*This project has been created as part of the 42 curriculum by thfranco, yufonten, erramos, yathayde.

# Videa — ft_transcendence

## Description

**Videa** is a web social network inspired by the Twitter/X style, developed as the final project of the 42 curriculum (`ft_transcendence`). The platform allows users to connect, publish content, interact with friends, and chat in real time.

### Objective

Build a complete web application — frontend, backend, database, media storage, and infrastructure — focused on social experience, real-time communication, and software engineering best practices.

### Main features


| Area              | Features                                                                               |
| ----------------- | -------------------------------------------------------------------------------------- |
| **Authentication** | Local registration and login (JWT), Google OAuth login, password change               |
| **Social feed**   | Post publishing (text, image, video), comments, likes, infinite pagination             |
| **Profile**       | Avatar, cover, biography, location, website, media grid, posts and likes               |
| **Friendships**   | Bidirectional requests, friends list, online presence, and **Discover** tab with advanced user search (filters, sorting, mutual friends) |
| **Chat**          | Direct and group conversations, real-time messages via WebSocket, read status        |
| **Notifications** | Likes, comments, friendships, and social events in real time                           |
| **Editorial**     | Automated editorial account with headline ingestion via GNews API                      |
| **Preferences**   | Light/dark theme, language (PT, EN, ES)                                                |
| **Legal**         | Terms of Service and Privacy Policy pages                                              |
| **Monitoring**    | Prometheus, Grafana, and Alertmanager with alerts via Discord                          |


---

## Instructions

### Prerequisites


| Software                                           | Minimum version | Notes                                             |
| -------------------------------------------------- | --------------- | ------------------------------------------------- |
| [Docker](https://docs.docker.com/get-docker/)      | 24+             | Required to run the project                       |
| [Docker Compose](https://docs.docker.com/compose/) | v2+             | Included with Docker Desktop                      |
| [Make](https://www.gnu.org/software/make/)         | —               | Simplifies commands (optional)                    |
| [Git](https://git-scm.com/)                        | —               | Repository clone                                  |
| [Node.js](https://nodejs.org/)                     | 22              | Only if running the frontend outside Docker       |
| [Java JDK](https://adoptium.net/)                  | 21              | Only if running the backend outside Docker          |
| [ffmpeg](https://ffmpeg.org/)                      | —               | Required for video processing on the backend      |


### Environment setup (`.env`)

1. Copy the example file:

```bash
make env
# or: cp .env.example .env
```

2. Edit `.env` with real values. Main variables:


| Variable                                            | Description                                                                |
| --------------------------------------------------- | -------------------------------------------------------------------------- |
| `DATABASE_*`                                        | PostgreSQL credentials (dev: local via Docker; prod: e.g. Supabase)        |
| `GOOGLE_WEB_CLIENT_ID` / `GOOGLE_WEB_CLIENT_SECRET` | Google OAuth ([Google Cloud Console](https://console.cloud.google.com/))   |
| `GOOGLE_REDIRECT_URI`                               | Callback URI (dev: `http://localhost:5173`; prod: `http://videa.local`)    |
| `FRONTEND_ORIGIN`                                   | Allowed origin for CORS                                                    |
| `VITE_BACKEND_URL`                                  | API URL consumed by the frontend                                           |
| `MINIO_*`                                           | MinIO credentials and endpoints (S3-compatible storage)                  |
| `GNEWS_API_KEY`                                     | [GNews API](https://gnews.io/) key for editorial headlines                 |
| `DISCORD_WEBHOOK_URL`                               | Discord webhook for monitoring alerts                                      |
| `HEALTHCHECKS_PING_URL`                             | [Healthchecks.io](https://healthchecks.io/) ping URL                       |


> See `[.env.example](.env.example)` for the full list of variables.

### Development

```bash
# Build + start backend, frontend (Vite), PostgreSQL, and MinIO
make build_dev

# View logs
make logs_dev

# Tear everything down
make down_dev
```

**Development URLs:**


| Service           | URL                                            |
| ----------------- | ---------------------------------------------- |
| Frontend (Vite)   | [http://localhost:5173](http://localhost:5173) |
| Backend (Quarkus) | [http://localhost:8080](http://localhost:8080) |
| MinIO Console     | [http://localhost:9001](http://localhost:9001) |
| Grafana           | [http://localhost:3001](http://localhost:3001) |
| Prometheus        | [http://localhost:9090](http://localhost:9090) |
| Alertmanager      | [http://localhost:9093](http://localhost:9093) |


To run with Nginx as a reverse proxy:

```bash
make build_dev_proxy   # http://localhost:8081
```

To start the app and monitoring together:

```bash
make up_dev_full
```

### Production (local or server)

1. Configure `/etc/hosts` (or the Windows equivalent):

```
127.0.0.1  videa.local api.videa.local s3.videa.local minio.videa.local
```

2. Set production variables in `.env`:

```bash
GOOGLE_REDIRECT_URI="http://videa.local"
FRONTEND_ORIGIN="http://videa.local"
VITE_BACKEND_URL="http://api.videa.local"
FRONTEND_SERVER_NAME="videa.local"
BACKEND_SERVER_NAME="api.videa.local"
MINIO_ENDPOINT=minio.videa.local
MINIO_API_ENDPOINT=s3.videa.local
```

3. Start the containers:

```bash
make build
make up_full  # app + monitoring
```

### Useful commands (Makefile)

```bash
make help          # List all available commands
make ps            # Container status
make clean_dev     # Remove dev containers and volumes
make re_dev        # Full dev rebuild
```

### Tests

**Backend** (JUnit + RestAssured + Testcontainers):

```bash
cd backend && ./mvnw clean test
```

**Frontend** (Vitest + Playwright + Storybook):

```bash
cd frontend
npm ci
npm run test              # unit tests
npm run test:storybook    # component tests
npm run test:e2e          # end-to-end tests
```

Automated CI/CD via GitHub Actions (`.github/workflows/ci-cd.yml`).

---

## Team Information


| 42 login | Name           | Role(s)                              | Responsibilities                                                                                                                                                                                                                                                                               |
| -------- | -------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| thfranco | Thaís Franco   | Project Manager - Frontend Developer | Delivery management, team organization, schedule tracking, stakeholder alignment, frontend development with backend support, feature development support. Also contributed to DevOps activities at certain points.            |
| erramos  | Erick Ramos    | Tech Lead - Fullstack Developer      | System architecture definition and evolution, code review, technical support for the team, strategic technical decisions, implementation and maintenance of complex features on both frontend and backend. Also performed DevOps duties as needed. |
| yathayde | Yasmim Mafort  | Backend Developer                    | ORM implementation and integration, monitoring with Grafana and Prometheus, new feature development, and DevOps collaboration.          |
| yufonten | Yuri Fontenele | Product Owner - Backend Developer    | Product requirements definition and prioritization, user interface, delivery validation, backend development and maintenance. Served as DevOps when the team required it.      |


---

## Project Management

### How we worked

The team used GitHub Projects to manage tasks, splitting work through cards assigned according to each member’s comfort and familiarity with the task. All changes were made by opening Pull Requests (PRs) to the main branch (`main`) — we did not use a development branch (`develop`). Commit conventions followed the guidelines documented at [https://github.com/iuricode/padroes-de-commits](https://github.com/iuricode/padroes-de-commits). To merge into `main`, at least two team members had to review each PR, ensuring quality and alignment. Team meetings were weekly; when needed, extra meetings happened on Discord or in person at the 42 campus.

### Management tools


| Tool                | Use                                                                               |
| ------------------- | --------------------------------------------------------------------------------- |
| **GitHub Issues**   | Backlog organization, bug tracking, documentation, and feature detailing        |
| **GitHub Projects** | Workflow management and task stages via card boards                               |
| **Pull Requests**   | Code review among team members and tracking of code change proposals              |


### Communication channels


| Channel     | Use                                                                     |
| ----------- | ----------------------------------------------------------------------- |
| **Discord** | Daily communication, weekly and ad-hoc meetings, private team channel   |
| **GitHub**  | Issues, PRs, and technical discussions                                  |


---

## Technical Stack

### Frontend


| Technology   | Version | Use                                               |
| ------------ | ------- | ------------------------------------------------- |
| React        | 19      | UI and components                                 |
| Vite         | 7       | Build tool and dev server                         |
| React Router | 7       | SPA routing                                       |
| Tailwind CSS | 4       | Styling                                           |
| Radix UI     | —       | Accessible components                             |
| Zustand      | 5       | Global state (WebSocket, notifications, presence) |
| Axios        | —       | HTTP client                                       |
| i18next      | —       | Internationalization (PT, EN, ES)                 |
| Vitest       | 4       | Unit tests                                        |
| Playwright   | —       | E2E tests                                         |
| Storybook    | 10      | Component documentation and visual tests          |


### Backend


| Technology              | Version | Use                                       |
| ----------------------- | ------- | ----------------------------------------- |
| Java                    | 21      | Language                                  |
| Quarkus                 | 3.30    | REST framework                            |
| Hibernate ORM + Panache | —       | ORM / persistence                         |
| Flyway                  | —       | Database migrations                       |
| SmallRye JWT            | —       | JWT authentication                        |
| Quarkus WebSockets Next | —       | Real-time communication                   |
| Quarkus Scheduler       | —       | Scheduled jobs (news ingestion)           |
| Apache Tika             | —       | Media type detection                      |
| ffmpeg                  | —       | Video processing (async jobs)             |
| Micrometer + Prometheus | —       | Metrics                                   |
| SmallRye OpenAPI        | —       | API documentation                         |


### Infrastructure


| Technology                              | Use                                                  |
| --------------------------------------- | ---------------------------------------------------- |
| **PostgreSQL 16**                       | Main relational database                             |
| **MinIO**                               | Object storage (S3-compatible) for media             |
| **Nginx**                               | Reverse proxy, TLS, serving SPA in production        |
| **Docker + Docker Compose**             | Containerization and orchestration                   |
| **Prometheus + Grafana + Alertmanager** | Monitoring and alerts                                |
| **GitHub Actions**                      | CI/CD (tests + automatic deploy on `main`)           |


### Rationale for main choices


| Choice                           | Rationale                                                                                                                                                                                                         |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Quarkus (Java)**               | Modern framework, performance, mature ecosystem for REST, JWT, WebSockets, and PostgreSQL integration; fast builds compared to Spring Boot; good stack for learning since we had no prior experience             |
| **PostgreSQL**                   | Robust relational database, JSONB support (notifications), Flyway migrations, `pg_trgm`/`unaccent` for user discovery search, widely used in production                                                              |
| **React + Vite**                 | Fast SPA, HMR in dev, rich ecosystem for UI and testing                                                                                                                                                           |
| **MinIO**                        | S3-compatible, self-hosted, ideal for image/video uploads without relying on proprietary cloud                                                                                                                    |
| **Native WebSockets (Quarkus)**  | Chat, online presence, and real-time notifications with low latency                                                                                                                                               |
| **Docker Compose**               | Reproducible environment for dev and prod, simplifies team onboarding                                                                                                                                             |


---

## Database Schema

Migrations managed by **Flyway** in `backend/src/main/resources/db/migration/` (V1–V19 on `main`; friend discovery adds `add_search_indexes` and `mutual_friendship_index` — renumber on merge if versions collide).

### ER diagram (overview)

```mermaid
erDiagram
    users {
        int8 id PK
        text email UNIQUE
        text username UNIQUE
        text name NULLABLE
        bool active
        text roles NULLABLE
        timestamptz created_at
        timestamptz updated_at
        timestamptz last_login NULLABLE
        text avatar_url NULLABLE
        text banner_image_url NULLABLE
        text biography NULLABLE
        varchar website_url NULLABLE
        varchar location NULLABLE
    }
    user_preferences {
        int8 id PK
        int8 user_id UNIQUE
        text theme
        text language
        timestamptz created_at
        timestamptz updated_at
    }
    posts {
        int8 id PK
        int8 user_id
        text text NULLABLE
        text media_url NULLABLE
        int8 like_count
        int8 comment_count
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at NULLABLE
    }
    comments {
        int8 id PK
        int8 user_id
        int8 post_id
        text text
        timestamptz created_at
        timestamptz updated_at
        int8 like_count
        timestamptz deleted_at NULLABLE
    }
    likes {
        int8 id PK
        int8 user_id
        int8 post_id NULLABLE
        int8 comment_id NULLABLE
        timestamptz created_at
    }
    follows {
        int8 id PK
        int8 follower_id
        int8 followee_id
        timestamptz created_at
    }
    friendships {
        int8 id PK
        int8 user_id
        int8 friend_id
        text status
        timestamptz created_at
    }
    notifications {
        int8 id PK
        int8 user_id
        text type
        jsonb content NULLABLE
        timestamptz created_at
        int8 sender_id NULLABLE
        bool is_read
        int8 target_id NULLABLE
    }
    auth_provider {
        int8 id PK
        int8 user_id
        auth_provider_type provider_type
        text provider_user_id NULLABLE
        text password_hash NULLABLE
        timestamptz created_at
    }
    media {
        int8 id PK
        text model_type
        int8 model_id
        text media_type
        text path_original
        text path_preview NULLABLE
        text path_blur NULLABLE
        int4 width NULLABLE
        int4 height NULLABLE
        numeric duration NULLABLE
        text status NULLABLE
        timestamptz created_at
        timestamptz updated_at NULLABLE
    }
    ingested_news {
        int8 id PK
        varchar source_url UNIQUE
        varchar external_id NULLABLE
        varchar title
        text summary NULLABLE
        varchar source_name NULLABLE
        varchar image_url NULLABLE
        int8 post_id NULLABLE
        timestamptz published_at NULLABLE
        timestamptz ingested_at
    }
    jobs {
        int8 id PK
        varchar type
        varchar status
        text payload
        int4 attempts
        int4 max_attempts
        text last_error NULLABLE
        timestamptz available_at
        timestamptz processing_started_at NULLABLE
        timestamptz finished_at NULLABLE
        timestamptz created_at
        timestamptz updated_at NULLABLE
    }
    chat_messages {
        int8 id PK
        int8 chat_id
        int8 sender_id
        text message_text NULLABLE
        text media_url NULLABLE
        text type
        int8 reply_to_id NULLABLE
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at NULLABLE
    }
    message_read_status {
        int8 id PK
        int8 message_id
        int8 user_id
        timestamptz read_at
    }
    chat_participants {
        int8 id PK
        int8 chat_id
        int8 user_id
        text role NULLABLE
        timestamptz joined_at
        timestamptz updated_at
    }
    chats {
        int8 id PK
        text chat_name NULLABLE
        text type NULLABLE
        timestamptz created_at
        timestamptz updated_at
        timestamptz last_message_at NULLABLE
    }
    flyway_schema_history {
        int4 installed_rank PK
        varchar version NULLABLE
        varchar description
        varchar type
        varchar script
        int4 checksum NULLABLE
        varchar installed_by
        timestamp installed_on
        int4 execution_time
        bool success
    }

    users ||--o{ posts : ""
    users ||--o{ comments : ""
    users ||--o{ likes : ""
    users ||--o{ follows : ""
    users ||--o{ friendships : ""
    users ||--o{ user_preferences : ""
    users ||--o{ notifications : ""
    users ||--o{ chat_participants : ""
    users ||--o{ chat_messages : ""
    users ||--o{ auth_provider : ""
    posts ||--o{ comments : ""
    posts ||--o{ likes : ""
    posts ||--o{ media : ""
    posts ||--o{ ingested_news : ""
    comments ||--o{ likes : ""
    chats ||--o{ chat_participants : ""
    chats ||--o{ chat_messages : ""
    chat_messages ||--o{ message_read_status : ""
    media }o--|| users : ""
```

### Search indexes (friend discovery)

On branch `feature/friend-discovery`, PostgreSQL extensions **`pg_trgm`** and **`unaccent`** support accent-insensitive partial search on `users.name`, `users.biography`, and `users.location`, plus trigram match on `users.username`. A composite index on `friendships (user_id, status, friend_id)` speeds up mutual-friends counting and sorting. After merge into `main`, these scripts must use the next available Flyway version (V15/V16 on the branch may conflict with existing media migrations).

---

## Features List

Assignments based on commit history (`git log`) and aligned with responsibilities declared in **Individual Contributions**.


| Feature                                 | Description                                                                              | Member(s)                             |
| --------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------- |
| Local authentication (register/login JWT) | Registration, login, JWT, and route protection on frontend and backend                 | yufonten, erramos, thfranco           |
| Google OAuth login                      | OAuth 2.0 with Google on backend (`GoogleAuthService`) and frontend (`@react-oauth/google`) | yufonten, erramos                     |
| Password change                         | `PATCH /auth/password` endpoint and security tab in settings                             | yufonten, erramos                     |
| Post feed                               | Post creation (text/photo/video), infinite pagination, likes, and soft delete           | thfranco, yufonten, erramos           |
| Comments and likes                      | Comment CRUD, likes on posts/comments, and concurrent counters                         | yufonten, thfranco, erramos           |
| Media upload                            | `media` table, MinIO, crop/resize, async jobs with ffmpeg                                | erramos, thfranco, yathayde           |
| User profile                            | Avatar, cover, bio, media grid, posts, likes, and profile editing                       | erramos, yufonten, thfranco           |
| Friendship system                       | Bidirectional requests, accept/decline, friends/requests tabs, and paginated list search | erramos, yufonten, thfranco           |
| Friend discovery (advanced search)    | Discover tab: text search (name/username/bio), location and language filters, sort by relevance/name/mutual friends, infinite scroll, friendship actions in place | erramos                               |
| Online presence                         | Presence WebSocket, online friends list on feed                                          | yufonten, erramos, thfranco           |
| Real-time chat                          | DMs and groups, WebSocket messages, read status, and full chat UI                        | yufonten, thfranco, erramos           |
| Notifications                           | Full flow (social CRUD), deduplication, page with infinite scroll and toasts             | yufonten, thfranco                    |
| Advanced search (friends list)          | Paginated search within the existing friends list (`PaginatedSearchList`)              | erramos, yufonten, thfranco           |
| User preferences                        | Persisted theme and language (`user_preferences`) and settings tabs                    | erramos, yufonten                     |
| Internationalization (i18n)             | UI in PT, EN, and ES with i18next and language selector                                | erramos, thfranco                     |
| Multi-browser compatibility             | Playwright tests (Chromium + Firefox), documentation, and smoke tests                    | thfranco                              |
| Editorial account + GNews               | Automatic headline ingestion, scheduler, and sidebar on feed                           | thfranco                              |
| Legal pages                             | Terms of service and privacy policy with i18n                                          | erramos                               |
| Design System + Storybook               | Reusable components, primitives, theme tokens, and visual documentation                | erramos                               |
| Monitoring                              | Prometheus, Grafana, Alertmanager, business metrics, and Discord alerts                  | yathayde                              |
| Nginx and security                      | Reverse proxy, TLS, API/WebSocket routing, and production deploy                         | yufonten, thfranco, yathayde          |
| CI/CD                                   | GitHub Actions (unit, Storybook, E2E tests) and automatic deploy on `main`               | thfranco, erramos, yufonten           |
| Docker and infrastructure               | `docker-compose` dev/prod, Makefile, healthchecks, and MinIO                             | thfranco, erramos, yufonten, yathayde |


---

## Modules

The selection of the modules below was based on the features we chose to implement, as well as our level of knowledge and willingness to learn.

Major = 2 pts | Minor = 1 pt

### Points summary


| Type             | Qty            | Points     |
| ---------------- | -------------- | ---------- |
| Major            | 4              | 8          |
| Minor            | 10             | 10         |
| Module of Choice | 2              | 2          |
| **Total**        | **16 modules** | **20 pts** |


### Web


| Requirement                                      | Classification | Pts | Implementation                                                                             | Member(s)                   |
| ------------------------------------------------ | -------------- | --- | ------------------------------------------------------------------------------------------ | --------------------------- |
| Basic chat, profile, and friends system          | **Major**      | 2   | Chat (DM/group), `ProfileViewer`, bidirectional friendship flow                            | erramos, thfranco, yufonten |
| Real-time features with WebSockets               | **Major**      | 2   | `realtime/` — chat, presence (`PRESENCE_UPDATE`), push notifications, PING/PONG heartbeat  | yufonten                    |
| Frontend framework (React)                       | Minor          | 1   | React 19 + Vite 7 + React Router in `frontend/`                                            | thfranco, erramos           |
| Backend framework (Quarkus)                      | Minor          | 1   | REST API in Java 21 with Quarkus 3.30 in `backend/`                                      | yufonten, erramos           |
| Database ORM                                     | Minor          | 1   | Hibernate ORM + Panache, JPA entities and repositories                                     | yathayde                    |
| Full social notifications system (CRUD)          | Minor          | 1   | `NotificationDispatcher`, like deduplication, WebSocket + notifications page               | yufonten                    |
| Custom design system                             | Minor          | 1   | `frontend/src/design-system/` — primitives, tokens, Storybook                              | erramos                     |
| Advanced search (filters, sorting, pagination)   | Minor          | 1   | `GET /user/search` (`UserDiscoveryService`), Discover tab (`FriendDiscovery`, `useFriendSearch`), PostgreSQL `pg_trgm` + `unaccent` indexes, mutual-friends sort | erramos, yufonten           |
| File upload and management                       | Minor          | 1   | MinIO, `media` table, Tika validation, ffmpeg jobs, preview/blur                           | erramos                     |


### Accessibility and Internationalization


| Requirement                                            | Classification | Pts | Implementation                                                       | Member(s) |
| ------------------------------------------------------ | -------------- | --- | -------------------------------------------------------------------- | --------- |
| Multiple languages support (≥ 3) with i18n and selector | Minor          | 1   | i18next in `frontend/src/i18n/` (PT, EN, ES)                         | erramos   |
| Additional browser compatibility                       | Minor          | 1   | Playwright (Chromium + Firefox), `frontend/docs/supportBrowsers.md`  | thfranco  |


### User Management


| Requirement                                | Classification | Pts | Implementation                                                       | Member(s)                   |
| ------------------------------------------ | -------------- | --- | -------------------------------------------------------------------- | --------------------------- |
| Standard user management and authentication | **Major**      | 2   | Register/login, profile, avatar, follow, friendships, profile pages | thfranco, erramos, yufonten |
| Remote OAuth 2.0 authentication (Google)   | Minor          | 1   | `GoogleAuthService` + `@react-oauth/google` integration              | yufonten, erramos           |


### Devops


| Requirement                              | Classification | Pts | Implementation                                                               | Member(s) |
| ---------------------------------------- | -------------- | --- | ---------------------------------------------------------------------------- | --------- |
| Monitoring with Prometheus and Grafana   | **Major**      | 2   | `monitoring/` — scrape, dashboards, `SocialMetrics`, Alertmanager → Discord | yathayde  |


### Modules of Choice


| Requirement                      | Pts | Rationale                                                                                      | Implementation                                                                                                                                       | Member(s) |
| -------------------------------- | --- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| Security with Nginx              | 1   | Centralizes TLS, reverse proxy, API/WebSocket/MinIO routing, and SPA protection in production | `nginx/nginx.conf`, SSL, proxy to backend and Grafana                                                                                               | yufonten  |
| News API integration (GNews)     | 1   | Adds editorial news on the social feed using scheduled ingestion, GNews REST client, and UI tabs in the SPA | `@videanews` editorial account, GNews ingestion, News tab, `MomentNewsCard` — see `backend/docs/news-integration.md`                                 | thfranco  |


#### Justification — News API integration (Minor, 1 pt)

This module integrates an external news API ([GNews](https://gnews.io/docs/v4)) into the existing social platform. Its classification as **Minor** is due to its focused scope: a single editorial account, one scheduled ingestion pipeline, and user interface enhancements for displaying editorial content. It does not introduce a new authentication subsystem or standalone service.

Even with limited scope, the module exercises technical competencies with MicroProfile REST Client, transactional deduplication (`ingested_news.source_url` unique constraint), Quarkus Scheduler for job automation, feed filtering, and reusing core social models (post/like/comment) for editorial news. It adds visible value by populating the feed with fresh Brazilian news, providing a News tab, and a widget for headlines—see [`backend/docs/news-integration.md`](backend/docs/news-integration.md) for details.

#### Justification — Security with Nginx (Module of Choice, 1 pt)

This module implements security, routing, and production readiness using **Nginx** as a reverse proxy. Nginx is responsible for centralizing SSL/TLS termination, routing traffic securely to backend and Grafana services, and protecting static SPA frontend assets. It supports domain-based routing (frontend, backend, MinIO, monitoring), differentiates between HTTP and WebSocket upgrades, and enforces security headers.

Documented in [`nginx/nginx.conf`](nginx/nginx.conf), this module follows best practices, such as generating self-signed SSL certificates, redirecting HTTP to HTTPS, and separating static and API traffic. In production, the Nginx configuration simplifies the deployment footprint, ensures API/WebSocket traffic is securely proxied, and improves resilience against attacks by restricting exposure and handling forwarding rules. This modular approach makes the application infrastructure more robust, maintainable, and aligned with industry deployment standards.

---

## Individual Contributions


### thfranco (Thaís Franco) — PM / Frontend Developer

- **Modules:** Chat/profile/friends (Major), user management (Major), frontend framework (Minor), multi-browser compatibility (Minor), news API integration (Minor).
- **Main features:**
  - Initial frontend structure: Home, feed, mobile navigation, Makefile, and Docker Compose.
  - Full feed: post creation (text/photo/video), comments, likes, infinite pagination, and text links.
  - Chat (frontend): `ChatList`, `ChatWindow`, `MessageInput`, group/DM modals, API integration, and chat i18n.
  - Notifications (frontend): page with infinite scroll, unread filter, deep linking, Playwright E2E tests.
  - Editorial account: GNews ingestion, scheduler, headlines on feed, VideaNews branding.
  - CI/CD and deploy: GitHub Actions, test pipeline (Vitest/Storybook), SSH deploy on DigitalOcean.
  - Nginx/Docker: proxy configuration, healthchecks, and production environment.
  - Shared form validation (`validators.js`), reserved routes, and dynamic page titles.
- **Challenges:** Integrating the frontend with WebSocket and an API that was constantly changing; handling news ingestion and environment variable management; ensuring all features worked correctly in Firefox (via Playwright) in addition to established Chromium support.

### erramos (Erick Ramos) — Tech Lead / Fullstack

- **Modules:** Chat/profile/friends (Major), user management (Major), frontend framework (Minor), backend framework (Minor), design system (Minor), file upload (Minor), advanced search (Minor), i18n (Minor), OAuth (Minor).
- **Main features:**
  - Design system: `design-system/` folder, primitives (Avatar, Button, Modal, Select…), Storybook, `ThemeShowcase`, frontend visual refactor.
  - Authentication (frontend): initial mock, backend integration, `PrivateRoute`, Vitest tests.
  - Profile: `ProfileViewer`, `EditProfileForm`, avatar crop, media grid, follower modals.
  - Media upload: `media` + MinIO architecture, client-side compression/resize, video jobs (`ProcessVideoHandler`), loading skeleton.
  - Friendships (backend + frontend): REST endpoints, friendship button, `/friends` page with tabs, paginated search, documentation in `friendship_system.md`.
  - Friend discovery (`feature/friend-discovery`): `UserDiscoveryService`, `GET /user/search`, Flyway search indexes (`pg_trgm`/`unaccent`), Discover tab UI, mutual-friends sorting, and `Select` primitive for filters.
  - i18n: i18next setup, translations for auth, home, settings, legal, profile, and `i18n_guide.md`.
  - Legal pages: Terms of Service and Privacy Policy with Accordion and section hooks.
  - Google OAuth on frontend; Docker Compose with MinIO; CI adjustments (ffmpeg, Playwright).
- **Challenges:** Migrating from simple media URLs to a polymorphic model with async jobs; maintaining visual consistency via the design system as the product grew; coordinating API contracts between frontend and backend.

### yathayde (Yasmim Mafort) — Backend Developer

- **Modules:** ORM (Minor), Prometheus/Grafana monitoring (Major).
- **Main features:**
  - ORM: first Hibernate/Panache entities (`User`, `Post`, `Like`) and persistence layer evolution.
  - Monitoring: Prometheus + Grafana + Alertmanager stack, dashboards (`transcendence-backend`, `social-metrics`, `server-health`), alert rules, and Discord/Healthchecks.io integration.
  - Business metrics: `SocialMetrics` instrumenting posts, likes, users, and WebSockets.
  - DevOps: deploy fixes (Grafana/Prometheus), MinIO in production, and storage security issues.
- **Challenges:** Configuring scrape and dashboards with containers on different Docker networks; exposing custom metrics without impacting performance of critical routes.

### yufonten (Yuri Fontenele) — PO / Backend Developer

- **Modules:** Chat/profile/friends (Major), WebSockets (Major), user management (Major), backend framework (Minor), notifications (Minor), advanced search (Minor), OAuth (Minor), Nginx security (choice).
- **Main features:**
  - Backend core: initial schema (Flyway V1), routes for posts, comments, likes, users, and follow.
  - Chat (backend): entities, migrations, send/list messages, groups, participants, and integration tests.
  - Real-time: WebSocket pipeline (`RealtimeWebSocket`, `RealtimeEventDispatcher`, chat and presence handlers), integration tests.
  - Notifications: `NotificationDispatcher`, event types, like deduplication, `unreadOnly` query, push via WS.
  - Auth: JWT, Google OAuth (`GoogleAuthService`), password change, Bean Validation on routes.
  - Profile (API): `/user/{username}` routes, posts, likes, media, avatar, and banner.
  - Nginx: SSL, reverse proxy, WebSocket routing, Makefile, and `docker-compose_dev`.
- **Challenges:** Concurrency on likes and comment counters; refactoring legacy WebSocket to architecture with `RealtimeSessionRegistry`; ensuring only friends appear in chats and presence.

---

## Resources

### Documentation and references


| Resource                 | Link                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| ft_transcendence subject | *internal 42 link*                                                                                                       |
| Quarkus Guides           | [https://quarkus.io/guides/](https://quarkus.io/guides/)                                                                 |
| React Documentation      | [https://react.dev/](https://react.dev/)                                                                                 |
| Vite Documentation       | [https://vite.dev/](https://vite.dev/)                                                                                   |
| PostgreSQL Documentation | [https://www.postgresql.org/docs/](https://www.postgresql.org/docs/)                                                     |
| Flyway Documentation     | [https://flywaydb.org/documentation/](https://flywaydb.org/documentation/)                                               |
| MinIO Documentation      | [https://min.io/docs/minio/linux/index.html](https://min.io/docs/minio/linux/index.html)                                 |
| WebSocket API (MDN)      | [https://developer.mozilla.org/en-US/docs/Web/API/WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) |
| Prometheus Documentation | [https://prometheus.io/docs/](https://prometheus.io/docs/)                                                               |
| Grafana Documentation    | [https://grafana.com/docs/](https://grafana.com/docs/)                                                                   |
| i18next Documentation    | [https://www.i18next.com/](https://www.i18next.com/)                                                                     |
| GNews API                | [https://gnews.io/docs/v4](https://gnews.io/docs/v4)                                                                     |
| Google OAuth 2.0         | [https://developers.google.com/identity/protocols/oauth2](https://developers.google.com/identity/protocols/oauth2)       |
| Playwright Documentation | [https://playwright.dev/](https://playwright.dev/)                                                                       |
| Tailwind CSS             | [https://tailwindcss.com/docs](https://tailwindcss.com/docs)                                                             |


### Internal project documentation


| Document           | Path                                                      |
| ------------------- | --------------------------------------------------------- |
| WebSocket protocol  | `frontend/src/shared/realtime/websocket_protocol.md`      |
| Friendship system   | `frontend/src/features/friends/docs/friendship_system.md` |
| News API integration | `backend/docs/news-integration.md`                       |
| i18n guide          | `frontend/src/i18n/i18n_guide.md`                         |
| Design System       | `frontend/src/design-system/README.md`                    |


### Use of Artificial Intelligence


| Task / Area       | Tool(s)                         | How it was used                                                                               |
| ----------------- | ------------------------------- | --------------------------------------------------------------------------------------------- |
| Debugging         | Cursor, ChatGPT                 | Identifying and explaining runtime and integration errors; troubleshooting suggestions        |
| Testing           | Cursor, ChatGPT                 | Generating unit and E2E test examples; mock and edge case suggestions                          |
| Documentation     | Cursor, ChatGPT                 | Improving README and internal docs text; clarity, conciseness, and grammar review             |
| Research          | Cursor, ChatGPT, Gemini, Claude | Used to answer questions and clarify concepts                                                 |


---

## License

MIT License

Copyright (c) 2024 Thaís Franco, Yuri Fontenele, Erick Ramos, Yasmim Mafort

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
