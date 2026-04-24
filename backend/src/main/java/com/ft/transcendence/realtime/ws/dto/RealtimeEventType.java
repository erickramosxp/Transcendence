package com.ft.transcendence.realtime.ws.dto;

public final class RealtimeEventType {
    public static final String CHAT_SUBSCRIBE = "CHAT_SUBSCRIBE";
    public static final String CHAT_UNSUBSCRIBE = "CHAT_UNSUBSCRIBE";
    public static final String SEND_MESSAGE = "SEND_MESSAGE";
    public static final String MESSAGE_CREATED = "MESSAGE_CREATED";
    public static final String TYPING_START = "TYPING_START";
    public static final String TYPING_STOP = "TYPING_STOP";
    public static final String PRESENCE_UPDATED = "PRESENCE_UPDATED";
    public static final String LIST_PRESENCE = "LIST_PRESENCE";
    public static final String PING = "PING";
    public static final String PONG = "PONG";
    public static final String ERROR = "ERROR";

    private RealtimeEventType() {}
}
