export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://designstudio-api.arx-app.com:4112';

export class ApiError extends Error {
  constructor(message, status = 500, details = null) {
    super(message || 'Something went wrong');
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

function buildUrl(path) {
  const base = String(API_BASE_URL).replace(/\/+$/, '');
  const suffix = String(path || '').startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}

function buildQuery(params) {
  if (!params || typeof params !== 'object') return '';
  const search = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    const value = params[key];
    if (value === undefined || value === null || value === '') return;
    if (typeof value === 'boolean') {
      search.append(key, value ? '1' : '0');
      return;
    }
    search.append(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

async function parseBody(response) {
  const text = await response.text().catch(() => '');
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (err) {
    return { raw: text };
  }
}

export async function request(path, options = {}) {
  const { method = 'GET', body, signal, headers = {} } = options;

  const init = {
    method,
    credentials: 'include',
    mode: 'cors',
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      ...headers,
    },
  };

  if (signal) init.signal = signal;

  if (body !== undefined && body !== null) {
    init.headers['Content-Type'] = 'application/json';
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(buildUrl(path), init);
  } catch (err) {
    if (err && (err.name === 'AbortError' || err.code === 20)) {
      throw err;
    }
    throw new ApiError('Unable to reach the studio API. Please check your connection and try again.', 0);
  }

  const payload = await parseBody(response);

  if (!response.ok) {
    const message =
      (payload && (payload.error || payload.message)) ||
      `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, payload && payload.details ? payload.details : null);
  }

  return payload;
}

/* ---------------------------------- Projects --------------------------------- */

export async function getProjects(params = {}) {
  const data = await request(`/api/projects${buildQuery(params)}`);
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.projects)) return data.projects;
  return [];
}

export async function getProject(slug) {
  if (!slug) throw new ApiError('A project slug is required', 400);
  const data = await request(`/api/projects/${encodeURIComponent(slug)}`);
  if (!data) throw new ApiError('Project not found', 404);
  if (data.project) {
    return { project: data.project, related: Array.isArray(data.related) ? data.related : [] };
  }
  return { project: data, related: [] };
}

export async function createProject(payload) {
  const data = await request('/api/projects', { method: 'POST', body: payload });
  return (data && data.project) || data;
}

export async function updateProject(id, payload) {
  if (!id && id !== 0) throw new ApiError('A project id is required', 400);
  const data = await request(`/api/projects/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: payload,
  });
  return (data && data.project) || data;
}

export async function deleteProject(id) {
  if (!id && id !== 0) throw new ApiError('A project id is required', 400);
  await request(`/api/projects/${encodeURIComponent(id)}`, { method: 'DELETE' });
  return { ok: true };
}

/* --------------------------------- Inquiries --------------------------------- */

export async function sendInquiry(payload) {
  const data = await request('/api/inquiries', { method: 'POST', body: payload });
  return (data && data.inquiry) || data;
}

export async function getInquiries(status) {
  const data = await request(`/api/inquiries${buildQuery({ status })}`);
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.inquiries)) return data.inquiries;
  return [];
}

export async function updateInquiryStatus(id, status) {
  if (!id && id !== 0) throw new ApiError('An inquiry id is required', 400);
  const data = await request(`/api/inquiries/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: { status },
  });
  return (data && data.inquiry) || data;
}

/* ------------------------------------ Auth ----------------------------------- */

export async function signup(payload) {
  const data = await request('/api/auth/signup', { method: 'POST', body: payload });
  return (data && data.user) || null;
}

export async function login(email, password) {
  const data = await request('/api/auth/login', { method: 'POST', body: { email, password } });
  return (data && data.user) || null;
}

export async function logout() {
  await request('/api/auth/logout', { method: 'POST' });
  return { ok: true };
}

export async function getCurrentUser() {
  try {
    const data = await request('/api/auth/me');
    return (data && data.user) || null;
  } catch (err) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
      return null;
    }
    throw err;
  }
}

const api = {
  API_BASE_URL,
  ApiError,
  request,
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  sendInquiry,
  getInquiries,
  updateInquiryStatus,
  signup,
  login,
  logout,
  getCurrentUser,
};

export default api;