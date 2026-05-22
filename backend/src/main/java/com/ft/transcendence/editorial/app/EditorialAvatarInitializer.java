package com.ft.transcendence.editorial.app;

import com.ft.transcendence.editorial.config.EditorialConfig;
import com.ft.transcendence.media.app.MediaService;
import com.ft.transcendence.media.domain.Media;
import com.ft.transcendence.user.domain.User;
import io.quarkus.logging.Log;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class EditorialAvatarInitializer {

    @Inject
    EditorialConfig editorialConfig;

    @Inject
    EditorialUserService editorialUserService;

    @Inject
    MediaService mediaService;

    @Transactional
    void onStart(@Observes StartupEvent event) {
        String avatarPath = normalizePublicPath(editorialConfig.avatarPath());
        if (avatarPath.isBlank()) {
            return;
        }

        User user = editorialUserService.findEditorialUser().orElse(null);
        if (user == null) {
            Log.warn("Editorial avatar skipped — user not found (run V19 migration)");
            return;
        }

        Media existing = Media.find("modelType = 'USER_PROFILE' and modelId = ?1", user.id).firstResult();
        if (existing != null && avatarPath.equals(existing.pathOriginal)) {
            return;
        }

        if (existing != null) {
            existing.delete();
        }

        mediaService.attachExternalImage("USER_PROFILE", user.id, avatarPath);
        user.avatarUrl = avatarPath;
        Log.infof("Editorial avatar set for @%s (%s)", user.username, avatarPath);
    }

    private static String normalizePublicPath(String path) {
        if (path == null) {
            return "";
        }
        String trimmed = path.trim();
        if (trimmed.isBlank()) {
            return "";
        }
        return trimmed.startsWith("/") ? trimmed : "/" + trimmed;
    }
}
