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
import com.ft.transcendence.media.app.MediaService;
import com.ft.transcendence.media.domain.Media;
import com.ft.transcendence.media.dto.MediaResponse;
import com.ft.transcendence.media.enums.MediaStatus;
import com.ft.transcendence.media.enums.MediaType;
import com.ft.transcendence.editorial.config.EditorialConfig;
import com.ft.transcendence.post.domain.Post;
import com.ft.transcendence.post.dto.CreatePostForm;
import com.ft.transcendence.post.dto.FeedResponse;
import com.ft.transcendence.post.dto.PostResponse;
import com.ft.transcendence.user.app.UserAvatarService;
import com.ft.transcendence.user.domain.User;
import io.quarkus.cache.CacheInvalidateAll;
import io.quarkus.cache.CacheResult;
import io.quarkus.logging.Log;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.LockModeType;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.NotSupportedException;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.OffsetDateTime;
import java.util.ArrayList;
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

    @Inject
    MediaService mediaService;

    @Inject
    UserAvatarService userAvatarService;

    @Inject
    EditorialConfig editorialConfig;

    @Transactional
    @CacheInvalidateAll(cacheName = "post-feed-cache")
    public Post createEditorialTextPost(long userId, String text, String externalImageUrl) {
        if (text == null || text.isBlank()) {
            throw new BadRequestException("Posts must contain text");
        }
        if (text.length() > 500) {
            throw new BadRequestException("Text content is too long. Maximum 500 characters.");
        }

        var form = new CreatePostForm();
        form.text = text;
        Post post = createPostEntity(userId, form);

        if (isExternalHttpsUrl(externalImageUrl)) {
            mediaService.attachExternalImage("POST", post.id, externalImageUrl.trim());
            metrics.recordPostCreated(true);
        } else {
            metrics.recordPostCreated(false);
        }

        return post;
    }

    @Transactional
    @CacheInvalidateAll(cacheName = "post-feed-cache")
    public PostResponse create(Long userId, CreatePostForm req) throws IOException {

        validatePostReq(req);

        MediaAnalysis analysis = validateMediaPost(req);

        Post post = createPostEntity(userId, req);

        Media createdMedia = null;
        if (req.file != null) {
            createdMedia = savePostMedia(post, userId, req, analysis);
        }
        metrics.recordPostCreated(req.file != null);

        return buildResponse(post, createdMedia);
    }

    public PostResponse getPostById(Long postId, Long currentUserId) {
        Post post = Post.findById(postId);
        boolean likedByMe = Like.find("user.id = ?1 and post.id = ?2", currentUserId, postId).firstResultOptional().isPresent();

        Media media = Media.find("modelType = ?1 and modelId = ?2", "POST", postId).firstResult();
        MediaResponse mediaResponse = null;
        if (media != null) {
            String originalUrl = storageService.generateUrl(media.pathOriginal);
            String blurUrl = media.pathBlur != null ? storageService.generateUrl(media.pathBlur) : null;

            mediaResponse = new MediaResponse(
                    media.id,
                    media.mediaType.name(),
                    originalUrl,
                    blurUrl,
                    media.width,
                    media.height,
                    media.status != null ? media.status.name() : null
            );
        }


        String avatarUrl = userAvatarService.getUserAvatarUrl(post.user);

        return PostResponse.of(post, likedByMe, avatarUrl, mediaResponse);
    }


    @CacheResult(cacheName = "post-feed-cache")
    public FeedResponse feed(int page, int size, long userId, String scope) {
        if (page < 0 || size <= 0)
            throw new BadRequestException("Invalid page or size");

        String feedScope = normalizeFeedScope(scope);
        String editorialUsername = editorialConfig.username().trim();

        int start = page * size;
        int end = start + size;

        List<Post> posts;
        if ("news".equals(feedScope)) {
            posts = Post.find(
                            "deletedAt is null and user.username = ?1 order by createdAt desc",
                            editorialUsername)
                    .range(start, end)
                    .list();
        } else {
            posts = Post.find(
                            "deletedAt is null and user.username <> ?1 order by createdAt desc",
                            editorialUsername)
                    .range(start, end)
                    .list();
        }

        boolean hasMore = posts.size() > size;
        if (hasMore)
            posts = posts.subList(0, size);

        FeedResponse resp = new FeedResponse();
        resp.page = page;
        resp.size = size;
        resp.hasMore = hasMore;
        if (posts.isEmpty()) {
            resp.items = java.util.Collections.emptyList();
            return resp;
        }
        // get posts ids
        List<Long> postIds = posts.stream().map(p -> p.id).toList();
        // get all likes in all posts
        List<Like> likes = Like.find("user.id = ?1 and post.id in ?2", userId, postIds).list();
        var likedPostIds = likes.stream().map(l -> l.post.id).collect(java.util.stream.Collectors.toSet());

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
            MediaResponse mediaResponse = mediaService.buildMediaResponse(media);

            return  PostResponse.of(p, likedPostIds.contains(p.id), avatarUrl, mediaResponse);
        }).toList();

        resp.page = page;
        resp.size = size;
        resp.hasMore = hasMore;
        return resp;
    }


    @Transactional
    @CacheInvalidateAll(cacheName = "post-feed-cache")
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
        List<Media> medias = Media.find("modelType = ?1 and modelId = ?2", "POST", postId).list();

        if (!medias.isEmpty()) {

            List<String> pathsToDelete = new ArrayList<>();

            for (Media m : medias) {
                if (m.pathOriginal != null)
                    pathsToDelete.add(m.pathOriginal);
                if (m.pathPreview != null)
                    pathsToDelete.add(m.pathPreview);
                if (m.pathBlur != null)
                    pathsToDelete.add(m.pathBlur);
            }

            if (!pathsToDelete.isEmpty()) {
                try {
                    jobService.createDeleteMediaJob(pathsToDelete, userId);
                } catch (Exception e) {
                    Log.info("Error creating delete media job", e);
                }
            }
            Media.delete("modelType = ?1 and modelId = ?2", "POST", postId);
        }

    }

    private String getExtensionFromMimeType(String contentType) {
        if (contentType == null) {
            return ".jpg";
        }

        switch (contentType.toLowerCase()) {
            case "image/jpeg":
            case "image/jpg":
                return ".jpg";
            case "image/png":
                return ".png";
            case "image/gif":
                return ".gif";
            case "image/webp":
                return ".webp";
            case "video/quicktime":
            case "video/mp4":
                return ".mp4";
            default:
                return ".jpg";
        }
    }

    private void uploadFileToStorage(FileUpload fileUpload, String path, String contentType) throws IOException {
        if (fileUpload == null) return;

        try (InputStream stream = Files.newInputStream(fileUpload.uploadedFile())) {
            storageService.upload(path, stream, fileUpload.size(), contentType);
        } catch (IOException e) {
            throw e;
        }
    }

    private void validatePostReq(CreatePostForm req) {

        if ((req.text == null || req.text.isBlank()) && (req.file == null))
            throw new BadRequestException("Posts must contain text or images");

        if (req.text != null && req.text.length() > 500) {
            throw new BadRequestException("Text content is too long. Maximum 500 characters.");
        }
    }

    private MediaAnalysis validateMediaPost(CreatePostForm req) {

        if (req.file == null) {
            return null;
        }

        Path uploadedPath = req.file.uploadedFile();

        MediaAnalysis analysis;

        try {
            analysis = mediaValidationService.analyzePostFile(uploadedPath);

        } catch (Exception e) {
            throw new BadRequestException("Error validating file");
        }


        if (!analysis.valid()) {

            if (analysis.mediaKind() == MediaKind.TOO_LARGE)
                throw new PayloadTooLargeException(analysis.error());

            if (analysis.mediaKind() == MediaKind.NOT_FOUNDED)
                throw new UnprocessableEntityException(analysis.error());

            if (analysis.mediaKind() == MediaKind.UNKNOWN)
                throw new NotSupportedException(analysis.error());

            throw new BadRequestException(analysis.error());
        }

        String contentType = analysis.detectedMimeType();

        if (contentType.startsWith("image/")) {
            if (!req.previewFile.contentType().startsWith("image/") || !req.blurFile.contentType().startsWith("image/")) {
                    throw new BadRequestException("Invalid format for preview or blur variants");
            }
        }

        return analysis;
    }

    private PostResponse buildResponse(Post post, Media media) {

        String avatarUrl  = userAvatarService.getUserAvatarUrl(post.user);

        MediaResponse mediaResponse = null;
        if (media != null) {

            String originalUrl = storageService.generateUrl(media.pathOriginal);
            String blurUrl = media.pathBlur != null ? storageService.generateUrl(media.pathBlur) : null;

            mediaResponse = new MediaResponse(
                    media.id,
                    media.mediaType.name(),
                    originalUrl,
                    blurUrl,
                    media.width,
                    media.height,
                    media.status != null ? media.status.name() : null
            );

        }
        return PostResponse.of(post, false, avatarUrl, mediaResponse);
    }

    private Media savePostMedia(Post post, Long userId, CreatePostForm req, MediaAnalysis analysis) {

        String contentType = analysis.detectedMimeType();
        MediaType type = contentType.startsWith("video/") ? MediaType.VIDEO : MediaType.IMAGE;


            try {
                String extension = getExtensionFromMimeType(contentType);
                String basePath = "users/" + userId + "/post/" + post.id + "/";


                String fullNameFile = java.util.UUID.randomUUID() + extension;
                String mainPath = basePath + "main_" + fullNameFile;
                uploadFileToStorage(req.file, mainPath, contentType);

                String previewPath = null;
                String blurPath = null;

                if (type == MediaType.IMAGE && req.previewFile != null && req.blurFile != null) {
                    previewPath = basePath + "preview_" + java.util.UUID.randomUUID() + ".jpg";
                    uploadFileToStorage(req.previewFile, previewPath, "image/jpeg");

                    blurPath = basePath + "blur_" + java.util.UUID.randomUUID() + ".jpg";
                    uploadFileToStorage(req.blurFile, blurPath, "image/jpeg");
                }

                Media media = mediaService.attachMedia(
                        "POST",
                        post.id,
                        type,
                        mainPath,
                        previewPath,
                        blurPath,
                        req.width,
                        req.height,
                        type != MediaType.IMAGE ? MediaStatus.PENDING : MediaStatus.COMPLETED
                );

                if (type == MediaType.VIDEO) {
                    jobService.createProcessVideoJob(media, userId);
                }

                return media;

            } catch (IOException e) {
                System.err.println("Erro crítico ao fazer upload para o MinIO: " + e.getMessage());
                throw new BadRequestException("Erro in uploaded file");

            }
    }

    private static boolean isExternalHttpsUrl(String url) {
        if (url == null || url.isBlank()) {
            return false;
        }
        String trimmed = url.trim();
        return trimmed.startsWith("https://");
    }

    private static String normalizeFeedScope(String scope) {
        if (scope == null || scope.isBlank()) {
            return "social";
        }
        String normalized = scope.trim().toLowerCase();
        if ("news".equals(normalized) || "social".equals(normalized)) {
            return normalized;
        }
        throw new BadRequestException("Invalid feed scope. Use 'social' or 'news'.");
    }

    private Post createPostEntity(Long userId, CreatePostForm req) {

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

        return post;
    }

}
