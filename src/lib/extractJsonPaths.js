/**
 * Recursively extracts all JSON paths from an object
 * @param {Object} obj - The object to extract paths from
 * @param {string} prefix - The prefix for the current path
 * @param {Array} paths - Array to store the paths
 * @returns {Array} - Array of objects with path, type, and sample value
 */
export function extractJsonPaths(obj, prefix = '', paths = []) {
  if (obj === null || obj === undefined) {
    return paths;
  }

  if (Array.isArray(obj)) {
    // For arrays, we can show the array itself or iterate through items
    paths.push({
      path: prefix || 'root',
      type: 'array',
      sample: `[${obj.length} items]`,
      value: obj,
    });
    
    // Optionally, extract paths from first item if it's an object
    if (obj.length > 0 && typeof obj[0] === 'object' && !Array.isArray(obj[0])) {
      extractJsonPaths(obj[0], `${prefix}[0]`, paths);
    }
    return paths;
  }

  if (typeof obj === 'object') {
    Object.keys(obj).forEach((key) => {
      const currentPath = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];

      if (value === null || value === undefined) {
        paths.push({
          path: currentPath,
          type: 'null',
          sample: 'null',
          value: null,
        });
      } else if (Array.isArray(value)) {
        paths.push({
          path: currentPath,
          type: 'array',
          sample: `[${value.length} items]`,
          value: value,
        });
        // Extract paths from first array item if it's an object
        if (value.length > 0 && typeof value[0] === 'object' && !Array.isArray(value[0])) {
          extractJsonPaths(value[0], `${currentPath}[0]`, paths);
        }
      } else if (typeof value === 'object') {
        // Recursively extract paths from nested objects
        extractJsonPaths(value, currentPath, paths);
      } else {
        // Primitive value
        paths.push({
          path: currentPath,
          type: typeof value,
          sample: String(value).substring(0, 50),
          value: value,
        });
      }
    });
  }

  return paths;
}

/**
 * Get value from object using dot notation path
 * @param {Object} obj - The object to get value from
 * @param {string} path - Dot notation path (e.g., 'data.rates.BTC')
 * @returns {any} - The value at the path
 */
export function getValueByPath(obj, path) {
  if (!path) return obj;
  
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    // Handle array indices like 'data[0].field'
    if (key.includes('[')) {
      const [baseKey, index] = key.split('[');
      const idx = parseInt(index.replace(']', ''));
      if (current[baseKey] && Array.isArray(current[baseKey])) {
        current = current[baseKey][idx];
      } else {
        return undefined;
      }
    } else {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }
  }
  
  return current;
}
