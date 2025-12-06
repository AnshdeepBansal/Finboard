/**
 * Parses API response and extracts relevant data based on API type
 * @param {Object} data - The parsed JSON data
 * @param {string} apiType - The type of API ('time-series' or 'crypto-rates')
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
    
    return {
      type: 'time-series',
      meta: data['Meta Data'] || {},
      data: dates.map((date) => ({
        date,
        open: parseFloat(timeSeries[date]['1. open']) || 0,
        high: parseFloat(timeSeries[date]['2. high']) || 0,
        low: parseFloat(timeSeries[date]['3. low']) || 0,
        close: parseFloat(timeSeries[date]['4. close']) || 0,
        volume: parseFloat(timeSeries[date]['5. volume']) || 0,
      })),
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

  return { error: 'Unknown API type' };
}
