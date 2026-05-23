--V16__mutual_friendship_index.sql

CREATE INDEX idx_friendships_mutual ON friendships (user_id, status, friend_id);