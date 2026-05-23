# 📊 Transcendence — Monitoring and Observability

Full observability stack for the Transcendence social network.

**Components:** Prometheus · Grafana · Alertmanager · Healthchecks.io · Discord · SocialMetrics (Quarkus)

---

## Table of Contents

- [Overview](#overview)
- [File Structure](#file-structure)
- [Prometheus Configuration](#prometheus-configuration)
- [Alert Rules](#alert-rules)
- [Alertmanager](#alertmanager)
- [Deadman's Switch](#deadmans-switch)
- [Business Metrics](#business-metrics)
- [Grafana](#grafana)
- [Makefile — Commands](#makefile--commands)
- [Docker Compose](#docker-compose)
- [Testing Guide](#testing-guide)
- [Access URLs](#access-urls)

---

## Overview

The backend is a **Quarkus 3.30.8 / Java 21** application that exposes metrics at `/q/metrics` via `quarkus-micrometer-registry-prometheus`. Prometheus scrapes every 15 seconds and makes the data available to Grafana and Alertmanager.

```
Backend (/q/metrics)
      │
      ▼
  Prometheus ──────────► Alertmanager ──────► Discord
      │                       │
      ▼                       └─────────────► Healthchecks.io ──► Discord
   Grafana                                    (Deadman's Switch)
```

> ⚠️ **Production:** Prometheus (9090), Grafana (3001), and Alertmanager (9093) ports are exposed only on `127.0.0.1` — not directly accessible from the internet.

---

## File Structure

```
monitoring/
├── prometheus/
│   ├── prometheus.dev.yml       # Dev scrape  (target: backend_dev:8080)
│   ├── prometheus.prod.yml      # Prod scrape (target: backend:8080)
│   └── alertrules.yml           # Alert rules
├── alertmanager/
│   └── alertmanager.yml         # Routing and receivers
└── grafana/
    └── provisioning/
        ├── datasources/
        │   └── prometheus.yml   # Auto-configured datasource
        └── dashboards/
            ├── dashboard.yml    # Load configuration
            └── transcendence-backend.json  # Main dashboard

backend/src/main/java/com/ft/transcendence/common/metrics/
└── SocialMetrics.java           # Business metrics bean
```

---

## Prometheus Configuration

### Dev vs Prod

The only difference between the two files is the backend target:

| File | Target |
|---|---|
| `prometheus.dev.yml` | `backend_dev:8080` |
| `prometheus.prod.yml` | `backend:8080` |

### Verification

```bash
# Targets and health status
curl -s http://localhost:9090/api/v1/targets | python3 -m json.tool | grep -A5 health

# Check if social metrics exist
curl -s "http://localhost:9090/api/v1/label/__name__/values" | python3 -m json.tool | grep social
```

---

## Alert Rules

File: `monitoring/prometheus/alertrules.yml`

### `infra_alerts`

| Alert | Severity | Condition |
|---|---|---|
| `PrometheusDown` | critical | `up{job="prometheus"} == 0` for 1 minute |
| `BackendDown` | critical | `up{job="transcendence-backend"} == 0` for 1 minute |

### `deadmans_switch`

| Alert | Severity | Condition |
|---|---|---|
| `DeadMansSwitch` | heartbeat | `vector(1)` — fires **always** |

> This alert serves as a heartbeat. Alertmanager forwards the signal to Healthchecks.io every 1 minute. If it stops, Healthchecks.io notifies Discord.

### `jvm_alerts`

| Alert | Severity | Condition |
|---|---|---|
| `HighHeapUsage` | warning | JVM heap > 85% for 2 minutes |
| `HighCpuUsage` | warning | Process CPU > 80% for 2 minutes |

### `http_alerts`

| Alert | Severity | Condition |
|---|---|---|
| `HighErrorRate` | critical | 5xx error rate > 5% for 2 minutes |
| `SlowResponses` | warning | P95 latency > 2s for 5 minutes |

### `social_alerts`

| Alert | Severity | Condition |
|---|---|---|
| `NoUsersOnline` | warning | No active WS connections for 10 minutes |
| `HighWsAuthFailures` | warning | WS auth failures > 0.5/s for 2 minutes |
| `HighLoginFailureRate` | warning | Login failure rate > 30% for 3 minutes |
| `NoPostsCreated` | warning | No posts created in 2 hours |
| `NoMessagesSent` | warning | No messages sent in 1 hour |

---

## Alertmanager

File: `monitoring/alertmanager/alertmanager.yml`

### Routing by severity

| Severity | Receiver | Repeat Interval |
|---|---|---|
| `heartbeat` | `healthchecks` | 1 minute (continuous ping) |
| `critical` | `discord-notifications` | 30 minutes |
| `warning` | `discord-notifications` | 1 hour |

### Inhibition rule

If a `critical` alert fires for an `alertname`, the `warning` alert with the same `alertname` is suppressed to avoid duplicate noise on Discord.

### Receivers

**`discord-notifications`** — sends formatted messages with severity icons:
- 🚨 `critical`
- ⚠️ `warning`
- ✅ resolved

**`healthchecks`** — pings Healthchecks.io every 1 minute. `send_resolved: false` because only the liveness signal matters.

> ⚠️ **Security:** the Discord webhook URL is hardcoded in `alertmanager.yml`. In public repositories, move it to an environment variable.

---

## Deadman's Switch

### Why is it needed?

Prometheus **cannot alert about its own failure** — if it goes down, it stops sending alerts and Alertmanager goes silent.

### How it works

```
1. Prometheus evaluates DeadMansSwitch (vector(1)) — always true
2. Alertmanager receives it and pings hc-ping.com/<uuid> every 1 min
3. Healthchecks.io expects the ping within Period (1min) + Grace (2min)
4. If the ping stops → Healthchecks.io notifies Discord
```

### Healthchecks.io configuration

| Parameter | Value |
|---|---|
| Period | 1 minute |
| Grace | 2 minutes |
| Integration | Discord (native) |

### Required variable in `.env`

```env
HEALTHCHECKS_PING_URL=https://hc-ping.com/your-uuid-here
```

### Test

```bash
make down_metrics
# Wait ~3 minutes → Discord receives DOWN notification
make up_metrics
# Discord receives RESOLVED notification
```

---

## Business Metrics

File: `backend/src/main/java/com/ft/transcendence/common/metrics/SocialMetrics.java`

`@Startup @ApplicationScoped` bean that registers metrics in Micrometer. All metrics are **aggregated and anonymous** — no personal data is exposed in labels. LGPD compliance ensured.

### Authentication

| Metric | Type | Description |
|---|---|---|
| `social_auth_registrations_total` | Counter | Local registrations |
| `social_auth_logins_total{result="success"}` | Counter | Successful logins |
| `social_auth_logins_total{result="failed"}` | Counter | Failed attempts |
| `social_auth_google_logins_total` | Counter | Google OAuth logins |

### Posts

| Metric | Type | Description |
|---|---|---|
| `social_posts_created_total` | Counter | Posts created |
| `social_posts_deleted_total` | Counter | Posts deleted |
| `social_posts_with_media_total` | Counter | Posts with image/video |

### Likes

| Metric | Type | Description |
|---|---|---|
| `social_likes_total{target="post", action="like"}` | Counter | Post likes |
| `social_likes_total{target="post", action="unlike"}` | Counter | Post unlikes |
| `social_likes_total{target="comment", action="like"}` | Counter | Comment likes |
| `social_likes_total{target="comment", action="unlike"}` | Counter | Comment unlikes |

### Chat and Messages

| Metric | Type | Description |
|---|---|---|
| `social_chats_created_total{type="direct"}` | Counter | Direct chats created |
| `social_chats_created_total{type="group"}` | Counter | Groups created |
| `social_messages_sent_total` | Counter | Messages sent |
| `social_messages_with_media_total` | Counter | Messages with media |
| `social_messages_with_reply_total` | Counter | Reply messages |

### Friendships

| Metric | Type | Description |
|---|---|---|
| `social_friendships_total{action="sent"}` | Counter | Requests sent |
| `social_friendships_total{action="accepted"}` | Counter | Requests accepted |
| `social_friendships_total{action="rejected"}` | Counter | Requests rejected |
| `social_friendships_total{action="removed"}` | Counter | Friendships removed |

### WebSocket / Presence

| Metric | Type | Description |
|---|---|---|
| `social_ws_connections_active` | Gauge | Users online now |
| `social_ws_connections_total{event="opened"}` | Counter | Connections opened (total) |
| `social_ws_connections_total{event="closed"}` | Counter | Connections closed (total) |
| `social_ws_auth_failures_total` | Counter | WS authentication failures |

### Modified services

| File | Methods that register metrics |
|---|---|
| `AuthService.java` | `login()`, `registerLocal()` |
| `GoogleAuthService.java` | `loginOrRegisterWithGoogle()` |
| `PostService.java` | `create()`, `deletePost()` |
| `LikeService.java` | `likePost()`, `unlikePost()`, `likeComment()`, `unlikeComment()` |
| `ChatService.java` | `createDirectChat()`, `createGroupChat()` |
| `ChatMessageService.java` | `createMessage()` |
| `FriendshipService.java` | `sendRequest()`, `acceptRequest()`, `deleteRequest()`, `removeFriendship()` |
| `RealtimeWebSocket.java` | `onOpen()`, `onClose()` |

---

## Grafana

### Access

| Environment | URL |
|---|---|
| Dev | http://localhost:3001 |
| Prod | `ssh -L 3001:localhost:3001 user@<ip>` → http://localhost:3001 |

Credentials: `GF_ADMIN_USER` and `GF_ADMIN_PASSWORD` defined in `.env`

### Password reset (if needed)

```bash
docker exec grafana /usr/share/grafana/bin/grafana cli admin reset-admin-password new_password
```

Or delete the volume and recreate:

```bash
make down_metrics
docker volume rm transcendence_grafana_data
make up_metrics
```

### Automatic provisioning

Grafana starts already configured — no manual UI setup required:

- **Datasource:** `provisioning/datasources/prometheus.yml` → points to `http://prometheus:9090`
- **Dashboard config:** `provisioning/dashboards/dashboard.yml`
- **Dashboard JSON:** `provisioning/dashboards/transcendence-backend.json`

### Dashboard panels (14 panels)

| # | Panel | What it shows |
|---|---|---|
| 1 | Backend Status | Real-time UP/DOWN |
| 2 | Users Online now | Active WebSocket connections gauge |
| 3 | Messages this week | Total in the last 7 days |
| 4 | Posts this week | Total in the last 7 days |
| 5 | Likes this week | Total in the last 7 days |
| 6 | New users this week | Total registrations |
| 7 | Users Online (time series) | Trend over the week |
| 8 | Messages per week | Total, with media and replies |
| 9 | Authentication per week | Successful logins, failures, Google OAuth, registrations |
| 10 | Engagement — Posts and Likes | Posts, media, post and comment likes |
| 11 | Friendships per week | Sent, accepted, rejected, removed |
| 12 | Chats and WebSocket failures | Direct, groups and auth failures |
| 13 | JVM — Heap | Used vs max memory |
| 14 | HTTP requests by status | Rate grouped by HTTP status code |

---

## Makefile — Commands

### Start

```bash
make up_dev_full        # Full dev (app + monitoring)
make up_metrics         # Monitoring only dev (app already running)
make up_full            # Full prod (app + monitoring)
make up_metrics_prod    # Monitoring only prod (app already running)
```

### Stop

```bash
make down_metrics       # Stop and remove dev monitoring containers
make down_metrics_prod  # Stop and remove prod monitoring containers
make stop_metrics       # Pause dev monitoring (keeps containers)
make stop_metrics_prod  # Pause prod monitoring (keeps containers)
```

### Logs

```bash
make logs_metrics       # Prometheus + Grafana + Alertmanager (dev)
make logs_metrics_prod  # Prod monitoring
```

---

## Docker Compose

### Required environment variables in `.env`

```env
# Grafana
GF_ADMIN_USER=admin
GF_ADMIN_PASSWORD=your_secure_password

# Healthchecks.io (Deadman's Switch)
HEALTHCHECKS_PING_URL=https://hc-ping.com/your-uuid-here
```

### Dev vs Prod

| Aspect | Dev | Prod |
|---|---|---|
| Exposed ports | `0.0.0.0` (external) | `127.0.0.1` (local only) |
| Prometheus config | `prometheus.dev.yml` | `prometheus.prod.yml` |
| Backend target | `backend_dev:8080` | `backend:8080` |
| Restart policy | not defined | `unless-stopped` |
| MinIO volume | `./minio_data` (local) | `~/minio/data` (home) |

---

## Testing Guide

### Verify endpoints

```bash
# Backend metrics (dev)
curl http://localhost:8080/q/metrics | grep social

# Backend metrics (prod — inside the container)
docker exec transcendence-prod-backend-1 curl -s http://localhost:8080/q/metrics | grep social

# Prometheus targets
curl -s http://localhost:9090/api/v1/targets | python3 -m json.tool | grep health

# Active alerts in Alertmanager
curl -s http://localhost:9093/api/v2/alerts | python3 -m json.tool
```

### Test an alert manually (without stopping services)

```bash
curl -X POST http://localhost:9093/api/v2/alerts \
  -H "Content-Type: application/json" \
  -d '[{
    "labels": {"alertname": "BackendDown", "severity": "critical"},
    "annotations": {"description": "Alert test"}
  }]'
```

### Test business metrics in real time

```bash
# Dev
watch -n5 'curl -s http://localhost:8080/q/metrics | grep social'

# Prod
watch -n5 'docker exec transcendence-prod-backend-1 curl -s http://localhost:8080/q/metrics | grep social'
```

After **logging in**, **creating a post**, **liking**, or **sending a message**, counters should increment within 15 seconds.

### Action vs metrics map

| Site action | Metric that increments |
|---|---|
| Log in | `social_auth_logins_total{result="success"}` |
| Wrong password | `social_auth_logins_total{result="failed"}` |
| Google login | `social_auth_google_logins_total` |
| Create account | `social_auth_registrations_total` |
| Create post | `social_posts_created_total` |
| Create post with photo | `social_posts_with_media_total` |
| Like post | `social_likes_total{target="post", action="like"}` |
| Send message | `social_messages_sent_total` |
| Open site (WS connects) | `social_ws_connections_active` increases by 1 |
| Close tab (WS disconnects) | `social_ws_connections_active` decreases by 1 |
| Add friend | `social_friendships_total{action="sent"}` |
| Accept friend | `social_friendships_total{action="accepted"}` |

---

## Access URLs

| Service | Dev | Prod |
|---|---|---|
| Frontend (Vite) | http://localhost:5173 | https://143.198.185.76.nip.io |
| Frontend (Nginx) | http://localhost:8081 | — |
| Backend | http://localhost:8080 | internal (nginx proxy) |
| Grafana | http://localhost:3001 | http://127.0.0.1:3001 |
| Prometheus | http://localhost:9090 | http://127.0.0.1:9090 |
| Alertmanager | http://localhost:9093 | http://127.0.0.1:9093 |
| MinIO Console | http://localhost:9001 | internal |

> 💡 **Access Grafana in prod from your local machine:**
> ```bash
> ssh -L 3001:localhost:3001 user@143.198.185.76
> # Then open http://localhost:3001 in your browser
> ```
