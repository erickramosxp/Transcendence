package com.ft.transcendence.user.app;

import com.ft.transcendence.auth.domain.AuthProvider;
import com.ft.transcendence.auth.domain.AuthProviderType;
import com.ft.transcendence.chat.dto.ChatParticipantResponse;
import com.ft.transcendence.common.dto.PageResponse;
import com.ft.transcendence.common.storage.FileUploadForm;
import com.ft.transcendence.common.storage.StorageService;
import com.ft.transcendence.common.media.MediaAnalysis;
import com.ft.transcendence.common.media.MediaValidationService;
import com.ft.transcendence.follow.domain.Follow;
import com.ft.transcendence.friendship.domain.Friendship;
import com.ft.transcendence.friendship.domain.FriendshipStatus;
import com.ft.transcendence.job.app.JobService;
import com.ft.transcendence.like.domain.Like;
import com.ft.transcendence.media.app.MediaService;
import com.ft.transcendence.media.domain.Media;
import com.ft.transcendence.media.enums.MediaStatus;
import com.ft.transcendence.media.enums.MediaType;
import com.ft.transcendence.post.domain.Post;
import com.ft.transcendence.post.dto.PostResponse;
import com.ft.transcendence.user.domain.User;
import com.ft.transcendence.user.dto.*;
import io.quarkus.logging.Log;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.Response;


import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.time.OffsetDateTime;
import java.util.*;
import java.nio.file.Path;

@ApplicationScoped
public class UserService {

    @Inject
    StorageService storageService;

    @Inject
    MediaValidationService mediaValidationService;

    @Inject
    MediaService mediaService;

    @Inject
    JobService jobService;

    @Inject
    UserAvatarService userAvatarService;

    public UserPageResponse getUserPage(User user, Long currentUserId) {
        Long followers = Follow.count("followee.id = ?1", user.id);
        Long following = Follow.count("follower.id = ?1", user.id);
        boolean isFollowing = Follow.find("follower.id = ?1 and followee.id = ?2", currentUserId, user.id)
                .firstResultOptional()
                .isPresent();

        Map<Long, String> avatarMap = userAvatarService.getAvatarUrls(List.of(user));

        String avatarUrl = avatarMap.get(user.id);

        UserPageResponse userPageResponse = UserPageResponse.of(user, followers, following, isFollowing, avatarUrl);

        Long targetUserId = user.id;
        if (targetUserId.equals(currentUserId)) {
            userPageResponse.relationStatus = "SELF";
            return userPageResponse;
        }

        Optional<Friendship> relation = Friendship.find(
                "(userId = ?1 AND friendId = ?2) OR (userId = ?2 AND friendId = ?1)",
                currentUserId, targetUserId
        ).firstResultOptional();

        if (relation.isEmpty()) {
            userPageResponse.relationStatus = "NONE";
            return userPageResponse;
        }

        Friendship friendship = relation.get();
        userPageResponse.friendshipId = friendship.id;

        if (friendship.status.equals(FriendshipStatus.ACCEPTED)) {
            userPageResponse.relationStatus = "ACCEPTED";
        } else if (friendship.status.equals(FriendshipStatus.PENDING)) {

            if (friendship.userId.equals(currentUserId)) {
                userPageResponse.relationStatus = "PENDING_SENT";
            } else {
                userPageResponse.relationStatus = "PENDING_RECEIVED";
            }
        }


        return userPageResponse;
    }

    private String normalize(String s) {
        if (s == null || s.isBlank())
            return null;
        return s;
    }

    @Transactional
    public UpdateUserProfileResponse updateProfile(long userId, UpdateUserProfileRequest req) {
        User user = User.findById(userId);

        if (req.name != null && !req.name.isBlank()) {
            String trimmed = req.name.trim();
            if (trimmed.length() < 3 || trimmed.length() > 30)
                throw new BadRequestException("Name must be between 3 and 30 characters");
            user.name = trimmed;
        }
        if (req.bio != null && req.bio.length() > 160)
            throw new BadRequestException("Bio must be at most 160 characters");
        if (req.location != null && req.location.length() > 100)
            throw new BadRequestException("Location must be at most 100 characters");

        user.biography = normalize(req.bio);
        user.location = normalize(req.location);
        user.websiteUrl = normalize(req.websiteUrl);

        return UpdateUserProfileResponse.of(user);
    }

    public AuthTypeResponse getAuthType(long userId) {
        List<AuthProvider> providers = AuthProvider.list("user.id", userId);
        List<AuthProviderType> types = providers.stream()
                .map(ap -> ap.providerType)
                .toList();
        return AuthTypeResponse.of(types);
    }

    public UserPostsResponse getPostsLikedByUser(long userId, long currentUserId, int page, int size) {
        if (page < 0 || size <= 0)
            throw new BadRequestException("Invalid page or size");

        int start = page * size;
        int end = start + size;

        List<Like> likes = Like.find("user.id = ?1 and post is not null and post.deletedAt is null order by createdAt desc", userId)
                .range(start, end)
                .list();

        boolean hasMore = likes.size() > size;
        if (hasMore)
            likes = likes.subList(0, size);

        List<Post> posts = likes.stream()
                .map(l -> l.post)
                .toList();

        UserPostsResponse resp = new UserPostsResponse();
        resp.page = page;
        resp.size = size;
        resp.hasMore = hasMore;

        if (posts.isEmpty()) {
            resp.items = java.util.Collections.emptyList();
            return resp;
        }

        List<Long> postIds = posts.stream().map(p -> p.id).toList();

        List<Like> likesByMe = Like.find("user.id = ?1 and post.id in ?2", currentUserId, postIds).list();
        var likedPostIds = likesByMe.stream().map(l -> l.post.id).collect(java.util.stream.Collectors.toSet());

        List<Media> feedMedias = Media.find("modelType = 'POST' and modelId in ?1", postIds).list();

        Map<Long, Media> mediaByPostId = feedMedias.stream()
                .collect(java.util.stream.Collectors.toMap(
                        m -> m.modelId,
                        m -> m,
                        (existing, replacement) -> existing
                ));

        List<User> postAuthors = posts.stream().map(p -> p.user).toList();
        Map<Long, String> avatarMap = userAvatarService.getAvatarUrls(postAuthors);


        resp.items = posts.stream().map(p -> {

            String avatarUrl = avatarMap.get(p.user.id);
            Media media = mediaByPostId.get(p.id);
            com.ft.transcendence.media.dto.MediaResponse mediaResponse = mediaService.buildMediaResponse(media);

            return  PostResponse.of(p, likedPostIds.contains(p.id), avatarUrl, mediaResponse);
        }).toList();

        return resp;
    }

    public UserPostsResponse getUserPosts(long userId, long currentUserId, int page, int size) {
        if (page < 0 || size <= 0)
            throw new BadRequestException("Invalid page or size");

        int start = page * size;
        int end = start + size;

        List<Post> posts = Post.find("user.id = ?1 and deletedAt is null order by createdAt desc", userId)
                .range(start, end)
                .list();

        boolean hasMore = posts.size() > size;
        if (hasMore)
            posts = posts.subList(0, size);

        UserPostsResponse resp = new UserPostsResponse();
        resp.page = page;
        resp.size = size;
        resp.hasMore = hasMore;

        if (posts.isEmpty()) {
            resp.items = java.util.Collections.emptyList();
            return resp;
        }

        List<Long> postIds = posts.stream().map(p -> p.id).toList();

        List<Like> likesByMe = Like.find("user.id = ?1 and post.id in ?2", currentUserId, postIds).list();
        var likedPostIds = likesByMe.stream().map(l -> l.post.id).collect(java.util.stream.Collectors.toSet());

        List<Media> feedMedias = Media.find("modelType = 'POST' and modelId in ?1", postIds).list();

        Map<Long, Media> mediaByPostId = feedMedias.stream()
                .collect(java.util.stream.Collectors.toMap(
                        m -> m.modelId,
                        m -> m,
                        (existing, replacement) -> existing
                ));

        User postOwner = posts.get(0).user;
        Map<Long, String> avatarMap = userAvatarService.getAvatarUrls(List.of(postOwner));
        String avatarUrl = avatarMap.get(postOwner.id);

        resp.items = posts.stream().map(p -> {
            Media media = mediaByPostId.get(p.id);
            com.ft.transcendence.media.dto.MediaResponse mediaResponse = mediaService.buildMediaResponse(media);

            // Usa a variável avatarUrl que foi carregada fora do loop
            return PostResponse.of(p, likedPostIds.contains(p.id), avatarUrl, mediaResponse);
        }).toList();

        return resp;
    }

    public UserMediaResponse getUserMedia(long userId, int page, int size) {
        if (page < 0 || size <= 0)
            throw new BadRequestException("Invalid page or size");

        int start = page * size;
        int end = start + size;

        List<Post> posts = Post.find(
                        "user.id = ?1 and deletedAt is null and id IN (select m.modelId from Media m where m.modelType = 'POST') order by createdAt desc",
                        userId)
                .range(start, end)
                .list();

        boolean hasMore = posts.size() > size;
        if (hasMore)
            posts = posts.subList(0, size);

        UserMediaResponse resp = new UserMediaResponse();
        resp.page = page;
        resp.size = size;
        resp.hasMore = hasMore;
        if (posts.isEmpty()) {
            resp.items = java.util.Collections.emptyList();
            return resp;
        }

        List<Long> postIds = posts.stream().map(p -> p.id).toList();
        List<Media> medias = Media.find("modelType = 'POST' and modelId in ?1", postIds).list();

        Map<Long, Media> mediaByPostId = medias.stream()
                .collect(java.util.stream.Collectors.toMap(
                        m -> m.modelId,
                        m -> m,
                        (existing, replacement) -> existing
                ));

        resp.items = posts.stream().map(p -> {

            Media media = mediaByPostId.get(p.id);
            String previewUrl = null;

            if (media != null) {
                String pathToLoad = null;
                if (media.mediaType == MediaType.IMAGE)
                    pathToLoad = media.pathPreview != null ? media.pathPreview : media.pathOriginal;
                else
                    pathToLoad = media.pathPreview;
                if (pathToLoad != null)
                    previewUrl = storageService.generateUrl(pathToLoad);
            }
            return MediaResponse.of(p, previewUrl, media.mediaType);

        }).toList();
        return resp;
    }

    @Transactional
    public Response updateAvatar(long userId, UpdateAvatarRequest req) {
        User user = User.findById(userId);
        user.avatarUrl = normalize(req.avatarUrl);
        return Response.noContent().build();
    }

    @Transactional
    public Response updateBanner(long userId, UpdateBannerRequest req) {
        User user = User.findById(userId);
        user.bannerImgUrl = normalize(req.bannerUrl);
        return Response.noContent().build();
    }

    @Transactional
    public void followUser(long currentUserId, User followedUser) {
        if (currentUserId == followedUser.id)
            throw new IllegalArgumentException("Users cannot be the same");

        boolean alreadyFollowing = Follow.find("follower.id = ?1 and followee.id = ?2", currentUserId, followedUser.id)
                .firstResultOptional().isPresent();

        if (alreadyFollowing)
            return;

        Follow follow = new Follow();
        follow.follower = User.findById(currentUserId);
        follow.followee = User.findById(followedUser.id);
        follow.createdAt = OffsetDateTime.now();

        follow.persist();
    }

    @Transactional
    public void unfollowUser(long currentUserId, User followedUser) {
        if (currentUserId == followedUser.id)
            throw new IllegalArgumentException("Users cannot be the same");

        Follow.delete("follower.id = ?1 and followee.id = ?2", currentUserId, followedUser.id);
    }

    public PageResponse<UserFollowResponse> getFollowers(long userId, int page, int size) {
        int start = page * size;
        int end = start + size;

        List<Follow> follows = Follow.find("followee.id = ?1 order by createdAt desc", userId)
                .range(start, end)
                .list();

        boolean hasMore = follows.size() > size;
        if (hasMore)
            follows = follows.subList(0, size);

        List<User> followers = follows.stream().map(f -> f.follower).toList();
        Map<Long, String> avatarMap = userAvatarService.getAvatarUrls(followers);

        List<UserFollowResponse> items = follows.stream()
                .map(f -> {
                    String avatarUrl = avatarMap.get(f.follower.id);
                    return UserFollowResponse.ofFollowers(f, avatarUrl);
                }).toList();

        return new PageResponse<>(items, page, items.size(), hasMore);
    }

    public PageResponse<UserFollowResponse> getFollowing(long userId, int page, int size) {
        int start = page * size;
        int end = start + size;

        List<Follow> follows = Follow.find("follower.id = ?1 order by createdAt desc", userId)
                .range(start, end)
                .list();

        boolean hasMore = follows.size() > size;
        if (hasMore)
            follows = follows.subList(0, size);

        List<User> followees = follows.stream().map(f -> f.followee).toList();
        Map<Long, String> avatarMap = userAvatarService.getAvatarUrls(followees);

        List<UserFollowResponse> items = follows.stream()
                .map(f -> {
                    String avatarUrl = avatarMap.get(f.followee.id);
                    return UserFollowResponse.ofFollowing(f, avatarUrl);
                }).toList();

        return new PageResponse<>(items, page, items.size(), hasMore);
    }

    @Transactional
    public Response updateAvatar(long userId, FileUploadForm req) throws IOException {


        MediaAnalysis analysis = validateAvatarFile(req);
        String mimeType = analysis.detectedMimeType();
        String extension = getExtensionFromMimeType(mimeType);

        String newPath = "users/" + userId + "/avatar/avatar_" + java.util.UUID.randomUUID() + extension;

        InputStream stream = Files.newInputStream(req.file.uploadedFile());
        storageService.upload(newPath, stream, req.file.size(), mimeType);

        User user = User.findById(userId);
        user.avatarUrl = newPath;

        Media existingMedia = Media.find("modelType = ?1 and modelId = ?2", "USER_PROFILE", userId).firstResult();

        if (existingMedia != null) {
            // Se o usuário já tinha avatar, envia as URLs ANTIGAS para o Job apagar do S3
            List<String> oldPaths = extractMediaPaths(existingMedia);
            if (!oldPaths.isEmpty()) {
                jobService.createDeleteMediaJob(oldPaths, userId);
            }

            // FAZ O UPDATE NA LINHA EXISTENTE
            existingMedia.mediaType = MediaType.IMAGE;
            existingMedia.pathOriginal = newPath;
            existingMedia.pathPreview = null;
            existingMedia.pathBlur = null;
            existingMedia.status = MediaStatus.COMPLETED;

        } else {
            // Se é o primeiro avatar da vida do usuário, faz INSERT
            Media newMedia = new Media();
            newMedia.modelType = "USER_PROFILE";
            newMedia.modelId = userId;
            newMedia.mediaType = MediaType.IMAGE;
            newMedia.pathOriginal = newPath;
            newMedia.status = MediaStatus.COMPLETED;
            newMedia.persist();
        }
        String avatarUrl = storageService.generateUrl(newPath);
        return Response.ok(new UpdateAvatarResponse(avatarUrl)).build();
    }

    @Transactional
    public void removeAvatar(long currentUserId) {

        User user = User.findById(currentUserId);
        if (user == null) {
            throw new NotFoundException();
        }

        List<String> pathsToDelete = new ArrayList<>();

        // Pega a URL legada do usuário (se existir) para garantir a exclusão
        if (user.avatarUrl != null && !user.avatarUrl.isBlank()) {
            pathsToDelete.add(user.avatarUrl);
            user.avatarUrl = null;
        }

        // 2. Busca o avatar na nova tabela
        Media media = Media.find("modelType = ?1 and modelId = ?2", "USER_PROFILE", currentUserId).firstResult();

        if (media != null) {
            // 3. Extrai todas as variações possíveis geradas pela nova arquitetura
            if (media.pathOriginal != null && !pathsToDelete.contains(media.pathOriginal)) pathsToDelete.add(media.pathOriginal);
            if (media.pathPreview != null && !pathsToDelete.contains(media.pathPreview)) pathsToDelete.add(media.pathPreview);
            if (media.pathBlur != null && !pathsToDelete.contains(media.pathBlur)) pathsToDelete.add(media.pathBlur);

            media.delete();
        }

        // 5. Envia todas as URLs mapeadas para o Worker
        if (!pathsToDelete.isEmpty()) {
            try {
                jobService.createDeleteMediaJob(pathsToDelete, currentUserId);
            } catch (Exception e) {
                Log.error("Error creating delete media job for avatar", e);
            }
        }
    }

    public UserAvatarResponse getAvatar(long userId) {

        User user = User.findById(userId);
        if (user == null) {
            throw new NotFoundException("User not found");
        }

        Map<Long, String> avatarMap = userAvatarService.getAvatarUrls(List.of(user));
        String presignedUrl = avatarMap.get(userId);

        return new UserAvatarResponse(presignedUrl);
    }

    private MediaAnalysis validateAvatarFile(FileUploadForm req) {
        if (req.file == null) {
            throw new BadRequestException("Avatar upload must contain image");
        }

        Path uploadedPath = req.file.uploadedFile();
        MediaAnalysis analysis;

        try {
            analysis = mediaValidationService.analyzeImage(uploadedPath);
        } catch (Exception e) {
            throw new BadRequestException("Error validating file");
        }

        if (!analysis.valid()) {
            throw new BadRequestException(analysis.error());
        }

        return analysis;
    }

    private String getExtensionFromMimeType(String mimeType) {
        if (mimeType == null) return ".png";
        return switch (mimeType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> ".png";
        };
    }

    private List<String> extractMediaPaths(Media media) {
        List<String> paths = new java.util.ArrayList<>();
        if (media.pathOriginal != null) paths.add(media.pathOriginal);
        if (media.pathPreview != null) paths.add(media.pathPreview);
        if (media.pathBlur != null) paths.add(media.pathBlur);
        return paths;
    }

}
