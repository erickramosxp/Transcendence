package com.ft.transcendence.realtime.chat.dto;

public class ChatSubscribedPayload {
    public Long chatId;

    public static ChatSubscribedPayload of(Long chatId) {
        ChatSubscribedPayload r = new ChatSubscribedPayload();
        r.chatId = chatId;
        return r;
    }
}
