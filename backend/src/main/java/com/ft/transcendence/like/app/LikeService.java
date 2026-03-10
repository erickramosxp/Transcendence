package com.ft.transcendence.like.app;

import com.ft.transcendence.comment.domain.Comment;
import com.ft.transcendence.like.domain.Like;
import com.ft.transcendence.post.domain.Post;
import com.ft.transcendence.user.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

import java.time.OffsetDateTime;

@ApplicationScoped
public class LikeService {

    @Transactional
    public void likePost(long userId, long postId) {
        Post post = Post.findById(postId);
        if (post == null)
            throw new NotFoundException("Post not found");

        boolean alreadyLiked = Like.find("user.id = ?1 and post.id = ?2", userId, postId)
                .firstResultOptional().isPresent();
        if (alreadyLiked)
            return;

        Like like = new Like();
        like.user = User.findById(userId);
        like.post = post;
        like.createdAt = OffsetDateTime.now();
        like.persist();

        post.likeCount = post.likeCount + 1;
    }

    @Transactional
    public void unlikePost(long userId, long postId) {
        Post post = Post.findById(postId);
        if (post == null)
            throw new NotFoundException("Post not found");

        Like like = Like.find("user.id = ?1 and post.id = ?2", userId, postId)
                .firstResult();
        if (like == null)
            return;

        like.delete();
        post.likeCount = Math.max(0, post.likeCount - 1);
    }

    @Transactional
    public void likeComment(long userId, long commentId) {
        Comment comment = Comment.findById(commentId);
        if (comment == null)
            throw new NotFoundException("Comment not found");

        boolean alreadyLiked = Like.find("user.id = ?1 and comment.id = ?2", userId, commentId)
                .firstResultOptional().isPresent();
        if (alreadyLiked)
            return;

        Like like = new Like();
        like.user = User.findById(userId);
        like.comment = comment;
        like.createdAt = OffsetDateTime.now();
        like.persist();

        comment.likeCount = comment.likeCount + 1;
    }

    public void unlikeComment(long userId, long commentId) {
        Comment comment = Comment.findById(commentId);
        if (comment == null)
            throw new NotFoundException("Comment not found");

        Like like = Like.find("user.id = ?1 and comment.id = ?2", userId, commentId)
                .firstResult();
        if (like == null)
            return;

        like.delete();
        comment.likeCount = Math.max(0, comment.likeCount - 1);
    }
}
