import InputField from './InputField';

/**
 * HeaderInput - Manages individual header key-value pairs
 */
export default function HeaderInput({
  header,
  index,
  onKeyChange,
  onValueChange,
  onRemove,
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <InputField
        value={header.key}
        onChange={(e) => onKeyChange(index, e.target.value)}
        placeholder="Header Key (e.g., Authorization)"
        className="flex-1 text-sm sm:text-base"
      />
      <InputField
        value={header.value}
        onChange={(e) => onValueChange(index, e.target.value)}
        placeholder="Header Value (e.g., Bearer token123)"
        className="flex-1 text-sm sm:text-base"
      />
      <button
        type="button"
        onClick={onRemove}
        className="rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700 sm:shrink"
        title="Remove header"
      >
        ×
      </button>
    </div>
  );
}
