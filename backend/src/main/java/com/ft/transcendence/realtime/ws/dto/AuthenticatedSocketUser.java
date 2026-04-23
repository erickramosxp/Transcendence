package com.ft.transcendence.realtime.ws.dto;

public class AuthenticatedSocketUser {
    public Long userId;
    public String name;
    public String username;
    public String avatarUrl;
    public String subject;

    public static AuthenticatedSocketUser of(Long userId, String name, String username, String avatarUrl, String subject) {
        AuthenticatedSocketUser r = new AuthenticatedSocketUser();
        r.userId = userId;
        r.name = name;
        r.username = username;
        r.avatarUrl = avatarUrl;
        r.subject = subject;
        return r;
    }
}
