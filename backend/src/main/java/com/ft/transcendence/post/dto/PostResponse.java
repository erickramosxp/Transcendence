package com.ft.transcendence.post.dto;

import com.ft.transcendence.post.domain.Post;

import java.time.OffsetDateTime;

public class PostResponse {
    public Long id;
    public String name;
    public String username;
    public String contents;
    public String avatarUrl;
    public boolean likedByMe;
    public Long likeCount;
    public Long commentCount;
    public String media;
    public OffsetDateTime created_at;

    public static PostResponse of(Post p, boolean likedByMe, String avatarUrl, String mediaUrl) {
        var r = new PostResponse();
        r.id = p.id;
        r.name = p.user.name;
        r.username = p.user.username;
        r.avatarUrl = p.user.avatarUrl;
        r.contents = p.text;
        r.likedByMe = likedByMe;
        r.likeCount = p.likeCount;
        r.commentCount = p.commentCount;
        r.media = mediaUrl;
        r.created_at = p.createdAt;
        return r;
    }
}
