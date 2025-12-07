'use client';

import { useState, useEffect, useCallback } from 'react';
import useWidgetStore from '@/store/widgetStore';

import AddWidgetModal from '@/components/widgets/AddWidgetModal/AddWidgetModal';
import HeaderBrand from './HeaderBrand';
import ThemeToggle from './ThemeToggle';
import AddWidgetButton from './AddWidgetButton';
import ImportExportMenu from './ImportExportMenu';

export default function Header() {
  const { exportConfig, importConfig, setTheme, theme, widgets } = useWidgetStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeWidgetsCount = widgets.length;
  const isDark = theme === 'dark';

  // Keep DOM <html> in sync with theme in store
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  const handleThemeToggle = useCallback(() => {
    setTheme(isDark ? 'light' : 'dark');
  }, [isDark, setTheme]);

  const handleImportConfig = useCallback(
    (config) => {
      importConfig(config);
    },
    [importConfig]
  );

  const handleExportConfig = useCallback(
    () => exportConfig(),
    [exportConfig]
  );

  return (
    <header
      className={`w-full border-b px-4 sm:px-6 lg:px-8 py-3 sm:py-4 transition-colors ${
        isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-teal-50'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        {/* Left side: logo + stats */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <HeaderBrand isDark={isDark} activeWidgetsCount={activeWidgetsCount} />
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
        </div>
      </div>

      <AddWidgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </header>
  );
}
