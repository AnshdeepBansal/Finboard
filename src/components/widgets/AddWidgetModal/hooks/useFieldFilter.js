import { useState, useMemo, useCallback } from 'react';

/**
 * Custom hook for filtering and searching fields
 * Single responsibility: field filtering logic
 */
export function useFieldFilter(availableFields, displayMode) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFields = useMemo(() => {
    return availableFields.filter((field) => {
      const matchesSearch = field.path
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // For table mode, only show arrays
      const matchesArrayFilter = displayMode === 'table' ? field.type === 'array' : true;

      return matchesSearch && matchesArrayFilter;
    });
  }, [availableFields, searchQuery, displayMode]);

  const reset = useCallback(() => {
    setSearchQuery('');
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    filteredFields,
    reset,
  };
}
