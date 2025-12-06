import apiCache from './cache';

/**
 * API Client with error handling, rate limiting, and caching
 */

// Rate limit tracking
const rateLimitInfo = new Map(); // url -> { retryAfter, lastError }

/**
 * Get user-friendly error message based on status code
 */
function getErrorMessage(status, errorData = {}) {
  switch (status) {
    case 429:
      return {
        message: 'Rate limit exceeded. Please try again later.',
        type: 'rate_limit',
        retryAfter: errorData.retryAfter || null,
      };
    case 401:
      return {
        message: 'Authentication failed. Please check your API credentials.',
        type: 'auth_error',
      };
    case 403:
      return {
        message: 'Access forbidden. You may not have permission to access this resource.',
        type: 'permission_error',
      };
    case 404:
      return {
        message: 'API endpoint not found. Please check the URL.',
        type: 'not_found',
      };
    case 500:
    case 502:
    case 503:
    case 504:
      return {
        message: 'Server error. The API is temporarily unavailable.',
        type: 'server_error',
      };
    default:
      return {
        message: errorData.error || `HTTP error! Status: ${status}`,
        type: 'http_error',
      };
  }
}

/**
 * Extract retry-after from response headers
 */
function getRetryAfter(response) {
  const retryAfter = response.headers.get('retry-after');
  if (retryAfter) {
    const seconds = parseInt(retryAfter, 10);
    if (!isNaN(seconds)) {
      return seconds * 1000; // Convert to milliseconds
    }
  }
  return null;
}

/**
 * Check if we should skip cache (e.g., after rate limit error)
 */
function shouldSkipCache(url, headers) {
  const key = `${url}::${JSON.stringify(headers)}`;
  const info = rateLimitInfo.get(key);
  
  if (info && info.retryAfter) {
    const timeSinceError = Date.now() - info.lastError;
    if (timeSinceError < info.retryAfter) {
      return true; // Still in rate limit window, skip cache to show error
    } else {
      // Rate limit window passed, clear the info
      rateLimitInfo.delete(key);
    }
  }
  
  return false;
}

/**
 * Fetch API data with caching and error handling
 * @param {string} url - API URL
 * @param {object} options - Fetch options
 * @param {object} options.headers - Request headers
 * @param {number} options.cacheTTL - Cache TTL in milliseconds (default: 30s)
 * @param {boolean} options.skipCache - Force skip cache
 * @returns {Promise} Response data
 */
export async function fetchApiData(url, options = {}) {
  const {
    headers = {},
    cacheTTL = 30 * 1000, // 30 seconds default
    skipCache = false,
  } = options;

  // Check cache first (unless skipping)
  if (!skipCache && !shouldSkipCache(url, headers)) {
    const cached = apiCache.get(url, headers);
    if (cached) {
      return {
        data: cached,
        fromCache: true,
        error: null,
      };
    }
  }

  try {
    // Build proxy URL
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
    const headersParam = Object.keys(headers).length > 0 
      ? `&headers=${encodeURIComponent(JSON.stringify(headers))}`
      : '';

    const response = await fetch(proxyUrl + headersParam);

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = getRetryAfter(response);
      const key = `${url}::${JSON.stringify(headers)}`;
      rateLimitInfo.set(key, {
        retryAfter: retryAfter || 60 * 1000, // Default 60 seconds if not specified
        lastError: Date.now(),
      });

      const errorData = await response.json().catch(() => ({}));
      const errorInfo = getErrorMessage(429, { retryAfter });

      return {
        data: null,
        fromCache: false,
        error: {
          ...errorInfo,
          retryAfter,
          status: 429,
        },
      };
    }

    // Handle other errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorInfo = getErrorMessage(response.status, errorData);

      return {
        data: null,
        fromCache: false,
        error: {
          ...errorInfo,
          status: response.status,
          details: errorData.details || null,
        },
      };
    }

    // Parse response
    const data = await response.json();

    // Cache successful response
    apiCache.set(url, headers, data, cacheTTL);

    // Clear any rate limit info on success
    const key = `${url}::${JSON.stringify(headers)}`;
    rateLimitInfo.delete(key);

    return {
      data,
      fromCache: false,
      error: null,
    };
  } catch (error) {
    // Network errors, parsing errors, etc.
    return {
      data: null,
      fromCache: false,
      error: {
        message: error.message || 'Failed to fetch data. Please check your connection.',
        type: 'network_error',
        status: null,
      },
    };
  }
}

/**
 * Clear cache for a specific URL
 */
export function clearCache(url, headers = {}) {
  apiCache.clear(url, headers);
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return apiCache.getStats();
}

/**
 * Cleanup expired cache entries
 */
export function cleanupCache() {
  apiCache.cleanup();
}

// Run cleanup periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    cleanupCache();
  }, 60000); // Cleanup every minute
}

