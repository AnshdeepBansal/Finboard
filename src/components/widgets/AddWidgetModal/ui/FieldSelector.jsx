/**
 * FieldSelector - Display mode selection buttons
 */
const DISPLAY_MODES = [
  {
    id: 'card',
    label: 'Card',
    icon: 'M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z',
  },
  {
    id: 'table',
    label: 'Table',
    icon: 'M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z',
  },
  {
    id: 'chart',
    label: 'Chart',
    icon: 'M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z',
  },
];

export default function FieldSelector({ value, onChange, label }) {
  return (
    <>
      {label && <label className="mb-2 block text-sm font-medium">{label}</label>}
      <div className="flex flex-wrap gap-2">
        {DISPLAY_MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onChange(mode.id)}
            className={`flex items-center gap-2 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base capitalize ${
              value === mode.id
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d={mode.icon} />
            </svg>
            {mode.label}
          </button>
        ))}
      </div>
    </>
  );
}
