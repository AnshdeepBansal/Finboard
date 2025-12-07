import { useState } from 'react';
import { fetchApiData } from '@/lib/apiClient';
import { extractApiFields, buildApiTestMessage } from './apiFieldExtractor';

/**
 * Custom hook for API testing with headers and caching
 * Handles all API interaction logic
 */
export function useApiTester() {
  const [testStatus, setTestStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiData, setApiData] = useState(null);
  const [apiType, setApiType] = useState(null);
  const [availableFields, setAvailableFields] = useState([]);

  const testApi = async (apiUrl, headers = []) => {
    if (!apiUrl.trim()) {
      setTestStatus({ success: false, message: 'Please enter an API URL' });
      return false;
    }

    setIsLoading(true);
    setTestStatus(null);

    try {
      // Build headers object from key-value pairs
      const headersObj = {};
      headers.forEach((header) => {
        if (header.key && header.key.trim()) {
          headersObj[header.key.trim()] = header.value?.trim() || '';
        }
      });

      // Fetch data with caching disabled for testing
      const result = await fetchApiData(apiUrl, {
        headers: headersObj,
        skipCache: true,
      });

      if (result.error) {
        return handleApiError(result.error);
      }

      if (!result.data) {
        setTestStatus({
          success: false,
          message: 'No data received from API.',
        });
        setApiData(null);
        setAvailableFields([]);
        return false;
      }

      return handleApiSuccess(result.data);
    } catch (error) {
      setTestStatus({
        success: false,
        message: `Error: ${error.message || 'An unexpected error occurred'}`,
        errorType: 'unknown_error',
      });
      setApiData(null);
      setAvailableFields([]);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiError = (error) => {
    let errorMessage = error.message;
    if (error.retryAfter) {
      errorMessage += ` (Retry after ${Math.ceil(error.retryAfter / 1000)} seconds)`;
    }

    setTestStatus({
      success: false,
      message: errorMessage,
      errorType: error.type,
    });
    setApiData(null);
    setAvailableFields([]);
    return false;
  };

  const handleApiSuccess = (data) => {
    const { type, fields, hasArrays } = extractApiFields(data);

    if (fields.length === 0) {
      setTestStatus({
        success: false,
        message: 'API response is empty or has no extractable fields.',
      });
      setApiData(null);
      setAvailableFields([]);
      return false;
    }

    setApiData(data);
    setApiType(type);
    setAvailableFields(fields);
    setTestStatus({
      success: true,
      message: buildApiTestMessage(fields, hasArrays),
    });
    return true;
  };

  const reset = () => {
    setTestStatus(null);
    setApiData(null);
    setApiType(null);
    setAvailableFields([]);
    setIsLoading(false);
  };

  return {
    testApi,
    testStatus,
    isLoading,
    apiData,
    apiType,
    availableFields,
    reset,
  };
}
