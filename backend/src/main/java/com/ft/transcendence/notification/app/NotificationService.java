package com.ft.transcendence.notification.app;

import com.ft.transcendence.common.dto.PageResponse;
import com.ft.transcendence.common.storage.StorageService;
import com.ft.transcendence.notification.domain.Notification;
import com.ft.transcendence.notification.domain.NotificationType;
import com.ft.transcendence.notification.dto.NotificationContent;
import com.ft.transcendence.notification.dto.NotificationResponse;
import com.ft.transcendence.user.domain.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
public class NotificationService {

    @Inject
    StorageService storageService;

    @Transactional
    public Notification create(Long receiverId, Long senderId, NotificationType type, NotificationContent content) {
        Notification n = new Notification();
        n.receiver = User.findById(receiverId);
        n.sender = senderId != null ? User.findById(senderId) : null;
        n.type = type;
        n.content = content;
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

        boolean hasMore = notifications.size() > pageSize;
        if (hasMore)
            notifications = notifications.subList(0, pageSize);

        List<NotificationResponse> items = notifications.stream()
                .map(n -> {
                    String avatarUrl = resolveAvatarUrl(n.content);
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

    private String resolveAvatarUrl(NotificationContent content) {
        if (content == null || content.avatarUrl == null || content.avatarUrl.isBlank())
            return null;

        String url = content.avatarUrl;
        if (url.contains("http") || url.contains("blob"))
            return url;

        return storageService.generateUrl(url);
    }
}
