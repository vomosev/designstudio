'use strict';

/**
 * Small dependency-free validation helpers shared by the Express controllers.
 */

class HttpError extends Error {
  constructor(message, status = 500, details) {
    super(message || 'Unexpected error');
    this.name = 'HttpError';
    this.status = Number.isInteger(status) ? status : 500;
    if (details !== undefined) {
      this.details = details;
    }
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError);
    }
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

function isString(value) {
  return typeof value === 'string';
}

function isNonEmptyString(value) {
  return isString(value) && value.trim().length > 0;
}

function isEmail(value) {
  if (!isNonEmptyString(value)) return false;
  const trimmed = value.trim();
  if (trimmed.length > 254) return false;
  return EMAIL_RE.test(trimmed);
}

/**
 * Trim a value to a string and hard-limit its length.
 */
function clampString(value, max = 255) {
  if (value === null || value === undefined) return '';
  const str = typeof value === 'string' ? value : String(value);
  const trimmed = str.trim();
  const limit = Number.isFinite(max) && max > 0 ? Math.floor(max) : trimmed.length;
  return trimmed.length > limit ? trimmed.slice(0, limit) : trimmed;
}

/**
 * Convert an arbitrary title into a URL-safe slug.
 */
function slugify(title) {
  if (title === null || title === undefined) return '';
  const base = (typeof title === 'string' ? title : String(title))
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’"`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
  return base.slice(0, 180).replace(/-+$/g, '');
}

function toNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  if (typeof value === 'string' && value.trim() !== '') return Number(value.trim());
  return NaN;
}

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

/**
 * validateFields(body, rules)
 *
 * rules shape (per field):
 * {
 *   required: true,
 *   type: 'string' | 'email' | 'number' | 'integer' | 'boolean',
 *   min: Number,           // min length for strings, min value for numbers
 *   max: Number,           // max length for strings, max value for numbers
 *   enum: ['a', 'b'],
 *   label: 'Friendly name',
 *   pattern: /regex/,
 *   message: 'Custom error message'
 * }
 *
 * Returns { valid, errors, values } where errors is an object keyed by field.
 */
function validateFields(body, rulesObject) {
  const errors = {};
  const values = {};
  const source = isPlainObject(body) ? body : {};
  const rules = isPlainObject(rulesObject) ? rulesObject : {};

  Object.keys(rules).forEach((field) => {
    const rule = isPlainObject(rules[field]) ? rules[field] : {};
    const label = rule.label || field;
    const raw = source[field];
    const type = rule.type || 'string';
    const isMissing =
      raw === undefined ||
      raw === null ||
      (typeof raw === 'string' && raw.trim() === '');

    if (isMissing) {
      if (rule.required) {
        errors[field] = rule.message || `${label} is required.`;
      } else if (rule.default !== undefined) {
        values[field] = rule.default;
      }
      return;
    }

    if (type === 'email') {
      const email = clampString(raw, rule.max || 254).toLowerCase();
      if (!isEmail(email)) {
        errors[field] = rule.message || `${label} must be a valid email address.`;
        return;
      }
      values[field] = email;
      return;
    }

    if (type === 'number' || type === 'integer') {
      const num = toNumber(raw);
      if (Number.isNaN(num)) {
        errors[field] = rule.message || `${label} must be a number.`;
        return;
      }
      if (type === 'integer' && !Number.isInteger(num)) {
        errors[field] = rule.message || `${label} must be a whole number.`;
        return;
      }
      if (typeof rule.min === 'number' && num < rule.min) {
        errors[field] = rule.message || `${label} must be at least ${rule.min}.`;
        return;
      }
      if (typeof rule.max === 'number' && num > rule.max) {
        errors[field] = rule.message || `${label} must be at most ${rule.max}.`;
        return;
      }
      values[field] = num;
      return;
    }

    if (type === 'boolean') {
      let bool;
      if (typeof raw === 'boolean') bool = raw;
      else if (raw === 1 || raw === '1' || raw === 'true') bool = true;
      else if (raw === 0 || raw === '0' || raw === 'false') bool = false;
      else {
        errors[field] = rule.message || `${label} must be true or false.`;
        return;
      }
      values[field] = bool;
      return;
    }

    // Default: string handling
    if (!isString(raw) && typeof raw !== 'number') {
      errors[field] = rule.message || `${label} must be text.`;
      return;
    }
    const str = clampString(raw, rule.max || 10000);
    if (typeof rule.min === 'number' && str.length < rule.min) {
      errors[field] =
        rule.message || `${label} must be at least ${rule.min} characters.`;
      return;
    }
    if (
      typeof rule.max === 'number' &&
      isString(raw) &&
      raw.trim().length > rule.max &&
      rule.strictMax
    ) {
      errors[field] = rule.message || `${label} must be ${rule.max} characters or fewer.`;
      return;
    }
    if (Array.isArray(rule.enum) && !rule.enum.includes(str)) {
      errors[field] =
        rule.message || `${label} must be one of: ${rule.enum.join(', ')}.`;
      return;
    }
    if (rule.pattern instanceof RegExp && !rule.pattern.test(str)) {
      errors[field] = rule.message || `${label} is not in the expected format.`;
      return;
    }
    values[field] = str;
  });

  return { valid: Object.keys(errors).length === 0, errors, values };
}

module.exports = {
  HttpError,
  isNonEmptyString,
  isEmail,
  clampString,
  slugify,
  validateFields,
};