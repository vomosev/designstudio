'use strict';

const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const {
  isNonEmptyString,
  isEmail,
  clampString,
  HttpError,
} = require('../utils/validate');

const SESSION_COOKIE_NAME = 'designstudio.sid';
const BCRYPT_COST = 10;

function publicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
  };
}

function normaliseEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function saveSession(req) {
  return new Promise((resolve, reject) => {
    if (!req.session || typeof req.session.save !== 'function') {
      resolve();
      return;
    }
    req.session.save((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/**
 * POST /api/auth/signup
 */
async function signup(req, res, next) {
  try {
    const body = req.body || {};
    const name = clampString(isNonEmptyString(body.name) ? body.name.trim() : '', 120);
    const email = clampString(normaliseEmail(body.email), 180);
    const password = typeof body.password === 'string' ? body.password : '';

    const errors = {};
    if (!isNonEmptyString(name)) {
      errors.name = 'Please tell us your name.';
    }
    if (!isEmail(email)) {
      errors.email = 'Enter a valid email address.';
    }
    if (!password || password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }

    if (Object.keys(errors).length > 0) {
      throw new HttpError('Please correct the highlighted fields.', 400, errors);
    }

    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    if (Array.isArray(existing) && existing.length > 0) {
      throw new HttpError('An account with that email already exists.', 409);
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

    let insertResult;
    try {
      [insertResult] = await pool.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [name, email, passwordHash, 'editor']
      );
    } catch (dbErr) {
      if (dbErr && dbErr.code === 'ER_DUP_ENTRY') {
        throw new HttpError('An account with that email already exists.', 409);
      }
      throw dbErr;
    }

    const user = {
      id: insertResult.insertId,
      name,
      email,
      role: 'editor',
    };

    if (req.session) {
      req.session.user = user;
      await saveSession(req);
    }

    return res.status(201).json({ user });
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const body = req.body || {};
    const email = normaliseEmail(body.email);
    const password = typeof body.password === 'string' ? body.password : '';

    if (!isEmail(email) || !password) {
      throw new HttpError('Email and password are required.', 400, {
        email: isEmail(email) ? undefined : 'Enter a valid email address.',
        password: password ? undefined : 'Enter your password.',
      });
    }

    const [rows] = await pool.query(
      'SELECT id, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    const row = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
    if (!row) {
      throw new HttpError('Incorrect email or password.', 401);
    }

    const matches = await bcrypt.compare(password, row.password_hash || '');
    if (!matches) {
      throw new HttpError('Incorrect email or password.', 401);
    }

    const user = publicUser(row);

    if (req.session) {
      req.session.user = user;
      await saveSession(req);
    }

    return res.json({ user });
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/auth/logout
 */
async function logout(req, res, next) {
  try {
    if (!req.session) {
      res.clearCookie(SESSION_COOKIE_NAME, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        domain: process.env.SESSION_COOKIE_DOMAIN || undefined,
      });
      return res.json({ ok: true });
    }

    return req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      res.clearCookie(SESSION_COOKIE_NAME, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        domain: process.env.SESSION_COOKIE_DOMAIN || undefined,
      });
      return res.json({ ok: true });
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/auth/me
 */
async function me(req, res, next) {
  try {
    const sessionUser = req.session && req.session.user ? req.session.user : null;
    if (!sessionUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Refresh from the database so role/name changes propagate; tolerate DB issues.
    try {
      const [rows] = await pool.query(
        'SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1',
        [sessionUser.id]
      );
      const row = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
      if (!row) {
        return req.session.destroy(() =>
          res.status(401).json({ error: 'Authentication required' })
        );
      }
      const user = publicUser(row);
      req.session.user = user;
      return res.json({ user });
    } catch (dbErr) {
      console.warn('[auth] /me database lookup failed:', dbErr.message);
      return res.json({ user: publicUser(sessionUser) });
    }
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  signup,
  login,
  logout,
  me,
};