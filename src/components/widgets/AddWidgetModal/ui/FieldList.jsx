/**
 * FieldList - Display list of available or selected fields
 */
export default function FieldList({
  fields,
  selectedFields,
  onAddField,
  onRemoveField,
  displayMode,
  isEmpty,
  emptyMessage = 'No fields found',
}) {
  if (isEmpty) {
    return (
      <div className="p-4 text-center text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {fields.map((field, index) => (
        <div
          key={index}
          className="mb-2 flex items-center justify-between rounded-lg bg-gray-800 p-2 hover:bg-gray-700"
        >
          <div className="flex-1">
            <div className="text-sm font-mono text-white">{field.path}</div>
            <div className="text-xs text-gray-400">
              {field.type} | {field.sample}
            </div>
          </div>
          {onAddField && (
            <button
              onClick={() => onAddField(field.path)}
              disabled={
                // For table mode, only one array field can be selected (toggle)
                displayMode === 'table'
                  ? selectedFields.length > 0 && selectedFields[0] === field.path
                  // For card mode, arrays should not be selectable because they cannot map one-to-one
                  : displayMode === 'card' && field.type === 'array'
                  ? true
                  : selectedFields.includes(field.path)
              }
              className="ml-2 rounded bg-green-600 px-2 py-1 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {displayMode === 'table' &&
              selectedFields.length > 0 &&
              selectedFields[0] === field.path
                ? '✓'
                : '+'}
            </button>
          )}
          {onRemoveField && (
            <button
              onClick={() => onRemoveField(field.path)}
              className="ml-2 rounded bg-red-600 px-2 py-1 text-white hover:bg-red-700"
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
