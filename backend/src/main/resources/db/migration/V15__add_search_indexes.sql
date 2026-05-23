--V15__add_search_indexes.sql

-- Habilita trigramas no PostgreSQL
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Habilita para ignorar acentos
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Cria função imutável
CREATE OR REPLACE FUNCTION f_unaccent(text)
    RETURNS text
    LANGUAGE sql
    IMMUTABLE
    STRICT
AS $$
    -- Uso do dicionário padrão de unaccent
    SELECT unaccent('unaccent'::regdictionary, $1);
$$;

-- Otimizador para busca de texto parcial
CREATE INDEX idx_users_name_trgm ON users USING gin (f_unaccent(name) gin_trgm_ops);
CREATE INDEX idx_users_username_trgm ON users USING gin (username gin_trgm_ops);
CREATE INDEX idx_users_bio_trgm ON users USING gin (f_unaccent(biography) gin_trgm_ops);
CREATE INDEX idx_users_location_trgm ON users USING gin (f_unaccent(location) gin_trgm_ops);

-- Índice comum (B-Tree) para buscas exatas na tabela user_preferences
CREATE INDEX idx_user_preferences_language ON user_preferences(language);
-- Índice comum para ordenação por data de login (pois usamos orderBy lastLogin)
CREATE INDEX idx_users_last_login ON users(last_login);