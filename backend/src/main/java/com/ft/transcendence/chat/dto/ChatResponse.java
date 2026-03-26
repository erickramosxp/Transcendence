package com.ft.transcendence.chat.dto;

import com.ft.transcendence.chat.domain.Chat;
import jakarta.persistence.Column;

import java.time.OffsetDateTime;

public class ChatResponse {
    public Long id;
    public String chatName;
    public OffsetDateTime createdAt;
    public OffsetDateTime updatedAt;
    public OffsetDateTime lastMessageAt;

    public static ChatResponse of(Chat c) {
        ChatResponse r = new ChatResponse();
        r.id = c.id;
        r.chatName = c.chatName;
        r.createdAt = c.createdAt;
        r.updatedAt = c.updatedAt;
        r.lastMessageAt = c.lastMessageAt;
        return r;
    }
}
