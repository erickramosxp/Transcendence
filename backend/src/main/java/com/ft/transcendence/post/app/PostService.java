package com.ft.transcendence.post.app;

import com.ft.transcendence.comment.domain.Comment;
import com.ft.transcendence.common.exception.PayloadTooLargeException;
import com.ft.transcendence.common.exception.UnprocessableEntityException;
import com.ft.transcendence.common.media.MediaAnalysis;
import com.ft.transcendence.common.media.MediaKind;
import com.ft.transcendence.common.media.MediaValidationService;
import com.ft.transcendence.common.metrics.SocialMetrics;
import com.ft.transcendence.common.storage.StorageService;
import com.ft.transcendence.job.app.JobService;
import com.ft.transcendence.like.domain.Like;
import com.ft.transcendence.post.domain.Post;
import com.ft.transcendence.post.dto.CreatePostForm;
import com.ft.transcendence.post.dto.FeedResponse;
import com.ft.transcendence.post.dto.PostResponse;
import com.ft.transcendence.user.domain.User;
import io.quarkus.logging.Log;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.LockModeType;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.NotSupportedException;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@ApplicationScoped
public class PostService {

    @Inject
    StorageService storageService;

    @Inject
    MediaValidationService mediaValidationService;

    @Inject
    JobService jobService;

    @Inject
    SocialMetrics metrics;

    @Transactional
    public PostResponse create(Long userId, CreatePostForm req) throws IOException {
        if ((req.text == null || req.text.isBlank()) && (req.file == null))
            throw new BadRequestException("Posts must contain text or images");

        String contentType = null;
        long size = 0;
        MediaAnalysis analysis;
        if (req.file != null) {
            Path uploadedPath = req.file.uploadedFile();
            size = req.file.size();

            try {
                analysis = mediaValidationService.analyzePostFile(uploadedPath);
            } catch (Exception e) {
                throw new BadRequestException("Error validating file");
            }

            if (!analysis.valid()) {
                if (analysis.mediaKind() == MediaKind.TOO_LARGE)
                    throw new PayloadTooLargeException(analysis.error());
                else if (analysis.mediaKind() == MediaKind.NOT_FOUNDED)
                    throw new UnprocessableEntityException(analysis.error());
                else if (analysis.mediaKind() == MediaKind.UNKNOWN)
                    throw new NotSupportedException(analysis.error());
                throw new BadRequestException(analysis.error());
            }

            contentType = analysis.detectedMimeType();
        }

        var now = OffsetDateTime.now();

        Post post = new Post();
        post.user = User.findById(userId);
        post.text = (req.text == null || req.text.isBlank()) ? null : req.text;
        post.mediaUrl = null;
        post.likeCount = 0L;
        post.commentCount = 0L;
        post.createdAt = now;
        post.updatedAt = now;
        post.persist();

        String mediaUrl = null;

        if (req.file != null) {
            String originalName = req.file.fileName();
            String extension = originalName.substring(originalName.lastIndexOf("."));
            String fullNameFile = java.util.UUID.randomUUID() + extension;
            String path = "users/" + userId + "/post/" + post.id + "/" + fullNameFile;

            try (InputStream stream = Files.newInputStream(req.file.uploadedFile())) {
                storageService.upload(path, stream, size, contentType);
            }

            post.mediaUrl = path;
            mediaUrl = path;

            if (mediaUrl != null && !mediaUrl.isBlank()) {
                mediaUrl = storageService.generateUrl(mediaUrl);
            }
        }

        metrics.recordPostCreated(req.file != null);

        String avatarUrl = post.user.avatarUrl;
        if (avatarUrl != null) {
            avatarUrl = storageService.generateUrl(avatarUrl);
        }

        return PostResponse.of(post, false, avatarUrl, mediaUrl);
    }

    public PostResponse getPostById(Long postId, Long currentUserId) {
        Post post = Post.findById(postId);
        boolean likedByMe = Like.find("user.id = ?1 and post.id = ?2", currentUserId, postId).firstResultOptional().isPresent();

        String mediaUrl = post.mediaUrl;

        if (mediaUrl != null && !mediaUrl.isBlank() && !(mediaUrl.contains("http") || mediaUrl.contains("blob"))) {
            mediaUrl = storageService.generateUrl(mediaUrl);
        }

        String avatarUrl = post.user.avatarUrl;
        if (avatarUrl != null) {
            avatarUrl = storageService.generateUrl(avatarUrl);
        }
        return PostResponse.of(post, likedByMe, avatarUrl, mediaUrl);
    }

    public FeedResponse feed(int page, int size, long userId) {
        if (page < 0 || size <= 0)
            throw new BadRequestException("Invalid page or size");

        int start = page * size;
        int end = start + size;

        List<Post> posts = Post.find("deletedAt is null order by createdAt desc")
                .range(start, end).list();

        boolean hasMore = posts.size() > size;
        if (hasMore)
            posts = posts.subList(0, size);

        List<Long> postIds = posts.stream().map(p -> p.id).toList();

        List<Like> likes = Like.find("user.id = ?1 and post.id in ?2", userId, postIds).list();

        var likedPostIds = likes.stream().map(l -> l.post.id).collect(java.util.stream.Collectors.toSet());

        FeedResponse resp = new FeedResponse();

        Map<String, String> avatarCache = new HashMap<>();
        resp.items = posts.stream().map(p -> {

            String mediaUrl = p.mediaUrl;

            if (mediaUrl != null && !mediaUrl.isBlank()) {
                mediaUrl = storageService.generateUrl(mediaUrl);
            }

            String avatarUrl = p.user.avatarUrl;
            if (avatarUrl != null && !avatarUrl.isEmpty()) {
                avatarUrl = avatarCache.computeIfAbsent(
                        avatarUrl,
                        storageService::generateUrl
                );
            }

            return PostResponse.of(p, likedPostIds.contains(p.id), avatarUrl, mediaUrl);
        }).toList();

        resp.page = page;
        resp.size = size;
        resp.hasMore = hasMore;
        return resp;
    }

    @Transactional
    public void deletePost(Long userId, Long postId) {

        Post post = Post.findById(postId, LockModeType.PESSIMISTIC_WRITE);

        if (post == null) {
            throw new NotFoundException();
        }

        User user = post.user;
        if (user.id != userId) {
            throw new ForbiddenException();
        }

        if (post.deletedAt != null) {
            return;
        }

        var now = OffsetDateTime.now();

        post.deletedAt = now;

        Comment.update("deletedAt = ?1 where post.id = ?2", now, postId);
        Like.delete("post.id = ?1", postId);
        Like.delete("comment.post.id = ?1", postId);

        metrics.recordPostDeleted();

        if (post.mediaUrl != null && !post.mediaUrl.isBlank()) {
            try {
                jobService.createDeletePostMediaJob(postId, userId);
            } catch (Exception e) {
                Log.info("Error creating job", e);
            }
        }
    }
}
