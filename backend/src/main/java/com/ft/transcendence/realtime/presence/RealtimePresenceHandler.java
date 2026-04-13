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

import java.time.Instant;
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
            sender.send(connection, RealtimeEventType.PRESENCE_UPDATED, PresenceUpdatePayload.of(userId, presenceService.isOnline(userId), now));
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
        notifyWatchers(connection.userId, true, connection.lastSeenAt);
    }

    public void handleDisconnected(String connectionId) {
        RealtimeConnection connection = registry.get(connectionId);
        if (connection == null)
            return;

        boolean wasLastConnection = registry.isUserOnline(connection.userId) && registry.getUserConnectionCount(connection.userId) == 1;

        connection.lastSeenAt = OffsetDateTime.now();

        if (wasLastConnection)
            notifyWatchers(connection.userId, false, connection.lastSeenAt);
    }

    public void ping(String connectionId) {
        RealtimeConnection connection = registry.get(connectionId);
        if (connection == null)
            return;

        connection.lastSeenAt = OffsetDateTime.now();
        sender.send(connection, RealtimeEventType.PONG, null);
    }

    private void notifyWatchers(Long targetUserId, boolean online, OffsetDateTime lastSeenAt) {
        Set<RealtimeConnection> watchers = presenceService.getWatchers(targetUserId);
        for (RealtimeConnection watcher : watchers) {
            sender.send(watcher, RealtimeEventType.PRESENCE_UPDATED, PresenceUpdatePayload.of(targetUserId, online, lastSeenAt));
        }
    }
}