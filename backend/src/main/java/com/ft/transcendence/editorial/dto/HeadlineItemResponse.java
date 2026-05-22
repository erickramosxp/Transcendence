package com.ft.transcendence.editorial.dto;

import java.time.OffsetDateTime;

public class HeadlineItemResponse {
    public Long postId;
    public String title;
    public String sourceName;
    public String sourceUrl;
    public String imageUrl;
    public OffsetDateTime publishedAt;

    public static HeadlineItemResponse of(
            Long postId,
            String title,
            String sourceName,
            String sourceUrl,
            String imageUrl,
            OffsetDateTime publishedAt
    ) {
        var item = new HeadlineItemResponse();
        item.postId = postId;
        item.title = title;
        item.sourceName = sourceName;
        item.sourceUrl = sourceUrl;
        item.imageUrl = imageUrl;
        item.publishedAt = publishedAt;
        return item;
    }
}
