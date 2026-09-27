function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

export function Card({
  as: Component = 'div',
  interactive = false,
  padded = true,
  className = '',
  children,
  ...rest
}) {
  return (
    <Component
      className={cx(
        'card',
        padded ? 'card--padded' : 'card--flush',
        interactive && 'card--interactive',
        className
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ as: Component = 'div', className = '', children, ...rest }) {
  return (
    <Component className={cx('card__header', className)} {...rest}>
      {children}
    </Component>
  );
}

export function CardBody({ as: Component = 'div', className = '', children, ...rest }) {
  return (
    <Component className={cx('card__body', className)} {...rest}>
      {children}
    </Component>
  );
}

export function CardFooter({ as: Component = 'div', className = '', children, ...rest }) {
  return (
    <Component className={cx('card__footer', className)} {...rest}>
      {children}
    </Component>
  );
}

export default Card;