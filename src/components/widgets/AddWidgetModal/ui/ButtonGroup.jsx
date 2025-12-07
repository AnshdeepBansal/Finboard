/**
 * ButtonGroup - Action buttons for modal
 */
export default function ButtonGroup({
  onCancel,
  onSubmit,
  isSubmitDisabled,
  isEditing,
  disabledReason,
}) {
  return (
    <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
      <button
        onClick={onCancel}
        className="rounded-lg bg-gray-700 px-4 sm:px-6 py-2 text-white hover:bg-gray-600 order-2 sm:order-1"
      >
        Cancel
      </button>
      <button
        onClick={onSubmit}
        disabled={isSubmitDisabled}
        className="rounded-lg bg-green-600 px-4 sm:px-6 py-2 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
        title={disabledReason || ''}
      >
        {isEditing ? 'Update Widget' : 'Add Widget'}
      </button>
    </div>
  );
}
