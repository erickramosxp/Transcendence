package com.ft.transcendence.chat.dto;

import com.ft.transcendence.chat.domain.ChatMessage;

import java.time.OffsetDateTime;

public class ChatMessageResponse {
    public Long id;
    public Long chatId;
    public Long senderId;
    public String senderUsername;
    public String senderAvatarUrl;
    public String text;
    public String mediaUrl;
    public String type;
    public Long replyToId;
    public OffsetDateTime createdAt;
    public OffsetDateTime updatedAt;
    public OffsetDateTime deletedAt;

    public static ChatMessageResponse of(ChatMessage cm) {
        ChatMessageResponse r = new ChatMessageResponse();
        r.id = cm.id;
        r.chatId = cm.chat.id;
        r.senderId = cm.sender.id;
        r.senderUsername = cm.sender.username;
        r.senderAvatarUrl = cm.sender.avatarUrl;
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
