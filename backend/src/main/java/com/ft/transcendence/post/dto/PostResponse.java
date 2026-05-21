package com.ft.transcendence.post.dto;

import com.ft.transcendence.media.dto.MediaResponse;
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
//    public String media;
    public MediaResponse media;
    public OffsetDateTime created_at;

    public static PostResponse of(Post p, boolean likedByMe, String avatarUrl, MediaResponse mediaResponse) {
        var r = new PostResponse();
        r.id = p.id;
        r.name = p.user.name;
        r.username = p.user.username;
        r.avatarUrl = avatarUrl;
        r.contents = p.text;
        r.likedByMe = likedByMe;
        r.likeCount = p.likeCount;
        r.commentCount = p.commentCount;
        r.media = mediaResponse;
        r.created_at = p.createdAt;
        return r;
    }
}
