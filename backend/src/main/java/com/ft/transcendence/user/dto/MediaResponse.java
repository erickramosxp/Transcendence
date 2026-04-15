package com.ft.transcendence.user.dto;

import com.ft.transcendence.post.domain.Post;

import java.time.OffsetDateTime;

public class MediaResponse {
    public Long postId;
    public String mediaUrl;
    public OffsetDateTime createdAt;

    public static MediaResponse of(Post p, String mediaUrl) {
        MediaResponse r = new MediaResponse();
        r.postId = p.id;
        r.mediaUrl = mediaUrl;
        r.createdAt = p.createdAt;
        return r;
    }
}
