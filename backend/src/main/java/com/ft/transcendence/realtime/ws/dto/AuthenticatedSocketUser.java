package com.ft.transcendence.realtime.ws.dto;

public class AuthenticatedSocketUser {
    public Long userId;
    public String name;
    public String subject;

    public static AuthenticatedSocketUser of(Long userId, String name, String subject) {
        AuthenticatedSocketUser r = new AuthenticatedSocketUser();
        r.userId = userId;
        r.name = name;
        r.subject = subject;
        return r;
    }
}
