'use client';

import { useEffect } from 'react';
import useWidgetStore from '@/store/widgetStore';

export default function ThemeProvider({ children }) {
  const { theme } = useWidgetStore();

  useEffect(() => {
    // Apply theme on mount and when it changes
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return <>{children}</>;
}
