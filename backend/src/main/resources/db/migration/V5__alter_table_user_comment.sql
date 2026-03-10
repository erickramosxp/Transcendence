ALTER TABLE users
    ADD COLUMN like_count bigint NOT NULL DEFAULT 0;

ALTER TABLE users
    ADD COLUMN avatar_url text;