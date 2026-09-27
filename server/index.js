'use strict';

require('dotenv').config();

const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { checkDatabaseConnection } = require('./config/db');
const { buildSessionMiddleware } = require('./config/session');
const { attachUser } = require('./middleware/auth');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const healthRouter = require('./routes/health');
const authRouter = require('./routes/auth');
const projectsRouter = require('./routes/projects');
const inquiriesRouter = require('./routes/inquiries');

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

const ALLOWED_ORIGIN_SUFFIX = process.env.CORS_ALLOWED_ORIGIN_SUFFIX || '.arx-app.com';

function isAllowedOrigin(origin) {
  if (!origin) return true;
  try {
    const { hostname } = new URL(origin);
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
    const suffix = ALLOWED_ORIGIN_SUFFIX.startsWith('.')
      ? ALLOWED_ORIGIN_SUFFIX
      : `.${ALLOWED_ORIGIN_SUFFIX}`;
    return hostname.endsWith(suffix) || hostname === suffix.slice(1);
  } catch (err) {
    return false;
  }
}

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'X-Requested-With'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(cookieParser());

try {
  app.use(buildSessionMiddleware());
} catch (err) {
  console.error('[designstudio] Failed to initialise session middleware:', err.message);
}

app.use(attachUser);

app.use('/', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/inquiries', inquiriesRouter);

app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 4112;
const HOST = '0.0.0.0';

function createServerInstance() {
  if (process.env.SSL_ENABLED === 'true') {
    try {
      const certPath = process.env.SSL_CERT_PATH;
      const keyPath = process.env.SSL_KEY_PATH;
      if (!certPath || !keyPath) {
        throw new Error('SSL_CERT_PATH and SSL_KEY_PATH must be set when SSL_ENABLED is true');
      }
      const options = {
        cert: fs.readFileSync(path.resolve(certPath)),
        key: fs.readFileSync(path.resolve(keyPath))
      };
      if (process.env.SSL_CA_PATH) {
        try {
          options.ca = fs.readFileSync(path.resolve(process.env.SSL_CA_PATH));
        } catch (caErr) {
          console.warn('[designstudio] Could not read SSL_CA_PATH:', caErr.message);
        }
      }
      return { server: https.createServer(options, app), secure: true };
    } catch (err) {
      console.error('[designstudio] TLS setup failed, falling back to HTTP:', err.message);
      return { server: http.createServer(app), secure: false };
    }
  }
  return { server: http.createServer(app), secure: false };
}

const { server, secure } = createServerInstance();

server.on('error', (err) => {
  console.error('[designstudio] Server error:', err.message);
  if (err.code === 'EADDRINUSE') {
    process.exit(1);
  }
});

server.listen(PORT, HOST, async () => {
  const scheme = secure ? 'https' : 'http';
  console.log(`[designstudio] API listening on ${scheme}://${HOST}:${PORT}`);
  try {
    await checkDatabaseConnection();
    console.log('[designstudio] Database connection OK');
  } catch (err) {
    console.warn('[designstudio] Database unavailable at boot:', err.message);
  }
});

process.on('unhandledRejection', (reason) => {
  console.error('[designstudio] Unhandled rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[designstudio] Uncaught exception:', err);
});

function shutdown(signal) {
  console.log(`[designstudio] Received ${signal}, shutting down...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 8000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = app;