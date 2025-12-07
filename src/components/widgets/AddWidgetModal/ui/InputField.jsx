/**
 * InputField - Reusable input component
 * Single responsibility: render input with label
 */
export default function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  min,
  className = '',
}) {
  return (
    <>
      {label && <label className="mb-2 block text-sm font-medium">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        className={`w-full rounded-lg bg-gray-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500 ${className}`}
      />
    </>
  );
}
