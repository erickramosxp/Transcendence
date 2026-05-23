# Transcendence — News API Integration (Minor Module)

Automated headline ingestion from the [GNews API](https://gnews.io/docs/v4) into the Videa social feed via a dedicated editorial account (`@videanews`).

**Stack:** Quarkus REST Client · GNews API · PostgreSQL · React · i18n

---

## Table of Contents

- [Module Justification](#module-justification)
- [Overview](#overview)
- [Architecture](#architecture)
- [File Structure](#file-structure)
- [Data Model](#data-model)
- [GNews Client](#gnews-client)
- [Ingestion Pipeline](#ingestion-pipeline)
- [Post Formatting](#post-formatting)
- [Feed Scope Integration](#feed-scope-integration)
- [Backend API](#backend-api)
- [Frontend Integration](#frontend-integration)
- [Configuration](#configuration)
- [Scheduler and Manual Trigger](#scheduler-and-manual-trigger)
- [Testing](#testing)
- [Manual Testing Guide](#manual-testing-guide)
- [Design Decisions](#design-decisions)

---

## Module Justification

This feature qualifies as a **Minor module** (1 point) under the `ft_transcendence` curriculum:

| Criterion | How this module meets it |
| --- | --- |
| **Smaller scope than a Major** | Focused on a single external API and one editorial account — no new auth flows, chat changes, or full CRUD subsystem. |
| **Technical skill** | MicroProfile REST Client, Quarkus Scheduler, deduplication via unique constraints, transactional ingestion, external image attachment, and feed scope filtering. |
| **Creativity** | Headlines are published as first-class social posts (likes, comments, profile page) while a sidebar widget offers a Flipboard-style “moment news” experience. |
| **Meaningful value** | Keeps the feed alive with fresh Brazilian headlines, separates editorial content from user posts, and gives users a dedicated News tab without leaving the platform. |

---

## Overview

The news integration enriches Videa with automatically ingested headlines from GNews. Instead of building a separate news reader, headlines are **mapped into the existing post model**:

1. A system user (`videanews`) is seeded via Flyway migration.
2. A scheduled job fetches top headlines from GNews every 15 minutes.
3. Each new article becomes a post on the editorial account, with metadata stored in `ingested_news`.
4. The feed exposes a `news` scope (editorial posts only) alongside the default `social` scope.
5. A sidebar card (`MomentNewsCard`) shows the latest headlines with thumbnails and links to the original article.

If `GNEWS_API_KEY` is missing, ingestion is skipped gracefully — the app continues to work without headlines.

---

## Architecture

```
                    ┌─────────────────────────────────────────┐
                    │              GNews API                   │
                    │         GET /api/v4/top-headlines        │
                    └──────────────────┬──────────────────────┘
                                       │
                    ┌──────────────────▼──────────────────────┐
                    │         NewsIngestionScheduler           │
                    │              (every 15m)                 │
                    └──────────────────┬──────────────────────┘
                                       │
                    ┌──────────────────▼──────────────────────┐
                    │         NewsIngestionService             │
                    │  fetch → dedupe → format → persist       │
                    └───────┬──────────────────────┬──────────┘
                            │                      │
              ┌─────────────▼─────────┐   ┌────────▼────────────┐
              │   posts (videanews)   │   │   ingested_news     │
              └─────────────┬─────────┘   └────────┬────────────┘
                            │                      │
              ┌─────────────▼──────────────────────▼──────────┐
              │  GET /feed?scope=news  ·  GET /editorial/headlines │
              └──────────────────────────┬───────────────────────┘
                                         │
              ┌──────────────────────────▼───────────────────────┐
              │  Feed.jsx — News tab + MomentNewsCard sidebar    │
              └──────────────────────────────────────────────────┘
```

---

## File Structure

```
backend/src/main/java/com/ft/transcendence/editorial/
├── api/
│   └── EditorialResource.java          # REST endpoints
├── app/
│   ├── EditorialAvatarInitializer.java # Sets editorial avatar on startup
│   ├── EditorialHeadlinesService.java  # Headlines query for sidebar
│   ├── EditorialUserService.java       # Resolves the editorial user
│   ├── NewsIngestionScheduler.java     # Cron-like scheduled ingestion
│   ├── NewsIngestionService.java       # Core ingestion logic
│   ├── NewsIngestionResult.java        # Ingestion result DTO
│   └── NewsPostFormatter.java          # Title + summary → post text
├── client/
│   ├── GNewsClient.java                # MicroProfile REST Client
│   └── dto/
│       ├── GNewsArticleDto.java
│       ├── GNewsSourceDto.java
│       └── GNewsTopHeadlinesResponse.java
├── config/
│   ├── EditorialConfig.java            # Username and avatar path
│   └── GNewsConfig.java                # API key, country, lang, max
├── domain/
│   └── IngestedNews.java               # JPA entity
└── dto/
    ├── HeadlineItemResponse.java
    └── HeadlinesResponse.java

backend/src/main/resources/db/migration/
├── V18__create_ingested_news_table.sql
└── V19__seed_editorial_user.sql

backend/src/test/java/com/ft/transcendence/editorial/app/
├── EditorialHeadlinesServiceTest.java
├── EditorialUserServiceTest.java
├── NewsIngestionServiceTest.java
└── NewsPostFormatterTest.java

frontend/src/features/editorial/
├── components/
│   ├── MomentNewsCard.jsx              # Sidebar headlines widget
│   └── NewsHeadlineItem.jsx            # Single headline row
└── services/
    └── editorialService.js             # GET /editorial/headlines

frontend/src/shared/constants/editorial.js
frontend/src/pages/Feed.jsx               # News tab + sidebar
frontend/src/features/feed/components/PostList.jsx  # scope=news support
```

---

## Data Model

### Table: `ingested_news`

Created by migration `V18__create_ingested_news_table.sql`.

| Column | Type | Description |
| --- | --- | --- |
| `id` | `bigint` | Primary key |
| `source_url` | `varchar(2048)` | Original article URL — **unique** (deduplication key) |
| `external_id` | `varchar(512)` | GNews article ID (optional) |
| `title` | `varchar(500)` | Headline title |
| `summary` | `text` | Article description from GNews |
| `source_name` | `varchar(120)` | Publisher name (e.g. “G1”) |
| `image_url` | `varchar(2048)` | Thumbnail URL from GNews |
| `post_id` | `bigint` | FK to `posts.id` (ON DELETE SET NULL) |
| `published_at` | `timestamptz` | Original publication time from GNews |
| `ingested_at` | `timestamptz` | When the article was ingested |

**Indexes:** `ingested_at DESC`, `post_id`.

### Editorial user

Migration `V19__seed_editorial_user.sql` seeds:

| Field | Value |
| --- | --- |
| Username | `videanews` |
| Display name | `Videa News` |
| Email | `editorial@videanews.local` |
| Biography | `Notícias do momento no Brasil.` |

The avatar is attached at startup by `EditorialAvatarInitializer`, reading `frontend/public/videanews-avatar.png` via `FRONTEND_ORIGIN + EDITORIAL_AVATAR_PATH`.

---

## GNews Client

`GNewsClient` is a MicroProfile REST Client registered with config key `gnews`:

```java
@RegisterRestClient(configKey = "gnews")
@Path("/top-headlines")
public interface GNewsClient {
    @GET
    GNewsTopHeadlinesResponse topHeadlines(
        @QueryParam("country") String country,
        @QueryParam("lang") String lang,
        @QueryParam("max") int max,
        @QueryParam("apikey") String apiKey
    );
}
```

Base URL defaults to `https://gnews.io/api/v4` (see `application.properties`).

---

## Ingestion Pipeline

`NewsIngestionService.ingest()` runs the full pipeline:

1. **Guard** — If `GNEWS_API_KEY` is empty, return `NewsIngestionResult.noApiKey()` and log a warning.
2. **Resolve user** — Load the editorial user via `EditorialUserService.requireEditorialUser()`.
3. **Fetch** — Call `GNewsClient.topHeadlines(country, lang, maxPerRun, apiKey)`.
4. **Persist** (transactional, per article):
   - Skip if `source_url` or `title` is blank.
   - Skip if `IngestedNews.existsBySourceUrl(sourceUrl)` (deduplication).
   - Format post text with `NewsPostFormatter`.
   - Create post via `PostService.createEditorialTextPost()`.
   - Attach external image if HTTPS URL is valid.
   - Insert `IngestedNews` row linked to the new post.
5. **Report** — Return counts: `ingested`, `skipped`, `failed`.

Errors on individual articles are caught and counted as `failed` without aborting the batch.

---

## Post Formatting

`NewsPostFormatter` converts GNews fields into a post body (max 500 characters):

- Combines title and description, stripping duplicate title prefixes from the summary.
- Ensures the title ends with sentence punctuation (the feed collapses newlines).
- Appends the source link: `\n\n🔗 {url}`.
- Truncates intelligently so the link is preserved when possible.

Example output:

```
Título da manchete. Resumo complementar do artigo.

🔗 https://example.com/article
```

---

## Feed Scope Integration

`PostService.feed()` accepts a `scope` query parameter:

| Scope | Query behavior |
| --- | --- |
| `social` (default) | All posts **except** those from the editorial username |
| `news` | Posts **only** from the editorial username (`videanews`) |

Both scopes support pagination (`page`, `size`) and return the same `FeedResponse` shape, so the frontend reuses `PostList`, `PostCard`, likes, and comments.

---

## Backend API

### `GET /editorial/headlines`

Returns the latest headlines for the sidebar widget.

- **Auth:** Required (`Bearer` token)
- **Query:** `limit` (default `5`, max `10`)
- **Response:** `HeadlinesResponse` with `items[]` and `updatedAt`

Each item includes: `postId`, `title`, `sourceName`, `sourceUrl`, `imageUrl`, `publishedAt`.

### `POST /editorial/ingest`

Triggers ingestion immediately (useful for development and manual refresh).

- **Auth:** Not required (intended for ops/dev; protect in production if needed)
- **Response:** `NewsIngestionResult` — `{ ingested, skipped, failed, message? }`

---

## Frontend Integration

### News tab (`Feed.jsx`)

The feed page uses design-system `Tabs` with two scopes:

- **Feed** — `PostList scope="social"` (user-generated content)
- **News** — `PostList scope="news"` (editorial headlines as posts)

Creating a new post automatically switches back to the social tab.

### Sidebar widget (`MomentNewsCard`)

Visible on large screens (`lg:block`) in the feed sidebar:

- Fetches headlines via `GET /editorial/headlines?limit=4`
- Auto-refreshes every 5 minutes
- Each row (`NewsHeadlineItem`) shows thumbnail, title, source, and relative time
- Clicking opens the original article in a new tab
- “View all” links to `/@videanews` profile

### i18n

Feed translations under the `feed` namespace: `feedTabs.news`, `sections.momentNews`, `momentNews.updated`, `momentNews.empty`, `momentNews.error`, `list.emptyNews`.

---

## Configuration

### Environment variables

| Variable | Default | Description |
| --- | --- | --- |
| `GNEWS_API_KEY` | *(empty)* | API key from [gnews.io](https://gnews.io/) — required for ingestion |
| `GNEWS_COUNTRY` | `br` | Country filter for top headlines |
| `GNEWS_LANG` | `pt` | Language filter |
| `GNEWS_MAX_PER_RUN` | `10` | Max articles fetched per ingestion run |
| `GNEWS_API_BASE_URL` | `https://gnews.io/api/v4` | API base URL |
| `EDITORIAL_USERNAME` | `videanews` | Editorial account username |
| `EDITORIAL_AVATAR_PATH` | `/videanews-avatar.png` | Public avatar path (served by frontend) |
| `VITE_EDITORIAL_USERNAME` | `videanews` | Frontend constant for profile link and feed filtering |

### Quarkus properties

```properties
editorial.username=${EDITORIAL_USERNAME:videanews}
editorial.avatar-path=${EDITORIAL_AVATAR_PATH:/videanews-avatar.png}
gnews.api-key=${GNEWS_API_KEY:}
gnews.country=${GNEWS_COUNTRY:br}
gnews.lang=${GNEWS_LANG:pt}
gnews.max-per-run=${GNEWS_MAX_PER_RUN:10}
quarkus.rest-client.gnews.url=${gnews.api-base-url}
```

---

## Scheduler and Manual Trigger

| Mechanism | Interval | Class |
| --- | --- | --- |
| Scheduled ingestion | Every 15 minutes | `NewsIngestionScheduler` |
| Manual trigger | On demand | `POST /editorial/ingest` |
| Frontend refresh | Every 5 minutes | `MomentNewsCard` (`REFRESH_MS`) |

The scheduler uses `concurrentExecution = SKIP` to avoid overlapping runs.

---

## Testing

Unit and integration tests cover the editorial module:

| Test | Coverage |
| --- | --- |
| `NewsIngestionServiceTest` | Ingestion, deduplication, missing API key |
| `NewsPostFormatterTest` | Text formatting, truncation, link suffix |
| `EditorialHeadlinesServiceTest` | Headlines query and ordering |
| `EditorialUserServiceTest` | Editorial user resolution |

Run backend tests:

```bash
cd backend && ./mvnw test -Dtest="com.ft.transcendence.editorial.**"
```

---

## Manual Testing Guide

### 1. Configure the API key

```bash
# In .env
GNEWS_API_KEY=your_key_here
```

Restart the backend container after changing env vars.

### 2. Trigger ingestion

```bash
curl -X POST http://localhost:8080/editorial/ingest
```

Expected response when configured:

```json
{ "ingested": 5, "skipped": 0, "failed": 0 }
```

### 3. Verify headlines endpoint

```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8080/editorial/headlines?limit=5"
```

### 4. Verify feed scopes

```bash
# Editorial posts only
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8080/feed?page=0&size=10&scope=news"

# User posts only (excludes editorial)
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8080/feed?page=0&size=10&scope=social"
```

### 5. Verify in the UI

1. Open the feed page while logged in.
2. Switch to the **News** tab — editorial posts should appear.
3. On desktop, check the **Moment News** sidebar card.
4. Visit `/@videanews` — the editorial profile shows all ingested headlines.

### 6. Verify deduplication

Run `POST /editorial/ingest` twice. The second run should report `skipped > 0` and `ingested = 0` for already-known URLs.

---

## Design Decisions

| Decision | Rationale |
| --- | --- |
| **Posts instead of a separate news table for display** | Reuses likes, comments, pagination, and profile — minimal frontend duplication. |
| **`ingested_news` metadata table** | Enables deduplication, sidebar queries, and source attribution without parsing post text. |
| **Feed scope filter by username** | Simple, index-friendly separation without schema changes to `posts`. |
| **External images via URL** | GNews thumbnails are hot-linked; no MinIO upload needed for editorial content. |
| **Graceful degradation without API key** | Local dev and CI work without external dependencies; ingestion is opt-in. |
| **Brazilian defaults (`br` / `pt`)** | Matches the project's primary audience and editorial biography. |

---

## External References

- [GNews API v4 Documentation](https://gnews.io/docs/v4)
- [Quarkus REST Client](https://quarkus.io/guides/rest-client)
- [Quarkus Scheduler](https://quarkus.io/guides/scheduling)
