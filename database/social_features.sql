-- =============================================================
-- GeTa-Cato - Extensiones sociales idempotentes para Supabase
-- Ejecuta este archivo despues de database/schema.sql
-- =============================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'notifications_type_enum'
    ) THEN
        CREATE TYPE "notifications_type_enum" AS ENUM (
            'like',
            'comment',
            'follow',
            'message',
            'system'
        );
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS "post_likes" (
    "id"        UUID      NOT NULL DEFAULT gen_random_uuid(),
    "postId"    UUID      NOT NULL,
    "userId"    UUID      NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT "PK_post_likes" PRIMARY KEY ("id"),
    CONSTRAINT "UQ_post_likes_post_user" UNIQUE ("postId", "userId"),
    CONSTRAINT "FK_post_likes_postId"
        FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE,
    CONSTRAINT "FK_post_likes_userId"
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "saved_posts" (
    "id"        UUID      NOT NULL DEFAULT gen_random_uuid(),
    "postId"    UUID      NOT NULL,
    "userId"    UUID      NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT "PK_saved_posts" PRIMARY KEY ("id"),
    CONSTRAINT "UQ_saved_posts_post_user" UNIQUE ("postId", "userId"),
    CONSTRAINT "FK_saved_posts_postId"
        FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE,
    CONSTRAINT "FK_saved_posts_userId"
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "follows" (
    "id"          UUID      NOT NULL DEFAULT gen_random_uuid(),
    "followerId"  UUID      NOT NULL,
    "followingId" UUID      NOT NULL,
    "createdAt"   TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT "PK_follows" PRIMARY KEY ("id"),
    CONSTRAINT "UQ_follows_pair" UNIQUE ("followerId", "followingId"),
    CONSTRAINT "CHK_follows_self" CHECK ("followerId" <> "followingId"),
    CONSTRAINT "FK_follows_followerId"
        FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "FK_follows_followingId"
        FOREIGN KEY ("followingId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "notifications" (
    "id"          UUID                        NOT NULL DEFAULT gen_random_uuid(),
    "recipientId" UUID                        NOT NULL,
    "actorId"     UUID,
    "type"        "notifications_type_enum"  NOT NULL,
    "message"     VARCHAR                     NOT NULL,
    "link"        VARCHAR,
    "isRead"      BOOLEAN                     NOT NULL DEFAULT false,
    "createdAt"   TIMESTAMP                   NOT NULL DEFAULT now(),
    "updatedAt"   TIMESTAMP                   NOT NULL DEFAULT now(),

    CONSTRAINT "PK_notifications" PRIMARY KEY ("id"),
    CONSTRAINT "FK_notifications_recipientId"
        FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "FK_notifications_actorId"
        FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "messages" (
    "id"          UUID      NOT NULL DEFAULT gen_random_uuid(),
    "senderId"    UUID      NOT NULL,
    "recipientId" UUID      NOT NULL,
    "content"     TEXT      NOT NULL,
    "isRead"      BOOLEAN   NOT NULL DEFAULT false,
    "createdAt"   TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt"   TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT "PK_messages" PRIMARY KEY ("id"),
    CONSTRAINT "CHK_messages_self" CHECK ("senderId" <> "recipientId"),
    CONSTRAINT "FK_messages_senderId"
        FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "FK_messages_recipientId"
        FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "app_seed_runs" (
    "seedKey"    VARCHAR    NOT NULL,
    "createdAt"  TIMESTAMP  NOT NULL DEFAULT now(),

    CONSTRAINT "PK_app_seed_runs" PRIMARY KEY ("seedKey")
);

CREATE INDEX IF NOT EXISTS "IDX_post_likes_postId"
    ON "post_likes" ("postId");

CREATE INDEX IF NOT EXISTS "IDX_post_likes_userId"
    ON "post_likes" ("userId");

CREATE INDEX IF NOT EXISTS "IDX_saved_posts_userId"
    ON "saved_posts" ("userId");

CREATE INDEX IF NOT EXISTS "IDX_follows_followerId"
    ON "follows" ("followerId");

CREATE INDEX IF NOT EXISTS "IDX_follows_followingId"
    ON "follows" ("followingId");

CREATE INDEX IF NOT EXISTS "IDX_notifications_recipientId_createdAt"
    ON "notifications" ("recipientId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "IDX_notifications_recipientId_isRead"
    ON "notifications" ("recipientId", "isRead");

CREATE INDEX IF NOT EXISTS "IDX_messages_recipientId_createdAt"
    ON "messages" ("recipientId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "IDX_messages_senderId_createdAt"
    ON "messages" ("senderId", "createdAt" DESC);
