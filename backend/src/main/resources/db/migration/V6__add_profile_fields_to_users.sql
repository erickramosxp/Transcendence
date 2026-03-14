-- V6__add_profile_fields_to_users.sql

ALTER TABLE users
    ADD COLUMN biography text,
    ADD COLUMN website_url VARCHAR(2048),
    ADD COLUMN location VARCHAR(255);