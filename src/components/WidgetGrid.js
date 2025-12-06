'use client';

import { useMemo, useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import WidgetCard from './WidgetCard';
import useWidgetStore from '@/store/widgetStore';
import AddWidgetModal from './AddWidgetModal';

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function WidgetGrid() {
  const { widgets, layout, setLayout } = useWidgetStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Generate responsive layouts for different breakpoints
  const generateLayoutForBreakpoint = (widgets, cols, existingLayout = null) => {
    if (!existingLayout || existingLayout.length === 0) {
      // Generate initial layout for all widgets
      return widgets.map((widget, index) => {
        // For mobile (2 cols), make widgets full width
        // For small (4 cols), make widgets half width
        // For medium (6 cols), make widgets half width
        // For large (10-12 cols), make widgets half width
        const itemsPerRow = cols <= 2 ? 1 : cols <= 4 ? 2 : cols <= 6 ? 2 : 2;
        const widgetWidth = cols <= 2 ? cols : Math.floor(cols / itemsPerRow);
        
        return {
          i: widget.id,
          x: (index % itemsPerRow) * widgetWidth,
          y: Math.floor(index / itemsPerRow) * 4,
          w: widgetWidth,
          h: 4,
          minW: cols <= 2 ? 2 : 2,
          minH: 3,
        };
      });
    }

    const existingLayoutArray = Array.isArray(existingLayout) ? existingLayout : [];
    const widgetIds = new Set(existingLayoutArray.map((item) => item.i));
    const missingWidgets = widgets.filter((w) => !widgetIds.has(w.id));

    const newLayoutItems = missingWidgets.map((widget, index) => {
      const maxY = existingLayoutArray.length > 0
        ? Math.max(...existingLayoutArray.map((item) => item.y + item.h))
        : 0;
      
      const itemsPerRow = cols <= 2 ? 1 : cols <= 4 ? 2 : cols <= 6 ? 2 : 2;
      const widgetWidth = cols <= 2 ? cols : Math.floor(cols / itemsPerRow);
      
      return {
        i: widget.id,
        x: (index % itemsPerRow) * widgetWidth,
        y: maxY + Math.floor(index / itemsPerRow) * 4,
        w: widgetWidth,
        h: 4,
        minW: cols <= 2 ? 2 : 2,
        minH: 3,
      };
    });

    return [...existingLayoutArray, ...newLayoutItems];
  };

  // Generate layouts for all breakpoints
  const responsiveLayouts = useMemo(() => {
    // If we have an existing layout, use it as base for large screens
    // For smaller screens, generate fresh layouts optimized for those breakpoints
    const baseLayout = Array.isArray(layout) && layout.length > 0 ? layout : null;
    
    return {
      lg: baseLayout || generateLayoutForBreakpoint(widgets, 12, null),
      md: baseLayout ? generateLayoutForBreakpoint(widgets, 10, baseLayout) : generateLayoutForBreakpoint(widgets, 10, null),
      sm: generateLayoutForBreakpoint(widgets, 6, null),
      xs: generateLayoutForBreakpoint(widgets, 4, null),
      xxs: generateLayoutForBreakpoint(widgets, 2, null),
    };
  }, [widgets, layout]);

  const handleLayoutChange = (currentLayout, allLayouts) => {
    // Store all layouts for all breakpoints
    if (allLayouts) {
      // Store the largest breakpoint layout as the base
      setLayout(allLayouts.lg || currentLayout);
    } else {
      setLayout(currentLayout);
    }
  };

  if (widgets.length === 0) {
    return (
      <>
        <div className="flex items-center justify-center py-8 sm:py-12 md:py-16">
          <div
            onClick={() => setIsModalOpen(true)}
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-green-500 bg-gray-800 p-6 sm:p-8 md:p-12 transition-colors hover:bg-gray-750 w-full max-w-md mx-4"
          >
            <div className="mb-4 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-green-600">
              <svg
                className="h-8 w-8 sm:h-10 sm:w-10 text-white"
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
            </div>
            <h3 className="mb-2 text-lg sm:text-xl font-semibold text-white">Add Widget</h3>
            <p className="text-center text-xs sm:text-sm text-gray-400 px-4">
              Connect to a finance API and create a custom widget
            </p>
          </div>
        </div>
        <AddWidgetModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <ResponsiveGridLayout
        className="layout"
        layouts={responsiveLayouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={60}
        onLayoutChange={handleLayoutChange}
        isDraggable={true}
        isResizable={true}
        margin={[20, 20]}
        draggableHandle=".react-draggable-handle"
        compactType="vertical"
        preventCollision={false}
      >
        {widgets.map((widget) => (
          <div key={widget.id} className="widget-wrapper" style={{ overflow: 'visible' }}>
            <WidgetCard widget={widget} />
          </div>
        ))}
      </ResponsiveGridLayout>
    </>
  );
}
