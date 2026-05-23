package com.ft.transcendence.editorial.app;

import com.ft.transcendence.editorial.domain.IngestedNews;
import com.ft.transcendence.editorial.dto.HeadlinesResponse;
import com.ft.transcendence.post.domain.Post;
import com.ft.transcendence.user.domain.User;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@QuarkusTest
class EditorialHeadlinesServiceTest {

    @Inject
    EditorialHeadlinesService editorialHeadlinesService;

    @BeforeEach
    @Transactional
    void seedHeadline() {
        User editorialUser = ensureEditorialUser();
        String sourceUrl = "https://example.com/headline-test-" + UUID.randomUUID();

        if (IngestedNews.existsBySourceUrl(sourceUrl)) {
            return;
        }

        Post post = new Post();
        post.user = editorialUser;
        post.text = "Título de teste";
        post.likeCount = 0L;
        post.commentCount = 0L;
        var now = OffsetDateTime.now();
        post.createdAt = now;
        post.updatedAt = now;
        post.persist();

        IngestedNews news = new IngestedNews();
        news.sourceUrl = sourceUrl;
        news.title = "Manchete de teste";
        news.sourceName = "Teste";
        news.imageUrl = "https://example.com/img.jpg";
        news.post = post;
        news.publishedAt = now;
        news.ingestedAt = now;
        news.persist();
    }

    @Test
    void getHeadlines_returnsItems() {
        HeadlinesResponse response = editorialHeadlinesService.getHeadlines(5);

        assertFalse(response.items.isEmpty());
        assertTrue(response.items.size() <= 5);
    }

    private User ensureEditorialUser() {
        User existing = User.find("username", "videanews").firstResult();
        if (existing != null) {
            return existing;
        }
        var now = OffsetDateTime.now();
        var user = new User();
        user.email = "editorial@videanews.local";
        user.username = "videanews";
        user.name = "Videa News";
        user.active = true;
        user.createdAt = now;
        user.updatedAt = now;
        user.persist();
        return user;
    }
}
