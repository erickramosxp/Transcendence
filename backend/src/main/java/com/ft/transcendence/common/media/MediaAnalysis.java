package com.ft.transcendence.common.media;

public record MediaAnalysis(
        boolean valid,
        String error,
        String detectedMimeType,
        MediaKind mediaKind
) {
}
