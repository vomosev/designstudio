import Card from './Card';

function DefaultGlyph({ variant }) {
  if (variant === 'error') {
    return (
      <svg
        className="empty-state__glyph"
        viewBox="0 0 48 48"
        role="presentation"
        focusable="false"
        aria-hidden="true"
        width="48"
        height="48"
      >
        <circle
          cx="24"
          cy="24"
          r="19"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          opacity="0.35"
        />
        <path
          d="M24 14v13"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="24" cy="33.5" r="2.2" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg
      className="empty-state__glyph"
      viewBox="0 0 48 48"
      role="presentation"
      focusable="false"
      aria-hidden="true"
      width="48"
      height="48"
    >
      <rect
        x="7"
        y="11"
        width="34"
        height="26"
        rx="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        opacity="0.4"
      />
      <path
        d="M7 29l8.5-8 6.5 6 7-7L41 30"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx="18" cy="19.5" r="2.6" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

export default function EmptyState({
  variant = 'empty',
  icon,
  title = 'Nothing here yet',
  description,
  action,
  className = '',
}) {
  const tone = variant === 'error' ? 'error' : 'empty';
  const classes = ['empty-state', `empty-state--${tone}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <Card className={classes} padded>
      <div
        className="empty-state__icon"
        role={tone === 'error' ? 'alert' : undefined}
      >
        {icon || <DefaultGlyph variant={tone} />}
      </div>
      <h3 className="empty-state__title">{title}</h3>
      {description ? (
        <p className="empty-state__description">{description}</p>
      ) : null}
      {action ? <div className="empty-state__action cluster">{action}</div> : null}
    </Card>
  );
}

export { EmptyState };