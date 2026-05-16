package com.ft.transcendence.notification.domain;

public enum NotificationType {
    LIKE_POST(true),
    LIKE_COMMENT(true),
    COMMENT_POST(false),
    FRIEND_REQUEST(false),
    FRIEND_ACCEPTED(false),
    FRIEND_REJECTED(false),
    FRIEND_BROKEN(false),
    ADDED_GROUP(false),
    REMOVED_GROUP(false);

    private final boolean dedupable;

    NotificationType(boolean dedupable) {
        this.dedupable = dedupable;
    }

    public boolean isDedupable() {
        return dedupable;
    }
}
