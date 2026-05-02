-- V11__alter_notifications.sql

ALTER TABLE notifications
    ADD COLUMN sender_id bigint REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE notifications
    ADD COLUMN is_read boolean NOT NULL DEFAULT false;

CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
