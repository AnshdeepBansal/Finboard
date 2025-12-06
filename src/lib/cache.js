/**
 * Simple in-memory cache for API responses
 * Uses URL + headers as cache key
 */

class ApiCache {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 30 * 1000; // 30 seconds default
  }

  /**
   * Generate cache key from URL and headers
   */
  generateKey(url, headers = {}) {
    const headersStr = JSON.stringify(headers);
    return `${url}::${headersStr}`;
  }

  /**
   * Get cached data if available and not expired
   */
  get(url, headers = {}) {
    const key = this.generateKey(url, headers);
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    // Check if expired
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Set cache with optional TTL (time to live in milliseconds)
   */
  set(url, headers = {}, data, ttl = null) {
    const key = this.generateKey(url, headers);
    const expiresAt = Date.now() + (ttl || this.defaultTTL);

    this.cache.set(key, {
      data,
      expiresAt,
      cachedAt: Date.now(),
    });
  }

  /**
   * Clear cache for a specific URL or all cache
   */
  clear(url = null, headers = {}) {
    if (url) {
      const key = this.generateKey(url, headers);
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const [key, value] of this.cache.entries()) {
      if (now > value.expiresAt) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }

    return {
      total: this.cache.size,
      valid: validEntries,
      expired: expiredEntries,
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now > value.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Export singleton instance
export default new ApiCache();

