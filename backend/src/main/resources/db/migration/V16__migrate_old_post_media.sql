-- Supondo que a coluna antiga no post se chame 'media_path'

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
    media_url,
    'COMPLETED',
    created_at
FROM posts
WHERE media_url IS NOT NULL;