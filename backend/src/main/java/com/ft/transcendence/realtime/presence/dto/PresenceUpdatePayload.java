package com.ft.transcendence.realtime.presence.dto;

import java.time.OffsetDateTime;

public class PresenceUpdatePayload {
    public Long userId;
    public String name;
    public String username;
    public String avatarUrl;
    public boolean online;
    public OffsetDateTime lastSeenAt;

    public static PresenceUpdatePayload of(Long userId, String name, String username, String avatarUrl, boolean online, OffsetDateTime lastSeenAt) {
        PresenceUpdatePayload r = new PresenceUpdatePayload();
        r.userId = userId;
        r.name = name;
        r.username = username;
        r.avatarUrl = avatarUrl;
        r.online = online;
        r.lastSeenAt = lastSeenAt;
        return r;
    }
}
