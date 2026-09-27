'use client';

import { forwardRef } from 'react';

function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required = false,
  className,
  children,
}) {
  const hintId = hint && htmlFor ? `${htmlFor}-hint` : undefined;
  const errorId = error && htmlFor ? `${htmlFor}-error` : undefined;

  return (
    <div className={cx('field', error && 'field--invalid', className)}>
      {label ? (
        <label className="field__label" htmlFor={htmlFor}>
          <span className="field__label-text">{label}</span>
          {required ? (
            <span className="field__required" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}

      <div className="field__control">{children}</div>

      {hint && !error ? (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}

      {error ? (
        <p className="field__error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(id, hint, error, provided) {
  const ids = [];
  if (provided) ids.push(provided);
  if (id && error) ids.push(`${id}-error`);
  else if (id && hint) ids.push(`${id}-hint`);
  return ids.length ? ids.join(' ') : undefined;
}

export const Input = forwardRef(function Input(
  { className, invalid = false, hint, error, id, 'aria-describedby': ariaDescribedBy, type = 'text', ...rest },
  ref
) {
  const isInvalid = Boolean(invalid || error);
  return (
    <input
      ref={ref}
      id={id}
      type={type}
      className={cx('input', isInvalid && 'input--invalid', className)}
      aria-invalid={isInvalid ? 'true' : undefined}
      aria-describedby={describedBy(id, hint, error, ariaDescribedBy)}
      {...rest}
    />
  );
});

export const Textarea = forwardRef(function Textarea(
  { className, invalid = false, hint, error, id, rows = 5, 'aria-describedby': ariaDescribedBy, ...rest },
  ref
) {
  const isInvalid = Boolean(invalid || error);
  return (
    <textarea
      ref={ref}
      id={id}
      rows={rows}
      className={cx('textarea', isInvalid && 'input--invalid', className)}
      aria-invalid={isInvalid ? 'true' : undefined}
      aria-describedby={describedBy(id, hint, error, ariaDescribedBy)}
      {...rest}
    />
  );
});

export const Select = forwardRef(function Select(
  { className, invalid = false, hint, error, id, children, 'aria-describedby': ariaDescribedBy, ...rest },
  ref
) {
  const isInvalid = Boolean(invalid || error);
  return (
    <div className="select-wrap">
      <select
        ref={ref}
        id={id}
        className={cx('select', isInvalid && 'input--invalid', className)}
        aria-invalid={isInvalid ? 'true' : undefined}
        aria-describedby={describedBy(id, hint, error, ariaDescribedBy)}
        {...rest}
      >
        {children}
      </select>
      <svg
        className="select-wrap__chevron"
        viewBox="0 0 16 16"
        width="16"
        height="16"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M3.5 6l4.5 4.5L12.5 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
});

export const Checkbox = forwardRef(function Checkbox(
  { className, label, id, ...rest },
  ref
) {
  return (
    <label className={cx('checkbox', className)} htmlFor={id}>
      <input ref={ref} id={id} type="checkbox" className="checkbox__input" {...rest} />
      <span className="checkbox__label">{label}</span>
    </label>
  );
});

export default Field;