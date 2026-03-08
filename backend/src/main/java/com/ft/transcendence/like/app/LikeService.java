package com.ft.transcendence.like.app;

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
        if (post == null) {
            throw new NotFoundException("Post not found");
        }

        Like like = Like.find("user.id = ?1 and post.id = ?2", userId, postId)
                .firstResult();
        if (like == null)
            return;

        like.delete();
        post.likeCount = Math.max(0, post.likeCount - 1);
    }

}
