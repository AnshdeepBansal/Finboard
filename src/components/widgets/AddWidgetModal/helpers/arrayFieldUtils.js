/**
 * Array field utilities for table field selection
 * Ensures only arrays are selected for table mode
 */

export function isArrayField(field) {
  return field.type === 'array';
}

export function filterArrayFields(fields) {
  return fields.filter(isArrayField);
}

export function getFirstArrayField(fields) {
  return filterArrayFields(fields)[0] || null;
}

export function isValidTableSelection(fieldPath, availableFields) {
  const field = availableFields.find((f) => f.path === fieldPath);
  return field && isArrayField(field);
}
