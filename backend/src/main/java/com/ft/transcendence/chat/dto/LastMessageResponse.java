package com.ft.transcendence.chat.dto;

import com.ft.transcendence.chat.domain.ChatMessage;
import java.time.OffsetDateTime;

public class LastMessageResponse {
    public String text;
    public OffsetDateTime createdAt;

    public static LastMessageResponse of(ChatMessage m) {
        if (m == null)
            return null;

        LastMessageResponse r = new LastMessageResponse();
        r.text = m.text;
        r.createdAt = m.createdAt;
        return r;
    }
}
