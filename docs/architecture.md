# Architecture

## Stack

| Layer         | Technology                         |
|---------------|------------------------------------|
| Framework     | NestJS 10                          |
| Language      | TypeScript 5                       |
| Database      | PostgreSQL 15                      |
| ORM           | TypeORM 0.3                        |
| Auth          | Passport JWT (`passport-jwt`)      |
| Password hash | bcrypt                             |
| Validation    | class-validator + class-transformer |
| Config        | @nestjs/config (dotenv)            |

---

## Project structure

```
src/
├── main.ts                        # Bootstrap, global prefix, ValidationPipe, CORS
├── app.module.ts                  # Root module, TypeORM async config
├── common/
│   └── decorators/
│       └── current-user.decorator.ts   # @CurrentUser() param decorator
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts         # POST /auth/register, POST /auth/login, GET /auth/me
│   ├── auth.service.ts
│   ├── dto/                       # RegisterDto, LoginDto
│   ├── guards/
│   │   └── jwt-auth.guard.ts      # AuthGuard('jwt') wrapper
│   ├── strategies/
│   │   └── jwt.strategy.ts        # Validates Bearer token, sets request.user
│   └── interfaces/
│       ├── jwt-payload.interface.ts
│       └── request-user.interface.ts
├── careers/
│   ├── careers.module.ts          # imports PostsModule for /careers/:id/posts
│   ├── careers.controller.ts
│   ├── careers.service.ts
│   └── entities/career.entity.ts
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts        # GET /users, GET /users/:id
│   ├── users.service.ts
│   └── entities/user.entity.ts    # @Exclude() on passwordHash
├── profiles/
│   ├── profiles.module.ts
│   ├── profiles.controller.ts     # GET /profiles/me, GET /profiles/:userId, PATCH /profiles/me
│   ├── profiles.service.ts
│   ├── dto/update-profile.dto.ts
│   └── entities/profile.entity.ts
├── posts/
│   ├── posts.module.ts            # exports PostsService (used by CareersModule)
│   ├── posts.controller.ts
│   ├── posts.service.ts           # pagination + filtering
│   ├── dto/                       # CreatePostDto, UpdatePostDto, QueryPostsDto
│   └── entities/post.entity.ts
└── comments/
    ├── comments.module.ts
    ├── comments.controller.ts
    ├── comments.service.ts
    ├── dto/                       # CreateCommentDto, UpdateCommentDto
    └── entities/comment.entity.ts
```

---

## Data model

```
Career
  id (uuid PK)
  name (unique)
  code (unique, nullable)
  createdAt, updatedAt

User
  id (uuid PK)
  email (unique)
  passwordHash            ← excluded from all serialized responses
  isActive (bool, default true)
  role (enum: student|admin, default student)
  createdAt, updatedAt

Profile
  id (uuid PK)
  userId (FK → User)      ← owns the 1:1 join column
  careerId (FK → Career)
  fullName
  bio (nullable)
  avatarUrl (nullable)
  campus (enum: La Paz)
  createdAt, updatedAt

Post
  id (uuid PK)
  authorId (FK → User)
  careerId (FK → Career)
  content (text)
  mediaUrl (nullable)
  isDeleted (bool, default false)  ← soft delete
  createdAt, updatedAt

Comment
  id (uuid PK)
  postId (FK → Post)
  authorId (FK → User)
  content (text)
  isDeleted (bool, default false)  ← soft delete
  createdAt, updatedAt
```

---

## Relations

```
Career ──1:N──> Profile
Career ──1:N──> Post
User   ──1:1──> Profile  (Profile owns FK)
User   ──1:N──> Post
User   ──1:N──> Comment
Post   ──1:N──> Comment
```

---

## Module dependency graph

```
AppModule
├── AuthModule       ← forFeature([User, Profile, Career])
├── UsersModule      ← forFeature([User])
├── ProfilesModule   ← forFeature([Profile, Career])
├── CareersModule    ← forFeature([Career]) + imports PostsModule
├── PostsModule      ← forFeature([Post, Career])  ← exported
└── CommentsModule   ← forFeature([Comment, Post])
```

No circular dependencies. `PostsModule` is the only shared module (consumed by `CareersModule`).

---

## Global configuration

| Setting               | Value                        |
|-----------------------|------------------------------|
| Global API prefix     | `/api`                       |
| ValidationPipe        | whitelist + transform        |
| ClassSerializerInterceptor | Global (hides `@Exclude` fields) |
| CORS origin           | `FRONTEND_URL` env var       |
| TypeORM synchronize   | `true` in dev, `false` in prod |
| JWT algorithm         | HS256 (default)              |

---

## Auth flow

1. Client sends `POST /api/auth/register` with `{email, password, fullName, careerId}`
2. Server validates `@ucb.edu.bo` domain, hashes password, creates `User` + `Profile`
3. Returns `{ accessToken, user }`
4. Client sends `Authorization: Bearer <token>` on protected routes
5. `JwtStrategy.validate()` resolves `{ userId, email }` into `request.user`
6. `@CurrentUser()` decorator extracts `request.user` in controllers

---

## Soft delete

`Post` and `Comment` are never physically deleted.  
`DELETE /posts/:id` and `DELETE /comments/:id` set `isDeleted = true`.  
All `findAll` and `findOne` queries filter `isDeleted = false`.
