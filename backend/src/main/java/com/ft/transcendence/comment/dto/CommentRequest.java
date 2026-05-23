package com.ft.transcendence.comment.dto;

import jakarta.validation.constraints.Size;

public class CommentRequest {
    @Size(max = 500)
    public String text;
    public Long postId;
}
