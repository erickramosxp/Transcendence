package com.ft.transcendence.chat.dto;

public class IncomingChatEvent {
    public String action;
    public String text;
    public String mediaUrl;
    public String type;
    Long replyToId;
}
