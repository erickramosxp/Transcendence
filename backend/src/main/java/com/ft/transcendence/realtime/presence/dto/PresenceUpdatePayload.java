package com.ft.transcendence.realtime.presence.dto;

import java.time.OffsetDateTime;

public class PresenceUpdatePayload {
    public Long userId;
    public boolean online;
    public OffsetDateTime lastSeenAt;

    public static PresenceUpdatePayload of(Long userId, boolean online, OffsetDateTime lastSeenAt) {
        PresenceUpdatePayload r = new PresenceUpdatePayload();
        r.userId = userId;
        r.online = online;
        r.lastSeenAt = lastSeenAt;
        return r;
    }
}
