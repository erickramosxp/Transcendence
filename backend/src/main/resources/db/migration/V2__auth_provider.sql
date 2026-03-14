-- V2__auth_provider.sql
-- 1) Enum do provider
DO $$ BEGIN
CREATE TYPE auth_provider_type AS ENUM ('LOCAL','GOOGLE','GITHUB');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2) Tabela auth_provider
CREATE TABLE auth_provider (
                               id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                               user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                               provider_type auth_provider_type NOT NULL,
                               provider_user_id text,
                               password_hash text,
                               created_at timestamptz NOT NULL DEFAULT now(),

                               CHECK (
                                   (provider_type = 'LOCAL' AND password_hash IS NOT NULL AND provider_user_id IS NULL)
                                       OR
                                   (provider_type <> 'LOCAL' AND provider_user_id IS NOT NULL AND password_hash IS NULL)
                                   )
);

-- 3) Índices/constraints de unicidade
CREATE UNIQUE INDEX ux_auth_provider_user_type
    ON auth_provider(user_id, provider_type);

CREATE UNIQUE INDEX ux_auth_provider_type_userid
    ON auth_provider(provider_type, provider_user_id);