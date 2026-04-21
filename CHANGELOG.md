# Changelog

All notable changes to this project will be documented in this file.

---

## [0.1.0] — 2026-04-20

### Added

- Full NestJS backend scaffolded from scratch
- PostgreSQL + TypeORM integration with `autoLoadEntities` and dev-mode `synchronize`
- Environment-based configuration via `@nestjs/config` + `.env.example`
- JWT authentication with `passport-jwt` (HS256, 7-day expiry)
- bcrypt password hashing (10 rounds)
- Global `ValidationPipe` with whitelist and transform
- Global `ClassSerializerInterceptor` (excludes `passwordHash` from all responses)
- CORS configured from `FRONTEND_URL` env variable

**Entities**: `Career`, `User`, `Profile`, `Post`, `Comment`

**Auth routes**
- `POST /api/auth/register` — validates `@ucb.edu.bo` domain, creates User + Profile
- `POST /api/auth/login` — returns JWT
- `GET /api/auth/me` — returns user with profile

**Career routes**
- `GET /api/careers` — list all
- `GET /api/careers/:id` — detail
- `GET /api/careers/:id/posts` — paginated posts by career

**User routes**
- `GET /api/users` — list all (JWT)
- `GET /api/users/:id` — by id (JWT)

**Profile routes**
- `GET /api/profiles/me` — own profile (JWT)
- `GET /api/profiles/:userId` — public profile by userId
- `PATCH /api/profiles/me` — update own profile (JWT)

**Post routes**
- `POST /api/posts` — create (JWT)
- `GET /api/posts` — paginated list with `page`, `limit`, `careerId`, `authorId` filters (JWT)
- `GET /api/posts/:id` — detail (JWT)
- `PATCH /api/posts/:id` — update own post (JWT, owner only)
- `DELETE /api/posts/:id` — soft delete own post (JWT, owner only)

**Comment routes**
- `POST /api/comments` — create (JWT)
- `GET /api/comments/post/:postId` — list by post (JWT)
- `PATCH /api/comments/:id` — update own comment (JWT, owner only)
- `DELETE /api/comments/:id` — soft delete own comment (JWT, owner only)
