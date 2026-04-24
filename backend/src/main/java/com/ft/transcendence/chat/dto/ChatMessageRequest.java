package com.ft.transcendence.chat.dto;

import com.ft.transcendence.realtime.chat.dto.SendMessagePayload;

public class ChatMessageRequest {
    public String text;
    public String mediaUrl;
    public String type;
    public Long replyToId;

    public static ChatMessageRequest of(SendMessagePayload req) {
        ChatMessageRequest r = new ChatMessageRequest();
        r.text = req.text;
        r.mediaUrl = req.mediaUrl;
        r.type = req.type;
        r.replyToId = req.replyToId;
        return r;
    }
}
