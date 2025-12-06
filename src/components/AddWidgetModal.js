'use client';

import { useState, useEffect } from 'react';
import { detectApiType } from '@/lib/detectApiType';
import { extractJsonPaths, getValueByPath } from '@/lib/extractJsonPaths';
import useWidgetStore from '@/store/widgetStore';
import { fetchApiData } from '@/lib/apiClient';

export default function AddWidgetModal({ isOpen, onClose, editingWidget = null }) {
  const { addWidget, updateWidget, widgets } = useWidgetStore();
  const [widgetName, setWidgetName] = useState(editingWidget?.widgetName || '');
  const [apiUrl, setApiUrl] = useState(editingWidget?.apiUrl || '');
  const [refreshInterval, setRefreshInterval] = useState(
    editingWidget?.refreshInterval || 30
  );
  const [displayMode, setDisplayMode] = useState(
    editingWidget?.displayMode || 'card'
  );
  const [selectedFields, setSelectedFields] = useState(
    editingWidget?.selectedFields || []
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showArraysOnly, setShowArraysOnly] = useState(false);
  const [availableFields, setAvailableFields] = useState([]);
  const [apiData, setApiData] = useState(null);
  const [apiType, setApiType] = useState(null);
  const [testStatus, setTestStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [headers, setHeaders] = useState(
    editingWidget?.headers && editingWidget.headers.length > 0
      ? editingWidget.headers
      : []
  );

  // Check widget limit (max 3 APIs)
  const uniqueApiUrls = new Set(
    widgets.filter((w) => !editingWidget || w.id !== editingWidget.id).map((w) => w.apiUrl)
  );
  const canAddMore = uniqueApiUrls.size < 3 || editingWidget;

  useEffect(() => {
    if (editingWidget && isOpen) {
      setWidgetName(editingWidget.widgetName);
      setApiUrl(editingWidget.apiUrl);
      setRefreshInterval(editingWidget.refreshInterval);
      setDisplayMode(editingWidget.displayMode);
      setSelectedFields(editingWidget.selectedFields || []);
      setHeaders(
        editingWidget.headers && editingWidget.headers.length > 0
          ? editingWidget.headers
          : []
      );
      // Test the API again when editing
      handleTestApi();
    }
  }, [editingWidget, isOpen]);

  // Auto-filter to arrays when switching to table mode
  useEffect(() => {
    if (displayMode === 'table') {
      setShowArraysOnly(true);
    }
  }, [displayMode]);

  const handleTestApi = async () => {
    if (!apiUrl.trim()) {
      setTestStatus({ success: false, message: 'Please enter an API URL' });
      return;
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

      // Use API client with caching and error handling
      // Skip cache for testing to ensure fresh data
      const result = await fetchApiData(apiUrl, {
        headers: headersObj,
        skipCache: true, // Always test with fresh data
      });

      if (result.error) {
        let errorMessage = result.error.message;
        if (result.error.retryAfter) {
          errorMessage += ` (Retry after ${Math.ceil(result.error.retryAfter / 1000)} seconds)`;
        }
        setTestStatus({
          success: false,
          message: errorMessage,
          errorType: result.error.type,
        });
        setApiData(null);
        setAvailableFields([]);
        return;
      }

      if (!result.data) {
        setTestStatus({
          success: false,
          message: 'No data received from API.',
        });
        setApiData(null);
        setAvailableFields([]);
        return;
      }

      const detectedType = detectApiType(result.data);
      const paths = extractJsonPaths(result.data);
      const hasArrays = paths.some(p => p.type === 'array');

      // Accept any API that has at least one array (for tables) or any fields (for cards)
      if (paths.length === 0) {
        setTestStatus({
          success: false,
          message: 'API response is empty or has no extractable fields.',
        });
        setApiData(null);
        setAvailableFields([]);
      } else {
        setApiData(result.data);
        setApiType(detectedType);
        setAvailableFields(paths);
        const arrayCount = paths.filter(p => p.type === 'array').length;
        const message = hasArrays 
          ? `API connection successful! ${paths.length} fields found (${arrayCount} array${arrayCount !== 1 ? 's' : ''} available for tables).`
          : `API connection successful! ${paths.length} fields found. Note: No arrays found - tables require array data.`;
        setTestStatus({
          success: true,
          message,
        });
      }
    } catch (error) {
      setTestStatus({
        success: false,
        message: `Error: ${error.message || 'An unexpected error occurred'}`,
        errorType: 'unknown_error',
      });
      setApiData(null);
      setAvailableFields([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddField = (fieldPath) => {
    // For table mode, only allow one array to be selected
    if (displayMode === 'table') {
      // Check if this field is an array
      const field = availableFields.find(f => f.path === fieldPath);
      if (field && field.type === 'array') {
        // Replace any existing selection with this new one
        setSelectedFields([fieldPath]);
      }
    } else {
      // For other modes, allow multiple selections
      if (!selectedFields.includes(fieldPath)) {
        setSelectedFields([...selectedFields, fieldPath]);
      }
    }
  };

  const handleRemoveField = (fieldPath) => {
    setSelectedFields(selectedFields.filter((f) => f !== fieldPath));
  };

  const filteredFields = availableFields.filter((field) => {
    const matchesSearch = field.path.toLowerCase().includes(searchQuery.toLowerCase());
    // For table mode, only show arrays by default
    const matchesArrayFilter = displayMode === 'table' 
      ? (showArraysOnly ? field.type === 'array' : field.type === 'array')
      : (showArraysOnly ? field.type === 'array' : true);
    return matchesSearch && matchesArrayFilter;
  });

  const handleSubmit = () => {
    // Validation checks with popup messages
    if (!widgetName.trim()) {
      alert('Please enter a widget name');
      return;
    }

    if (!apiUrl.trim()) {
      alert('Please enter an API URL');
      return;
    }

    if (!testStatus?.success) {
      alert('Please test the API connection first');
      return;
    }

    // Auto-populate selectedFields based on display mode and API type
    let fieldsToUse = selectedFields;
    if (displayMode === 'chart' && apiType === 'time-series') {
      // For charts, automatically use all time-series fields
      fieldsToUse = ['open', 'high', 'low', 'close', 'volume'];
    } else if (displayMode === 'table') {
      // For tables, ensure we have at least one array selected
      if (fieldsToUse.length === 0) {
        // Try to auto-select first available array
        const arrays = availableFields.filter(field => field.type === 'array');
        if (arrays.length > 0) {
          fieldsToUse = [arrays[0].path];
        } else {
          alert('Please select an array field to display as a table. No arrays found in the API response.');
          return;
        }
      } else {
        // Validate that selected field is an array
        const selectedField = availableFields.find(f => f.path === fieldsToUse[0]);
        if (!selectedField || selectedField.type !== 'array') {
          alert('For table view, please select an array field. The selected field is not an array.');
          return;
        }
      }
    } else if (fieldsToUse.length === 0) {
      // For other modes (cards), use all available fields if none selected
      fieldsToUse = availableFields.map(field => field.path);
    }

    if (fieldsToUse.length === 0) {
      alert('No fields available to display');
      return;
    }

    // Check if this API URL is already used by another widget
    const existingWidgetWithSameUrl = widgets.find(
      (w) => w.apiUrl === apiUrl.trim() && (!editingWidget || w.id !== editingWidget.id)
    );

    if (existingWidgetWithSameUrl) {
      alert('This API URL is already in use by another widget');
      return;
    }

    // if (!canAddMore && !editingWidget) {
    //   alert('Maximum of 3 unique APIs allowed');
    //   return;
    // }

    // Filter out empty headers
    const validHeaders = headers.filter((h) => h.key.trim() !== '');

    const widgetData = {
      widgetName: widgetName.trim(),
      apiUrl: apiUrl.trim(),
      refreshInterval: parseInt(refreshInterval) || 30,
      displayMode,
      selectedFields: fieldsToUse,
      widgetType: apiType,
      headers: validHeaders.length > 0 ? validHeaders : undefined,
    };

    if (editingWidget) {
      updateWidget(editingWidget.id, widgetData);
    } else {
      addWidget(widgetData);
    }

    handleClose();
  };

  const handleClose = () => {
    setWidgetName('');
    setApiUrl('');
    setRefreshInterval(30);
    setDisplayMode('card');
    setSelectedFields([]);
    setSearchQuery('');
    setShowArraysOnly(false);
    setAvailableFields([]);
    setApiData(null);
    setApiType(null);
    setTestStatus(null);
    setHeaders([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 overflow-y-auto flex items-center justify-center">
      <div className="md:w-[40vw] sm:w-[80vw] w-full lg:h-[85vh] h-full overflow-scroll bg-gray-800 p-4 sm:p-6 md:p-8 text-white rounded-xl">
        {/* Header */}
        <div className="mb-4 sm:mb-6 flex items-center justify-between max-w-7xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold">{editingWidget ? 'Edit Widget' : 'Add New Widget'}</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white p-2 -mr-2 cursor-pointer"
            aria-label="Close modal"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="max-w-7xl mx-auto">
        {/* Widget Name */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Widget Name</label>
          <input
            type="text"
            value={widgetName}
            onChange={(e) => setWidgetName(e.target.value)}
            className="w-full rounded-lg bg-gray-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter widget name"
          />
        </div>

        {/* API URL */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">API URL</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="flex-1 rounded-lg bg-gray-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
              placeholder="https://api.example.com/data"
            />
            <button
              onClick={handleTestApi}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50 whitespace-nowrap text-sm sm:text-base"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Test
            </button>
          </div>
          {testStatus && (
            <div
              className={`mt-2 rounded-lg p-3 border ${
                testStatus.success
                  ? 'bg-green-900/30 text-green-200 border-green-700/50'
                  : testStatus.errorType === 'rate_limit'
                  ? 'bg-yellow-900/30 text-yellow-200 border-yellow-700/50'
                  : testStatus.errorType === 'auth_error' || testStatus.errorType === 'permission_error'
                  ? 'bg-orange-900/30 text-orange-200 border-orange-700/50'
                  : 'bg-red-900/30 text-red-200 border-red-700/50'
              }`}
            >
              <div className="flex items-start gap-2">
                {testStatus.success ? (
                  <svg
                    className="h-5 w-5 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : testStatus.errorType === 'rate_limit' ? (
                  <svg
                    className="h-5 w-5 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <span className="flex-1">{testStatus.message}</span>
              </div>
            </div>
          )}
        </div>

        {/* Headers Section */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-medium">
              Request Headers (Optional)
            </label>
            <button
              type="button"
              onClick={() => setHeaders([...headers, { key: '', value: '' }])}
              className="text-sm text-green-400 hover:text-green-300"
            >
              + Add Header
            </button>
          </div>
          {headers.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-600 p-4 text-center">
              <p className="text-sm text-gray-400 mb-2">No headers added</p>
              <button
                type="button"
                onClick={() => setHeaders([{ key: '', value: '' }])}
                className="text-sm text-green-400 hover:text-green-300"
              >
                Click to add a header
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {headers.map((header, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={header.key}
                  onChange={(e) => {
                    const newHeaders = [...headers];
                    newHeaders[index].key = e.target.value;
                    setHeaders(newHeaders);
                  }}
                  placeholder="Header Key (e.g., Authorization)"
                  className="flex-1 rounded-lg bg-gray-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                />
                <input
                  type="text"
                  value={header.value}
                  onChange={(e) => {
                    const newHeaders = [...headers];
                    newHeaders[index].value = e.target.value;
                    setHeaders(newHeaders);
                  }}
                  placeholder="Header Value (e.g., Bearer token123)"
                  className="flex-1 rounded-lg bg-gray-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newHeaders = headers.filter((_, i) => i !== index);
                    setHeaders(newHeaders);
                  }}
                  className="rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700 sm:flex-shrink-0"
                  title="Remove header"
                >
                  ×
                </button>
              </div>
              ))}
            </div>
          )}
          <p className="mt-2 text-xs text-gray-400">
            Add custom headers for API authentication or other requirements (e.g., Authorization, X-API-Key)
          </p>
        </div>

        {/* Refresh Interval */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">
            Refresh Interval (seconds)
          </label>
          <input
            type="number"
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(e.target.value)}
            min="1"
            className="w-full rounded-lg bg-gray-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Display Mode */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">
            Select Fields to Display
          </label>
          <div className="flex flex-wrap gap-2">
            {['card', 'table', 'chart'].map((mode) => (
              <button
                key={mode}
                onClick={() => setDisplayMode(mode)}
                className={`flex items-center gap-2 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base capitalize ${
                  displayMode === mode
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {mode === 'card' && (
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                  </svg>
                )}
                {mode === 'table' && (
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                )}
                {mode === 'chart' && (
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                )}
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Field Selection */}
        {testStatus?.success && displayMode !== 'chart' && (
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium">
                {displayMode === 'table' ? 'Select Array Field for Table' : 'Select Fields to Display'}
              </label>
              {displayMode === 'table' && (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showArraysOnly}
                    onChange={(e) => setShowArraysOnly(e.target.checked)}
                    className="rounded"
                  />
                  <span>Show arrays only</span>
                </label>
              )}
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for fields..."
              className="mb-4 w-full rounded-lg bg-gray-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Available Fields */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Available Fields
                </label>
                <div className="h-48 sm:h-64 overflow-y-auto rounded-lg border border-gray-700 bg-gray-900 p-2">
                  {filteredFields.length === 0 ? (
                    <div className="p-4 text-center text-gray-400">
                      No fields found
                    </div>
                  ) : (
                    filteredFields.map((field, index) => (
                      <div
                        key={index}
                        className="mb-2 flex items-center justify-between rounded-lg bg-gray-800 p-2 hover:bg-gray-700"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-mono text-white">
                            {field.path}
                          </div>
                          <div className="text-xs text-gray-400">
                            {field.type} | {field.sample}
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddField(field.path)}
                          disabled={displayMode === 'table' ? selectedFields.length > 0 && selectedFields[0] === field.path : selectedFields.includes(field.path)}
                          className="ml-2 rounded bg-green-600 px-2 py-1 text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          {displayMode === 'table' && selectedFields.length > 0 && selectedFields[0] === field.path ? '✓' : '+'}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Selected Fields */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Selected Fields
                </label>
                <div className="h-48 sm:h-64 overflow-y-auto rounded-lg border border-gray-700 bg-gray-900 p-2">
                  {selectedFields.length === 0 ? (
                    <div className="p-4 text-center text-gray-400">
                      No fields selected
                    </div>
                  ) : (
                    selectedFields.map((fieldPath, index) => (
                      <div
                        key={index}
                        className="mb-2 flex items-center justify-between rounded-lg bg-gray-800 p-2"
                      >
                        <span className="text-sm font-mono text-white">
                          {fieldPath}
                        </span>
                        <button
                          onClick={() => handleRemoveField(fieldPath)}
                          className="ml-2 rounded bg-red-600 px-2 py-1 text-white hover:bg-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Auto-mapping info for chart mode */}
        {testStatus?.success && displayMode === 'chart' && apiType === 'time-series' && (
          <div className="mb-4 rounded-lg bg-blue-900 p-3 text-blue-200 text-sm">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2z" clipRule="evenodd" />
              </svg>
              <span>Chart will automatically display all available time-series fields (Open, High, Low, Close, Volume)</span>
            </div>
          </div>
        )}

        {/* Info for table mode */}
        {testStatus?.success && displayMode === 'table' && (
          <div className="mb-4 rounded-lg bg-blue-900 p-3 text-blue-200 text-sm">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>
                {selectedFields.length > 0 
                  ? `Table will display data from the selected array. Columns will be generated automatically from the array items.`
                  : `Please select an array field from the API response. The table will automatically generate columns from the array items.`}
              </span>
            </div>
          </div>
        )}

        {/* Info for card mode */}
        {testStatus?.success && displayMode === 'card' && (
          <div className="mb-4 rounded-lg bg-blue-900 p-3 text-blue-200 text-sm">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>
                Cards support any API structure. Select fields to display and they will be mapped one-to-one from the API response.
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
          <button
            onClick={handleClose}
            className="rounded-lg bg-gray-700 px-4 sm:px-6 py-2 text-white hover:bg-gray-600 order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!widgetName.trim() || !apiUrl.trim() || !testStatus?.success}
            className="rounded-lg bg-green-600 px-4 sm:px-6 py-2 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
            title={
              !widgetName.trim() 
                ? 'Widget name is required'
                : !apiUrl.trim()
                ? 'API URL is required'
                : !testStatus?.success
                ? 'Please test the API connection first'
                : ''
            }
          >
            {editingWidget ? 'Update Widget' : 'Add Widget'}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
