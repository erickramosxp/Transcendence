package com.ft.transcendence.comment.dto;

import com.ft.transcendence.comment.domain.Comment;

import java.time.OffsetDateTime;

public class CommentResponse {
    public Long id;
    public String name;
    public String username;
    public String contents;
    public String avatarUrl;
    public boolean likedByMe;
    public Long likeCount;
    public OffsetDateTime created_at;

    public static CommentResponse of(Comment comment, boolean likedByMe, String avatarUrl) {
        var r = new CommentResponse();
        r.id = comment.id;
        r.name = comment.user.name;
        r.username = comment.user.username;
        r.contents = comment.text;
        r.avatarUrl = avatarUrl;
        r.likedByMe = likedByMe;
        r.likeCount = comment.likeCount;
        r.created_at = comment.createdAt;
        return r;
    }
}
