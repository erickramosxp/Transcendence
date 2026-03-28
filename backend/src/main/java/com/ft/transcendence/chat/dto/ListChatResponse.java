package com.ft.transcendence.chat.dto;

import com.ft.transcendence.chat.domain.Chat;

import java.util.List;

public class ListChatResponse {
    public List<ChatResponse> items;

    public static ListChatResponse of(List<Chat> chats) {
        ListChatResponse resp = new ListChatResponse();
        resp.items = chats.stream().map(ChatResponse::of).toList();
        return resp;
    }
}
