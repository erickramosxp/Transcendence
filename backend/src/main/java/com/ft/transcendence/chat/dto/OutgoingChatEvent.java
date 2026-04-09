package com.ft.transcendence.chat.dto;

import java.time.OffsetDateTime;

public class OutgoingChatEvent {
    public String event;
    public Long chatId;
    public Long messageId;
    public Long senderId;
    public String senderUsername;
    public String senderAvatarUrl;
    public String content;
    public String mediaUrl;
    public String type;
    public Long replyToId;
    public OffsetDateTime createdAt;
}
