import SunIcon from '@/components/Icons/SunIcon';
import MoonIcon from '@/components/Icons/MoonIcon';

export default function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`rounded-lg px-3 sm:px-4 py-2 cursor-pointer text-sm font-medium transition-all hover:scale-105 ${
        isDark
          ? 'bg-gray-800 text-white hover:bg-gray-700'
          : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
      }`}
      aria-label="Toggle theme"
    >
      <span className="text-base">
        {isDark ? <SunIcon /> : <MoonIcon />}
      </span>
    </button>
  );
}
