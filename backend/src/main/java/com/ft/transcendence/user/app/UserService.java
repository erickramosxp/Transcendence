package com.ft.transcendence.user.app;

import com.ft.transcendence.common.storage.FileUploadForm;
import com.ft.transcendence.common.storage.StorageService;
import com.ft.transcendence.common.media.MediaAnalysis;
import com.ft.transcendence.common.media.MediaValidationService;
import com.ft.transcendence.follow.domain.Follow;
import com.ft.transcendence.like.domain.Like;
import com.ft.transcendence.post.domain.Post;
import com.ft.transcendence.post.dto.PostResponse;
import com.ft.transcendence.user.domain.User;
import com.ft.transcendence.user.dto.*;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.nio.file.Path;

@ApplicationScoped
public class UserService {

    @Inject
    StorageService storageService;

    @Inject
    MediaValidationService mediaValidationService;

    public UserPageResponse getUserPage(User user, Long currentUserId) {
        Long followers = Follow.count("followee.id = ?1", user.id);
        Long following = Follow.count("follower.id = ?1", user.id);
        boolean isFollowing = Follow.find("follower.id = ?1 and followee.id = ?2", currentUserId, user.id)
                .firstResultOptional()
                .isPresent();

        String avatarUrl = user.avatarUrl;

        if (user.avatarUrl != null && !user.avatarUrl.startsWith("http")) {
            avatarUrl = storageService.generateUrl(user.avatarUrl);
        }
        return UserPageResponse.of(user, followers, following, isFollowing, avatarUrl);
    }

    private String normalize(String s) {
        if (s == null || s.isBlank())
            return null;
        return s;
    }

    @Transactional
    public UpdateUserProfileResponse updateProfile(long userId, UpdateUserProfileRequest req) {
        User user = User.findById(userId);

        if (req.name != null && !req.name.isBlank())
            user.name = req.name;
        user.biography = normalize(req.bio);
        user.location = normalize(req.location);
        user.websiteUrl = normalize(req.websiteUrl);

        return UpdateUserProfileResponse.of(user);
    }

    public UserPostsResponse getPostsLikedByUser(long userId, long currentUserId, int page, int size) {
        if (page < 0 || size <= 0)
            throw new BadRequestException("Invalid page or size");

        int start = page * size;
        int end = start + size;

        List<Like> likes = Like.find("user.id = ?1 and post is not null order by createdAt desc", userId)
                .range(start, end)
                .list();

        boolean hasMore = likes.size() > size;
        if (hasMore)
            likes = likes.subList(0, size);

        List<Post> posts = likes.stream()
                .map(l -> l.post)
                .toList();

        List<Long> postIds = posts.stream().map(p -> p.id).toList();
        List<Like> likesByMe = Like.find("user.id = ?1 and post.id in ?2", currentUserId, postIds).list();
        var likedPostIds = likesByMe.stream().map(l -> l.post.id).collect(java.util.stream.Collectors.toSet());

        UserPostsResponse resp = new UserPostsResponse();

        Map<String, String> avatarCache = new HashMap<>();

        resp.items = posts.stream().map(p -> {

            String mediaUrl = p.mediaUrl;

            if (mediaUrl != null && !mediaUrl.isBlank() && !(mediaUrl.startsWith("http") || mediaUrl.startsWith("blob"))) {
                mediaUrl = storageService.generateUrl(mediaUrl);
            }

            String avatarUrl  = p.user.avatarUrl;
            if (avatarUrl != null) {
                avatarUrl = avatarCache.computeIfAbsent(
                        avatarUrl,
                        storageService::generateUrl
                );
            }

            return  PostResponse.of(p, likedPostIds.contains(p.id), avatarUrl, mediaUrl);
        }).toList();

        resp.page = page;
        resp.size = size;
        resp.hasMore = hasMore;
        return resp;
    }

    public UserPostsResponse getUserPosts(long userId, int page, int size) {
        if (page < 0 || size <= 0)
            throw new BadRequestException("Invalid page or size");

        int start = page * size;
        int end = start + size;

        List<Post> posts = Post.find("user.id = ?1 order by createdAt desc", userId)
                .range(start, end)
                .list();

        boolean hasMore = posts.size() > size;
        if (hasMore)
            posts = posts.subList(0, size);

        List<Long> postIds = posts.stream().map(p -> p.id).toList();

        List<Like> likes = Like.find("user.id = ?1 and post.id in ?2", userId, postIds).list();

        var likedPostIds = likes.stream().map(l -> l.post.id).collect(java.util.stream.Collectors.toSet());


        UserPostsResponse resp = new UserPostsResponse();
        Map<String, String> avatarCache = new HashMap<>();

        resp.items = posts.stream().map(p -> {

            String mediaUrl = p.mediaUrl;

            if (mediaUrl != null && !mediaUrl.isBlank() && !(mediaUrl.contains("http") || mediaUrl.contains("blob"))) {
                mediaUrl = storageService.generateUrl(mediaUrl);
            }

            String avatarUrl  = p.user.avatarUrl;
            if (avatarUrl != null) {
                avatarUrl = avatarCache.computeIfAbsent(
                        avatarUrl,
                        storageService::generateUrl
                );
            }

            return  PostResponse.of(p, likedPostIds.contains(p.id), avatarUrl, mediaUrl);
        }).toList();
        resp.page = page;
        resp.size = size;
        resp.hasMore = hasMore;
        return resp;
    }

    public UserMediaResponse getUserMedia(long userId, int page, int size) {
        if (page < 0 || size <= 0)
            throw new BadRequestException("Invalid page or size");

        int start = page * size;
        int end = start + size;

        List<Post> posts = Post.find("user.id = ?1 and mediaUrl is not null order by createdAt desc", userId)
                .range(start, end)
                .list();

        boolean hasMore = posts.size() > size;
        if (hasMore)
            posts = posts.subList(0, size);

        UserMediaResponse resp = new UserMediaResponse();
        resp.items = posts.stream().map(p -> {
            
            String mediaUrl = p.mediaUrl;
            if (mediaUrl != null && !mediaUrl.isBlank() && !(mediaUrl.contains("http") || mediaUrl.contains("blob"))) {
                mediaUrl = storageService.generateUrl(mediaUrl);
            }
            return MediaResponse.of(p, mediaUrl);
        }).toList();
        resp.page = page;
        resp.size = size;
        resp.hasMore = hasMore;
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

    public UserFollowListResponse getFollowers(long userId) {
        List<Follow> follows = Follow.find("followee.id = ?1 order by createdAt desc", userId).list();

        UserFollowListResponse list = new UserFollowListResponse();
        list.items = follows.stream().map(UserFollowResponse::ofFollowers).toList();
        return list;
    }

    public UserFollowListResponse getFollowing(long userId) {
        List<Follow> follows = Follow.find("follower.id = ?1 order by createdAt desc", userId).list();

        UserFollowListResponse list = new UserFollowListResponse();
        list.items = follows.stream().map(UserFollowResponse::ofFollowing).toList();
        return list;
    }

    @Transactional
    public Response updateAvatar(long userId, FileUploadForm req) throws IOException {

        if (req.file == null)
            throw new BadRequestException("Avatar upload must contain image");



        String contentType = req.file.contentType();
        MediaAnalysis analysis;
        Path uploadedPath = req.file.uploadedFile();
        try {
            analysis = mediaValidationService.analyzeImage(uploadedPath);
        } catch (Exception e) {
            throw new BadRequestException("Error validating file");
        }

        if (!analysis.valid()) {
            throw new BadRequestException(analysis.error());
        }


        String mimeType = analysis.detectedMimeType();

        String extension = switch (mimeType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> ".png";
        };

        String fullNameFile = java.util.UUID.randomUUID() + extension;
        String path = "users/" + userId + "/avatar/avatar" + fullNameFile;

        InputStream stream = Files.newInputStream(req.file.uploadedFile());
        long size = req.file.size();

        storageService.upload(path, stream, size, mimeType);
        User user = User.findById(userId);
        user.avatarUrl = path;
        String avatarUrl = storageService.generateUrl(path);
        return Response.ok(
                new UpdateAvatarResponse(avatarUrl)
        ).build();
    }
}
