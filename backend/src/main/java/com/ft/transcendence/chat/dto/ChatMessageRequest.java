package com.ft.transcendence.chat.dto;

import com.ft.transcendence.chat.domain.Chat;
import com.ft.transcendence.chat.domain.ChatMessage;
import com.ft.transcendence.user.domain.User;

public class ChatMessageRequest {
    public String text;
    public String mediaUrl;
    public Long replyMessageId;
}
