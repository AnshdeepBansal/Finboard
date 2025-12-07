import { useState, useCallback } from 'react';

/**
 * Custom hook for managing request headers
 * Single responsibility: header management only
 */
export function useHeaders(initialHeaders = []) {
  const [headers, setHeaders] = useState(initialHeaders);

  const addHeader = useCallback(() => {
    setHeaders((prev) => [...prev, { key: '', value: '' }]);
  }, []);

  const updateHeader = useCallback((index, field, value) => {
    setHeaders((prev) => {
      const newHeaders = [...prev];
      newHeaders[index] = { ...newHeaders[index], [field]: value };
      return newHeaders;
    });
  }, []);

  const removeHeader = useCallback((index) => {
    setHeaders((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const reset = useCallback(() => {
    setHeaders([]);
  }, []);

  return {
    headers,
    addHeader,
    updateHeader,
    removeHeader,
    reset,
    isEmpty: headers.length === 0,
  };
}
