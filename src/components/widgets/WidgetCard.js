'use client';

import { useState, useEffect } from 'react';
import CardRenderer from '@/components/Renderers/CardRenderer';
import TableRenderer from '@/components/Renderers/TableRenderer';
import ChartRenderer from '@/components/Renderers/ChartRenderer';
import { parseApi } from '@/lib/parseApi';
import { detectApiType } from '@/lib/detectApiType';
import useWidgetStore from '@/store/widgetStore';
import AddWidgetModal from './AddWidgetModal/AddWidgetModal';
import { fetchApiData } from '@/lib/apiClient';

export default function WidgetCard({ widget, onEdit }) {
  const { deleteWidget } = useWidgetStore();
  const [data, setData] = useState(null);
  const [rawData, setRawData] = useState(null); // Store raw API response for table rendering
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null);
  const [retryAfter, setRetryAfter] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const menuContainer = event.target.closest('.menu-container');
      if (showMenu && !menuContainer) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      // Use setTimeout to avoid immediate closure
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showMenu]);

  const fetchData = async (skipCache = false) => {
    setLoading(true);
    setError(null);
    setErrorType(null);
    setRetryAfter(null);
    setIsFromCache(false);

    try {
      // Build headers object from widget headers
      const headersObj = {};
      if (widget.headers && Array.isArray(widget.headers)) {
        widget.headers.forEach((header) => {
          if (header.key && header.key.trim()) {
            headersObj[header.key.trim()] = header.value || '';
          }
        });
      }

      // Use API client with caching and error handling
      const result = await fetchApiData(widget.apiUrl, {
        headers: headersObj,
        cacheTTL: widget.refreshInterval * 1000, // Use refresh interval as cache TTL
        skipCache,
      });

      if (result.error) {
        setError(result.error.message);
        setErrorType(result.error.type);
        setRetryAfter(result.error.retryAfter);
        setData({ error: result.error.message });
        setLoading(false);
        return;
      }

      if (result.data) {
        const apiType = detectApiType(result.data);
        const parsedData = parseApi(result.data, apiType, widget.selectedFields);
        setData(parsedData);
        // Store raw data for table renderer to access nested paths
        setRawData(result.data);
        setIsFromCache(result.fromCache);
        setLastUpdated(new Date());
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
      setErrorType('unknown_error');
      setData({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, widget.refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [widget.apiUrl, widget.refreshInterval, widget.headers]);

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this widget?')) {
      deleteWidget(widget.id);
    }
    setShowMenu(false);
  };

  const handleEdit = (e) => {
    e?.stopPropagation();
    setIsEditing(true);
    setShowMenu(false);
  };

  const renderContent = () => {
    if (loading && !data) {
      return (
        <div className="flex h-48 sm:h-64 items-center justify-center">
          <div className="text-gray-400 text-sm sm:text-base">Loading...</div>
        </div>
      );
    }

    switch (widget.displayMode) {
      case 'card':
        // For cards, use raw data to preserve original structure for field mapping
        let cardData = rawData || data;
        // If raw data is an array, pass it as-is and let CardRenderer handle it
        // CardRenderer will extract the first item if needed
        return (
          <CardRenderer
            data={cardData}
            selectedFields={widget.selectedFields}
            widgetName={widget.widgetName}
            apiType={data?.type || detectApiType(rawData)}
          />
        );
      case 'table':
        // For tables, use raw data to preserve nested structure for path extraction
        return (
          <TableRenderer
            data={rawData || data}
            selectedFields={widget.selectedFields}
            apiType={data?.type || detectApiType(rawData)}
          />
        );
      case 'chart':
        return (
          <ChartRenderer
            data={data}
            selectedFields={widget.selectedFields}
            apiType={data?.type || detectApiType(rawData)}
          />
        );
      default:
        return <div className="p-4 text-gray-400">Unknown display mode</div>;
    }
  };

  return (
    <>
      <div className="h-full w-full rounded-lg bg-gray-800 text-white shadow-lg overflow-visible">
        {/* Title Bar */}
        <div className="flex items-center justify-between border-b border-gray-700 px-2 sm:px-3 md:px-4 py-2 sm:py-3 relative overflow-visible">
          <div className="flex items-center gap-2 sm:gap-3 react-draggable-handle" style={{ cursor: 'move', flex: 1, minWidth: 0 }}>
            <h3 className="font-semibold text-sm sm:text-base truncate">{widget.widgetName}</h3>
            <span className="rounded bg-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs text-gray-300 shrink">
              {widget.refreshInterval}s
            </span>
          </div>
          <div className="relative menu-container overflow-visible" style={{ zIndex: showMenu ? 1000 : 'auto' }}>
            <button
              type="button"
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onMouseUp={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.nativeEvent?.stopImmediatePropagation?.();
                setShowMenu((prev) => !prev);
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
              }}
              className="text-gray-400 hover:text-white focus:outline-none cursor-pointer"
              aria-label="Widget menu"
              style={{ pointerEvents: 'auto', position: 'relative', zIndex: 1001 }}
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            {showMenu && (
              <div 
                className="absolute right-0 top-8 w-48 rounded-lg bg-gray-700 shadow-2xl border border-gray-600"
                style={{ 
                  zIndex: 1001,
                  position: 'absolute',
                  pointerEvents: 'auto'
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={handleEdit}
                  className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-white hover:bg-gray-600 rounded-t-lg"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-red-400 hover:bg-gray-600 rounded-b-lg"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-60px)] overflow-auto">
          {error && !loading && (
            <div className="p-3 sm:p-4">
              <div className={`rounded-lg p-3 sm:p-4 ${
                errorType === 'rate_limit' 
                  ? 'bg-yellow-900/30 border border-yellow-700/50' 
                  : errorType === 'auth_error' || errorType === 'permission_error'
                  ? 'bg-orange-900/30 border border-orange-700/50'
                  : 'bg-red-900/30 border border-red-700/50'
              }`}>
                <div className="flex items-start gap-2">
                  <svg 
                    className="h-5 w-5 shrink mt-0.5" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    {errorType === 'rate_limit' ? (
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    ) : (
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    )}
                  </svg>
                  <div className="flex-1">
                    <p className={`text-sm sm:text-base font-medium ${
                      errorType === 'rate_limit' ? 'text-yellow-300' : 'text-red-300'
                    }`}>
                      {error}
                    </p>
                    {retryAfter && (
                      <p className="text-xs text-gray-400 mt-1">
                        Retry after {Math.ceil(retryAfter / 1000)} seconds
                      </p>
                    )}
                    {errorType === 'rate_limit' && (
                      <button
                        onClick={() => fetchData(true)}
                        className="mt-2 text-xs text-yellow-300 hover:text-yellow-200 underline"
                      >
                        Retry now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {renderContent()}
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <div className="border-t border-gray-700 px-2 sm:px-4 py-1.5 sm:py-2 text-center text-xs text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
            {isFromCache && (
              <span className="ml-2 text-gray-500">(cached)</span>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <AddWidgetModal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          editingWidget={widget}
        />
      )}
    </>
  );
}
