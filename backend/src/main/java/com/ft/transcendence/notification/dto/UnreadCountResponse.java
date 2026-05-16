package com.ft.transcendence.notification.dto;

public class UnreadCountResponse {
    public long count;

    public static UnreadCountResponse of(long count) {
        UnreadCountResponse r = new UnreadCountResponse();
        r.count = count;
        return r;
    }
}
