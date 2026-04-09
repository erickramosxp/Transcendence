package com.ft.transcendence.chat.dto;

import com.ft.transcendence.chat.domain.ChatMessage;

import java.util.List;

public class ChatMessagePageResponse {
    public List<ChatMessageResponse> items;
    public int page;
    public int size;
    public boolean hasMore;

    public static ChatMessagePageResponse of(List<ChatMessage> messages, int page, boolean hasMore) {
        ChatMessagePageResponse resp = new ChatMessagePageResponse();
        resp.items = messages.stream().map(ChatMessageResponse::of).toList();
        resp.page = page;
        resp.size = messages.size();
        resp.hasMore = hasMore;
        return resp;
    }
}
