/**
 * Section - Reusable section wrapper
 * Handles consistent spacing and structure
 */
export default function Section({ children, className = '' }) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}
