package com.ft.transcendence.editorial.app;

import com.ft.transcendence.editorial.client.GNewsClient;
import com.ft.transcendence.editorial.client.dto.GNewsArticleDto;
import com.ft.transcendence.editorial.client.dto.GNewsSourceDto;
import com.ft.transcendence.editorial.client.dto.GNewsTopHeadlinesResponse;
import com.ft.transcendence.editorial.domain.IngestedNews;
import com.ft.transcendence.media.domain.Media;
import com.ft.transcendence.post.domain.Post;
import com.ft.transcendence.user.domain.User;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@QuarkusTest
class NewsIngestionServiceTest {

    @Inject
    NewsIngestionService newsIngestionService;

    @InjectMock
    @RestClient
    GNewsClient gNewsClient;

    @BeforeEach
    @Transactional
    void cleanEditorialData() {
        ensureVideaUserExists();
        User videa = User.find("username", "videa").firstResult();
        List<Post> posts = Post.find("user.id", videa.id).list();
        for (Post post : posts) {
            Media.delete("modelType = ?1 and modelId = ?2", "POST", post.id);
            IngestedNews.delete("post.id", post.id);
        }
        Post.delete("user.id", videa.id);
    }

    @Test
    void ingest_createsPostAndIngestedNews() {
        String uniqueUrl = "https://example.com/noticia-" + UUID.randomUUID();

        GNewsTopHeadlinesResponse response = new GNewsTopHeadlinesResponse();
        response.totalArticles = 1;

        GNewsArticleDto article = new GNewsArticleDto();
        article.id = "gnews-1";
        article.title = "Nova lei aprovada no Congresso";
        article.description = "Texto resumido da notícia para o feed.";
        article.url = uniqueUrl;
        article.image = "https://example.com/image.jpg";
        article.publishedAt = "2026-05-20T12:00:00Z";
        article.source = new GNewsSourceDto();
        article.source.name = "Example News";

        response.articles = List.of(article);

        when(gNewsClient.topHeadlines(anyString(), anyString(), anyInt(), anyString()))
                .thenReturn(response);

        NewsIngestionResult result = newsIngestionService.ingest();

        assertEquals(1, result.ingested());
        assertEquals(0, result.skipped());
        assertEquals(0, result.failed());
        assertTrue(IngestedNews.existsBySourceUrl(uniqueUrl));
        assertEquals(1, Post.find("user.username", "videa").count());
    }

    @Test
    void ingest_skipsDuplicateSourceUrl() {
        String uniqueUrl = "https://example.com/dup-" + UUID.randomUUID();
        mockSingleArticle(uniqueUrl);

        NewsIngestionResult first = newsIngestionService.ingest();
        NewsIngestionResult second = newsIngestionService.ingest();

        assertEquals(1, first.ingested());
        assertEquals(0, second.ingested());
        assertTrue(second.skipped() >= 1);
        assertEquals(1, Post.find("user.username", "videa").count());
    }

    private void mockSingleArticle(String url) {
        GNewsTopHeadlinesResponse response = new GNewsTopHeadlinesResponse();
        GNewsArticleDto article = new GNewsArticleDto();
        article.title = "Título";
        article.description = "Resumo";
        article.url = url;
        article.source = new GNewsSourceDto();
        article.source.name = "Fonte";
        response.articles = List.of(article);
        when(gNewsClient.topHeadlines(anyString(), anyString(), anyInt(), anyString()))
                .thenReturn(response);
    }

    private void ensureVideaUserExists() {
        if (User.find("username", "videa").firstResult() != null) {
            return;
        }
        var now = OffsetDateTime.now();
        var user = new User();
        user.email = "editorial@videa.local";
        user.username = "videa";
        user.name = "Videa Notícias";
        user.active = true;
        user.createdAt = now;
        user.updatedAt = now;
        user.persist();
    }
}
