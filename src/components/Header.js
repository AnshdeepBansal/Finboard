'use client';

import { useState, useRef, useEffect } from 'react';
import useWidgetStore from '@/store/widgetStore';
import AddWidgetModal from './AddWidgetModal';

export default function Header() {
  const { exportConfig, setTheme, theme, widgets } = useWidgetStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    // Apply theme immediately to DOM
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const handleExport = () => {
    const config = exportConfig();
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dashboard-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target.result);
        useWidgetStore.getState().importConfig(config);
        alert('Configuration imported successfully!');
      } catch (error) {
        alert('Error importing configuration: ' + error.message);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const activeWidgetsCount = widgets.length;
  const isDark = theme === 'dark';

  return (
    <header className={`w-full border-b px-3 sm:px-4 md:px-6 py-3 sm:py-4 ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 sm:h-6 sm:w-6 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <h1 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Finance Dashboard</h1>
          </div>
          <div className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} hidden sm:block`}>
            {activeWidgetsCount} active widget{activeWidgetsCount !== 1 ? 's' : ''} - Real-time data
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full sm:w-auto">
          {/* Theme Toggle */}
          <button
            onClick={handleThemeToggle}
            className={`rounded-lg px-3 sm:px-4 py-2 text-sm ${isDark ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Import JSON */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm ${isDark ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'} hidden sm:inline-flex items-center`}
          >
            Import JSON
          </button>

          {/* Export JSON */}
          <button
            onClick={handleExport}
            className={`rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm ${isDark ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'} hidden sm:inline-flex items-center`}
          >
            Export JSON
          </button>

          {/* Add Widget Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-3 sm:px-4 py-2 text-xs sm:text-sm text-white hover:bg-green-700 flex-1 sm:flex-initial"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Widget
          </button>
        </div>
      </div>
      <AddWidgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </header>
  );
}
