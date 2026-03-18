package com.ft.transcendence.user.dto;

import com.ft.transcendence.post.dto.PostResponse;

import java.util.List;

public class UserPostsResponse {
        public List<PostResponse> items;
        public int page;
        public int size;
        public boolean hasMore;
}
