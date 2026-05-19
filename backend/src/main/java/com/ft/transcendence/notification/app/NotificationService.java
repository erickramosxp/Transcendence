package com.ft.transcendence.notification.app;

import com.ft.transcendence.common.dto.PageResponse;
import com.ft.transcendence.common.storage.StorageService;
import com.ft.transcendence.notification.domain.Notification;
import com.ft.transcendence.notification.domain.NotificationType;
import com.ft.transcendence.notification.dto.NotificationContent;
import com.ft.transcendence.notification.dto.NotificationResponse;
import com.ft.transcendence.user.app.UserAvatarService;
import com.ft.transcendence.user.domain.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@ApplicationScoped
public class NotificationService {

    @Inject
    UserAvatarService userAvatarService;

    @Transactional
    public Notification create(Long receiverId, Long senderId, NotificationType type, NotificationContent content, Long targetId) {
        if (type.isDedupable() && targetId != null && senderId != null) {
            long existing = Notification.count(
                    "receiver.id = ?1 and sender.id = ?2 and type = ?3 and targetId = ?4",
                    receiverId, senderId, type, targetId
            );
            if (existing > 0)
                return null;
        }

        Notification n = new Notification();
        n.receiver = User.findById(receiverId);
        n.sender = senderId != null ? User.findById(senderId) : null;
        n.type = type;
        n.content = content;
        n.targetId = targetId;
        n.isRead = false;
        n.persist();
        return n;
    }

    public PageResponse<NotificationResponse> listByUser(Long userId, int pageIndex, int pageSize) {
        int start = pageIndex * pageSize;
        int end = start + pageSize;

        List<Notification> notifications = Notification
                .find("receiver.id = ?1 ORDER BY createdAt DESC", userId)
                .range(start, end)
                .list();

        if (notifications.isEmpty()) {
            return new PageResponse<>(Collections.emptyList(), pageIndex, pageSize, false);
        }

        boolean hasMore = notifications.size() > pageSize;
        if (hasMore)
            notifications = notifications.subList(0, pageSize);

        List<User> senders = notifications.stream().map(n -> n.sender).toList();
        Map<Long, String> avatars = userAvatarService.getAvatarUrls(senders);


        List<NotificationResponse> items = notifications.stream()
                .map(n -> {
                    String avatarUrl = avatars.get(n.sender.id);
                    return NotificationResponse.of(n, avatarUrl);
                })
                .toList();

        return new PageResponse<>(items, pageIndex, pageSize, hasMore);
    }

    public long countUnread(Long userId) {
        return Notification.count("receiver.id = ?1 AND isRead = false", userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification n = Notification.<Notification>findByIdOptional(notificationId).orElseThrow(() -> new NotFoundException("Notification not found"));

        if (!n.receiver.id.equals(userId))
            throw new ForbiddenException("Access denied");

        n.isRead = true;
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        Notification.update("isRead = true WHERE receiver.id = ?1 AND isRead = false", userId);
    }
}
