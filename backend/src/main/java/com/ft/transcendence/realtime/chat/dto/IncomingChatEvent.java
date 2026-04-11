package com.ft.transcendence.realtime.chat.dto;

public class IncomingChatEvent {
    public String action;
    public String text;
    public String mediaUrl;
    public String type;
    public Long replyToId;
}
