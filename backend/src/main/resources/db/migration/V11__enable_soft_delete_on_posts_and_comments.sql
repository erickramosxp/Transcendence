-- V11__enable_soft_delete_on_posts_and_comments.sql

ALTER TABLE posts
ADD COLUMN deleted_at timestamptz;

ALTER TABLE comments
ADD COLUMN deleted_at timestamptz;

CREATE INDEX idx_posts_not_deleted
ON posts (id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_comments_not_deleted
ON comments (post_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_posts_deleted_at
ON posts (deleted_at);

CREATE INDEX idx_comments_deleted_at
ON comments (deleted_at);