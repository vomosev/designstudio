'use strict';

const { pool } = require('../config/db');
const {
  isNonEmptyString,
  clampString,
  slugify,
  HttpError,
} = require('../utils/validate');

const CATEGORIES = ['Branding', 'Packaging', 'Editorial', 'Digital', 'Motion'];
const STATUSES = ['draft', 'published'];

function mapProject(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    client: row.client,
    category: row.category,
    year: row.year === null || row.year === undefined ? null : Number(row.year),
    summary: row.summary,
    body: row.body,
    palette:
      typeof row.palette === 'string' && row.palette.length
        ? row.palette
            .split(',')
            .map((token) => token.trim())
            .filter(Boolean)
        : [],
    coverHue:
      row.cover_hue === null || row.cover_hue === undefined
        ? 260
        : Number(row.cover_hue),
    coverHueEnd:
      row.cover_hue_end === null || row.cover_hue_end === undefined
        ? (Number(row.cover_hue) || 260) + 40
        : Number(row.cover_hue_end),
    featured: Boolean(row.featured),
    status: row.status,
    sortOrder:
      row.sort_order === null || row.sort_order === undefined
        ? 0
        : Number(row.sort_order),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function isAuthenticated(req) {
  return Boolean(req && req.session && req.session.user);
}

function parseHue(value, fallback) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  const rounded = Math.round(num);
  if (rounded < 0) return 0;
  if (rounded > 360) return 360;
  return rounded;
}

function normalisePalette(value) {
  if (Array.isArray(value)) {
    return clampString(
      value
        .map((token) => String(token).trim())
        .filter(Boolean)
        .join(','),
      255
    );
  }
  if (typeof value === 'string') {
    return clampString(value.trim(), 255);
  }
  return '';
}

async function slugExists(slug, excludeId) {
  const params = [slug];
  let sql = 'SELECT id FROM projects WHERE slug = ?';
  if (excludeId) {
    sql += ' AND id <> ?';
    params.push(excludeId);
  }
  sql += ' LIMIT 1';
  const [rows] = await pool.query(sql, params);
  return rows.length > 0;
}

async function uniqueSlug(base, excludeId) {
  const root = base && base.length ? base : 'project';
  let candidate = root;
  let counter = 2;
  /* eslint-disable no-await-in-loop */
  while (await slugExists(candidate, excludeId)) {
    candidate = `${root}-${counter}`;
    counter += 1;
    if (counter > 200) {
      candidate = `${root}-${Date.now()}`;
      break;
    }
  }
  /* eslint-enable no-await-in-loop */
  return candidate;
}

async function listProjects(req, res, next) {
  try {
    const { category, featured, limit, status } = req.query || {};
    const where = [];
    const params = [];

    if (isAuthenticated(req)) {
      if (isNonEmptyString(status) && STATUSES.includes(status)) {
        where.push('status = ?');
        params.push(status);
      }
    } else {
      where.push("status = 'published'");
    }

    if (isNonEmptyString(category) && category.toLowerCase() !== 'all') {
      where.push('category = ?');
      params.push(String(category).trim());
    }

    if (featured === '1' || featured === 'true') {
      where.push('featured = 1');
    }

    let sql = 'SELECT * FROM projects';
    if (where.length) sql += ` WHERE ${where.join(' AND ')}`;
    sql += ' ORDER BY sort_order ASC, year DESC, id DESC';

    let max = 60;
    const parsedLimit = Number.parseInt(limit, 10);
    if (Number.isFinite(parsedLimit) && parsedLimit > 0) {
      max = Math.min(parsedLimit, 60);
    }
    sql += ` LIMIT ${max}`;

    const [rows] = await pool.query(sql, params);
    res.json({ projects: rows.map(mapProject), count: rows.length });
  } catch (err) {
    next(err);
  }
}

async function getProjectBySlug(req, res, next) {
  try {
    const slug = String(req.params.slug || '').trim();
    if (!slug) throw new HttpError('A project slug is required', 400);

    const [rows] = await pool.query(
      'SELECT * FROM projects WHERE slug = ? LIMIT 1',
      [slug]
    );
    const row = rows[0];
    if (!row) throw new HttpError('Project not found', 404);

    if (row.status !== 'published' && !isAuthenticated(req)) {
      throw new HttpError('Project not found', 404);
    }

    const [relatedRows] = await pool.query(
      "SELECT * FROM projects WHERE category = ? AND id <> ? AND status = 'published' ORDER BY sort_order ASC, year DESC LIMIT 3",
      [row.category, row.id]
    );

    let related = relatedRows;
    if (related.length < 3) {
      const excludeIds = [row.id, ...related.map((r) => r.id)];
      const placeholders = excludeIds.map(() => '?').join(',');
      const [fillRows] = await pool.query(
        `SELECT * FROM projects WHERE status = 'published' AND id NOT IN (${placeholders}) ORDER BY sort_order ASC, year DESC LIMIT ${
          3 - related.length
        }`,
        excludeIds
      );
      related = related.concat(fillRows);
    }

    res.json({
      project: mapProject(row),
      related: related.map(mapProject),
    });
  } catch (err) {
    next(err);
  }
}

async function createProject(req, res, next) {
  try {
    const body = req.body || {};
    const errors = {};

    const title = clampString(String(body.title || '').trim(), 160);
    const client = clampString(String(body.client || '').trim(), 120);
    const category = clampString(String(body.category || '').trim(), 60);
    const summary = clampString(String(body.summary || '').trim(), 280);
    const content = String(body.body || '').trim();

    if (!isNonEmptyString(title)) errors.title = 'A project title is required';
    if (!isNonEmptyString(client)) errors.client = 'A client name is required';
    if (!isNonEmptyString(category)) {
      errors.category = 'A category is required';
    } else if (!CATEGORIES.includes(category)) {
      errors.category = `Category must be one of: ${CATEGORIES.join(', ')}`;
    }
    if (!isNonEmptyString(summary)) errors.summary = 'A short summary is required';

    const year = Number.parseInt(body.year, 10);
    const safeYear = Number.isFinite(year) ? year : new Date().getFullYear();
    if (safeYear < 1980 || safeYear > 2100) {
      errors.year = 'Year must be between 1980 and 2100';
    }

    const status =
      isNonEmptyString(body.status) && STATUSES.includes(body.status)
        ? body.status
        : 'published';

    if (Object.keys(errors).length) {
      const err = new HttpError('Please correct the highlighted fields', 400);
      err.details = errors;
      throw err;
    }

    const requestedSlug = isNonEmptyString(body.slug)
      ? slugify(body.slug)
      : slugify(title);

    if (await slugExists(requestedSlug)) {
      throw new HttpError('A project with that slug already exists', 409);
    }

    const coverHue = parseHue(body.coverHue, 268);
    const coverHueEnd = parseHue(body.coverHueEnd, (coverHue + 46) % 361);
    const palette = normalisePalette(body.palette);
    const featured = body.featured ? 1 : 0;
    const sortOrder = Number.isFinite(Number.parseInt(body.sortOrder, 10))
      ? Number.parseInt(body.sortOrder, 10)
      : 0;

    const [result] = await pool.query(
      `INSERT INTO projects
        (slug, title, client, category, year, summary, body, palette, cover_hue, cover_hue_end, featured, status, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        requestedSlug,
        title,
        client,
        category,
        safeYear,
        summary,
        content,
        palette,
        coverHue,
        coverHueEnd,
        featured,
        status,
        sortOrder,
      ]
    );

    const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [
      result.insertId,
    ]);

    res.status(201).json({ project: mapProject(rows[0]) });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') {
      return next(new HttpError('A project with that slug already exists', 409));
    }
    return next(err);
  }
}

async function updateProject(req, res, next) {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(id) || id <= 0) {
      throw new HttpError('A valid project id is required', 400);
    }

    const [existingRows] = await pool.query(
      'SELECT * FROM projects WHERE id = ? LIMIT 1',
      [id]
    );
    const existing = existingRows[0];
    if (!existing) throw new HttpError('Project not found', 404);

    const body = req.body || {};
    const fields = [];
    const params = [];
    const errors = {};

    if (body.title !== undefined) {
      const title = clampString(String(body.title).trim(), 160);
      if (!isNonEmptyString(title)) errors.title = 'A project title is required';
      else {
        fields.push('title = ?');
        params.push(title);
      }
    }

    if (body.client !== undefined) {
      const client = clampString(String(body.client).trim(), 120);
      if (!isNonEmptyString(client)) errors.client = 'A client name is required';
      else {
        fields.push('client = ?');
        params.push(client);
      }
    }

    if (body.category !== undefined) {
      const category = clampString(String(body.category).trim(), 60);
      if (!CATEGORIES.includes(category)) {
        errors.category = `Category must be one of: ${CATEGORIES.join(', ')}`;
      } else {
        fields.push('category = ?');
        params.push(category);
      }
    }

    if (body.year !== undefined) {
      const year = Number.parseInt(body.year, 10);
      if (!Number.isFinite(year) || year < 1980 || year > 2100) {
        errors.year = 'Year must be between 1980 and 2100';
      } else {
        fields.push('year = ?');
        params.push(year);
      }
    }

    if (body.summary !== undefined) {
      const summary = clampString(String(body.summary).trim(), 280);
      if (!isNonEmptyString(summary)) {
        errors.summary = 'A short summary is required';
      } else {
        fields.push('summary = ?');
        params.push(summary);
      }
    }

    if (body.body !== undefined) {
      fields.push('body = ?');
      params.push(String(body.body));
    }

    if (body.palette !== undefined) {
      fields.push('palette = ?');
      params.push(normalisePalette(body.palette));
    }

    if (body.coverHue !== undefined) {
      fields.push('cover_hue = ?');
      params.push(parseHue(body.coverHue, existing.cover_hue || 268));
    }

    if (body.coverHueEnd !== undefined) {
      fields.push('cover_hue_end = ?');
      params.push(parseHue(body.coverHueEnd, existing.cover_hue_end || 310));
    }

    if (body.featured !== undefined) {
      fields.push('featured = ?');
      params.push(body.featured ? 1 : 0);
    }

    if (body.status !== undefined) {
      if (!STATUSES.includes(body.status)) {
        errors.status = "Status must be 'draft' or 'published'";
      } else {
        fields.push('status = ?');
        params.push(body.status);
      }
    }

    if (body.sortOrder !== undefined) {
      const sortOrder = Number.parseInt(body.sortOrder, 10);
      if (!Number.isFinite(sortOrder)) {
        errors.sortOrder = 'Sort order must be a number';
      } else {
        fields.push('sort_order = ?');
        params.push(sortOrder);
      }
    }

    if (body.slug !== undefined || body.title !== undefined) {
      const base = isNonEmptyString(body.slug)
        ? slugify(body.slug)
        : body.slug !== undefined
        ? slugify(String(body.title || existing.title))
        : null;
      if (base) {
        if (await slugExists(base, id)) {
          errors.slug = 'A project with that slug already exists';
        } else {
          fields.push('slug = ?');
          params.push(base);
        }
      }
    }

    if (Object.keys(errors).length) {
      const err = new HttpError('Please correct the highlighted fields', 400);
      err.details = errors;
      throw err;
    }

    if (!fields.length) {
      return res.json({ project: mapProject(existing) });
    }

    params.push(id);
    await pool.query(
      `UPDATE projects SET ${fields.join(', ')} WHERE id = ?`,
      params
    );

    const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [id]);
    return res.json({ project: mapProject(rows[0]) });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') {
      return next(new HttpError('A project with that slug already exists', 409));
    }
    return next(err);
  }
}

async function deleteProject(req, res, next) {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(id) || id <= 0) {
      throw new HttpError('A valid project id is required', 400);
    }

    const [result] = await pool.query('DELETE FROM projects WHERE id = ?', [id]);
    if (!result.affectedRows) {
      throw new HttpError('Project not found', 404);
    }

    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listProjects,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
  CATEGORIES,
};