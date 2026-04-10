package com.ft.transcendence.chat.dto;

import com.ft.transcendence.chat.domain.Chat;

import java.util.List;

public class ListChatResponse {
    public List<ChatResponse> items;
    public int page;
    public int size;
    public boolean hasMore;

    public static ListChatResponse of(List<Chat> chats, int page, boolean hasMore) {
        ListChatResponse resp = new ListChatResponse();
        resp.items = chats.stream().map(ChatResponse::of).toList();
        resp.page = page;
        resp.size = chats.size();
        resp.hasMore = hasMore;
        return resp;
    }
}
