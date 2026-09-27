'use client';

import React from 'react';
import Link from 'next/link';
import Spinner from './Spinner';

const VARIANTS = ['primary', 'secondary', 'ghost', 'danger'];
const SIZES = ['sm', 'md', 'lg'];

function buildClassName({ variant, size, loading, block, className }) {
  const safeVariant = VARIANTS.includes(variant) ? variant : 'primary';
  const safeSize = SIZES.includes(size) ? size : 'md';

  return [
    'btn',
    `btn--${safeVariant}`,
    `btn--${safeSize}`,
    loading ? 'btn--loading' : null,
    block ? 'btn--block' : null,
    className || null,
  ]
    .filter(Boolean)
    .join(' ');
}

const Button = React.forwardRef(function Button(
  {
    as,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    type = 'button',
    href,
    onClick,
    block = false,
    className,
    children,
    ...rest
  },
  ref
) {
  const classes = buildClassName({ variant, size, loading, block, className });
  const isBusy = Boolean(loading);
  const isInert = Boolean(disabled) || isBusy;

  const content = (
    <>
      {isBusy ? (
        <span className="btn__spinner" aria-hidden="true">
          <Spinner size="sm" label="Working" />
        </span>
      ) : null}
      <span className="btn__label">{children}</span>
    </>
  );

  // Resolve the element to render.
  let Component = 'button';
  if (as === 'a') {
    Component = 'a';
  } else if (as === Link || as === 'link' || as === 'Link') {
    Component = Link;
  } else if (typeof as === 'function' || (typeof as === 'object' && as !== null)) {
    Component = as;
  } else if (typeof as === 'string' && as !== 'button') {
    Component = as;
  } else if (!as && href) {
    Component = Link;
  }

  if (Component === 'button') {
    const handleClick = (event) => {
      if (isInert) {
        event.preventDefault();
        return;
      }
      if (typeof onClick === 'function') {
        onClick(event);
      }
    };

    return (
      <button
        {...rest}
        ref={ref}
        type={type}
        className={classes}
        disabled={isInert}
        aria-busy={isBusy ? 'true' : undefined}
        onClick={handleClick}
      >
        {content}
      </button>
    );
  }

  // Link-like rendering (next/link, <a>, or a custom component).
  const linkHandleClick = (event) => {
    if (isInert) {
      event.preventDefault();
      return;
    }
    if (typeof onClick === 'function') {
      onClick(event);
    }
  };

  const linkProps = {
    ...rest,
    ref,
    className: classes,
    onClick: linkHandleClick,
    'aria-busy': isBusy ? 'true' : undefined,
    'aria-disabled': isInert ? 'true' : undefined,
  };

  if (Component === Link) {
    linkProps.href = href || '#';
  } else if (Component === 'a') {
    linkProps.href = isInert ? undefined : href;
  } else if (href) {
    linkProps.href = href;
  }

  if (isInert) {
    linkProps.tabIndex = -1;
  }

  return <Component {...linkProps}>{content}</Component>;
});

export default Button;