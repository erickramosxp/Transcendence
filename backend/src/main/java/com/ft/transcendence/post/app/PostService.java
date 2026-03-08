package com.ft.transcendence.post.app;

import com.ft.transcendence.like.domain.Like;
import com.ft.transcendence.post.domain.Post;
import com.ft.transcendence.post.dto.FeedResponse;
import com.ft.transcendence.post.dto.PostRequest;
import com.ft.transcendence.post.dto.PostResponse;
import com.ft.transcendence.user.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;

import java.time.OffsetDateTime;
import java.util.List;

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
        post.mediaUrl = req.imageUrl;
        post.likeCount = 0L;
        post.commentCount = 0L;
        post.createdAt = now;
        post.updatedAt = now;

        post.persist();

        return PostResponse.of(post, false);
    }

    public FeedResponse feed(int page, int size, long userId) {
        int pageSizePlusOne = size + 1;

        List<Post> posts = Post.find("order by createdAt desc")
                .page(page, pageSizePlusOne).list();

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
