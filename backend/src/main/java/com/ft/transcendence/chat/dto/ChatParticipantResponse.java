package com.ft.transcendence.chat.dto;

import com.ft.transcendence.chat.domain.ChatParticipant;

public class ChatParticipantResponse {
    public Long id;
    public String name;
    public String username;
    public String avatarUrl;
    public String role;

    public static ChatParticipantResponse of(ChatParticipant cp, String resolvedAvatarUrl) {
        ChatParticipantResponse r = new ChatParticipantResponse();
        r.id = cp.user.id;
        r.name = cp.user.name;
        r.username = cp.user.username;
        r.avatarUrl = resolvedAvatarUrl;
        r.role = cp.role;
        return r;
    }
}
