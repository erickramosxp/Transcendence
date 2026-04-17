package com.ft.transcendence.realtime.ws.dto;

public final class RealtimeEventType {
    public static final String CHAT_SUBSCRIBE = "CHAT_SUBSCRIBE";
    public static final String CHAT_SUBSCRIBED = "CHAT_SUBSCRIBED";
    public static final String CHAT_UNSUBSCRIBE = "CHAT_UNSUBSCRIBE";
    public static final String CHAT_UNSUBSCRIBED = "CHAT_UNSUBSCRIBED";
    public static final String SEND_MESSAGE = "SEND_MESSAGE";
    public static final String MESSAGE_CREATED = "MESSAGE_CREATED";
    public static final String TYPING_START = "TYPING_START";
    public static final String TYPING_STOP = "TYPING_STOP";
    public static final String PRESENCE_SUBSCRIBE = "PRESENCE_SUBSCRIBE";
    public static final String PRESENCE_UNSUBSCRIBE = "PRESENCE_UNSUBSCRIBE";
    public static final String PRESENCE_UPDATED = "PRESENCE_UPDATED";
    public static final String USER_ONLINE = "USER_ONLINE";
    public static final String USER_OFFLINE = "USER_OFFLINE";
    public static final String PING = "PING";
    public static final String PONG = "PONG";
    public static final String ERROR = "ERROR";

    private RealtimeEventType() {}
}
