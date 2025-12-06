/**
 * Detects the API type based on the JSON structure
 * @param {Object} data - The parsed JSON data
 * @returns {string} - 'time-series', 'crypto-rates', or 'unsupported'
 */
export function detectApiType(data) {
  if (!data || typeof data !== 'object') {
    return 'unsupported';
  }

  // Check for Time Series API formats (Daily, Weekly, Monthly)
  if (data['Meta Data']) {
    if (data['Time Series (Daily)']) {
      return 'time-series';
    }
    if (data['Weekly Time Series']) {
      return 'time-series';
    }
    if (data['Monthly Time Series']) {
      return 'time-series';
    }
  }

  // Check for Crypto Rates API format
  if (data.data && data.data.currency && data.data.rates) {
    return 'crypto-rates';
  }

  return 'unsupported';
}
