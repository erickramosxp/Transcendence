package com.ft.transcendence.realtime.chat.dto;

public class TypingEventPayload {
    public Long userId;
    public Long chatId;

    public static TypingEventPayload of(Long userId, Long chatId) {
        TypingEventPayload r = new TypingEventPayload();
        r.userId = userId;
        r.chatId = chatId;
        return r;
    }
}
