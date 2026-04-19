package com.ft.transcendence.realtime.presence;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ft.transcendence.realtime.presence.dto.PresenceSubscribePayload;
import com.ft.transcendence.realtime.presence.dto.PresenceUpdatePayload;
import com.ft.transcendence.realtime.ws.RealtimeConnection;
import com.ft.transcendence.realtime.ws.RealtimeEventSender;
import com.ft.transcendence.realtime.ws.RealtimeSessionRegistry;
import com.ft.transcendence.realtime.ws.dto.RealtimeErrorPayload;
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
    @Inject
    ObjectMapper objectMapper;

    public void subscribe(String connectionId, JsonNode payload) {
        RealtimeConnection connection = registry.get(connectionId);
        if (connection == null)
            return;

        PresenceSubscribePayload req = objectMapper.convertValue(payload, PresenceSubscribePayload.class);
        if (req == null) {
            sendError(connection,"INVALID_PAYLOAD", "Payload is required", RealtimeEventType.PRESENCE_SUBSCRIBE);
            return;
        }

        if (req.userIds == null || req.userIds.isEmpty()) {
            sendError(connection,"MISSING_FIELD","userIds is required", RealtimeEventType.PRESENCE_SUBSCRIBE);
            return;
        }

        presenceService.subscribePresence(connection, req.userIds);

        for (Long userId : req.userIds) {
            sender.send(connection.connectionId, RealtimeEventType.PRESENCE_UPDATED, getUserPayload(userId));
        }
    }

    private PresenceUpdatePayload getUserPayload(Long userId) {
        RealtimeConnection targetConnection = registry.getAnyConnectionByUserId(userId);
        String username = null;
        String avatarUrl = null;
        OffsetDateTime now = OffsetDateTime.now();

        if (targetConnection != null) {
            username = targetConnection.username;
            avatarUrl = targetConnection.avatarUrl;
        } else {
            User user = User.findById(userId);
            if (user != null) {
                username = user.username;
                avatarUrl = user.avatarUrl;
            }
        }

        return PresenceUpdatePayload.of(userId, username, avatarUrl, presenceService.isOnline(userId), now);
    }

    public void unsubscribe(String connectionId, JsonNode payload) {
        RealtimeConnection connection = registry.get(connectionId);
        if (connection == null)
            return;

        PresenceSubscribePayload req = objectMapper.convertValue(payload, PresenceSubscribePayload.class);
        if (req == null) {
            sendError(connection,"INVALID_PAYLOAD", "Payload is required", RealtimeEventType.PRESENCE_UNSUBSCRIBE);
            return;
        }

        if (req.userIds == null || req.userIds.isEmpty()) {
            sendError(connection,"MISSING_FIELD","userIds is required", RealtimeEventType.PRESENCE_UNSUBSCRIBE);
            return;
        }

        presenceService.unsubscribePresence(connection, req.userIds);
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
                    targetConnection.username, targetConnection.avatarUrl, online, lastSeenAt));
        }
    }

    private void sendError(RealtimeConnection connection, String code, String message, String originalType) {
        if (connection == null)
            return;
        sender.send(connection.connectionId, RealtimeEventType.ERROR, RealtimeErrorPayload.of(code, message, originalType));
    }
}