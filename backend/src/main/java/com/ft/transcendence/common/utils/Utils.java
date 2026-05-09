package com.ft.transcendence.common.utils;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.logging.Log;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;

public class Utils {

    public enum MessageType {
        TEXT("text"),
        MEDIA("image");

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
            throw new BadRequestException("Message cannot contain text and media");

        return hasText ? MessageType.TEXT : MessageType.MEDIA;
    }

}
