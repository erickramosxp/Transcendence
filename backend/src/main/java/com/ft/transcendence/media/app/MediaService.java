package com.ft.transcendence.media.app;

import com.ft.transcendence.common.storage.StorageService;
import com.ft.transcendence.media.domain.Media;
import com.ft.transcendence.media.dto.MediaResponse;
import com.ft.transcendence.media.enums.MediaStatus;
import com.ft.transcendence.media.enums.MediaType;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class MediaService {

    @Inject
    StorageService storageService;

    @Transactional
    public Media attachMedia(String modelType, Long modelId, MediaType mediaType,
                            String original, String preview, String blur,
                            Integer width, Integer height, MediaStatus mediaStatus) {

        Media media = new Media();
        media.modelType = modelType;
        media.modelId = modelId;
        media.mediaType = mediaType;
        media.pathOriginal = original;
        media.pathPreview = preview;
        media.pathBlur = blur;
        media.width = width;
        media.height = height;
        media.status = mediaStatus;

        media.persist();
        return media;
    }

    @Transactional
    public Media attachExternalImage(String modelType, Long modelId, String externalUrl) {
        Media media = new Media();
        media.modelType = modelType;
        media.modelId = modelId;
        media.mediaType = MediaType.IMAGE;
        media.pathOriginal = externalUrl;
        media.pathPreview = null;
        media.pathBlur = null;
        media.status = MediaStatus.COMPLETED;
        media.persist();
        return media;
    }

    public MediaResponse buildMediaResponse(Media media) {

        if (media == null) {
            return null;
        }

        String originalUrl = resolvePublicUrl(media.pathOriginal);
        String previewUrl = media.pathPreview != null ? resolvePublicUrl(media.pathPreview) : null;
        String blurUrl = media.pathBlur != null ? resolvePublicUrl(media.pathBlur) : null;

        return new MediaResponse(
                media.id,
                media.mediaType.name(),
                originalUrl,
                blurUrl,
                media.width,
                media.height,
                media.status != null ? media.status.name() : null
        );
    }

    private String resolvePublicUrl(String path) {
        if (path == null || path.isBlank()) {
            return null;
        }
        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }
        return storageService.generateUrl(path);
    }

}
