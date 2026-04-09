package com.ft.transcendence.chat.dto;

import java.time.OffsetDateTime;

public class OutgoingChatEvent {
    public String event;
    public Long chatId;
    public Long messageId;
    public Long senderId;
    public String senderUsername;
    public String senderAvatarUrl;
    public String text;
    public String mediaUrl;
    public String type;
    public Long replyToId;
    public OffsetDateTime createdAt;

    public static OutgoingChatEvent of(String event, ChatMessageResponse saved) {
        OutgoingChatEvent r = new OutgoingChatEvent();
        r.event = event;
        r.chatId = saved.chatId;
        r.messageId = saved.id;
        r.senderId = saved.senderId;
        r.senderUsername = saved.senderUsername;
        r.senderAvatarUrl = saved.senderAvatarUrl;
        r.text = saved.text;
        r.mediaUrl = saved.mediaUrl;
        r.type = saved.type;
        r.replyToId = saved.replyToId;
        r.createdAt = saved.createdAt;
        return r;
    }
}
