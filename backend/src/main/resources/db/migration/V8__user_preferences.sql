-- V8__user_preferences.sql

CREATE TABLE user_preferences (
                                  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                                  user_id     bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                  theme       text NOT NULL DEFAULT 'light',
                                  language    text NOT NULL DEFAULT 'pt-BR',
                                  created_at  timestamptz NOT NULL DEFAULT now(),
                                  updated_at  timestamptz NOT NULL DEFAULT now(),
                                  UNIQUE (user_id)
);

CREATE TRIGGER trg_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

INSERT INTO user_preferences (user_id, theme, language, created_at, updated_at)
SELECT u.id, 'light', 'pt-BR', now(), now()
FROM users u
         LEFT JOIN user_preferences up ON up.user_id = u.id
WHERE up.id IS NULL;