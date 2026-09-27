const express = require('express');
const { checkDatabaseConnection } = require('../config/db');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'designstudio-api',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

router.get('/health/db', async (req, res) => {
  try {
    await checkDatabaseConnection();
    res.status(200).json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[health] Database check failed:', err && err.message ? err.message : err);
    res.status(503).json({
      status: 'degraded',
      database: 'unavailable',
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;