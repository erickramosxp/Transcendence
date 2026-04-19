package com.ft.transcendence.realtime.chat.dto;

public class TypingEventPayload {
    public Long userId;
    public String username;
    public Long chatId;

    public static TypingEventPayload of(Long userId, Long chatId, String username) {
        TypingEventPayload r = new TypingEventPayload();
        r.userId = userId;
        r.username = username;
        r.chatId = chatId;
        return r;
    }
}
