package com.ft.transcendence.common.utils;

import jakarta.ws.rs.BadRequestException;

public class Utils {

    public enum MessageType {
        TEXT("TEXT"),
        MEDIA("MEDIA"),
        TEXT_WITH_MEDIA("TEXT_WITH_MEDIA");

        private final String value;

        MessageType(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }
    }

    public static MessageType resolveType(String content, String mediaUrl) {
        boolean hasText = content != null && !content.isBlank();
        boolean hasMedia = mediaUrl != null && !mediaUrl.isBlank();

        if (!hasText && !hasMedia)
            throw new BadRequestException("Message must contain text or media");

        if (hasText && hasMedia)
            return MessageType.TEXT_WITH_MEDIA;

        return hasText ? MessageType.TEXT : MessageType.MEDIA;
    }

}
