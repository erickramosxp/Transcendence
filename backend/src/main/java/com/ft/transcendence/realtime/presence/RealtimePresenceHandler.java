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
import java.util.Set;

@ApplicationScoped
public class RealtimePresenceHandler {

    @Inject
    RealtimeSessionRegistry registry;
    @Inject
    PresenceService presenceService;
    @Inject
    RealtimeEventSender sender;

    public void subscribe(String connectionId) {
        RealtimeConnection connection = registry.get(connectionId);
        if (connection == null)
            return;

        Set<Long> targetUserIds = presenceService.resolveDefaultTargetUserIds(connection.userId);

        presenceService.subscribePresence(connection, targetUserIds);

        for (Long userId : targetUserIds) {
            sender.send(connection.connectionId, RealtimeEventType.PRESENCE_UPDATED, getUserPayload(userId));
        }
    }

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

    public void unsubscribe(String connectionId) {
        RealtimeConnection connection = registry.get(connectionId);
        if (connection == null)
            return;

        presenceService.removeWatcher(connection);
    }

    public void handleConnected(String connectionId) {
        RealtimeConnection connection = registry.get(connectionId);
        if (connection == null)
            return;

        connection.lastSeenAt = OffsetDateTime.now();
        notifyWatchers(connection, true, connection.lastSeenAt);
    }

    public void handleDisconnected(String connectionId) {
        RealtimeConnection connection = registry.get(connectionId);
        if (connection == null)
            return;

        boolean wasLastConnection = registry.isUserOnline(connection.userId) && registry.getUserConnectionCount(connection.userId) == 1;

        connection.lastSeenAt = OffsetDateTime.now();

        presenceService.removeWatcher(connection);

        if (wasLastConnection)
            notifyWatchers(connection, false, connection.lastSeenAt);
    }

    public void ping(String connectionId) {
        RealtimeConnection connection = registry.get(connectionId);
        if (connection == null)
            return;

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