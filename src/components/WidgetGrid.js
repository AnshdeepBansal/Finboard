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

  // Generate default layout for widgets that don't have layout yet
  const currentLayout = useMemo(() => {
    if (!layout || layout.length === 0) {
      // Generate initial layout for all widgets
      return widgets.map((widget, index) => ({
        i: widget.id,
        x: (index % 2) * 6,
        y: Math.floor(index / 2) * 4,
        w: 6,
        h: 4,
        minW: 3,
        minH: 3,
      }));
    }

    const existingLayout = Array.isArray(layout) ? layout : [];
    const widgetIds = new Set(existingLayout.map((item) => item.i));
    const missingWidgets = widgets.filter((w) => !widgetIds.has(w.id));

    const newLayoutItems = missingWidgets.map((widget, index) => {
      const maxY = existingLayout.length > 0
        ? Math.max(...existingLayout.map((item) => item.y + item.h))
        : 0;
      return {
        i: widget.id,
        x: (index % 2) * 6,
        y: maxY + Math.floor(index / 2) * 4,
        w: 6,
        h: 4,
        minW: 3,
        minH: 3,
      };
    });

    return [...existingLayout, ...newLayoutItems];
  }, [widgets, layout]);

  const handleLayoutChange = (currentLayout, allLayouts) => {
    // Store the layout for the current breakpoint (lg)
    setLayout(currentLayout);
  };

  if (widgets.length === 0) {
    return (
      <>
        <div className="flex items-center justify-center py-16">
          <div
            onClick={() => setIsModalOpen(true)}
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-green-500 bg-gray-800 p-12 transition-colors hover:bg-gray-750"
          >
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-600">
              <svg
                className="h-10 w-10 text-white"
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
            <h3 className="mb-2 text-xl font-semibold text-white">Add Widget</h3>
            <p className="text-center text-sm text-gray-400">
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
        layouts={{ lg: currentLayout, md: currentLayout, sm: currentLayout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={60}
        onLayoutChange={handleLayoutChange}
        isDraggable={true}
        isResizable={true}
        margin={[16, 16]}
        draggableHandle=".react-draggable-handle"
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
