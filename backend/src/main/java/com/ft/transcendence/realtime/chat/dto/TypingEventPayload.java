package com.ft.transcendence.realtime.chat.dto;

public class TypingEventPayload {
    public Long userId;
    public String name;
    public Long chatId;

    public static TypingEventPayload of(Long userId, Long chatId, String name) {
        TypingEventPayload r = new TypingEventPayload();
        r.userId = userId;
        r.name = name;
        r.chatId = chatId;
        return r;
    }
}
