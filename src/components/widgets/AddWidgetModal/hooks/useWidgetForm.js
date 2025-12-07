import { useState, useEffect, useCallback } from 'react';
import useWidgetStore from '@/store/widgetStore';

/**
 * Custom hook for form state management
 * Handles all widget form logic and validation
 */
export function useWidgetForm(editingWidget = null) {
  const { widgets } = useWidgetStore();

  const [formData, setFormData] = useState({
    widgetName: editingWidget?.widgetName || '',
    apiUrl: editingWidget?.apiUrl || '',
    refreshInterval: editingWidget?.refreshInterval || 30,
    displayMode: editingWidget?.displayMode || 'card',
    selectedFields: editingWidget?.selectedFields || [],
    apiType: editingWidget?.widgetType || null,
  });

  // Update form when editing widget changes
  useEffect(() => {
    if (editingWidget) {
      setFormData({
        widgetName: editingWidget.widgetName,
        apiUrl: editingWidget.apiUrl,
        refreshInterval: editingWidget.refreshInterval,
        displayMode: editingWidget.displayMode,
        selectedFields: editingWidget.selectedFields || [],
        apiType: editingWidget.widgetType,
      });
    }
  }, [editingWidget]);

  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const reset = useCallback(() => {
    setFormData({
      widgetName: '',
      apiUrl: '',
      refreshInterval: 30,
      displayMode: 'card',
      selectedFields: [],
      apiType: null,
    });
  }, []);

  const canAddMore = useCallback(() => {
    const uniqueApiUrls = new Set(
      widgets
        .filter((w) => !editingWidget || w.id !== editingWidget.id)
        .map((w) => w.apiUrl)
    );
    return uniqueApiUrls.size < 3 || !!editingWidget;
  }, [widgets, editingWidget]);

  const isDuplicate = useCallback(() => {
    return !!widgets.find(
      (w) =>
        w.apiUrl === formData.apiUrl.trim() &&
        (!editingWidget || w.id !== editingWidget.id)
    );
  }, [widgets, formData.apiUrl, editingWidget]);

  return {
    formData,
    updateField,
    reset,
    canAddMore: canAddMore(),
    isDuplicate: isDuplicate(),
    isEditing: !!editingWidget,
  };
}
