package com.ft.transcendence.chat.dto;

import java.util.List;

public class ChatMessagePageResponse {
    public List<ChatMessageResponse> items;
    public int page;
    public int size;
    public boolean hasMore;
}
