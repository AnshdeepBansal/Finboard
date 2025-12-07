import { filterArrayFields, getFirstArrayField } from './arrayFieldUtils';

/**
 * Handles building the final widget data structure
 * Separates form data transformation from UI logic
 */

export function buildFieldsForSubmit(selectedFields, displayMode, apiType, availableFields) {
  if (displayMode === 'chart' && apiType === 'time-series') {
    return ['open', 'high', 'low', 'close', 'volume'];
  }

  if (displayMode === 'table') {
    if (selectedFields.length === 0) {
      const firstArray = getFirstArrayField(availableFields);
      return firstArray ? [firstArray.path] : [];
    }
    return selectedFields;
  }

  if (selectedFields.length === 0) {
    return availableFields.map((f) => f.path);
  }

  return selectedFields;
}

export function buildWidgetData(formData, fieldsToUse, validHeaders) {
  return {
    widgetName: formData.widgetName.trim(),
    apiUrl: formData.apiUrl.trim(),
    refreshInterval: parseInt(formData.refreshInterval) || 30,
    displayMode: formData.displayMode,
    selectedFields: fieldsToUse,
    widgetType: formData.apiType,
    headers: validHeaders.length > 0 ? validHeaders : undefined,
  };
}

export function filterValidHeaders(headers) {
  return headers.filter((h) => h.key.trim() !== '');
}
