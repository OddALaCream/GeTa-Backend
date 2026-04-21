-- =============================================================
-- GeTa-Cato — Schema completo para Supabase / PostgreSQL
-- Ejecutar en orden en el SQL Editor de Supabase
-- =============================================================

-- UUID: gen_random_uuid() ya está disponible en Supabase sin extensión
-- Si falla, descomenta la línea siguiente:
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- =============================================================
-- ENUMS
-- =============================================================

-- Roles de usuario
CREATE TYPE "users_role_enum" AS ENUM ('student', 'admin');

-- Campus disponibles (por ahora solo La Paz)
CREATE TYPE "profiles_campus_enum" AS ENUM ('La Paz');


-- =============================================================
-- TABLA: careers
-- =============================================================
-- Almacena las carreras académicas de UCB La Paz.
-- Se inserta manualmente por el administrador.
-- Se consulta en: GET /careers, GET /careers/:id, al registrar usuario,
--                al crear un post, al actualizar perfil.
-- =============================================================
CREATE TABLE IF NOT EXISTS "careers" (
    "id"          UUID        NOT NULL DEFAULT gen_random_uuid(),
    "name"        VARCHAR     NOT NULL,
    "code"        VARCHAR,
    "createdAt"   TIMESTAMP   NOT NULL DEFAULT now(),
    "updatedAt"   TIMESTAMP   NOT NULL DEFAULT now(),

    CONSTRAINT "PK_careers"      PRIMARY KEY ("id"),
    CONSTRAINT "UQ_careers_name" UNIQUE      ("name"),
    CONSTRAINT "UQ_careers_code" UNIQUE      ("code")
);


-- =============================================================
-- TABLA: users
-- =============================================================
-- Cuentas de estudiantes UCB. Solo emails @ucb.edu.bo.
-- passwordHash = bcrypt hash (nunca plain text).
--
-- INSERT: POST /auth/register
-- SELECT: POST /auth/login (buscar por email),
--         GET /auth/me, GET /users, GET /users/:id
-- UPDATE: (futuro: desactivar cuenta, cambiar rol)
-- =============================================================
CREATE TABLE IF NOT EXISTS "users" (
    "id"           UUID                 NOT NULL DEFAULT gen_random_uuid(),
    "email"        VARCHAR              NOT NULL,
    "passwordHash" VARCHAR              NOT NULL,
    "isActive"     BOOLEAN              NOT NULL DEFAULT true,
    "role"         "users_role_enum"    NOT NULL DEFAULT 'student',
    "createdAt"    TIMESTAMP            NOT NULL DEFAULT now(),
    "updatedAt"    TIMESTAMP            NOT NULL DEFAULT now(),

    CONSTRAINT "PK_users"       PRIMARY KEY ("id"),
    CONSTRAINT "UQ_users_email" UNIQUE      ("email"),
    CONSTRAINT "CHK_users_email_domain"
        CHECK ("email" LIKE '%@ucb.edu.bo')
);


-- =============================================================
-- TABLA: profiles
-- =============================================================
-- Perfil académico del estudiante. Se crea junto con el usuario.
-- Relación 1:1 con users (userId es UNIQUE).
--
-- INSERT: POST /auth/register (se crea automáticamente)
-- SELECT: GET /profiles/me, GET /profiles/:userId, GET /auth/me
-- UPDATE: PATCH /profiles/me  (fullName, bio, avatarUrl, careerId)
-- =============================================================
CREATE TABLE IF NOT EXISTS "profiles" (
    "id"        UUID                      NOT NULL DEFAULT gen_random_uuid(),
    "userId"    UUID                      NOT NULL,
    "fullName"  VARCHAR                   NOT NULL,
    "bio"       TEXT,
    "avatarUrl" VARCHAR,
    "campus"    "profiles_campus_enum"    NOT NULL DEFAULT 'La Paz',
    "careerId"  UUID                      NOT NULL,
    "createdAt" TIMESTAMP                 NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP                 NOT NULL DEFAULT now(),

    CONSTRAINT "PK_profiles"        PRIMARY KEY ("id"),
    CONSTRAINT "UQ_profiles_userId" UNIQUE      ("userId"),

    CONSTRAINT "FK_profiles_userId"
        FOREIGN KEY ("userId")   REFERENCES "users"("id")   ON DELETE CASCADE,
    CONSTRAINT "FK_profiles_careerId"
        FOREIGN KEY ("careerId") REFERENCES "careers"("id") ON DELETE RESTRICT
);


-- =============================================================
-- TABLA: posts
-- =============================================================
-- Publicaciones de estudiantes, filtradas por carrera.
-- Borrado lógico: isDeleted = true (nunca se elimina físicamente).
--
-- INSERT: POST /posts
-- SELECT: GET /posts (paginado, filtros careerId / authorId),
--         GET /posts/:id,
--         GET /careers/:id/posts (paginado),
--         todos filtran isDeleted = false
-- UPDATE: PATCH /posts/:id (content, mediaUrl) — solo el autor
-- SOFT DELETE: DELETE /posts/:id → isDeleted = true — solo el autor
-- =============================================================
CREATE TABLE IF NOT EXISTS "posts" (
    "id"        UUID      NOT NULL DEFAULT gen_random_uuid(),
    "authorId"  UUID      NOT NULL,
    "careerId"  UUID      NOT NULL,
    "content"   TEXT      NOT NULL,
    "mediaUrl"  VARCHAR,
    "isDeleted" BOOLEAN   NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT "PK_posts" PRIMARY KEY ("id"),

    CONSTRAINT "FK_posts_authorId"
        FOREIGN KEY ("authorId") REFERENCES "users"("id")   ON DELETE CASCADE,
    CONSTRAINT "FK_posts_careerId"
        FOREIGN KEY ("careerId") REFERENCES "careers"("id") ON DELETE RESTRICT
);


-- =============================================================
-- TABLA: comments
-- =============================================================
-- Comentarios en publicaciones.
-- Borrado lógico: isDeleted = true.
--
-- INSERT: POST /comments
-- SELECT: GET /comments/post/:postId — filtra isDeleted = false,
--         ordenado por createdAt ASC
-- UPDATE: PATCH /comments/:id (content) — solo el autor
-- SOFT DELETE: DELETE /comments/:id → isDeleted = true — solo el autor
-- =============================================================
CREATE TABLE IF NOT EXISTS "comments" (
    "id"        UUID      NOT NULL DEFAULT gen_random_uuid(),
    "postId"    UUID      NOT NULL,
    "authorId"  UUID      NOT NULL,
    "content"   TEXT      NOT NULL,
    "isDeleted" BOOLEAN   NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT "PK_comments" PRIMARY KEY ("id"),

    CONSTRAINT "FK_comments_postId"
        FOREIGN KEY ("postId")   REFERENCES "posts"("id")  ON DELETE CASCADE,
    CONSTRAINT "FK_comments_authorId"
        FOREIGN KEY ("authorId") REFERENCES "users"("id")  ON DELETE CASCADE
);


-- =============================================================
-- ÍNDICES
-- Aceleran las consultas más frecuentes del backend
-- =============================================================

-- Login: buscar usuario por email
CREATE INDEX IF NOT EXISTS "IDX_users_email"
    ON "users" ("email");

-- Perfil: buscar por userId (GET /profiles/:userId)
CREATE INDEX IF NOT EXISTS "IDX_profiles_userId"
    ON "profiles" ("userId");

-- Feed principal: posts activos ordenados por fecha
CREATE INDEX IF NOT EXISTS "IDX_posts_active_createdAt"
    ON "posts" ("createdAt" DESC)
    WHERE "isDeleted" = false;

-- Filtro de posts por carrera (GET /careers/:id/posts, GET /posts?careerId=)
CREATE INDEX IF NOT EXISTS "IDX_posts_careerId"
    ON "posts" ("careerId")
    WHERE "isDeleted" = false;

-- Filtro de posts por autor (GET /posts?authorId=)
CREATE INDEX IF NOT EXISTS "IDX_posts_authorId"
    ON "posts" ("authorId")
    WHERE "isDeleted" = false;

-- Comentarios de un post (GET /comments/post/:postId)
CREATE INDEX IF NOT EXISTS "IDX_comments_postId"
    ON "comments" ("postId")
    WHERE "isDeleted" = false;


-- =============================================================
-- DATOS INICIALES: carreras de UCB La Paz
-- Ajusta o agrega las carreras reales de tu facultad
-- =============================================================

INSERT INTO "careers" ("name", "code") VALUES
    ('Ingeniería de Sistemas',         'IS'),
    ('Ingeniería Civil',               'IC'),
    ('Ingeniería Industrial',          'II'),
    ('Administración de Empresas',     'AE'),
    ('Contaduría Pública',             'CP'),
    ('Derecho',                        'DR'),
    ('Psicología',                     'PS'),
    ('Medicina',                       'MD'),
    ('Arquitectura',                   'AR'),
    ('Comunicación Social',            'CS')
ON CONFLICT DO NOTHING;
