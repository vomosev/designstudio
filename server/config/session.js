'use strict';

const session = require('express-session');
const MySQLStoreFactory = require('express-mysql-session');
const { pool } = require('./db');

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Build the configured express-session middleware.
 * Uses express-mysql-session backed by the shared mysql2 pool.
 * Falls back to the in-memory store (with a warning) when the
 * MySQL-backed store cannot be created.
 */
function buildSessionMiddleware() {
  let store;

  try {
    const MySQLStore = MySQLStoreFactory(session);
    store = new MySQLStore(
      {
        createDatabaseTable: false,
        clearExpired: true,
        checkExpirationInterval: 15 * 60 * 1000,
        expiration: SEVEN_DAYS_MS,
        schema: {
          tableName: 'sessions',
          columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data',
          },
        },
      },
      pool
    );

    if (typeof store.on === 'function') {
      store.on('error', (err) => {
        console.error('[session] MySQL session store error:', err && err.message ? err.message : err);
      });
    }
  } catch (err) {
    console.warn(
      '[session] Unable to create the MySQL session store, falling back to MemoryStore:',
      err && err.message ? err.message : err
    );
    store = undefined;
  }

  const options = {
    name: 'designstudio.sid',
    secret: process.env.SESSION_SECRET || 'designstudio-development-secret',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    proxy: true,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: process.env.SESSION_COOKIE_DOMAIN || undefined,
      path: '/',
      maxAge: SEVEN_DAYS_MS,
    },
  };

  if (store) {
    options.store = store;
  }

  return session(options);
}

module.exports = { buildSessionMiddleware, SEVEN_DAYS_MS };