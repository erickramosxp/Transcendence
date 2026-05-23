package com.ft.transcendence.editorial.dto;

import java.time.OffsetDateTime;
import java.util.List;

public class HeadlinesResponse {
    public List<HeadlineItemResponse> items;
    public OffsetDateTime updatedAt;

    public static HeadlinesResponse of(List<HeadlineItemResponse> items, OffsetDateTime updatedAt) {
        var response = new HeadlinesResponse();
        response.items = items;
        response.updatedAt = updatedAt;
        return response;
    }
}
