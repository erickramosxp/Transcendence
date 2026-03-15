-- V1__initial_schema.sql
CREATE SCHEMA IF NOT EXISTS public;
SET search_path TO public;

-- Tabela Users
CREATE TABLE users (
                       id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                       email      text NOT NULL UNIQUE,
                       username   text NOT NULL UNIQUE,
                       name       text,
                       active     boolean NOT NULL DEFAULT TRUE,
                       roles      text,
                       created_at timestamptz NOT NULL DEFAULT now(),
                       updated_at timestamptz NOT NULL DEFAULT now(),
                       last_login timestamptz
);

-- Tabela Posts
CREATE TABLE posts (
                       id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                       user_id    bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                       title      text,
                       text       text,
                       image_url  text,
                       like_count bigint NOT NULL DEFAULT 0,
                       comment_count bigint NOT NULL DEFAULT 0,
                       created_at timestamptz NOT NULL DEFAULT now(),
                       updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tabela Comments
CREATE TABLE comments (
                          id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                          user_id    bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                          post_id    bigint NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
                          text       text NOT NULL,
                          created_at timestamptz NOT NULL DEFAULT now(),
                          updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tabela Likes (like em post ou comentário)
CREATE TABLE likes (
                       id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                       user_id     bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                       post_id     bigint REFERENCES posts(id) ON DELETE CASCADE,
                       comment_id  bigint REFERENCES comments(id) ON DELETE CASCADE,
                       created_at  timestamptz NOT NULL DEFAULT now(),
                       CHECK (
                           (post_id IS NOT NULL AND comment_id IS NULL) OR
                           (post_id IS NULL AND comment_id IS NOT NULL)
                           ),
                       UNIQUE (user_id, post_id),
                       UNIQUE (user_id, comment_id)
);

-- Tabela Chats
CREATE TABLE chats (
                       id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                       chat_name  text,
                       type       text, -- 'direct', 'group', etc.
                       created_at timestamptz NOT NULL DEFAULT now(),
                       updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tabela ChatParticipants
CREATE TABLE chat_participants (
                                   id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                                   chat_id    bigint NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
                                   user_id    bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                   role       text, -- 'admin', 'member', etc.
                                   joined_at  timestamptz NOT NULL DEFAULT now(),
                                   updated_at timestamptz NOT NULL DEFAULT now(),
                                   UNIQUE (chat_id, user_id)
);

-- Tabela Follows
CREATE TABLE follows (
                         id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                         follower_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                         followee_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                         created_at  timestamptz NOT NULL DEFAULT now(),
                         UNIQUE (follower_id, followee_id)
);

-- Tabela Notifications
CREATE TABLE notifications (
                               id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                               user_id    bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                               type       text NOT NULL,
                               content    jsonb,
                               created_at timestamptz NOT NULL DEFAULT now()
);

-- Índices principais
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_likes_user_post ON likes(user_id, post_id);
CREATE INDEX idx_likes_user_comment ON likes(user_id, comment_id);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_followee ON follows(followee_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);

-- Trigger genérico para updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_chats_updated_at
    BEFORE UPDATE ON chats
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_chat_participants_updated_at
    BEFORE UPDATE ON chat_participants
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();