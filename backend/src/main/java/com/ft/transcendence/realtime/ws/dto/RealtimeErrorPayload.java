package com.ft.transcendence.realtime.ws.dto;

public class RealtimeErrorPayload {
    public String code;
    public String message;
    public String originalType;

    public static RealtimeErrorPayload of(String code, String message, String originalType) {
        RealtimeErrorPayload r = new RealtimeErrorPayload();
        r.code = code;
        r.message = message;
        r.originalType = originalType;
        return r;
    }
}