/**
 * Parses API response and extracts relevant data based on API type
 * @param {Object} data - The parsed JSON data
 * @param {string} apiType - The type of API ('time-series', 'crypto-rates', or 'generic-array')
 * @param {Array} selectedFields - Array of field paths to extract
 * @returns {Object} - Parsed data structure
 */
export function parseApi(data, apiType, selectedFields = []) {
  if (!data || apiType === 'unsupported') {
    return { error: 'Unsupported API format' };
  }

  if (apiType === 'time-series') {
    // Support Daily, Weekly, and Monthly time series
    const timeSeries =
      data['Time Series (Daily)'] ||
      data['Weekly Time Series'] ||
      data['Monthly Time Series'] ||
      {};
    const dates = Object.keys(timeSeries).sort();

    // Determine which fields to include. If selectedFields provided, use those keys.
    const allKeys = ['open', 'high', 'low', 'close', 'volume'];
    const keysToInclude = (selectedFields && selectedFields.length > 0)
      ? allKeys.filter(k => selectedFields.includes(k))
      : allKeys;

    return {
      type: 'time-series',
      meta: data['Meta Data'] || {},
      data: dates.map((date) => {
        const item = { date };
        if (keysToInclude.includes('open')) {
          item.open = parseFloat(timeSeries[date]['1. open']) || 0;
        }
        if (keysToInclude.includes('high')) {
          item.high = parseFloat(timeSeries[date]['2. high']) || 0;
        }
        if (keysToInclude.includes('low')) {
          item.low = parseFloat(timeSeries[date]['3. low']) || 0;
        }
        if (keysToInclude.includes('close')) {
          item.close = parseFloat(timeSeries[date]['4. close']) || 0;
        }
        if (keysToInclude.includes('volume')) {
          item.volume = parseFloat(timeSeries[date]['5. volume']) || 0;
        }
        return item;
      }),
    };
  }

  if (apiType === 'crypto-rates') {
    const rates = data.data?.rates || {};
    const currency = data.data?.currency || '';
    
    return {
      type: 'crypto-rates',
      currency,
      rates: Object.keys(rates).map((symbol) => ({
        symbol,
        value: rates[symbol],
      })),
    };
  }

  if (apiType === 'generic-array') {
    // Handle generic array-based APIs
    let arrayData = [];
    let arrayPath = 'root';

    // If data is directly an array
    if (Array.isArray(data)) {
      arrayData = data;
      arrayPath = 'root';
    } else {
      // Find the first array in the response
      for (const key in data) {
        if (Array.isArray(data[key]) && data[key].length > 0) {
          if (typeof data[key][0] === 'object' && !Array.isArray(data[key][0])) {
            arrayData = data[key];
            arrayPath = key;
            break;
          }
        }
      }
    }

    if (arrayData.length === 0) {
      return { error: 'No array data found' };
    }

    // Get column headers from first item
    const columns = Object.keys(arrayData[0]).filter(
      (key) => typeof arrayData[0][key] !== 'object' || arrayData[0][key] === null
    );

    return {
      type: 'generic-array',
      arrayPath,
      columns,
      data: arrayData,
    };
  }

  return { error: 'Unknown API type' };
}
