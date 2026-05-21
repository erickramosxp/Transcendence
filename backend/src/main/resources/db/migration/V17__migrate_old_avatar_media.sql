-- V17__migrate_old_avatar_media.sql

INSERT INTO media (
    model_type, 
    model_id, 
    media_type, 
    path_original, 
    status,
    created_at
)
SELECT
    'USER_PROFILE',
    id,
    'IMAGE',
    avatar_url,
    'COMPLETED',
    created_at
FROM users
WHERE avatar_url IS NOT NULL;