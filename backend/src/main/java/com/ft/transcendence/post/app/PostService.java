package com.ft.transcendence.post.app;

import com.ft.transcendence.like.domain.Like;
import com.ft.transcendence.post.domain.Post;
import com.ft.transcendence.post.dto.FeedResponse;
import com.ft.transcendence.post.dto.PostRequest;
import com.ft.transcendence.post.dto.PostResponse;
import com.ft.transcendence.user.domain.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;

import java.time.OffsetDateTime;
import java.util.List;

@ApplicationScoped
public class PostService {

    @Transactional
    public PostResponse create(Long userId, PostRequest req) {
        if ((req.text == null || req.text.isBlank()) && (req.mediaUrl == null || req.mediaUrl.isBlank()))
            throw new BadRequestException("Posts must contain text or images");

        var now = OffsetDateTime.now();

        Post post = new Post();
        post.user = User.findById(userId);
        post.text = (req.text == null || req.text.isBlank()) ? null : req.text;
        post.mediaUrl = (req.mediaUrl == null || req.mediaUrl.isBlank()) ? null : req.mediaUrl;
        post.likeCount = 0L;
        post.commentCount = 0L;
        post.createdAt = now;
        post.updatedAt = now;

        post.persist();

        return PostResponse.of(post, false);
    }

    public PostResponse getPostById(Long postId, Long currentUserId) {
        Post post = Post.findById(postId);
        boolean likedByMe = Like.find("user.id = ?1 and post.id = ?2", currentUserId, postId).firstResultOptional().isPresent();

        return PostResponse.of(post, likedByMe);
    }

    public FeedResponse feed(int page, int size, long userId) {
        if (page < 0 || size <= 0)
            throw new BadRequestException("Invalid page or size");

        int start = page * size;
        int end = start + size;

        List<Post> posts = Post.find("order by createdAt desc")
                .range(start, end).list();

        boolean hasMore = posts.size() > size;
        if (hasMore)
            posts = posts.subList(0, size);

        List<Long> postIds = posts.stream().map(p -> p.id).toList();

        List<Like> likes = Like.find("user.id = ?1 and post.id in ?2", userId, postIds).list();

        var likedPostIds = likes.stream().map(l -> l.post.id).collect(java.util.stream.Collectors.toSet());

        FeedResponse resp = new FeedResponse();
        resp.items = posts.stream().map(p -> PostResponse.of(p, likedPostIds.contains(p.id))).toList();
        resp.page = page;
        resp.size = size;
        resp.hasMore = hasMore;
        return resp;
    }
}
