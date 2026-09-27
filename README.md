# Prism Studio

Prism Studio is a graphic design studio and portfolio website. It presents the studio's
selected work, services, process and team, and captures client inquiries through a
contact flow. Studio staff sign in to an admin dashboard where they manage portfolio
projects and triage incoming inquiries.

The repository holds **one application**: a Next.js App Router frontend at the repository
root and an Express API in `server/`, sharing a single root `package.json`.

---

## Architecture

```
                      Browser
                         |
        +----------------+-----------------+
        |                                  |
        v                                  v
  Next.js App Router                 Express API (server/)
  https://designstudio.arx-app.com   https://designstudio-api.arx-app.com:4112
  - app/ routes (server + client)    - terminates TLS itself (SSL_ENABLED=true)
  - components/ UI primitives        - express-session + express-mysql-session
  - lib/api.js  (fetch, credentials  - bcryptjs password hashing
        : 'include')                 - cors() allowing *.arx-app.com
  - app/globals.css (single global   |
        stylesheet)                  v
                               MySQL (mysql2/promise pool)
                               tables: users, projects,
                                       inquiries, sessions
```

Key points:

- The browser talks to the API **directly** at `NEXT_PUBLIC_API_BASE_URL`. There are no
  Next.js rewrites or proxies.
- **No data is fetched at build time.** Every API call happens at runtime in the browser
  (inside `useEffect`), so `next build` never needs a live database.
- Marketing pages render instantly from static copy in `lib/content.js`, which also
  supplies `FALLBACK_PROJECTS` used as graceful offline content when the API is
  unreachable.
- Styling is **one global stylesheet** (`app/globals.css`) with semantic class names — no
  CSS Modules, no CSS-in-JS, no Tailwind.

---

## Environment variables

Copy `.env.example` to `.env` and fill in real values. Never commit `.env`.

| Variable | Required | Example / default | Description |
| --- | --- | --- | --- |
| `PORT` | yes | `4112` | Port the Express API binds to. Supplied by the deploy script / PM2. |
| `NODE_ENV` | no | `production` | Node environment. Stack traces are hidden when `production`. |
| `SSL_ENABLED` | no | `true` | When `true` the API starts an HTTPS server using the cert/key below. |
| `SSL_CERT_PATH` | if TLS | `/home/arx-app/backends/certs/certificate.crt` | Absolute path to the TLS certificate. |
| `SSL_KEY_PATH` | if TLS | `/home/arx-app/backends/certs/private.key` | Absolute path to the TLS private key. |
| `SSL_CA_PATH` | no | `/home/arx-app/backends/certs/ca_bundle.crt` | Optional CA chain file. |
| `DB_HOST` | yes | `localhost` | MySQL server hostname. |
| `DB_USER` | yes | `designstudio` | MySQL username. |
| `DB_PASSWORD` | yes | `change-me` | MySQL password. |
| `DB_NAME` | yes | `designstudio` | MySQL database name. |
| `SESSION_SECRET` | yes | `replace-with-a-long-random-string` | Secret used to sign the session cookie. |
| `SESSION_COOKIE_DOMAIN` | yes | `.arx-app.com` | Cookie domain so the session cookie is shared between the site and API subdomains. |
| `CORS_ALLOWED_ORIGIN_SUFFIX` | yes | `.arx-app.com` | Only origins whose hostname ends with this suffix are allowed (plus same-origin / no-origin requests). |
| `NEXT_PUBLIC_API_BASE_URL` | yes | `https://designstudio-api.arx-app.com:4112` | Public base URL of the Express API used by the browser. Inlined at build time by Next.js. |

---

## Database setup

The schema targets MySQL 8 (utf8mb4 / InnoDB).

```bash
# 1. create the database and a user
mysql -u root -p -e "CREATE DATABASE designstudio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. create the tables
mysql -u root -p designstudio < schema.sql

# 3. load demo content (admin user, six projects, three inquiries)
mysql -u root -p designstudio < seed.sql
```

Tables created by `schema.sql`:

| Table | Purpose |
| --- | --- |
| `users` | Studio accounts: `id`, `name`, `email` (unique), `password_hash`, `role` (`admin`\|`editor`), `created_at`. |
| `projects` | Portfolio entries: `slug` (unique), `title`, `client`, `category`, `year`, `summary`, `body`, `palette`, `cover_hue`, `cover_hue_end`, `featured`, `status` (`draft`\|`published`), `sort_order`, timestamps. Indexed on `category` and `status`. |
| `inquiries` | Client enquiries: `name`, `email`, `company`, `budget_range`, `service`, `message`, `status` (`new`\|`in_review`\|`replied`\|`archived`), `created_at`. Indexed on `status`. |
| `sessions` | Session store required by `express-mysql-session` (`session_id`, `expires`, `data`). |

### Seeded admin credentials

`seed.sql` inserts a single admin account for the demo environment:

```
email:    studio@prismdesign.co
password: PrismStudio2024
```

Change or remove this account before any public deployment.

---

## Local development

```bash
npm install          # installs frontend + backend dependencies (one package.json)
cp .env.example .env # then edit the values
npm run build        # next build  -> produces .next/
npm run start        # node server/index.js -> serves the API
```

Scripts (exactly as declared in `package.json`):

| Script | Command | Notes |
| --- | --- | --- |
| `npm run build` | `next build` | Builds the Next.js frontend. No network/database access required. |
| `npm run start` | `node server/index.js` | Starts the Express API. |
| `npm run server` | `node server/index.js` | Alias for the API process. |

Notes:

- `PORT` is **supplied by the environment** (the deploy script or PM2). It is `4112` in
  production. The API reads `process.env.PORT` and binds to `0.0.0.0`.
- With `SSL_ENABLED` unset or not `"true"`, the API starts a plain HTTP server — useful
  for local work. Set `NEXT_PUBLIC_API_BASE_URL=http://localhost:4112` in that case.
- If MySQL is unreachable at boot the API logs a warning and keeps running; the
  `/health/db` endpoint reports the degraded state.

---

## Deployment

### START.sh

```bash
./START.sh
```

`START.sh` changes to its own directory, exports `PORT=4112` when unset, runs
`npm install --omit=dev` if `node_modules/` is missing, creates `logs/`, launches the API
with `nohup node server/index.js > logs/api.log 2>&1 &`, writes the PID to
`designstudio.pid` and prints the health-check URL
`https://designstudio-api.arx-app.com:4112/health`.

### PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 logs designstudio
```

`ecosystem.config.js` runs `server/index.js` from
`/home/arx-app/backends/designstudio` with `NODE_ENV=production` and `PORT=4112`.

---

## REST API reference

Base URL: `https://designstudio-api.arx-app.com:4112`

All request and response bodies are JSON. Authenticated endpoints require the
`designstudio.sid` session cookie (sent automatically by `lib/api.js` because every
request uses `credentials: 'include'`).

### Health

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | – | Always returns `{ "status": "ok" }`. |
| `GET` | `/health/db` | – | `{ "status": "ok", "database": "connected" }` or `503 { "status": "degraded", "database": "unavailable" }`. |

### Auth — `/api/auth`

| Method | Path | Auth | Body | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/api/auth/signup` | – | `{ name, email, password }` (password ≥ 8 chars) | `201 { user }`, `409` on duplicate email |
| `POST` | `/api/auth/login` | – | `{ email, password }` | `200 { user }`, `401` on bad credentials |
| `POST` | `/api/auth/logout` | session | – | `200 { ok: true }` |
| `GET` | `/api/auth/me` | session | – | `200 { user }` or `401 { error: 'Authentication required' }` |

`user` is always `{ id, name, email, role }` — `password_hash` is never returned.

### Projects — `/api/projects`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/projects` | – | List projects. Query: `category`, `featured=1`, `limit`. Returns only `status='published'` unless the caller has a session. Ordered by `sort_order`, then `year DESC`. |
| `GET` | `/api/projects/:slug` | – | `{ project, related }` where `related` is up to 3 projects in the same category. `404` when missing. |
| `POST` | `/api/projects` | session | Create. Slug derived from the title. `409` on duplicate slug. |
| `PATCH` | `/api/projects/:id` | session | Partial update by id. |
| `DELETE` | `/api/projects/:id` | session | `204 No Content`. |

Example project object (camelCase keys):

```json
{
  "id": 3,
  "slug": "cadence-music-festival-identity",
  "title": "Cadence Music Festival Identity",
  "client": "Cadence Festival",
  "category": "Branding",
  "year": 2024,
  "summary": "A kinetic identity that scales from wristbands to stage screens.",
  "body": "…",
  "palette": "accent,surface,text",
  "coverHue": 14,
  "coverHueEnd": 268,
  "featured": true,
  "status": "published",
  "sortOrder": 10,
  "createdAt": "2024-03-02T10:15:00.000Z",
  "updatedAt": "2024-03-02T10:15:00.000Z"
}
```

### Inquiries — `/api/inquiries`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/inquiries` | – | Public. Body `{ name, email, message, company?, budgetRange?, service? }`. Returns `201 { inquiry }`. |
| `GET` | `/api/inquiries` | session | List, newest first. Optional `?status=new\|in_review\|replied\|archived`. |
| `PATCH` | `/api/inquiries/:id/status` | session | Body `{ status }`, one of the four values. `400` otherwise. |

### Errors

Errors are returned as `{ "error": "message", "details": … }` with the appropriate status
code. Unknown routes return `404 { "error": "Not found", "path": "/…" }`. Stack traces are
suppressed when `NODE_ENV === 'production'`.

---

## Session-cookie authentication

- Passwords are hashed with **bcryptjs** (cost 10). Plaintext passwords are never stored
  or logged, and `password_hash` is never serialised into a response.
- Sessions are managed by **express-session** with an **express-mysql-session** store
  backed by the same `mysql2` pool (table `sessions`). If the store cannot be created the
  server falls back to the in-memory store and logs a warning.
- The cookie is named `designstudio.sid` and is issued with
  `httpOnly: true, secure: true, sameSite: 'none', domain: SESSION_COOKIE_DOMAIN,
  maxAge: 7 days`, so it is shared between `designstudio.arx-app.com` and
  `designstudio-api.arx-app.com`. `SameSite=None` **requires** HTTPS on both origins.
- Every browser request from `lib/api.js` sets `credentials: 'include'`, and the API's
  CORS config uses `credentials: true` with an origin callback that allows requests with
  no `Origin` header plus any origin whose hostname ends with
  `CORS_ALLOWED_ORIGIN_SUFFIX` (`.arx-app.com`).
- `app.set('trust proxy', 1)` is enabled so secure cookies work behind a proxy.
- `lib/AuthContext.jsx` calls `GET /api/auth/me` once on mount and exposes
  `{ user, status, signIn, signUp, signOut, refresh }`; `/admin` redirects anonymous
  visitors to `/login`.

---

## Project structure

```
.
├── package.json              # single root manifest (frontend + backend deps)
├── next.config.js            # reactStrictMode, exposes NEXT_PUBLIC_API_BASE_URL
├── ecosystem.config.js       # PM2 app definition (port 4112)
├── START.sh                  # background launcher, writes designstudio.pid
├── schema.sql                # MySQL DDL: users, projects, inquiries, sessions
├── seed.sql                  # admin user, six projects, three inquiries
├── .env.example              # every environment variable, placeholder values
│
├── app/                      # Next.js App Router (frontend lives at the repo root)
│   ├── globals.css           # THE single global stylesheet (tokens + components)
│   ├── layout.jsx            # metadata, font, AuthProvider, header/main/footer
│   ├── page.jsx              # home: hero, stats, selected work, services, process
│   ├── work/page.jsx         # portfolio index with category filters
│   ├── work/[slug]/page.jsx  # client-side project detail + related work
│   ├── services/page.jsx     # services grid + process + CTA
│   ├── about/page.jsx        # studio story, values, team, facts
│   ├── contact/page.jsx      # ContactForm + studio details
│   ├── login/page.jsx        # AuthForm mode="login"
│   ├── signup/page.jsx       # AuthForm mode="signup"
│   ├── admin/page.jsx        # guarded dashboard: projects / inquiries tabs
│   ├── not-found.jsx         # custom 404
│   └── error.jsx             # App Router error boundary
│
├── components/
│   ├── layout/SiteHeader.jsx # sticky nav, session-aware, mobile panel
│   ├── layout/SiteFooter.jsx # three-column footer
│   ├── layout/PageShell.jsx  # eyebrow / h1 / lead / actions header block
│   ├── ui/Button.jsx         # variants + sizes, loading state
│   ├── ui/Field.jsx          # Field, Input, Textarea, Select
│   ├── ui/Card.jsx           # Card, CardHeader, CardBody, CardFooter
│   ├── ui/Modal.jsx          # portal dialog, focus trap, Esc/overlay close
│   ├── ui/Table.jsx          # semantic table, skeletons, empty state
│   ├── ui/Badge.jsx          # tone/size pills
│   ├── ui/Spinner.jsx        # role="status" ring
│   ├── ui/EmptyState.jsx     # empty + error variants
│   ├── ui/Artwork.jsx        # deterministic CSS-gradient project artwork
│   ├── ProjectCard.jsx       # card composing Artwork + Badge + meta
│   ├── ProjectGrid.jsx       # runtime fetch, filters, loading/empty/error
│   ├── ContactForm.jsx       # inquiry form + success panel
│   ├── AuthForm.jsx          # login / signup form
│   ├── AdminProjectsPanel.jsx   # project CRUD table + modals
│   └── AdminInquiriesPanel.jsx  # inquiry list, filters, status updates
│
├── lib/
│   ├── api.js                # fetch client, ApiError, typed helpers
│   ├── AuthContext.jsx       # AuthProvider + useAuth()
│   └── content.js            # SERVICES, PROCESS_STEPS, TEAM, STUDIO_FACTS,
│                             # FALLBACK_PROJECTS
│
├── public/favicon.svg        # inline prism mark
│
└── server/
    ├── index.js              # app bootstrap, CORS, session, routers, TLS listen
    ├── config/db.js          # mysql2 pool + checkDatabaseConnection()
    ├── config/session.js     # buildSessionMiddleware()
    ├── middleware/auth.js    # requireAuth, requireAdmin, attachUser
    ├── middleware/errorHandler.js  # notFound, errorHandler
    ├── utils/validate.js     # validators, slugify, HttpError
    ├── controllers/authController.js
    ├── controllers/projectsController.js
    ├── controllers/inquiriesController.js
    └── routes/{health,auth,projects,inquiries}.js
```

---

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| `401` on every authenticated call | Cookie not sent: check `SESSION_COOKIE_DOMAIN`, HTTPS on both origins, and that the frontend origin ends with `CORS_ALLOWED_ORIGIN_SUFFIX`. |
| CORS error in the console | The requesting origin's hostname does not end with `.arx-app.com`. |
| `/health/db` returns `503` | MySQL credentials/host wrong, or the database is down. The API stays up by design. |
| Projects show fallback copy | The API was unreachable; `ProjectGrid` fell back to `FALLBACK_PROJECTS`. Check `/health/db`. |
| `EADDRINUSE` on start | Another process holds `PORT`. Stop it (`cat designstudio.pid`) or change `PORT`. |