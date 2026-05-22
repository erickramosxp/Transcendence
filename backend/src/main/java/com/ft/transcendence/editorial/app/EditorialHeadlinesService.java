package com.ft.transcendence.editorial.app;

import com.ft.transcendence.editorial.domain.IngestedNews;
import com.ft.transcendence.editorial.dto.HeadlineItemResponse;
import com.ft.transcendence.editorial.dto.HeadlinesResponse;
import jakarta.enterprise.context.ApplicationScoped;

import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;

@ApplicationScoped
public class EditorialHeadlinesService {

    private static final int DEFAULT_LIMIT = 5;
    private static final int MAX_LIMIT = 10;

    public HeadlinesResponse getHeadlines(Integer limit) {
        int safeLimit = normalizeLimit(limit);

        List<IngestedNews> rows = IngestedNews.find(
                        """
                                select n from IngestedNews n
                                inner join fetch n.post
                                where n.post is not null
                                order by n.publishedAt desc nulls last, n.ingestedAt desc
                                """)
                .page(0, safeLimit)
                .list();

        List<HeadlineItemResponse> items = rows.stream()
                .map(this::toHeadlineItem)
                .toList();

        OffsetDateTime updatedAt = rows.stream()
                .map(row -> row.ingestedAt)
                .max(Comparator.naturalOrder())
                .orElse(null);

        return HeadlinesResponse.of(items, updatedAt);
    }

    private HeadlineItemResponse toHeadlineItem(IngestedNews row) {
        OffsetDateTime displayTime = row.publishedAt != null ? row.publishedAt : row.ingestedAt;
        return HeadlineItemResponse.of(
                row.post.id,
                row.title,
                row.sourceName,
                row.sourceUrl,
                row.imageUrl,
                displayTime
        );
    }

    private int normalizeLimit(Integer limit) {
        if (limit == null || limit <= 0) {
            return DEFAULT_LIMIT;
        }
        return Math.min(limit, MAX_LIMIT);
    }
}
