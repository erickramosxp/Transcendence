package com.ft.transcendence.realtime.chat.dto;

public class ChatUnsubscribedPayload {
    public Long chatId;

    public static ChatUnsubscribedPayload of(Long chatId) {
        ChatUnsubscribedPayload r = new ChatUnsubscribedPayload();
        r.chatId = chatId;
        return r;
    }
}
