import {
  isArrayField,
  filterArrayFields,
  getFirstArrayField,
  isValidTableSelection,
} from './arrayFieldUtils';

/**
 * Widget form validation
 * All validation logic in one place
 */

export function validateWidgetName(name) {
  if (!name.trim()) {
    return 'Widget name is required';
  }
  return null;
}

export function validateApiUrl(url) {
  if (!url.trim()) {
    return 'API URL is required';
  }
  return null;
}

export function validateApiTested(testStatus) {
  if (!testStatus?.success) {
    return 'Please test the API connection first';
  }
  return null;
}

export function validateTableFieldSelection(selectedFields, availableFields) {
  if (selectedFields.length === 0) {
    const arrays = filterArrayFields(availableFields);
    if (arrays.length === 0) {
      return 'No array fields found in API response. Please select a different API.';
    }
    return null; // Will auto-select first array
  }

  // Validate selected field is actually an array
  if (!isValidTableSelection(selectedFields[0], availableFields)) {
    return 'Selected field must be an array for table view';
  }

  return null;
}

export function validateFieldSelection(selectedFields, displayMode, availableFields) {
  if (displayMode === 'chart') {
    return null; // Charts auto-populate
  }

  if (displayMode === 'table') {
    return validateTableFieldSelection(selectedFields, availableFields);
  }

  if (selectedFields.length === 0) {
    return null; // Will auto-populate
  }

  return null;
}

/**
 * Run all validations
 * Returns first error found or null
 */
export function validateWidget(formData, availableFields, testStatus) {
  const nameError = validateWidgetName(formData.widgetName);
  if (nameError) return nameError;

  const urlError = validateApiUrl(formData.apiUrl);
  if (urlError) return urlError;

  const apiError = validateApiTested(testStatus);
  if (apiError) return apiError;

  const fieldsError = validateFieldSelection(
    formData.selectedFields,
    formData.displayMode,
    availableFields
  );
  if (fieldsError) return fieldsError;

  return null;
}
