package com.ft.transcendence.post.dto;

import com.ft.transcendence.post.domain.Post;
import com.ft.transcendence.user.dto.UserResponse;

import java.time.OffsetDateTime;

public class PostResponse {
    public Long id;
    public Long userId;
    public String text;
    public String imageUrl;
    public Long likeCount;
    public Long commentCount;
    public boolean likedByMe;
    public OffsetDateTime createdAt;
    public OffsetDateTime updatedAt;

    public static PostResponse of(Post p, boolean likedByMe) {
        var r = new PostResponse();
        r.id = p.id;
        r.userId = p.user.id;
        r.text = p.text;
        r.imageUrl = p.imageUrl;
        r.likeCount = p.likeCount;
        r.commentCount = p.commentCount;
        r.likedByMe = likedByMe;
        r.createdAt = p.createdAt;
        r.updatedAt = p.updatedAt;
        return r;
    }
}
