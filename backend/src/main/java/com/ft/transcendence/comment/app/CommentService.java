package com.ft.transcendence.comment.app;

import com.ft.transcendence.comment.domain.Comment;
import com.ft.transcendence.comment.dto.CommentRequest;
import com.ft.transcendence.comment.dto.CommentResponse;
import com.ft.transcendence.comment.dto.CommentsByPostResponse;
import com.ft.transcendence.common.storage.StorageService;
import com.ft.transcendence.like.domain.Like;
import com.ft.transcendence.post.domain.Post;
import com.ft.transcendence.user.domain.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@ApplicationScoped
public class CommentService {

    @Inject
    StorageService storageService;
    @Inject
    EntityManager entityManager;

    @Transactional
    public CommentResponse create(Long userId, CommentRequest req) {
        if (req.text == null || req.text.isBlank())
            throw new BadRequestException("Comment must contain text");

        Post post = Post.findById(req.postId);
        if (post == null)
            throw new NotFoundException("Post not found");

        var now = OffsetDateTime.now();
        Comment comment = new Comment();
        comment.user = User.findById(userId);
        comment.post = post;
        comment.text = req.text;
        comment.likeCount = 0L;
        comment.createdAt = now;
        comment.updatedAt = now;
        comment.persist();

        entityManager.createQuery(
                "UPDATE Post SET commentCount = commentCount + 1 WHERE id = :id"
        ).setParameter("id", req.postId).executeUpdate();

        String avatarUrl  = comment.user.avatarUrl;
        if (avatarUrl != null && !avatarUrl.isBlank() && !(avatarUrl.contains("http") || avatarUrl.contains("blob"))) {
            avatarUrl = storageService.generateUrl(avatarUrl);
        }

        return CommentResponse.of(comment, false, avatarUrl);
    }

    public CommentsByPostResponse commentsByPost(Long userId, Long postId) {
        List<Comment> comments = Comment.find("post.id = ?1 order by createdAt desc", postId).list();

        List<Long> commentsIds = comments.stream().map(c -> c.id).toList();

        List<Like> likes = Like.find("user.id = ?1 and comment.id in ?2", userId, commentsIds).list();

        var likedCommentIds = likes.stream().map(l -> l.comment.id).collect(java.util.stream.Collectors.toSet());

        CommentsByPostResponse resp = new CommentsByPostResponse();
        Map<String, String> avatarCache = new HashMap<>();
        resp.items = comments.stream().map(c -> {

            String avatarUrl  = c.user.avatarUrl;
            if (avatarUrl != null && !avatarUrl.isBlank() && !(avatarUrl.contains("http") || avatarUrl.contains("blob"))) {
                avatarUrl = avatarCache.computeIfAbsent(
                        avatarUrl,
                        storageService::generateUrl
                );
            }

            return CommentResponse.of(c, likedCommentIds.contains(c.id), avatarUrl);
        }).toList();
        return resp;
    }
}
