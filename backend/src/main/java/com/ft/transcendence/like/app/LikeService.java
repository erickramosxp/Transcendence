package com.ft.transcendence.like.app;

import com.ft.transcendence.comment.domain.Comment;
import com.ft.transcendence.common.metrics.SocialMetrics;
import com.ft.transcendence.like.domain.Like;
import com.ft.transcendence.notification.app.NotificationDispatcher;
import com.ft.transcendence.post.domain.Post;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

import java.time.OffsetDateTime;

@ApplicationScoped
public class LikeService {

    @Inject
    EntityManager entityManager;

    @Inject
    SocialMetrics metrics;

    @Inject
    NotificationDispatcher notificationDispatcher;

    @Transactional
    public void likePost(long userId, long postId) {
        Post post = Post.findById(postId);
        if (post == null)
            throw new NotFoundException("Post not found");

        int inserted = entityManager.createNativeQuery(
                        "INSERT INTO likes (user_id, post_id, created_at) " +
                                "VALUES (?1, ?2, ?3) ON CONFLICT (user_id, post_id) DO NOTHING"
                )
                .setParameter(1, userId)
                .setParameter(2, postId)
                .setParameter(3, OffsetDateTime.now())
                .executeUpdate();

        if (inserted > 0) {
            entityManager.createQuery(
                    "UPDATE Post SET likeCount = likeCount + 1 WHERE id = :id"
            ).setParameter("id", postId).executeUpdate();

            metrics.recordPostLike();
        }

        notificationDispatcher.onLikePost(userId, post);
    }

    @Transactional
    public void unlikePost(long userId, long postId) {
        Post post = Post.findById(postId);
        if (post == null)
            throw new NotFoundException("Post not found");

        int deleted = entityManager.createQuery(
                        "DELETE FROM Like WHERE user.id = :uid AND post.id = :pid"
                )
                .setParameter("uid", userId)
                .setParameter("pid", postId)
                .executeUpdate();

        if (deleted > 0) {
            entityManager.createQuery(
                    "UPDATE Post SET likeCount = GREATEST(likeCount - 1, 0) WHERE id = :id"
            ).setParameter("id", postId).executeUpdate();

            metrics.recordPostUnlike();
        }
    }

    @Transactional
    public void likeComment(long userId, long commentId) {
        Comment comment = Comment.findById(commentId);
        if (comment == null)
            throw new NotFoundException("Comment not found");

        int inserted = entityManager.createNativeQuery(
                        "INSERT INTO likes (user_id, comment_id, created_at) " +
                                "VALUES (?1, ?2, ?3) ON CONFLICT (user_id, comment_id) DO NOTHING"
                )
                .setParameter(1, userId)
                .setParameter(2, commentId)
                .setParameter(3, OffsetDateTime.now())
                .executeUpdate();

        if (inserted > 0) {
            entityManager.createQuery(
                    "UPDATE Comment SET likeCount = likeCount + 1 WHERE id = :id"
            ).setParameter("id", commentId).executeUpdate();

            metrics.recordCommentLike();
        }

        notificationDispatcher.onLikeComment(userId, comment);
    }

    @Transactional
    public void unlikeComment(long userId, long commentId) {
        Comment comment = Comment.findById(commentId);
        if (comment == null)
            throw new NotFoundException("Comment not found");

        int deleted = entityManager.createQuery(
                        "DELETE FROM Like WHERE user.id = :uid AND comment.id = :pid"
                )
                .setParameter("uid", userId)
                .setParameter("pid", commentId)
                .executeUpdate();

        if (deleted > 0) {
            entityManager.createQuery(
                    "UPDATE Comment SET likeCount = GREATEST(likeCount - 1, 0) WHERE id = :id"
            ).setParameter("id", commentId).executeUpdate();

            metrics.recordCommentUnlike();
        }
    }
}
