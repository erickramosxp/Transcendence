package com.ft.transcendence.media.dto;

import com.ft.transcendence.media.domain.Media;

public record MediaResponse (
        Long id,
        String mediaType,
        String mediaUrl,
        String blurUrl,
        Integer width,
        Integer height,
        String status
) {
    public static MediaResponse fromEntity(Media media) {
        if (media == null) return null;
        return new MediaResponse(
                media.id,
                media.mediaType.name(),
                media.pathOriginal,
                media.pathBlur,
                media.width,
                media.height,
                media.status != null ? media.status.name() : null
        );
    }
}
