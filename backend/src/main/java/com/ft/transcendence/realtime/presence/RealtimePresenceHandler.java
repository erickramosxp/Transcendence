package com.ft.transcendence.realtime.presence;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ft.transcendence.realtime.presence.dto.PresenceSubscribePayload;
import com.ft.transcendence.realtime.presence.dto.PresenceUpdatePayload;
import com.ft.transcendence.realtime.ws.RealtimeConnection;
import com.ft.transcendence.realtime.ws.RealtimeEventSender;
import com.ft.transcendence.realtime.ws.RealtimeSessionRegistry;
import com.ft.transcendence.realtime.ws.dto.RealtimeEventType;
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
        if (req == null || req.userIds == null || req.userIds.isEmpty())
            return;

        presenceService.subscribePresence(connection, req.userIds);

        OffsetDateTime now = OffsetDateTime.now();

        for (Long userId : req.userIds) {
            sender.send(connection.connectionId, RealtimeEventType.PRESENCE_UPDATED, PresenceUpdatePayload.of(userId,
                    connection.username, connection.avatarUrl, presenceService.isOnline(userId), now));
        }
    }

    public void unsubscribe(String connectionId, JsonNode payload) {
        RealtimeConnection connection = registry.get(connectionId);
        if (connection == null)
            return;

        PresenceSubscribePayload req = objectMapper.convertValue(payload, PresenceSubscribePayload.class);
        if (req == null || req.userIds == null || req.userIds.isEmpty())
            return;

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
}