package com.ft.transcendence.editorial.app;

import com.ft.transcendence.editorial.client.GNewsClient;
import com.ft.transcendence.editorial.client.dto.GNewsArticleDto;
import com.ft.transcendence.editorial.client.dto.GNewsTopHeadlinesResponse;
import com.ft.transcendence.editorial.config.GNewsConfig;
import com.ft.transcendence.editorial.domain.IngestedNews;
import com.ft.transcendence.post.app.PostService;
import com.ft.transcendence.post.domain.Post;
import com.ft.transcendence.user.domain.User;
import io.quarkus.logging.Log;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.eclipse.microprofile.rest.client.inject.RestClient;

import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;

@ApplicationScoped
public class NewsIngestionService {

    @Inject
    GNewsConfig gNewsConfig;

    @Inject
    EditorialUserService editorialUserService;

    @Inject
    PostService postService;

    @RestClient
    GNewsClient gNewsClient;

    public NewsIngestionResult ingest() {
        if (gNewsConfig.apiKey().isEmpty()) {
            Log.warn("GNEWS_API_KEY not configured — skipping news ingestion");
            return NewsIngestionResult.noApiKey();
        }

        User editorialUser = editorialUserService.requireEditorialUser();
        GNewsTopHeadlinesResponse response;

        try {
            response = gNewsClient.topHeadlines(
                    gNewsConfig.country(),
                    gNewsConfig.lang(),
                    gNewsConfig.maxPerRun(),
                    gNewsConfig.apiKey().get()
            );
        } catch (Exception e) {
            Log.error("Failed to fetch top headlines from GNews", e);
            return NewsIngestionResult.empty();
        }

        if (response == null || response.articles == null || response.articles.isEmpty()) {
            Log.info("GNews returned no articles");
            return NewsIngestionResult.empty();
        }

        return persistArticles(editorialUser, response.articles);
    }

    @Transactional
    NewsIngestionResult persistArticles(User editorialUser, List<GNewsArticleDto> articles) {
        int ingested = 0;
        int skipped = 0;
        int failed = 0;

        for (GNewsArticleDto article : articles) {
            try {
                boolean created = ingestSingleArticle(editorialUser, article);
                if (created) {
                    ingested++;
                } else {
                    skipped++;
                }
            } catch (Exception e) {
                failed++;
                Log.warnf(e, "Failed to ingest article: %s", article != null ? article.url : "unknown");
            }
        }

        Log.infof("News ingestion finished — ingested=%d skipped=%d failed=%d", ingested, skipped, failed);
        return new NewsIngestionResult(ingested, skipped, failed, null);
    }

    private boolean ingestSingleArticle(User editorialUser, GNewsArticleDto article) {
        if (article == null) {
            return false;
        }

        String sourceUrl = normalize(article.url);
        String title = normalize(article.title);

        if (sourceUrl.isBlank() || title.isBlank()) {
            return false;
        }

        if (IngestedNews.existsBySourceUrl(sourceUrl)) {
            return false;
        }

        String postText = NewsPostFormatter.format(title, article.description, sourceUrl);
        if (postText.isBlank()) {
            return false;
        }

        Post post = postService.createEditorialTextPost(
                editorialUser.id,
                postText,
                normalize(article.image)
        );

        IngestedNews ingested = new IngestedNews();
        ingested.sourceUrl = sourceUrl;
        ingested.externalId = normalize(article.id);
        ingested.title = truncate(title, 500);
        ingested.summary = normalize(article.description);
        ingested.sourceName = article.source != null ? normalize(article.source.name) : null;
        ingested.imageUrl = normalize(article.image);
        ingested.post = post;
        ingested.publishedAt = parsePublishedAt(article.publishedAt);
        ingested.ingestedAt = OffsetDateTime.now();
        ingested.persist();

        return true;
    }

    private OffsetDateTime parsePublishedAt(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return OffsetDateTime.parse(value);
        } catch (DateTimeParseException e) {
            Log.debugf("Could not parse publishedAt: %s", value);
            return null;
        }
    }

    private String normalize(String value) {
        if (value == null) {
            return "";
        }
        return value.trim();
    }

    private String truncate(String value, int max) {
        if (value.length() <= max) {
            return value;
        }
        return value.substring(0, max);
    }
}
