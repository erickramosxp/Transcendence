-- V4__alter_table_users.sql
ALTER TABLE posts
    RENAME COLUMN image_url TO media_url;

ALTER TABLE users
    ADD COLUMN avatar_url text;