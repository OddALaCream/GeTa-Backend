# Progress Log

## 2026-04-20 — Initial full implementation

### Completed

- Scaffolded full NestJS project from scratch (no CLI generator used)
- Configured TypeORM with async ConfigService-driven PostgreSQL connection
- Configured JWT with `@nestjs/jwt` + `passport-jwt`
- Implemented global `ValidationPipe` (whitelist, transform), `ClassSerializerInterceptor`, CORS

**Entities created**
- `Career` — id, name (unique), code (unique, optional)
- `User` — id, email, passwordHash (`@Exclude()`), isActive, role (enum)
- `Profile` — id, userId (FK), careerId (FK), fullName, bio, avatarUrl, campus (enum La Paz)
- `Post` — id, authorId (FK), careerId (FK), content, mediaUrl, isDeleted (soft delete)
- `Comment` — id, postId (FK), authorId (FK), content, isDeleted (soft delete)

**Auth module** (`POST /auth/register`, `POST /auth/login`, `GET /auth/me`)
- Domain validation: only `@ucb.edu.bo` emails accepted
- bcrypt password hashing (rounds: 10)
- JWT Bearer token issued on register and login
- `JwtStrategy` validates token and sets `request.user = { userId, email }`
- `@CurrentUser()` decorator extracts `request.user` in controllers
- `JwtAuthGuard` wraps `AuthGuard('jwt')` for route protection

**Careers module** (`GET /careers`, `GET /careers/:id`, `GET /careers/:id/posts`)
- No auth required for list/detail
- Posts endpoint uses `PostsService.findAll` with pagination

**Users module** (`GET /users`, `GET /users/:id`)
- JWT protected
- `passwordHash` excluded from all responses via `@Exclude()`

**Profiles module** (`GET /profiles/me`, `GET /profiles/:userId`, `PATCH /profiles/me`)
- Public read by userId; JWT required for own profile
- Update validates careerId existence

**Posts module** (`POST /posts`, `GET /posts`, `GET /posts/:id`, `PATCH /posts/:id`, `DELETE /posts/:id`)
- Pagination via `QueryBuilder` with `skip/take`
- Filters: `careerId`, `authorId`
- Soft delete (`isDeleted = true`)
- Owner-only edit/delete enforced

**Comments module** (`POST /comments`, `GET /comments/post/:postId`, `PATCH /comments/:id`, `DELETE /comments/:id`)
- Validates post exists and is not deleted before creating comment
- Soft delete
- Owner-only edit/delete enforced

**Build validated** — `npm run build` exits clean (0 errors)

### Pending

- Database migrations (for production use)
- Seed script for careers
- Admin endpoints (manage users, careers)
- Avatar upload (currently stores URL only)
