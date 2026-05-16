--V14_notifications_dedup.sql

TRUNCATE TABLE notifications;

ALTER TABLE notifications
    ADD COLUMN target_id BIGINT NULL;

CREATE INDEX idx_notifications_target
    ON notifications (target_id);

CREATE UNIQUE INDEX notifications_like_dedup
    ON notifications (user_id, sender_id, type, target_id)
    WHERE type IN ('LIKE_POST', 'LIKE_COMMENT');