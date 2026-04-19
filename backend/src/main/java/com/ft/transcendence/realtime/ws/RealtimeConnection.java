package com.ft.transcendence.realtime.ws;

import io.quarkus.websockets.next.WebSocketConnection;

import java.time.OffsetDateTime;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

public class RealtimeConnection {
    public final String connectionId;
    public final Long userId;
    public final String name;
    public final String username;
    public final String avatarUrl;
    public final Set<Long> subscribedChatIds = ConcurrentHashMap.newKeySet();
    public final Set<Long> subscribedPresenceUserIds = ConcurrentHashMap.newKeySet();
    public volatile OffsetDateTime lastSeenAt;

    public RealtimeConnection(String connectionId, Long userId, String name, String username, String avatarUrl) {
        this.connectionId = connectionId;
        this.userId = userId;
        this.name = name;
        this.username = username;
        this.avatarUrl = avatarUrl;
        this.lastSeenAt = OffsetDateTime.now();
    }
}
