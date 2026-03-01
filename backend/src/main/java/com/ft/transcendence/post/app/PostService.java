package com.ft.transcendence.post.app;

import com.ft.transcendence.post.domain.Post;
import com.ft.transcendence.post.dto.PostRequest;
import com.ft.transcendence.post.dto.PostResponse;
import com.ft.transcendence.user.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;

import java.time.OffsetDateTime;

@ApplicationScoped
public class PostService {

    @Transactional
    public PostResponse create(Long userId, PostRequest req) {
        if ((req.text == null || req.text.isBlank()) && (req.imageUrl == null || req.imageUrl.isBlank()))
            throw new BadRequestException("Posts must contain text or images");

        var now = OffsetDateTime.now();

        Post post = new Post();
        post.user = User.findById(userId);
        post.text = req.text;
        post.imageUrl = req.imageUrl;
        post.likeCount = 0L;
        post.commentCount = 0L;
        post.createdAt = now;
        post.updatedAt = now;

        post.persist();

        return PostResponse.of(post);
    }
}
