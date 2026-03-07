package com.ft.transcendence.post.dto;

import com.ft.transcendence.post.domain.Post;

import java.util.List;

public class FeedResponse {
    public List<PostResponse> items;
    public int page;
    public int size;
    public boolean hasMore;
}
