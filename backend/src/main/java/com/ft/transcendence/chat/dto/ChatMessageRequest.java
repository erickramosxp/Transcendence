package com.ft.transcendence.chat.dto;

import com.ft.transcendence.realtime.chat.dto.IncomingChatEvent;

public class ChatMessageRequest {
    public String text;
    public String mediaUrl;
    public String type;
    public Long replyToId;

    public static ChatMessageRequest of(IncomingChatEvent event) {
        ChatMessageRequest r = new ChatMessageRequest();
        r.text = event.text;
        r.mediaUrl = event.mediaUrl;
        r.type = event.type;
        r.replyToId = event.replyToId;
        return r;
    }
}
