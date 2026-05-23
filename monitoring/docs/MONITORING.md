# 📊 Transcendence — Monitoring and Observability

Observability stack for the Transcendence social network.

**Components:** Prometheus · Grafana · Alertmanager · Discord · SocialMetrics (Quarkus)

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

The backend is a **Quarkus 3.30.8 / Java 21** application that exposes metrics on `/q/metrics` via `quarkus-micrometer-registry-prometheus`. Prometheus scrapes them every 15 seconds and makes the data available to Grafana and Alertmanager.

```
Backend (/q/metrics)
      │
      ▼
  Prometheus ──────────► Alertmanager ──────► Discord
      │
      ▼
   Grafana
```

---

## File Structure

```
monitoring/
├── prometheus/
│   ├── prometheus.yml           # Scrape config (target: backend_dev:8080)
│   └── alertrules.yml           # Alert rules
├── alertmanager/
│   └── alertmanager.yml         # Routing and receivers
└── grafana/
    └── provisioning/
        ├── datasources/
        │   └── prometheus.yml   # Auto-provisioned datasource
        └── dashboards/
            ├── dashboard.yml    # Loader config
            └── transcendence-backend.json  # Main dashboard

backend/src/main/java/com/ft/transcendence/common/metrics/
└── SocialMetrics.java           # Business metrics bean
```

> 🛈 The current repository ships a single `prometheus.yml` rather than separate `prometheus.dev.yml` / `prometheus.prod.yml` files. If you need to point at a different backend target in production (e.g. `backend:8080` instead of `backend_dev:8080`), either edit the file before deploy or split it into two files and mount the right one per environment.

---

## Prometheus Configuration

### Current scrape config

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'transcendence-backend'
    metrics_path: '/q/metrics'
    static_configs:
      - targets: ['backend_dev:8080']

  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

rule_files:
  - "alertrules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - 'alertmanager:9093'
```

### Dev vs Prod target

The backend target name differs between environments:

| Environment | Target |
|---|---|
| Dev | `backend_dev:8080` |
| Prod | `backend:8080` |

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

### Currently configured

#### `auto_monitoring`

| Alert | Severity | Condition |
|---|---|---|
| `PrometheusDown` | critical | `up{job="prometheus"} == 0` for 1 minute |
| `BackendDown` | critical | `up{job="transcendence-backend"} == 0` for 1 minute |

#### `transcendence_alerts`

| Alert | Severity | Condition |
|---|---|---|
| `ServidorOffline` | critical | `up == 0` for 10 seconds |

> 🛈 `ServidorOffline` is a catch-all that fires for any target whose `up` metric is `0`. It partially overlaps with `PrometheusDown` and `BackendDown` but fires faster (10s vs 1m). Consider an inhibition rule in Alertmanager to avoid duplicate notifications, or remove it in favor of the more specific alerts.

### Recommended additions (not yet in the repo)

The following groups are good candidates to add for richer coverage. They rely on metrics that the backend already exposes through Micrometer.

#### `deadmans_switch`

| Alert | Severity | Condition |
|---|---|---|
| `DeadMansSwitch` | heartbeat | `vector(1)` — always firing |

This is required for the [Deadman's Switch](#deadmans-switch) flow described below.

#### `jvm_alerts`

| Alert | Severity | Condition |
|---|---|---|
| `HighHeapUsage` | warning | JVM heap > 85% for 2 minutes |
| `HighCpuUsage` | warning | Process CPU > 80% for 2 minutes |

#### `http_alerts`

| Alert | Severity | Condition |
|---|---|---|
| `HighErrorRate` | critical | 5xx error rate > 5% for 2 minutes |
| `SlowResponses` | warning | P95 latency > 2s for 5 minutes |

#### `social_alerts`

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

### Current configuration

```yaml
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'discord-notifications'

receivers:
  - name: 'discord-notifications'
    discord_configs:
      - webhook_url: 'https://discord.com/api/webhooks/...'
        title: >-
          {{ if eq .Status "firing" }}
            🚨 ALERT: {{ .GroupLabels.alertname }}
          {{ else }}
            ✅ RESOLVED: {{ .GroupLabels.alertname }}
          {{ end }}
        message: >
          {{ if eq .Status "resolved" }}
          🟢 **The Backend is back!** The service has recovered and metrics are being collected again.
          {{ else }}
          🔴 **Attention:** {{ range .Alerts }}{{ .Annotations.description }}{{ end }}
          {{ end }}
        send_resolved: true
```

Single route → single receiver (`discord-notifications`). No severity-based routing or inhibition rules are currently in place.

### ⚠️ Security: rotate the Discord webhook

The current `alertmanager.yml` has the Discord webhook URL **hardcoded in plaintext**. If this file is in a public repository, **the webhook is leaked** — anyone can post to your Discord channel.

**Action items:**
1. Rotate the webhook in Discord immediately (delete and recreate).
2. Move the new URL to a Docker secret or `.env` variable.
3. Mount it as `${DISCORD_WEBHOOK_URL}` in the Alertmanager config via templating or an entrypoint script.

### Recommended routing (not yet in the repo)

A more robust setup would route by severity:

| Severity | Receiver | Repeat Interval |
|---|---|---|
| `heartbeat` | `healthchecks` | 1 minute (continuous ping) |
| `critical` | `discord-notifications` | 30 minutes |
| `warning` | `discord-notifications` | 1 hour |

With an inhibition rule: if a `critical` alert fires for an `alertname`, the `warning` alert with the same `alertname` is suppressed to avoid duplicate noise on Discord.

The Discord template can also be enriched with icons per severity:
- 🚨 `critical`
- ⚠️ `warning`
- ✅ resolved

---

## Deadman's Switch

> 🛈 **Status:** Documented design — not yet wired in `alertrules.yml` or `alertmanager.yml`.

### Why it matters

Prometheus **cannot alert on its own failure** — if it crashes, it stops sending alerts and Alertmanager goes silent. A Deadman's Switch is an external service that expects a periodic "I'm alive" ping and notifies you when the ping stops.

### How it works

```
1. Prometheus evaluates DeadMansSwitch (vector(1)) — always true
2. Alertmanager receives it and pings hc-ping.com/<uuid> every 1 minute
3. Healthchecks.io expects the ping within Period (1min) + Grace (2min)
4. If pings stop → Healthchecks.io notifies Discord
```

### Healthchecks.io setup

| Parameter | Value |
|---|---|
| Period | 1 minute |
| Grace | 2 minutes |
| Integration | Discord (native) |

### Required `.env` variable

```env
HEALTHCHECKS_PING_URL=https://hc-ping.com/your-uuid-here
```

### Manual test

```bash
make down_metrics
# Wait ~3 minutes → Discord receives a DOWN notification
make up_metrics
# Discord receives a RESOLVED notification
```

---

## Business Metrics

File: `backend/src/main/java/com/ft/transcendence/common/metrics/SocialMetrics.java`

A `@Startup @ApplicationScoped` bean that registers metrics through Micrometer. All metrics are **aggregated and anonymous** — no personal data is exposed in labels. LGPD-compliant by design.

### Authentication

| Metric | Type | Description |
|---|---|---|
| `social_auth_registrations_total` | Counter | Local sign-ups |
| `social_auth_logins_total{result="success"}` | Counter | Successful logins |
| `social_auth_logins_total{result="failed"}` | Counter | Failed login attempts |
| `social_auth_google_logins_total` | Counter | Logins via Google OAuth |

### Posts

| Metric | Type | Description |
|---|---|---|
| `social_posts_created_total` | Counter | Posts created |
| `social_posts_deleted_total` | Counter | Posts deleted |
| `social_posts_with_media_total` | Counter | Posts with image/video |

### Likes

| Metric | Type | Description |
|---|---|---|
| `social_likes_total{target="post", action="like"}` | Counter | Likes on posts |
| `social_likes_total{target="post", action="unlike"}` | Counter | Unlikes on posts |
| `social_likes_total{target="comment", action="like"}` | Counter | Likes on comments |
| `social_likes_total{target="comment", action="unlike"}` | Counter | Unlikes on comments |

### Chats and Messages

| Metric | Type | Description |
|---|---|---|
| `social_chats_created_total{type="direct"}` | Counter | Direct chats created |
| `social_chats_created_total{type="group"}` | Counter | Group chats created |
| `social_messages_sent_total` | Counter | Messages sent |
| `social_messages_with_media_total` | Counter | Messages with media |
| `social_messages_with_reply_total` | Counter | Messages sent as replies |

### Friendships

| Metric | Type | Description |
|---|---|---|
| `social_friendships_total{action="sent"}` | Counter | Friend requests sent |
| `social_friendships_total{action="accepted"}` | Counter | Friend requests accepted |
| `social_friendships_total{action="rejected"}` | Counter | Friend requests rejected |
| `social_friendships_total{action="removed"}` | Counter | Friendships removed |

### WebSocket / Presence

| Metric | Type | Description |
|---|---|---|
| `social_ws_connections_active` | Gauge | Users currently online |
| `social_ws_connections_total{event="opened"}` | Counter | Connections opened (total) |
| `social_ws_connections_total{event="closed"}` | Counter | Connections closed (total) |
| `social_ws_auth_failures_total` | Counter | WS authentication failures |

### Modified services

| File | Methods that record metrics |
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
| Prod | https://grafana.143.198.185.76.nip.io/|

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

Grafana starts pre-configured — no manual setup in the UI:

- **Datasource:** `provisioning/datasources/prometheus.yml` → points to `http://prometheus:9090`
- **Dashboard config:** `provisioning/dashboards/dashboard.yml`
- **Dashboard JSON:** `provisioning/dashboards/transcendence-backend.json`

### Dashboard panels (14 panels)

| # | Panel | Shows |
|---|---|---|
| 1 | Backend Status | UP/DOWN in real time |
| 2 | Users Online now | Gauge of active WebSocket connections |
| 3 | Messages this week | Total over the last 7 days |
| 4 | Posts this week | Total over the last 7 days |
| 5 | Likes this week | Total over the last 7 days |
| 6 | New users this week | Total sign-ups |
| 7 | Users Online (time series) | Evolution over the week |
| 8 | Messages per week | Total, with media and replies |
| 9 | Authentication per week | Login OK, failures, Google OAuth, registrations |
| 10 | Engagement — Posts and Likes | Posts, media, likes on posts and comments |
| 11 | Friendships per week | Sent, accepted, rejected, removed |
| 12 | Chats and WebSocket failures | Direct, group, and auth failures |
| 13 | JVM — Heap | Used vs max memory |
| 14 | HTTP Requests by status | Rate grouped by HTTP code |

---

## Makefile — Commands

### Start

```bash
make up_dev_full        # Full dev stack (app + monitoring)
make up_metrics         # Monitoring only (dev, app already running)
make up_full            # Full prod stack (app + monitoring)
make up_metrics_prod    # Monitoring only (prod, app already running)
```

### Stop

```bash
make down_metrics       # Stop and remove dev monitoring containers
make down_metrics_prod  # Stop and remove prod monitoring containers
make stop_metrics       # Pause dev monitoring (keep containers)
make stop_metrics_prod  # Pause prod monitoring (keep containers)
```

### Logs

```bash
make logs_metrics       # Prometheus + Grafana + Alertmanager (dev)
make logs_metrics_prod  # Monitoring in prod
```

---

## Docker Compose

### Required `.env` variables

```env
# Grafana
GF_ADMIN_USER=admin
GF_ADMIN_PASSWORD=your_secure_password

# Discord webhook (move out of alertmanager.yml)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Healthchecks.io (Deadman's Switch — once implemented)
HEALTHCHECKS_PING_URL=https://hc-ping.com/your-uuid-here
```

### Dev vs Prod

| Aspect | Dev | Prod |
|---|---|---|
| Exposed ports | `0.0.0.0` (external) | `127.0.0.1` (local only) |
| Prometheus target | `backend_dev:8080` | `backend:8080` |
| Restart policy | not set | `unless-stopped` |
| MinIO volume | `./minio_data` (local) | `~/minio/data` (home) |

> 🛈 **Heads-up:** The current `docker-compose.yml` (prod) **does not include monitoring services**. Only `docker-compose_dev.yml` ships Prometheus, Grafana and Alertmanager. Add them to the prod compose file (or to a separate `docker-compose.monitoring.yml` overlay) before relying on the `make up_full` / `make up_metrics_prod` workflows described above.

### Current dev monitoring services (extract from `docker-compose_dev.yml`)

```yaml
prometheus:
  image: prom/prometheus:latest
  ports:
    - "9090:9090"
  volumes:
    - ./monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
    - ./monitoring/prometheus/alertrules.yml:/etc/prometheus/alertrules.yml
    - prometheus_data:/prometheus

grafana:
  image: grafana/grafana:latest
  ports:
    - "3001:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
  volumes:
    - grafana_data:/var/lib/grafana

alertmanager:
  image: prom/alertmanager
  volumes:
    - ./monitoring/alertmanager/alertmanager.yml:/etc/alertmanager/alertmanager.yml
  ports:
    - "9093:9093"
```

---

## Testing Guide

### Check endpoints

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

### Fire an alert manually (without taking services down)

```bash
curl -X POST http://localhost:9093/api/v2/alerts \
  -H "Content-Type: application/json" \
  -d '[{
    "labels": {"alertname": "BackendDown", "severity": "critical"},
    "annotations": {"description": "Alert test"}
  }]'
```

### Watch business metrics in real time

```bash
# Dev
watch -n5 'curl -s http://localhost:8080/q/metrics | grep social'

# Prod
watch -n5 'docker exec transcendence-prod-backend-1 curl -s http://localhost:8080/q/metrics | grep social'
```

After **logging in**, **creating a post**, **liking** or **sending a message**, the counters should increment within 15 seconds.

### Action → metric map

| Action on the site | Metric that increases |
|---|---|
| Log in | `social_auth_logins_total{result="success"}` |
| Wrong password | `social_auth_logins_total{result="failed"}` |
| Login with Google | `social_auth_google_logins_total` |
| Sign up | `social_auth_registrations_total` |
| Create a post | `social_posts_created_total` |
| Create a post with a photo | `social_posts_with_media_total` |
| Like a post | `social_likes_total{target="post", action="like"}` |
| Send a message | `social_messages_sent_total` |
| Open the site (WS connects) | `social_ws_connections_active` +1 |
| Close the tab (WS disconnects) | `social_ws_connections_active` -1 |
| Add a friend | `social_friendships_total{action="sent"}` |
| Accept a friend | `social_friendships_total{action="accepted"}` |

---

## Access URLs

| Service | Dev | Prod |
|---|---|---|
| Frontend (Vite) | http://localhost:5173 | https://143.198.185.76.nip.io |
| Frontend (Nginx) | http://localhost:8081 | — |
| Backend | http://localhost:8080 | internal (nginx proxy) |
| Grafana | http://localhost:3001 | https://grafana.143.198.185.76.nip.io/ |
| Prometheus | http://localhost:9090 | https://prometheus.143.198.185.76.nip.io/ |
| Alertmanager | http://localhost:9093 | https://alertmanager.143.198.185.76.nip.io/ |
| MinIO Console | http://localhost:9001 | internal |


