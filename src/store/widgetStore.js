import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useWidgetStore = create(
  persist(
    (set, get) => ({
      widgets: [],
      layout: [], // Array of layout items for react-grid-layout
      theme: 'dark',

      // Add a new widget
      addWidget: (widget) => {
        const newWidget = {
          ...widget,
          id: widget.id || `widget-${Date.now()}`,
        };
        set((state) => ({
          widgets: [...state.widgets, newWidget],
        }));
        return newWidget.id;
      },

      // Update an existing widget
      updateWidget: (id, data) => {
        set((state) => ({
          widgets: state.widgets.map((widget) =>
            widget.id === id ? { ...widget, ...data } : widget
          ),
        }));
      },

      // Delete a widget
      deleteWidget: (id) => {
        set((state) => ({
          widgets: state.widgets.filter((widget) => widget.id !== id),
          layout: state.layout.filter((item) => item.i !== id),
        }));
      },

      //Delete all Widgets
      deleteAllWidgets: () => {
          set({
            widgets: [],
            layout: [],
          });
        },

      // Set layout for react-grid-layout
      setLayout: (layout) => {
        set({ layout });
      },

      // Import configuration
      importConfig: (config) => {
        if (config.widgets && Array.isArray(config.widgets)) {
          set({
            widgets: config.widgets,
            layout: config.layout || [],
          });
        }
      },

      // Export configuration
      exportConfig: () => {
        const state = get();
        return {
          widgets: state.widgets,
          layout: state.layout,
        };
      },

      // Set theme
      setTheme: (theme) => {
        set({ theme });
      },
    }),
    {
      name: 'dashboard-widgets',
    }
  )
);

export default useWidgetStore;
