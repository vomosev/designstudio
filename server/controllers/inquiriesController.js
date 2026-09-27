'use strict';

const { pool } = require('../config/db');
const {
  isNonEmptyString,
  isEmail,
  clampString,
  HttpError,
} = require('../utils/validate');

const VALID_STATUSES = ['new', 'in_review', 'replied', 'archived'];

function mapInquiry(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    company: row.company || '',
    budgetRange: row.budget_range || '',
    service: row.service || '',
    message: row.message || '',
    status: row.status,
    createdAt: row.created_at,
  };
}

async function createInquiry(req, res, next) {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};

    const name = isNonEmptyString(body.name) ? body.name.trim() : '';
    const email = isNonEmptyString(body.email) ? body.email.trim() : '';
    const message = isNonEmptyString(body.message) ? body.message.trim() : '';
    const company = isNonEmptyString(body.company) ? body.company.trim() : '';
    const budgetRange = isNonEmptyString(body.budgetRange)
      ? body.budgetRange.trim()
      : isNonEmptyString(body.budget_range)
        ? body.budget_range.trim()
        : '';
    const service = isNonEmptyString(body.service) ? body.service.trim() : '';

    const errors = {};
    if (!name) errors.name = 'Please tell us your name.';
    if (!email) {
      errors.email = 'An email address is required.';
    } else if (!isEmail(email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!message) {
      errors.message = 'Please include a short project description.';
    } else if (message.length < 10) {
      errors.message = 'Please give us a little more detail (10+ characters).';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        error: 'Please correct the highlighted fields.',
        details: errors,
      });
    }

    const payload = {
      name: clampString(name, 120),
      email: clampString(email, 180),
      company: company ? clampString(company, 160) : null,
      budget_range: budgetRange ? clampString(budgetRange, 80) : null,
      service: service ? clampString(service, 120) : null,
      message: clampString(message, 4000),
    };

    const [result] = await pool.query(
      `INSERT INTO inquiries (name, email, company, budget_range, service, message, status)
       VALUES (?, ?, ?, ?, ?, ?, 'new')`,
      [
        payload.name,
        payload.email,
        payload.company,
        payload.budget_range,
        payload.service,
        payload.message,
      ]
    );

    const insertedId = result && result.insertId;
    let inquiry = null;

    if (insertedId) {
      const [rows] = await pool.query(
        `SELECT id, name, email, company, budget_range, service, message, status, created_at
         FROM inquiries WHERE id = ? LIMIT 1`,
        [insertedId]
      );
      inquiry = mapInquiry(rows && rows[0]);
    }

    if (!inquiry) {
      inquiry = mapInquiry({
        id: insertedId || null,
        name: payload.name,
        email: payload.email,
        company: payload.company,
        budget_range: payload.budget_range,
        service: payload.service,
        message: payload.message,
        status: 'new',
        created_at: new Date(),
      });
    }

    return res.status(201).json({ inquiry });
  } catch (err) {
    return next(err);
  }
}

async function listInquiries(req, res, next) {
  try {
    const status =
      req.query && isNonEmptyString(req.query.status)
        ? String(req.query.status).trim().toLowerCase()
        : '';

    const params = [];
    let sql = `SELECT id, name, email, company, budget_range, service, message, status, created_at
               FROM inquiries`;

    if (status && status !== 'all') {
      if (!VALID_STATUSES.includes(status)) {
        throw new HttpError(
          `Invalid status filter. Use one of: ${VALID_STATUSES.join(', ')}.`,
          400
        );
      }
      sql += ' WHERE status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC, id DESC LIMIT 500';

    const [rows] = await pool.query(sql, params);
    const inquiries = Array.isArray(rows) ? rows.map(mapInquiry) : [];

    return res.json({ inquiries, count: inquiries.length });
  } catch (err) {
    return next(err);
  }
}

async function updateInquiryStatus(req, res, next) {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpError('A valid inquiry id is required.', 400);
    }

    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const status = isNonEmptyString(body.status)
      ? body.status.trim().toLowerCase()
      : '';

    if (!VALID_STATUSES.includes(status)) {
      throw new HttpError(
        `Status must be one of: ${VALID_STATUSES.join(', ')}.`,
        400
      );
    }

    const [result] = await pool.query(
      'UPDATE inquiries SET status = ? WHERE id = ?',
      [status, id]
    );

    if (!result || result.affectedRows === 0) {
      throw new HttpError('Inquiry not found.', 404);
    }

    const [rows] = await pool.query(
      `SELECT id, name, email, company, budget_range, service, message, status, created_at
       FROM inquiries WHERE id = ? LIMIT 1`,
      [id]
    );

    const inquiry = mapInquiry(rows && rows[0]);
    if (!inquiry) {
      throw new HttpError('Inquiry not found.', 404);
    }

    return res.json({ inquiry });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createInquiry,
  listInquiries,
  updateInquiryStatus,
  VALID_STATUSES,
};