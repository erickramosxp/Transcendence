package com.ft.transcendence.user.app;

import com.ft.transcendence.common.storage.StorageService;
import com.ft.transcendence.media.domain.Media;
import com.ft.transcendence.user.domain.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.*;
import java.util.stream.Collectors;

@ApplicationScoped
public class UserAvatarService {

    @Inject
    StorageService storageService;

    public Map<Long, String> getAvatarUrls(List<User> users) {
        if (users == null || users.isEmpty()) {
            return Collections.emptyMap();
        }

        // 1. Extrai IDs únicos
        Set<Long> userIds = users.stream().map(u -> u.id).collect(Collectors.toSet());

        // 2. Busca todas as mídias da nova tabela em lote
        List<Media> medias = Media.find("modelType = 'USER_PROFILE' and modelId IN ?1", userIds).list();
        Map<Long, Media> mediaByUserId = medias.stream()
                .collect(Collectors.toMap(m -> m.modelId, m -> m, (m1, m2) -> m1));

        Map<Long, String> avatarMap = new HashMap<>();
        Map<String, String> urlCache = new HashMap<>();

        // 3. Associa cada usuário à sua URL correta
        for (User user : users) {
            Media media = mediaByUserId.get(user.id);
            String url = null;

            if (media != null) {
                String pathToLoad = media.pathOriginal != null ? media.pathOriginal : media.pathOriginal;
                url = urlCache.computeIfAbsent(pathToLoad, storageService::generateUrl);

            } else if (user.avatarUrl != null && !user.avatarUrl.isBlank()) {
                // Fallback para a coluna antiga
                url = urlCache.computeIfAbsent(user.avatarUrl, storageService::generateUrl);
            }
            avatarMap.put(user.id, url);
        }

        return avatarMap;
    }

    public Map<Long, String> getAvatarUrlsByIds(List<Long> userIds) {

        if (userIds == null || userIds.isEmpty()) {
            return Collections.emptyMap();
        }

        List<User> users = User.find("id IN ?1", userIds).list();

        return getAvatarUrls(users);
    }

    public String getUserAvatarUrl(User user) {

        Media media = Media.find("modelType = 'USER_PROFILE' and modelId = ?1", user.id).firstResult();

        if (media != null && media.pathOriginal != null) {
            return storageService.generateUrl(media.pathOriginal);
        }

        if (user.avatarUrl != null && !user.avatarUrl.isBlank()) {
            return storageService.generateUrl(user.avatarUrl);
        }

        return null;
    }

    public String getUserAvatarUrl(Long userId) {

        if (userId == null) return null;

        Media media = Media.find("modelType = 'USER_PROFILE' and modelId = ?1", userId).firstResult();

        if (media != null && media.pathOriginal != null) {
            return storageService.generateUrl(media.pathOriginal);
        }

        User user = User.findById(userId);
        if (user != null && user.avatarUrl != null && !user.avatarUrl.isBlank()) {
            return storageService.generateUrl(user.avatarUrl);
        }

        return null;
    }
}
