export default function Spinner({ size = 'md', label = 'Loading', className = '' }) {
  const sizeClass = ['sm', 'md', 'lg'].includes(size) ? size : 'md';
  const classes = ['spinner', `spinner--${sizeClass}`, className].filter(Boolean).join(' ');

  return (
    <span className={classes} role="status" aria-live="polite">
      <svg
        className="spinner__ring"
        viewBox="0 0 24 24"
        width="100%"
        height="100%"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          className="spinner__track"
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="2.5"
          opacity="0.25"
        />
        <path
          className="spinner__arc"
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="visually-hidden">{label}</span>
    </span>
  );
}