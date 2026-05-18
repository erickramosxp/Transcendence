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

    public MediaResponse buildMediaResponse(Media media) {

        if (media == null) {
            return null;
        }

        String originalUrl = storageService.generateUrl(media.pathOriginal);
        String previewUrl = media.pathPreview != null ? storageService.generateUrl(media.pathPreview) : null;
        String blurUrl = media.pathBlur != null ? storageService.generateUrl(media.pathBlur) : null;

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
}
