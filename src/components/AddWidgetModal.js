'use client';

import { useState, useEffect } from 'react';
import { detectApiType } from '@/lib/detectApiType';
import { extractJsonPaths, getValueByPath } from '@/lib/extractJsonPaths';
import useWidgetStore from '@/store/widgetStore';

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
      // Test the API again when editing
      handleTestApi();
    }
  }, [editingWidget, isOpen]);

  const handleTestApi = async () => {
    if (!apiUrl.trim()) {
      setTestStatus({ success: false, message: 'Please enter an API URL' });
      return;
    }

    setIsLoading(true);
    setTestStatus(null);

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const detectedType = detectApiType(data);

      if (detectedType === 'unsupported') {
        setTestStatus({
          success: false,
          message: 'Unsupported API format. Please use Time Series (Daily/Weekly/Monthly) or Crypto Rates API.',
        });
        setApiData(null);
        setAvailableFields([]);
      } else {
        setApiData(data);
        setApiType(detectedType);
        const paths = extractJsonPaths(data);
        setAvailableFields(paths);
        setTestStatus({
          success: true,
          message: `API connection successful! ${paths.length} top-level fields found.`,
        });
      }
    } catch (error) {
      setTestStatus({
        success: false,
        message: `Error: ${error.message}`,
      });
      setApiData(null);
      setAvailableFields([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddField = (fieldPath) => {
    if (!selectedFields.includes(fieldPath)) {
      setSelectedFields([...selectedFields, fieldPath]);
    }
  };

  const handleRemoveField = (fieldPath) => {
    setSelectedFields(selectedFields.filter((f) => f !== fieldPath));
  };

  const filteredFields = availableFields.filter((field) => {
    const matchesSearch = field.path.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArrayFilter = showArraysOnly ? field.type === 'array' : true;
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
    } else if (fieldsToUse.length === 0) {
      // For other modes, use all available fields if none selected
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

    if (!canAddMore && !editingWidget) {
      alert('Maximum of 3 unique APIs allowed');
      return;
    }

    const widgetData = {
      widgetName: widgetName.trim(),
      apiUrl: apiUrl.trim(),
      refreshInterval: parseInt(refreshInterval) || 30,
      displayMode,
      selectedFields: fieldsToUse,
      widgetType: apiType,
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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-lg bg-gray-800 p-6 text-white shadow-xl overflow-y-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Add New Widget</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white"
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
          <div className="flex gap-2">
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="flex-1 rounded-lg bg-gray-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="https://api.example.com/data"
            />
            <button
              onClick={handleTestApi}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
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
              className={`mt-2 rounded-lg p-3 ${
                testStatus.success
                  ? 'bg-green-900 text-green-200'
                  : 'bg-red-900 text-red-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {testStatus.success ? (
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
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
                <span>{testStatus.message}</span>
              </div>
            </div>
          )}
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
          <div className="flex gap-2">
            {['card', 'table', 'chart'].map((mode) => (
              <button
                key={mode}
                onClick={() => setDisplayMode(mode)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 capitalize ${
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

        {/* Field Selection - Only show for non-chart modes */}
        {testStatus?.success && displayMode !== 'chart' && (
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium">Search Fields</label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showArraysOnly}
                  onChange={(e) => setShowArraysOnly(e.target.checked)}
                  className="rounded"
                />
                <span>Show arrays only (for table view)</span>
              </label>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for fields..."
              className="mb-4 w-full rounded-lg bg-gray-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Available Fields */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Available Fields
                </label>
                <div className="h-64 overflow-y-auto rounded-lg border border-gray-700 bg-gray-900 p-2">
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
                          disabled={selectedFields.includes(field.path)}
                          className="ml-2 rounded bg-green-600 px-2 py-1 text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          +
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
                <div className="h-64 overflow-y-auto rounded-lg border border-gray-700 bg-gray-900 p-2">
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

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={handleClose}
            className="rounded-lg bg-gray-700 px-6 py-2 text-white hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!widgetName.trim() || !apiUrl.trim() || !testStatus?.success}
            className="rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
}
