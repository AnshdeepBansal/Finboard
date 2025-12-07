/**
 * ModalWrapper - Reusable modal container
 * Handles backdrop and styling logic
 */
export default function ModalWrapper({ isOpen, onClose, children, title, isEditing }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 overflow-y-auto flex items-center justify-center">
      <div className="md:w-[40vw] sm:w-[80vw] w-full lg:h-[85vh] h-full overflow-scroll bg-gray-800 p-4 sm:p-6 md:p-8 text-white rounded-xl">
        {/* Header */}
        <div className="mb-4 sm:mb-6 flex items-center justify-between max-w-7xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold">
            {isEditing ? 'Edit Widget' : title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 -mr-2 cursor-pointer"
            aria-label="Close modal"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="max-w-7xl mx-auto">{children}</div>
      </div>
    </div>
  );
}
