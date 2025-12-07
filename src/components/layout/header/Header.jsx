"use client";

import { useState, useEffect, useCallback } from "react";
import useWidgetStore from "@/store/widgetStore";

import AddWidgetModal from "@/components/widgets/AddWidgetModal/AddWidgetModal";
import HeaderBrand from "./HeaderBrand";
import ThemeToggle from "./ThemeToggle";
import AddWidgetButton from "./AddWidgetButton";
import ImportExportMenu from "./ImportExportMenu";

export default function Header() {
  const { exportConfig, importConfig, setTheme, theme, widgets, deleteAllWidgets } =
    useWidgetStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeWidgetsCount = widgets.length;
  const isDark = theme === "dark";

  // Keep DOM <html> in sync with theme in store
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  const handleThemeToggle = useCallback(() => {
    setTheme(isDark ? "light" : "dark");
  }, [isDark, setTheme]);

  const handleImportConfig = useCallback(
    (config) => {
      importConfig(config);
    },
    [importConfig]
  );

  const handleExportConfig = useCallback(() => exportConfig(), [exportConfig]);

  const handleClearCanvas = useCallback(() => {
    if (
      confirm(
        "Are you sure you want to clear all widgets? This action cannot be undone."
      )
    ) {
      deleteAllWidgets();
    }
  }, [deleteAllWidgets]);

  return (
    <header
      className={`w-full border-b px-4 sm:px-6 lg:px-8 py-3 sm:py-4 transition-colors ${
        isDark ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-teal-50"
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        {/* Left side: logo + stats */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <HeaderBrand
            isDark={isDark}
            activeWidgetsCount={activeWidgetsCount}
          />
        </div>

        {/* Right side: controls */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <ThemeToggle isDark={isDark} onToggle={handleThemeToggle} />
          <AddWidgetButton onClick={() => setIsModalOpen(true)} />
          <ImportExportMenu
            isDark={isDark}
            exportConfig={handleExportConfig}
            importConfig={handleImportConfig}
          />
          {activeWidgetsCount > 0 && (
            <button
              onClick={handleClearCanvas}
              title="Clear all widgets"
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'text-red-400 hover:bg-red-900 hover:bg-opacity-20'
                  : 'text-red-600 hover:bg-red-100'
              }`}
            >
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <AddWidgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </header>
  );
}
