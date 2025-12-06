'use client';

import { useState, useEffect } from 'react';
import CardRenderer from './Renderers/CardRenderer';
import TableRenderer from './Renderers/TableRenderer';
import ChartRenderer from './Renderers/ChartRenderer';
import { parseApi } from '@/lib/parseApi';
import { detectApiType } from '@/lib/detectApiType';
import useWidgetStore from '@/store/widgetStore';
import AddWidgetModal from './AddWidgetModal';

export default function WidgetCard({ widget, onEdit }) {
  const { deleteWidget } = useWidgetStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(widget.apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const jsonData = await response.json();
      const apiType = detectApiType(jsonData);
      const parsedData = parseApi(jsonData, apiType, widget.selectedFields);
      setData(parsedData);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
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
  }, [widget.apiUrl, widget.refreshInterval]);

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

  const handleConfigure = (e) => {
    e?.stopPropagation();
    // Same as edit for now
    handleEdit();
  };

  const renderContent = () => {
    if (loading && !data) {
      return (
        <div className="flex h-64 items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </div>
      );
    }

    switch (widget.displayMode) {
      case 'card':
        return (
          <CardRenderer
            data={data}
            selectedFields={widget.selectedFields}
            widgetName={widget.widgetName}
            apiType={widget.widgetType}
          />
        );
      case 'table':
        return (
          <TableRenderer
            data={data}
            selectedFields={widget.selectedFields}
            apiType={widget.widgetType}
          />
        );
      case 'chart':
        return (
          <ChartRenderer
            data={data}
            selectedFields={widget.selectedFields}
            apiType={widget.widgetType}
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
        <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3 relative overflow-visible">
          <div className="flex items-center gap-3 react-draggable-handle" style={{ cursor: 'move', flex: 1 }}>
            <h3 className="font-semibold">{widget.widgetName}</h3>
            <span className="rounded bg-gray-700 px-2 py-1 text-xs text-gray-300">
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
                  className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-600 rounded-t-lg"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleConfigure}
                  className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-600"
                >
                  Configure
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-600 rounded-b-lg"
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
            <div className="p-4 text-center text-red-400">{error}</div>
          )}
          {renderContent()}
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <div className="border-t border-gray-700 px-4 py-2 text-center text-xs text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
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
