package com.ft.transcendence.chat.dto;

import com.ft.transcendence.chat.domain.Chat;

import java.util.List;

public class ListChatResponse {
    public List<ChatResponse> items;
    public int page;
    public int size;
    public boolean hasMore;

    public static ListChatResponse of(List<ChatResponse> items, int page, boolean hasMore) {
        ListChatResponse resp = new ListChatResponse();
        resp.items = items;
        resp.page = page;
        resp.size = items.size();
        resp.hasMore = hasMore;
        return resp;
    }
}
