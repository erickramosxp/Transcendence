package com.ft.transcendence.notification.app;

import com.ft.transcendence.chat.domain.Chat;
import com.ft.transcendence.comment.domain.Comment;
import com.ft.transcendence.common.storage.StorageService;
import com.ft.transcendence.notification.domain.Notification;
import com.ft.transcendence.notification.domain.NotificationType;
import com.ft.transcendence.notification.dto.NotificationContent;
import com.ft.transcendence.notification.dto.NotificationResponse;
import com.ft.transcendence.post.domain.Post;
import com.ft.transcendence.realtime.ws.app.RealtimeEventSender;
import com.ft.transcendence.realtime.ws.app.RealtimeSessionRegistry;
import com.ft.transcendence.realtime.ws.domain.RealtimeConnection;
import com.ft.transcendence.realtime.ws.dto.RealtimeEventType;
import com.ft.transcendence.user.domain.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.OffsetDateTime;

@ApplicationScoped
public class NotificationDispatcher {

    @Inject
    NotificationService notificationService;
    @Inject
    RealtimeSessionRegistry sessionRegistry;
    @Inject
    RealtimeEventSender eventSender;
    @Inject
    StorageService storageService;

    public void onLikePost(Long userId, Post post) {
        User actor = User.findById(userId);
        if (actor.id.equals(post.user.id))
            return;

        NotificationContent content = new NotificationContent();
        content.name = actor.name;
        content.username = actor.username;
        content.avatarUrl = actor.avatarUrl;
        content.postId = post.id;
        content.preview = truncate(post.text);
        content.created_at = OffsetDateTime.now();

        dispatch(post.user.id, actor.id, NotificationType.LIKE_POST, content, post.id);
    }

    public void onLikeComment(Long userId, Comment comment) {
        User actor = User.findById(userId);
        if (actor.id.equals(comment.user.id))
            return;

        NotificationContent content = new NotificationContent();
        content.name = actor.name;
        content.username = actor.username;
        content.avatarUrl = actor.avatarUrl;
        content.commentId = comment.id;
        content.postId = comment.post.id;
        content.preview = truncate(comment.text);
        content.created_at = OffsetDateTime.now();

        dispatch(comment.user.id, actor.id, NotificationType.LIKE_COMMENT, content, comment.id);
    }

    public void onComment(User actor, Comment comment) {
        if (actor.id.equals(comment.post.user.id))
            return;

        NotificationContent content = new NotificationContent();
        content.name = actor.name;
        content.username = actor.username;
        content.avatarUrl = actor.avatarUrl;
        content.postId = comment.post.id;
        content.commentId = comment.id;
        content.preview = truncate(comment.text);
        content.created_at = OffsetDateTime.now();

        dispatch(comment.post.user.id, actor.id, NotificationType.COMMENT_POST, content, comment.id);
    }

    public void onFriendRequest(User actor, Long targetUserId, Long friendshipId) {
        NotificationContent content = new NotificationContent();
        content.name = actor.name;
        content.username = actor.username;
        content.avatarUrl = actor.avatarUrl;
        content.friendshipId = friendshipId;
        content.created_at = OffsetDateTime.now();

        dispatch(targetUserId, actor.id, NotificationType.FRIEND_REQUEST, content, null);
    }

    public void onFriendAccepted(User actor, Long originalSenderId) {
        NotificationContent content = new NotificationContent();
        content.name = actor.name;
        content.username = actor.username;
        content.avatarUrl = actor.avatarUrl;
        content.created_at = OffsetDateTime.now();

        dispatch(originalSenderId, actor.id, NotificationType.FRIEND_ACCEPTED, content, null);
    }

    public void onFriendReject(User actor, Long originalSenderId) {
        NotificationContent content = new NotificationContent();
        content.name = actor.name;
        content.username = actor.username;
        content.avatarUrl = actor.avatarUrl;
        content.created_at = OffsetDateTime.now();

        dispatch(originalSenderId, actor.id, NotificationType.FRIEND_REJECTED, content, null);
    }

    public void onFriendBroken(User actor, Long originalSenderId) {
        NotificationContent content = new NotificationContent();
        content.name = actor.name;
        content.username = actor.username;
        content.avatarUrl = actor.avatarUrl;
        content.created_at = OffsetDateTime.now();

        dispatch(originalSenderId, actor.id, NotificationType.FRIEND_BROKEN, content, null);
    }

    public void onAddedToGroup(User actor, Long targetUserId, Chat chat) {
        NotificationContent content = new NotificationContent();
        content.name = actor.name;
        content.username = actor.username;
        content.avatarUrl = actor.avatarUrl;
        content.chatName = chat.chatName;
        content.created_at = OffsetDateTime.now();

        dispatch(targetUserId, actor.id, NotificationType.ADDED_GROUP, content, null);
    }

    public void onRemovedFromGroup(User actor, Long targetUserId, Chat chat) {
        NotificationContent content = new NotificationContent();
        content.name = actor.name;
        content.username = actor.username;
        content.avatarUrl = actor.avatarUrl;
        content.chatName = chat.chatName;
        content.created_at = OffsetDateTime.now();

        dispatch(targetUserId, actor.id, NotificationType.REMOVED_GROUP, content, null);
    }

    private void dispatch(Long receiverId, Long senderId, NotificationType type, NotificationContent content, Long targetId) {
        Notification saved = notificationService.create(receiverId, senderId, type, content, targetId);

        if (saved == null)
            return;

        if (sessionRegistry.isUserOnline(receiverId)) {
            RealtimeConnection connection = sessionRegistry.getAnyConnectionByUserId(receiverId);
            if (connection != null) {
                String avatarUrl = content.avatarUrl;

                if (avatarUrl != null && !avatarUrl.isEmpty())
                    avatarUrl = storageService.generateUrl(content.avatarUrl);

                NotificationResponse payload = NotificationResponse.of(saved, avatarUrl);
                eventSender.send(connection.connectionId, RealtimeEventType.NOTIFICATION_RECEIVED, payload);
            }
        }
    }

    private String truncate(String text) {
        if (text == null || text.isBlank())
            return null;
        return text.length() <= 60 ? text : text.substring(0, 60) + "...";
    }
}
