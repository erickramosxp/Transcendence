package com.ft.transcendence.common.dto;

import java.util.List;

public class PageResponse<T> {

    public List<T> items;
    public int page;
    public int size;
    public boolean hasMore;

    public PageResponse(List<T> content, int page, int size, boolean hasMore) {
        this.items = content;
        this.page = page;
        this.size = size;
        this.hasMore = hasMore;
    }
}
