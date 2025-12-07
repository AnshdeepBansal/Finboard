'use client';

import { getValueByPath } from '@/lib/extractJsonPaths';

export default function CardRenderer({ data, selectedFields, widgetName, apiType }) {
  if (!data || data.error) {
    return (
      <div className="p-4 text-center text-red-400">
        {data?.error || 'No data available'}
      </div>
    );
  }

  // If no fields selected, show message
  if (!selectedFields || selectedFields.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400">
        <div className="mb-2">No fields selected</div>
        <div className="text-sm">Please select fields to display in the widget configuration.</div>
      </div>
    );
  }

  // Get field labels (last part of path) for display
  const getFieldLabel = (path) => {
    const parts = path.split('.');
    return parts[parts.length - 1];
  };

  // Format value for display
  const formatValue = (value) => {
    if (value == null) return 'N/A';
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return `[${value.length} items]`;
      }
      return JSON.stringify(value);
    }
    if (typeof value === 'number') {
      // Format large numbers with commas
      if (value > 1000) {
        return value.toLocaleString();
      }
      // Format decimals
      if (value % 1 !== 0) {
        return value.toFixed(4);
      }
      return value.toString();
    }
    return String(value);
  };

  // Handle array data - if data is an array, use first item for card display
  let displayData = data;
  if (Array.isArray(data) && data.length > 0) {
    // For array responses, use the first item for card display
    displayData = data[0];
  } else if (data && typeof data === 'object' && data.data && Array.isArray(data.data) && data.data.length > 0) {
    // Handle parsed data structure that wraps array in data property
    displayData = data.data[0];
  }
  // Filter out fields that resolve to arrays — cards cannot represent arrays one-to-one
  const displayableFields = selectedFields.filter((fieldPath) => {
    let value;
    if (fieldPath.startsWith('[0].')) {
      const pathWithoutIndex = fieldPath.substring(4);
      value = getValueByPath(displayData, pathWithoutIndex);
    } else {
      value = getValueByPath(displayData, fieldPath);
    }

    // If value resolves to an array, it's not displayable in card
    if (Array.isArray(value)) return false;
    return true;
  });

  if (!displayableFields || displayableFields.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400">
        <div className="mb-2">No displayable fields</div>
        <div className="text-sm">Arrays cannot be rendered in Card view. Please select non-array fields.</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="space-y-2">
        {displayableFields.map((fieldPath, index) => {
          // Handle different path formats
          let value = undefined;
          
          // If path starts with [0], remove it and try direct access (for array item fields)
          if (fieldPath.startsWith('[0].')) {
            const pathWithoutIndex = fieldPath.substring(4); // Remove "[0]."
            value = getValueByPath(displayData, pathWithoutIndex);
          } else {
            // Try the path as-is
            value = getValueByPath(displayData, fieldPath);
          }
          
          // If still undefined and fieldPath is a simple key (no dots, no brackets), try direct access
          if (value === undefined && !fieldPath.includes('.') && !fieldPath.includes('[')) {
            value = displayData && typeof displayData === 'object' && displayData !== null 
              ? displayData[fieldPath] 
              : undefined;
          }

          const label = getFieldLabel(fieldPath);
          const displayValue = formatValue(value);
          return (
            <div
  key={index}
  className="flex flex-col sm:flex-row sm:justify-between gap-1 rounded-lg bg-gray-700 p-3 hover:bg-gray-600 transition-colors"
>
  <span
    className="text-gray-400 truncate pr-2 
               text-sm sm:text-base md:text-lg"
    title={fieldPath}
  >
    {label}
  </span>

  <span
    className="font-light text-white wrap-break-word sm:text-right
               text-sm sm:text-base md:text-lg"
  >
    {displayValue}
  </span>
</div>


          );
        })}
      </div>
    </div>
  );
}
