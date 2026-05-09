package com.ft.transcendence.chat.dto;

import com.ft.transcendence.chat.domain.ChatMessage;

import java.time.OffsetDateTime;

public class ChatMessageResponse {
    public Long id;
    public Long chatId;
    public Long senderId;
    public UserMessageResponse user;
    public String text;
    public String mediaUrl;
    public String type;
    public Long replyToId;
    public OffsetDateTime createdAt;
    public OffsetDateTime updatedAt;
    public OffsetDateTime deletedAt;

    public static ChatMessageResponse of(ChatMessage cm) {
        ChatMessageResponse r = new ChatMessageResponse();
        r.user = new UserMessageResponse();
        r.id = cm.id;
        r.chatId = cm.chat.id;
        r.senderId = cm.sender.id;
        r.user.id = cm.sender.id;
        r.user.username = cm.sender.username;
        r.user.name = cm.sender.name;
        r.user.avatarUrl = cm.sender.avatarUrl;
        r.text = cm.text;
        r.mediaUrl = cm.mediaUrl;
        r.type = cm.type;
        r.replyToId = cm.replyTo != null ? cm.replyTo.id : null;
        r.createdAt = cm.createdAt;
        r.updatedAt = cm.updatedAt;
        r.deletedAt = cm.deletedAt;
        return r;
    }
}
