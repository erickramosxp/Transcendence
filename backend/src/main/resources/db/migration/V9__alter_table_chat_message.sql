-- V9__alter_table_chat_message.sql
ALTER TABLE chat_messages
    RENAME COLUMN content TO message_text;