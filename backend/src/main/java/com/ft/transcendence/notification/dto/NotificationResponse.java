package com.ft.transcendence.notification.dto;

import com.ft.transcendence.notification.domain.Notification;
import com.ft.transcendence.notification.domain.NotificationType;

import java.time.OffsetDateTime;

public class NotificationResponse {
    public Long id;
    public NotificationType type;
    public boolean isRead;
    public OffsetDateTime createdAt;
    public String name;
    public String username;
    public String avatarUrl;
    public Long postId;
    public Long commentId;
    public Long friendshipId;
    public String preview;
    public String chatName;

    public static NotificationResponse of(Notification n, String resolvedAvatarUrl) {
        NotificationResponse r = new NotificationResponse();
        r.id = n.id;
        r.type = n.type;
        r.isRead = n.isRead;
        r.createdAt = n.createdAt;

        if (n.content != null) {
            r.name = n.content.name;
            r.username = n.content.username;
            r.avatarUrl = resolvedAvatarUrl;
            r.postId = n.content.postId;
            r.commentId = n.content.commentId;
            r.friendshipId = n.content.friendshipId;
            r.preview = n.content.preview;
            r.chatName = n.content.chatName;
        }

        return r;
    }
}
