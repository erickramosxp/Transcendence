package com.ft.transcendence.post.dto;

import java.util.List;

public class FeedResponse {
    public List<PostResponse> items;
    public int page;
    public int size;
    public boolean hasMore;
}
