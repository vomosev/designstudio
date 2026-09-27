'use strict';

/**
 * 404 handler — mounted after all routes.
 */
function notFound(req, res) {
  res.status(404).json({
    error: 'Not found',
    path: req.originalUrl || req.url || '',
  });
}

/**
 * Central error handler.
 * Maps err.status / err.statusCode (default 500) onto the response and hides
 * stack traces in production.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const isProduction = process.env.NODE_ENV === 'production';

  let status = Number(err && (err.status || err.statusCode));
  if (!Number.isInteger(status) || status < 400 || status > 599) {
    status = 500;
  }

  const rawMessage =
    (err && typeof err.message === 'string' && err.message.trim()) || 'Internal server error';

  const message = status >= 500 && isProduction ? 'Internal server error' : rawMessage;

  // Log everything server-side.
  if (status >= 500) {
    console.error('[error]', req.method, req.originalUrl || req.url, '-', rawMessage);
    if (err && err.stack) {
      console.error(err.stack);
    }
  } else {
    console.warn('[warn]', req.method, req.originalUrl || req.url, '-', status, rawMessage);
  }

  if (res.headersSent) {
    return next(err);
  }

  const payload = { error: message };

  if (err && err.details !== undefined && err.details !== null) {
    payload.details = err.details;
  } else if (err && err.errors !== undefined && err.errors !== null) {
    payload.details = err.errors;
  }

  if (!isProduction && err && err.stack) {
    payload.stack = String(err.stack).split('\n').slice(0, 8);
  }

  return res.status(status).json(payload);
}

module.exports = { notFound, errorHandler };