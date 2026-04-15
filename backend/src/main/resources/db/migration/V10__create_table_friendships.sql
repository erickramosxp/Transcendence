-- V10__create_table_friendships.sql
CREATE TABLE friendships (
    id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id    bigint NOT NULL,
    friend_id  bigint NOT NULL,
    status     text NOT NULL CHECK (status IN ('PENDING', 'ACCEPTED')), -- 'PENDING' ou 'ACCEPTED'
        created_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT fk_friendships_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_friendships_friend FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_friendships_user_status ON friendships(user_id, status);

CREATE UNIQUE INDEX idx_unique_friendship_request ON friendships(user_id, friend_id);