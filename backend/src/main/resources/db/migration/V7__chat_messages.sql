-- V7__chat_messages.sql

ALTER TABLE chats
    ADD CONSTRAINT chk_chat_type CHECK (type IN ('direct', 'group'));

CREATE TABLE chat_messages (
                               id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                               chat_id      bigint NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
                               sender_id    bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                               content      text,
                               media_url    text,
                               type         text NOT NULL DEFAULT 'text'
                                   CHECK (type IN ('text', 'image', 'video', 'audio', 'system')),
                               reply_to_id  bigint REFERENCES chat_messages(id) ON DELETE SET NULL,
                               created_at   timestamptz NOT NULL DEFAULT now(),
                               updated_at   timestamptz NOT NULL DEFAULT now(),
                               deleted_at   timestamptz
);

CREATE TABLE message_read_status (
                                     id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                                     message_id  bigint NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
                                     user_id     bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                     read_at     timestamptz NOT NULL DEFAULT now(),
                                     UNIQUE (message_id, user_id)
);

ALTER TABLE chats
    ADD COLUMN last_message_at timestamptz;

CREATE OR REPLACE FUNCTION update_chat_last_message()
RETURNS trigger AS $$
BEGIN
UPDATE chats SET last_message_at = NEW.created_at, updated_at = NEW.created_at
WHERE id = NEW.chat_id;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_chat_messages_updated_at
    BEFORE UPDATE ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_update_chat_last_message
    AFTER INSERT ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_chat_last_message();