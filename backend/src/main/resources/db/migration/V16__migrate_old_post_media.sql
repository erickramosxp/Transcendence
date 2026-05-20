-- V16__migrate_old_post_media.sql

INSERT INTO media (
    model_type, 
    model_id, 
    media_type, 
    path_original, 
    path_preview,
    status, 
    created_at
)
SELECT 
    'POST', 
    id, 
    CASE 
        WHEN media_url LIKE '%.mp4' THEN 'VIDEO'
        ELSE 'IMAGE'
    END AS media_type,
    media_url,
    CASE
        WHEN media_url LIKE '%.mp4' THEN NULL
        ELSE media_url
    END AS path_preview,
    CASE
        WHEN media_url LIKE '%.mp4' THEN 'PENDING'
        ELSE 'COMPLETED'
    END AS status,
    created_at
FROM posts
WHERE media_url IS NOT NULL;