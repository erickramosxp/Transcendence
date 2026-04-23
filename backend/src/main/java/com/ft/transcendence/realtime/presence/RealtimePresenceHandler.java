package com.ft.transcendence.realtime.presence;

import com.ft.transcendence.realtime.presence.dto.PresenceUpdatePayload;
import com.ft.transcendence.realtime.ws.domain.RealtimeConnection;
import com.ft.transcendence.realtime.ws.app.RealtimeEventSender;
import com.ft.transcendence.realtime.ws.app.RealtimeSessionRegistry;
import com.ft.transcendence.realtime.ws.dto.RealtimeEventType;
import com.ft.transcendence.user.domain.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Set;

@ApplicationScoped
public class RealtimePresenceHandler {

    @Inject
    RealtimeSessionRegistry registry;
    @Inject
    PresenceService presenceService;
    @Inject
    RealtimeEventSender sender;

    private PresenceUpdatePayload getUserPayload(Long userId) {
        RealtimeConnection targetConnection = registry.getAnyConnectionByUserId(userId);
        String name = null;
        String username = null;
        String avatarUrl = null;
        OffsetDateTime now = OffsetDateTime.now();

        if (targetConnection != null) {
            name = targetConnection.name;
            username = targetConnection.username;
            avatarUrl = targetConnection.avatarUrl;
        } else {
            User user = User.findById(userId);
            if (user != null) {
                name = user.name;
                username = user.username;
                avatarUrl = user.avatarUrl;
            }
        }

        return PresenceUpdatePayload.of(userId, name, username, avatarUrl, presenceService.isOnline(userId), now);
    }

    public void handleConnected(RealtimeConnection connection) {
        connection.lastSeenAt = OffsetDateTime.now();

        listPresenceFriends(connection);

        notifyWatchers(connection, true, connection.lastSeenAt);
    }

    public void listPresenceFriends(RealtimeConnection connection) {
        connection.lastSeenAt = OffsetDateTime.now();

        Set<Long> targetUserIds = presenceService.resolveDefaultTargetUserIds(connection.userId);
        presenceService.subscribePresence(connection, targetUserIds);

        List<Long> orderedUserIds = targetUserIds.stream()
                .sorted(Comparator.comparing((Long userId) -> registry.isUserOnline(userId)).reversed())
                .toList();

        for (Long userId : orderedUserIds) {
            sender.send(connection.connectionId, RealtimeEventType.PRESENCE_UPDATED, getUserPayload(userId));
        }
    }

    public void handleDisconnected(RealtimeConnection connection) {
        boolean wasLastConnection = registry.isUserOnline(connection.userId) && registry.getUserConnectionCount(connection.userId) == 1;

        connection.lastSeenAt = OffsetDateTime.now();

        presenceService.removeWatcher(connection);

        if (wasLastConnection)
            notifyWatchers(connection, false, connection.lastSeenAt);
    }

    public void ping(RealtimeConnection connection) {
        connection.lastSeenAt = OffsetDateTime.now();
        sender.send(connection.connectionId, RealtimeEventType.PONG, null);
    }

    private void notifyWatchers(RealtimeConnection targetConnection, boolean online, OffsetDateTime lastSeenAt) {
        Set<RealtimeConnection> watchers = presenceService.getWatchers(targetConnection.userId);
        for (RealtimeConnection watcher : watchers) {
            sender.send(watcher.connectionId, RealtimeEventType.PRESENCE_UPDATED, PresenceUpdatePayload.of(targetConnection.userId,
                    targetConnection.name, targetConnection.username, targetConnection.avatarUrl, online, lastSeenAt));
        }
    }
}