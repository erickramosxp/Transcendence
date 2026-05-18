-- V15__create_media_table.sql

CREATE TABLE media (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    model_type text NOT NULL,  -- Ex: 'POST', 'USER_PROFILE'
    model_id bigint NOT NULL,         -- ID do Post ou do Usuário
    media_type text NOT NULL,  -- 'IMAGE', 'VIDEO'

    path_original text NOT NULL,
    path_preview text,
    path_blur text,

    width INT,
    height INT,
    duration DECIMAL(10, 2),          -- Tempo em segundos para vídeos
    status text,               -- 'PENDING', 'COMPLETED' (Para os Jobs)

    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz
);

-- A Mágica da Performance: Índice Composto
CREATE INDEX idx_media_polymorphic
    ON media (model_type, model_id);

-- Reaproveitando a trigger do seu banco
CREATE TRIGGER trg_media_updated_at
    BEFORE UPDATE ON media
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();