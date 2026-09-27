# Integration Notes for designstudio

## Overview

**Prism Studio** (`designstudio`) is a graphic design studio and portfolio website delivered as a single repository containing both a Next.js App Router frontend and an Express API.

| Tier | Technology | Public URL |
| --- | --- | --- |
| Frontend | Next.js (App Router, JSX, global CSS) | `https://designstudio.arx-app.com` |
| Backend API | Node.js + Express 
 (terminates its own TLS) | `https://designstudio-api.arx-app.com:4112` |
| Database | MySQL via `mysql2/promise` | configured via `DB_*` env vars |

Text architecture diagram:

```
Browser
  │
  ├── https://designstudio.arx-app.com          (Next.js App Router — app/, components/, lib/)
  │        │  fetch(..., { credentials: 'include' })  ← lib/api.js
  │        ▼
  └── https://designstudio-api.arx-app.com:4112 (Express — server/index.js, HTTPS terminated in-process)
             │  mysql2/promise pool (server/config/db.js)
             ▼
          MySQL  ── users · projects · inquiries · sessions
```

Key characteristics:

- **No proxy/rewrites.** The browser calls the API origin directly; `next.config.js` exposes `NEXT_PUBLIC_API_BASE_URL` to client code.
- **Session-cookie auth.** `express-session` + `express-mysql-session` store sessions in MySQL; passwords are hashed with `bcryptjs`. The cookie is `httpOnly`, `secure`, `SameSite=None` and scoped to `SESSION_COOKIE_DOMAIN` (`.arx-app.com`) so it is shared across the site and API subdomains.
- **No build-time data fetching.** Every API call happens at runtime in the browser (`useEffect`), so `next build` never needs a live database. Marketing pages render instantly from `lib/content.js`, which also supplies `FALLBACK_PROJECTS` when the API is unreachable.
- **Single styling approach.** `app/globals.css` is the one and only stylesheet, imported exactly once from `app/layout.jsx`.

## Prerequisites

- **Node.js 18.17+** (Node 20 LTS recommended — required by Next.js App Router) and **npm 9+**
- **MySQL 8.0+** (or MySQL 5.7 with `utf8mb4` support) reachable from the API host
- **TLS certificate and private key** on disk, readable by the process user, if `SSL_ENABLED=true`
- **PM2** (optional, for production process management): `npm install -g pm2`
- DNS records for `designstudio.arx-app.com` and `designstudio-api.arx-app.com`, and port **4112** open on the API host

Verify your toolchain:

```bash
node -v
npm -v
mysql --version
```

## Installation

1. **Clone and install dependencies.** There is a single root `package.json` — no workspaces, no nested `package.json`.

   ```bash
   git clone <your-repo-url> designstudio
   cd designstudio
   npm install
   ```

   For a production install that skips dev dependencies (this is what `START.sh` does):

   ```bash
   npm install --omit=dev
   ```

2. **Create the environment file.** Copy the documented example and fill in real values:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` — at minimum set `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` and a long random `SESSION_SECRET`:

   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

   `.env` is git-ignored (see `.gitignore`); never commit real credentials.

3. **Create the database and load the schema.**

   ```bash
   mysql -h "$DB_HOST" -u root -p -e "CREATE DATABASE designstudio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   mysql -h "$DB_HOST" -u "$DB_USER" -p designstudio < schema.sql
   mysql -h "$DB_HOST" -u "$DB_USER" -p designstudio < seed.sql
   ```

   `schema.sql` creates `users`, `projects`, `inquiries` and the `sessions` table required by `express-mysql-session` (plus indexes on `projects.category`, `projects.status` and `inquiries.status`). `seed.sql` inserts one admin user (`studio@prismdesign.co`), six published portfolio projects and three sample inquiries. The seeded demo password is documented in `README.md` — **change or delete this account before going live.**

4. **Build the frontend.**

   ```bash
   npm run build
   ```

## Environment Variables

All variables are read from `.env` (loaded by `dotenv` in `server/index.js`) or from the process environment. `.env.example` mirrors this table with placeholder values only.

| Variable | Description | Example |
| --- | --- | --- |
| `PORT` | Port the Express API binds to (assigned by the deploy script; 4112 in production). | `4112` |
| `NODE_ENV` | Node environment. Controls stack-trace hiding in `server/middleware/errorHandler.js`. | `production` |
| `SSL_ENABLED` | When `'true'` the API starts an HTTPS server using the cert/key paths below; otherwise plain HTTP. | `true` |
| `SSL_CERT_PATH` | Absolute path to the TLS certificate file. | `/home/arx-app/backends/certs/certificate.crt` |
| `SSL_KEY_PATH` | Absolute path to the TLS private key file. | `/home/arx-app/backends/certs/private.key` |
| `SSL_CA_PATH` | Optional absolute path to a CA chain file. | `/home/arx-app/backends/certs/ca_bundle.crt` |
| `DB_HOST` | MySQL server hostname. | `db.example.com` |
| `DB_USER` | MySQL username. | `designstudio` |
| `DB_PASSWORD` | MySQL password. | `your-secret-here` |
| `DB_NAME` | MySQL database name. | `designstudio` |
| `SESSION_SECRET` | Secret used to sign the session cookie. Use a long random string; rotating it invalidates all sessions. | `change-me-to-a-long-random-string` |
| `SESSION_COOKIE_DOMAIN` | Cookie domain so the session cookie is shared between the site and API subdomains. | `.arx-app.com` |
| `CORS_ALLOWED_ORIGIN_SUFFIX` | Domain suffix allowed by CORS (all `*.arx-app.com` origins). | `.arx-app.com` |
| `NEXT_PUBLIC_API_BASE_URL` | Public base URL of the Express API used by the browser. Must be present **at build time** because `next.config.js` inlines it via the `env` block. | `https://designstudio-api.arx-app.com:4112` |

Notes:

- `NEXT_PUBLIC_API_BASE_URL` is the only variable exposed to the browser. Both `next.config.js` and `lib/api.js` fall back to `https://designstudio-api.arx-app.com:4112` if it is unset.
- Because the session cookie uses `SameSite=None; Secure`, the API **must** be served over HTTPS in any environment where you expect login to work from the deployed frontend.

## Running the Application

The scripts block in `package.json` is exactly:

```json
{
  "build": "next build",
  "start": "node server/index.js",
  "server": "node server/index.js"
}
```

### Local development

```bash
npm install
cp .env.example .env     # then edit
npm run build            # produce .next/
npm run start            # boots the Express API on $PORT
```

`PORT` is supplied by the environment (`PORT=4112 npm run start`). At boot `server/index.js` calls `checkDatabaseConnection()`; if MySQL is unreachable it logs a warning rather than crashing, so the API still answers `GET /health`.

For local work without certificates, set `SSL_ENABLED=false` and point `NEXT_PUBLIC_API_BASE_URL` at `http://localhost:4112`. Note that cross-origin session cookies will not be set over plain HTTP in modern browsers — use the same host/port or HTTPS when testing auth.

### Health checks

```bash
curl -k https://designstudio-api.arx-app.com:4112/health
# { "status": "ok" }

curl -k https://designstudio-api.arx-app.com:4112/health/db
# { "status": "ok", "database": "connected" }   (503 + "degraded" when MySQL is down)
```

### Using START.sh

```bash
chmod +x START.sh
./START.sh
```

`START.sh` (`set -euo pipefail`) `cd`s to its own directory, exports `PORT=4112` when unset, runs `npm install --omit=dev` only when `node_modules` is missing, creates `logs/`, launches `nohup node server/index.js > logs/api.log 2>&1 &`, writes the PID to `designstudio.pid` and echoes the health-check URL.

Stop it with:

```bash
kill "$(cat designstudio.pid)"
```

### Using PM2

`ecosystem.config.js` defines a single app named `designstudio` running `server/index.js` from `cwd: /home/arx-app/backends/designstudio` with `NODE_ENV=production` and `PORT=4112`.

```bash
pm2 start ecosystem.config.js
pm2 logs designstudio
pm2 restart designstudio
pm2 save && pm2 startup
```

### API endpoint reference

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | — | Always `{ status: 'ok' }` |
| GET | `/health/db` | — | Pings the MySQL pool |
| POST | `/api/auth/signup` | — | Create an `editor` account, starts a session |
| POST | `/api/auth/login` | — | Email + password login |
| POST | `/api/auth/logout` | session | Destroys the session, clears the cookie |
| GET | `/api/auth/me` | session | Current user or 401 |
| GET | `/api/projects` | optional | `?category=`, `?featured=1`, `?limit=`; only `published` unless authenticated |
| GET | `/api/projects/:slug` | optional | Project + 3 related projects in the same category |
| POST | `/api/projects` | session | Create (slugified title, 409 on duplicate slug) |
| PATCH | `/api/projects/:id` | session | Partial update |
| DELETE | `/api/projects/:id` | session | 204 on success |
| POST | `/api/inquiries` | — | Public contact form submission |
| GET | `/api/inquiries` | session | `?status=` filter, newest first |
| PATCH | `/api/inquiries/:id/status` | session | `new` \| `in_review` \| `replied` \| `archived` |

CORS is configured in `server/index.js`: requests with no `Origin` are allowed, as is any origin whose hostname ends with `CORS_ALLOWED_ORIGIN_SUFFIX` (`.arx-app.com`), with `credentials: true` and methods `GET, POST, PATCH, DELETE, OPTIONS`.

## Project Structure

```
designstudio/
├── package.json              Single root manifest (build / start / server scripts)
├── next.config.js            reactStrictMode, poweredByHeader:false, NEXT_PUBLIC_API_BASE_URL
├── ecosystem.config.js       PM2 app definition (name designstudio, port 4112)
├── START.sh                  Background launcher + PID file + logs/api.log
├── .env.example              Every env var with placeholder values
├── .gitignore                node_modules/, .next/, out/, .env*, logs/, *.pid, .DS_Store
├── README.md                 Full architecture, env table, endpoints, seeded credentials
├── schema.sql                utf8mb4/InnoDB DDL: users, projects, inquiries, sessions + indexes
├── seed.sql                  Admin user, six portfolio projects, three inquiries
│
├── server/                   Express API
│   ├── index.js              Entry point: dotenv, trust proxy, json, cookies, session, CORS,
│   │                         routers, notFound/errorHandler, http|https listen on 0.0.0.0
│   ├── config/db.js          mysql2/promise pool + checkDatabaseConnection()
│   ├── config/session.js     buildSessionMiddleware() — express-mysql-session on the shared pool
│   ├── middleware/auth.js    requireAuth, requireAdmin, attachUser
│   ├── middleware/errorHandler.js  notFound + centralised error responses
│   ├── utils/validate.js     isEmail, slugify, clampString, validateFields, HttpError
│   ├── controllers/          authController · projectsController · inquiriesController
│   └── routes/               health · auth · projects · inquiries
│
├── lib/
│   ├── api.js                Browser API client (credentials:'include', ApiError, typed helpers)
│   ├── AuthContext.jsx       AuthProvider + useAuth() session state
│   └── content.js            SERVICES, PROCESS_STEPS, TEAM, STUDIO_FACTS, FALLBACK_PROJECTS
│
├── app/                      Next.js App Router
│   ├── globals.css           THE single stylesheet: reset, :root tokens, base type,
│   │                         layout utilities, component classes, focus/reduced-motion
│   ├── layout.jsx            metadata, next/font, AuthProvider + SiteHeader/main.shell/SiteFooter
│   ├── page.jsx              Home (hero, stats, featured ProjectGrid, services, process)
│   ├── work/page.jsx         Portfolio index with category filters
│   ├── work/[slug]/page.jsx  Client-side project detail + related work
│   ├── services/page.jsx     Services grid + process + CTA
│   ├── about/page.jsx        Studio story, values, team, facts
│   ├── contact/page.jsx      ContactForm + contact details card
│   ├── login/page.jsx        AuthForm mode="login"
│   ├── signup/page.jsx       AuthForm mode="signup"
│   ├── admin/page.jsx        Guarded dashboard: projects / inquiries tabs
│   ├── not-found.jsx         Custom 404
│   └── error.jsx             App Router error boundary
│
├── components/
│   ├── layout/               SiteHeader · SiteFooter · PageShell
│   ├── ui/                   Button · Field · Card · Modal · Table · Badge · Spinner ·
│   │                         EmptyState · Artwork (CSS-gradient tiles, no remote images)
│   ├── ProjectCard.jsx       Card + Artwork + Badge, links to /work/[slug]
│   ├── ProjectGrid.jsx       Runtime fetch, skeletons, empty/error + FALLBACK_PROJECTS
│   ├── ContactForm.jsx       Validation, sendInquiry, success panel
│   ├── AuthForm.jsx          Shared login/signup form
│   ├── AdminProjectsPanel.jsx   Table + Modal CRUD for projects
│   └── AdminInquiriesPanel.jsx  Status filters, details modal, status updates
│
└── public/favicon.svg        Inline prism/triangle mark using the design tokens
```

## Next Steps / Production Considerations

1. **Rotate the seeded credentials.** `seed.sql` ships a demo admin (`studio@prismdesign.co`) with a documented password. Change the password or delete the row immediately after first login:
   ```sql
   DELETE FROM users WHERE email = 'studio@prismdesign.co';
   ```
2. **Generate a real `SESSION_SECRET`.** Never ship `change-me-to-a-long-random-string`. Store it in your secret manager, not in the repo.
3. **Lock down database access.** Grant the `DB_USER` only `SELECT, INSERT, UPDATE, DELETE` on the `designstudio` schema, restrict by host, and enable TLS between the API and MySQL. The pool is created with `multipleStatements: false` — keep it that way.
4. **Certificate lifecycle.** `server/index.js` reads `SSL_CERT_PATH`/`SSL_KEY_PATH`/`SSL_CA_PATH` once at boot with `fs.readFileSync`. After renewal you must restart the process (`pm2 restart designstudio`) for the new certificate to take effect — wire this into your renewal hook.
5. **Session store hygiene.** `express-mysql-session` writes to the `sessions` table; confirm its expiry sweeper is running, or add a scheduled `DELETE FROM sessions WHERE expires < UNIX_TIMESTAMP();`. Watch for the console warning that indicates a fallback to the in-memory store — MemoryStore does not survive restarts and does not scale beyond one process.
6. **Frontend hosting.** `npm run build` produces `.next/`. If you serve the Next.js site from a separate process or CDN, ensure `NEXT_PUBLIC_API_BASE_URL` is set **before** the build, since `next.config.js` inlines it.
7. **Rate limiting and abuse protection.** `POST /api/inquiries`, `/api/auth/signup` and `/api/auth/login` are public. Add `express-rate-limit` (or an edge/WAF rule) plus a honeypot or CAPTCHA on the contact form before launch.
8. **Security headers.** `poweredByHeader` is already disabled. Add `helmet` to the Express app and a Content-Security-Policy at the edge; the app uses no external fonts or remote images (`components/ui/Artwork.jsx` renders CSS gradients and inline SVG), so a strict policy is achievable.
9. **Logging and monitoring.** `START.sh` writes to `logs/api.log`; under PM2 use `pm2 logs` and configure `pm2-logrotate`. Point uptime monitoring at `/health` (liveness) and `/health/db` (readiness — returns 503 when MySQL is down).
10. **Backups and migrations.** Schedule `mysqldump` of `users`, `projects` and `inquiries`. Future schema changes should be added as new numbered `.sql` files rather than edits to `schema.sql`, so existing deployments can apply them incrementally.
11. **Role enforcement.** `requireAdmin` exists in `server/middleware/auth.js` but the project/inquiry routes currently use `requireAuth` only — tighten destructive routes (`DELETE /api/projects/:id`) to `requireAdmin` if you want editors restricted.
12. **Accessibility and performance QA.** Verify focus-visible rings, the ≥44px control hit areas, modal focus trapping and the `prefers-reduced-motion` block, then run Lighthouse against `https://designstudio.arx-app.com` before sign-off.

## Database Provisioning

A mysql database has been automatically provisioned for this app.

- **Database:** app_designstudio
- **Host:** testdb.gridiron-app.com
- **Port:** 3306
- **User:** designstudio
- **Credentials stored in Vault at:** `secret/data/mysql/designstudio`

Retrieve the password securely from Vault and set it as an environment variable (e.g. `DB_PASSWORD`) in your deployment settings — do not commit it to source control.
