package com.ft.transcendence.chat.dto;

import com.ft.transcendence.chat.domain.Chat;
import com.ft.transcendence.chat.domain.ChatMessage;

import java.time.OffsetDateTime;

public class ChatResponse {
    public Long id;
    public String chatName;
    public String type;
    public UserMessageResponse user;
    public OffsetDateTime createdAt;
    public OffsetDateTime updatedAt;
    public LastMessageResponse lastMessage;

    public static ChatResponse of(Chat c) {
        return of(c, null, null);
    }

    public static ChatResponse of(Chat c, UserMessageResponse otherUser, ChatMessage lastMessage) {
        ChatResponse r = new ChatResponse();
        r.id = c.id;
        r.chatName = c.chatName;
        r.type = c.getType();
        r.user = otherUser;
        r.createdAt = c.createdAt;
        r.updatedAt = c.updatedAt;
        r.lastMessage = LastMessageResponse.of(lastMessage);
        return r;
    }
}
