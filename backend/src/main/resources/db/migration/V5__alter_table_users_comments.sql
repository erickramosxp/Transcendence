-- V5__alter_table_users_comments.sql
ALTER TABLE comments
    ADD COLUMN like_count bigint NOT NULL DEFAULT 0;

ALTER TABLE users
    ADD COLUMN banner_image_url text;