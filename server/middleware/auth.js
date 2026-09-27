'use strict';

/**
 * Session-based authentication middleware for the Prism Studio API.
 *
 * The session cookie is issued by express-session (see server/config/session.js)
 * and stores a normalised user object: { id, name, email, role }.
 */

/**
 * Normalises req.session.user onto req.user so downstream controllers can read
 * the current actor from a single place. Always calls next().
 */
function attachUser(req, _res, next) {
  try {
    const sessionUser = req && req.session ? req.session.user : null;

    if (sessionUser && typeof sessionUser === 'object' && sessionUser.id) {
      req.user = {
        id: sessionUser.id,
        name: typeof sessionUser.name === 'string' ? sessionUser.name : '',
        email: typeof sessionUser.email === 'string' ? sessionUser.email : '',
        role: sessionUser.role === 'admin' ? 'admin' : 'editor',
      };
    } else {
      req.user = null;
    }
  } catch (err) {
    req.user = null;
  }

  return next();
}

/**
 * Blocks the request with 401 when there is no authenticated session.
 */
function requireAuth(req, res, next) {
  const sessionUser = req && req.session ? req.session.user : null;

  if (!sessionUser || !sessionUser.id) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!req.user) {
    req.user = {
      id: sessionUser.id,
      name: typeof sessionUser.name === 'string' ? sessionUser.name : '',
      email: typeof sessionUser.email === 'string' ? sessionUser.email : '',
      role: sessionUser.role === 'admin' ? 'admin' : 'editor',
    };
  }

  return next();
}

/**
 * Blocks the request with 401 when anonymous, or 403 when the authenticated
 * user is not an administrator.
 */
function requireAdmin(req, res, next) {
  const sessionUser = req && req.session ? req.session.user : null;

  if (!sessionUser || !sessionUser.id) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (sessionUser.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required' });
  }

  if (!req.user) {
    req.user = {
      id: sessionUser.id,
      name: typeof sessionUser.name === 'string' ? sessionUser.name : '',
      email: typeof sessionUser.email === 'string' ? sessionUser.email : '',
      role: 'admin',
    };
  }

  return next();
}

/**
 * Convenience helper used by public endpoints that change behaviour for
 * signed-in staff (e.g. listing draft projects).
 */
function isAuthenticated(req) {
  return Boolean(req && req.session && req.session.user && req.session.user.id);
}

module.exports = {
  attachUser,
  requireAuth,
  requireAdmin,
  isAuthenticated,
};