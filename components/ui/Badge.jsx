export default function Badge({
  tone = 'neutral',
  size = 'md',
  as: Component = 'span',
  className = '',
  children,
  ...rest
}) {
  const tones = ['neutral', 'accent', 'success', 'warning', 'danger'];
  const sizes = ['sm', 'md'];

  const safeTone = tones.includes(tone) ? tone : 'neutral';
  const safeSize = sizes.includes(size) ? size : 'md';

  const classes = [
    'badge',
    `badge--${safeTone}`,
    `badge--${safeSize}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (children === null || children === undefined || children === '') {
    return null;
  }

  return (
    <Component className={classes} {...rest}>
      {children}
    </Component>
  );
}

export { Badge };