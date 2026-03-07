package com.ft.transcendence.post.dto;

import com.ft.transcendence.post.domain.Post;
import com.ft.transcendence.user.dto.UserResponse;

import java.time.OffsetDateTime;

public class PostResponse {
    public Long id;
    public String name;
    public String userName;
    public String content;
    public boolean likedByMe;
    public Long likeCount;
    public Long commentCount;
    public String media;
    public OffsetDateTime date_time;

    public static PostResponse of(Post p, boolean likedByMe) {
        var r = new PostResponse();
        r.id = p.id;
        r.name = p.user.name;
        r.userName = p.user.username;
        r.content = p.text;
        r.likedByMe = likedByMe;
        r.likeCount = p.likeCount;
        r.commentCount = p.commentCount;
        r.media = p.imageUrl;
        r.date_time = p.createdAt;
        return r;
    }
}
