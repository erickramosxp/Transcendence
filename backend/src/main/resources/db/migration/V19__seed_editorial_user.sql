-- V19__seed_editorial_user.sql


INSERT INTO users (email, username, name, active, biography, created_at, updated_at)
SELECT
    'editorial@videa.local',
    'videa',
    'Videa Notícias',
    TRUE,
    'Manchetes do momento no Brasil.',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE username = 'videa'
);

INSERT INTO user_preferences (user_id, theme, language, created_at, updated_at)
SELECT u.id, 'light', 'pt-BR', NOW(), NOW()
FROM users u
         LEFT JOIN user_preferences up ON up.user_id = u.id
WHERE u.username = 'videa'
  AND up.id IS NULL;
