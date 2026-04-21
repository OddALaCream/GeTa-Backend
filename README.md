# GeTa-Cato Backend

Backend for the GeTa-Cato academic social platform at UCB La Paz.

Built with NestJS + PostgreSQL + TypeORM + JWT.

---

## Requirements

- Node.js 20+
- PostgreSQL 15+
- npm 9+

---

## Quick start

```bash
# 1. Clone and install
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your DB credentials and JWT secret
# For Supabase local development, prefer the Session pooler
# (Connect -> Session pooler), or use DATABASE_URL directly.

# 3. Create the database in Postgres
createdb geta_cato

# 4. Start in development (auto-sync schema)
npm run start:dev

# 5. API is available at
http://localhost:3000/api
```

---

## Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Full Postgres connection string | - |
| `DB_HOST` | Postgres host | `localhost` |
| `DB_PORT` | Postgres port | `5432` |
| `DB_USERNAME` | Postgres user | `postgres` |
| `DB_PASSWORD` | Postgres password | `postgres` |
| `DB_NAME` | Database name | `geta_cato` |
| `DB_SSL` | Enables TLS for hosted Postgres | `false` |
| `JWT_SECRET` | JWT signing secret (change this) | - |
| `JWT_EXPIRES_IN` | JWT expiry duration | `7d` |
| `PORT` | HTTP port | `3000` |
| `FRONTEND_URL` | CORS allowed origin | `http://localhost:5173` |
| `NODE_ENV` | `development` / `production` | `development` |

> In `production`, `synchronize` is disabled. Use migrations.
>
> Supabase direct hosts like `db.<project-ref>.supabase.co:5432` are IPv6-only by default.
> If your local network or machine does not support IPv6, use the Session pooler
> (`aws-0-<region>.pooler.supabase.com:5432`) and set `DB_SSL=true`.

---

## Modules

| Module | Prefix | Auth required |
|--------|--------|---------------|
| auth | `/api/auth` | Public (register/login) / JWT (me) |
| careers | `/api/careers` | Public (list/detail) / JWT (posts) |
| users | `/api/users` | JWT |
| profiles | `/api/profiles` | Public (by userId) / JWT (me, update) |
| posts | `/api/posts` | JWT |
| comments | `/api/comments` | JWT |

---

## Scripts

```bash
npm run start:dev    # development with hot-reload
npm run build        # compile TypeScript
npm run start:prod   # run compiled dist/
npm run lint         # ESLint
```

---

## Documentation

- [API reference](docs/api.md)
- [Architecture](docs/architecture.md)
- [Progress log](docs/progress.md)
- [Changelog](CHANGELOG.md)
