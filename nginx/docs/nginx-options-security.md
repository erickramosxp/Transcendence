# Nginx — Detailed anatomy of `nginx.conf` and `spa-locations.conf`

This document explains line by line, in depth, the Nginx configuration used in the Transcendence project. The goal is to serve as a study reference: for each directive we show what it does, why it is there, what the alternatives are, and in which situations it can bite you.

---

## Table of contents

1. [Fundamental concepts before diving in](#1-fundamental-concepts)
2. [`nginx.conf` — main context](#2-nginxconf--main-context)
3. [`nginx.conf` — `events` block](#3-nginxconf--events-block)
4. [`nginx.conf` — `http` block (global settings)](#4-nginxconf--http-block-global-settings)
5. [`nginx.conf` — `map`s, rate limiting, and SSL](#5-nginxconf--maps-rate-limiting-and-ssl)
6. [`nginx.conf` — `server` blocks](#6-nginxconf--server-blocks)
7. [`spa-locations.conf`](#7-spa-locationsconf)
8. [Location evaluation order](#8-location-evaluation-order)
9. [Gotchas and final tips](#9-gotchas-and-final-tips)
---

## 1. Fundamental concepts

Before going into the file, three ideas need to be clear:

**Contexts.** Nginx organizes directives in nested contexts: `main` (file root) > `events` > `http` > `server` > `location`. Some directives only work in certain contexts. When a directive is defined in a parent context, it is usually inherited by children — *except* `add_header`, which has a special rule (see section 7).

**Virtual server.** A `server { }` block represents a "site". Nginx chooses which `server` handles a request based on the combination of `listen` (port/IP) + `Host:` (HTTP header) compared to `server_name`. If none match, it uses the `default_server` for that port.

**Worker model.** Nginx has a `master` process (root) that only manages things, and N `workers` (non-root) that handle requests. Each worker is single-threaded but uses asynchronous I/O (epoll/kqueue), which is why it can handle thousands of simultaneous connections with few workers.

---

## 2. `nginx.conf` — main context

```nginx
user nginx;
worker_processes auto;

error_log /dev/stderr warn;
pid /var/run/nginx.pid;
```

**`user nginx;`** — Defines which system user the *worker* processes run as. The master always runs as root (to open privileged ports like 80/443 and read certificates), but workers drop to `nginx` for security. If a worker is compromised, the attacker is limited to that user, without root.

**`worker_processes auto;`** — Number of workers. `auto` makes nginx detect the number of available CPUs and create one worker per core. You could set it manually (e.g. `worker_processes 4;`), but `auto` is the recommended default. More workers than CPUs rarely helps (context switching).

**`error_log /dev/stderr warn;`** — Error log path + minimum level. In a Docker container, sending to `/dev/stderr` means `docker logs` captures everything. Severity levels, from least to most severe: `debug`, `info`, `notice`, `warn`, `error`, `crit`, `alert`, `emerg`. `warn` is a reasonable middle ground: you see real problems without being flooded by operational noise.

**`pid /var/run/nginx.pid;`** — File where the master writes its PID, useful for `nginx -s reload`, `nginx -s stop`, etc. In containers this rarely matters.

---

## 3. `nginx.conf` — `events` block

```nginx
events {
    worker_connections 1024;
}
```

**`worker_connections 1024;`** — How many *simultaneous* connections each worker can handle. The theoretical server total is `worker_processes × worker_connections`. Remember that a request as a proxy uses **two** connections: client↔nginx and nginx↔upstream. So 1024 workers × 4 cores = ~4096 client connections. Raising this value also requires increasing the system's/container's `ulimit -n` (file descriptors).

Other directives that could be here but use reasonable defaults: `use epoll;` (Linux), `multi_accept on;` (accept several connections per event loop).

---

## 4. `nginx.conf` — `http` block (global settings)

```nginx
http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    access_log /dev/stdout;
```

**`include /etc/nginx/mime.types;`** — Loads the extension → `Content-Type` table that nginx serves with each file. Without this, `style.css` would be served as `application/octet-stream` and the browser would not interpret it. The `mime.types` file ships with nginx and maps hundreds of extensions.

**`default_type application/octet-stream;`** — Fallback for files without a recognized extension. `octet-stream` means "generic binary data", which makes the browser offer a download instead of trying to display it.

**`access_log /dev/stdout;`** — Logs every request served. In a container, it goes to `docker logs` (stdout) separately from errors (stderr). You can customize the format with `log_format`, and turn off logging in high-volume locations (e.g. `access_log off;` for health checks).

```nginx
    server_tokens off;
```

**`server_tokens off;`** — Hides the nginx version in two places: in the `Server:` response header (becomes just `Server: nginx`) and on default error pages. It is not strong protection (attackers have other ways to fingerprint), but it removes free information.

```nginx
    keepalive_timeout 65;
    client_body_timeout 10s;
    client_header_timeout 10s;
    send_timeout 10s;
```

Four different timeouts — they are confusing on first read:

**`keepalive_timeout 65;`** — How many seconds to keep a TCP connection open after serving a request, waiting for the same client to send another. Keepalive avoids the overhead of TCP handshake + TLS handshake on every request, which is huge. 65s is a classic value.

**`client_header_timeout 10s;`** — Maximum time for the client to finish sending the request *headers*. If it opens the connection and starts sending bytes but does not finish within 10s, we drop it. Defense against Slowloris (attack that opens thousands of connections and sends headers byte by byte to exhaust resources).

**`client_body_timeout 10s;`** — Same idea for the *body* (POST/PUT). Caution: 10s may be too short for large uploads on a bad network. If you have an upload endpoint, override locally in that `location` (as we do in `/posts` with `client_max_body_size 21M`).

**`send_timeout 10s;`** — Maximum time *between* two send operations to the client. It is not "total time to send the response", it is "if the client stops accepting data for 10s, we drop it".

```nginx
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 5;
    gzip_proxied any;
    gzip_types
        text/plain
        text/css
        application/json
        application/javascript
        text/xml
        application/xml
        application/xml+rss
        text/javascript
        image/svg+xml;
```

**`gzip on;`** — Enables compression. Nginx compresses the response before sending it, *if* the client announced `Accept-Encoding: gzip`. Reduces traffic by 60–80% for textual content.

**`gzip_vary on;`** — Adds `Vary: Accept-Encoding` to the response header. This tells intermediate caches (CDN, corporate proxy) that the response varies depending on whether the client accepts gzip — without this, a cache may serve a compressed version to a client that does not support it.

**`gzip_min_length 1024;`** — Do not compress responses smaller than 1KB. For small text the compression overhead (gzip header + processing) is greater than the gain.

**`gzip_comp_level 5;`** — Compression level (1–9). 1 is faster and compresses little; 9 is the opposite. 5 is the recommended sweet spot — above that the size gain is tiny but CPU rises quickly.

**`gzip_proxied any;`** — By default nginx does not compress responses being served as a proxy (`proxy_pass`). `any` forces compression for all, regardless of cache headers. In an architecture with a CDN in front of nginx this matters.

**`gzip_types ...`** — MIME types to compress. `text/html` is included automatically, which is why it does not appear. Already compressed images (jpg, png, webp) should not be included — recompressing gains nothing and wastes CPU. SVG is included because it is XML (text).

Modern alternative: **brotli** compresses ~20% better than gzip but requires a separate module (`ngx_brotli`). It is not in this config.

```nginx
    client_max_body_size 1M;
```

**`client_max_body_size 1M;`** — Maximum request body size. Above this, nginx returns `413 Payload Too Large` *before* calling the upstream. Important because it protects the backend from abusive uploads. We override per location when needed (`/posts` accepts 21M, `/user/avatar` accepts 5M).

```nginx
    resolver 127.0.0.11 valid=30s;
```

**`resolver 127.0.0.11 valid=30s;`** — Internal DNS used by nginx to resolve names at runtime. `127.0.0.11` is Docker's built-in resolver — it resolves container names (`backend`, `minio`, `grafana`) to internal IPs. `valid=30s` caches the result for 30s; if a container restarts and changes IP, nginx notices within at most 30s.

Important subtlety: nginx only *needs* the resolver when the name in `proxy_pass` is a variable (e.g. `proxy_pass $upstream;`) or in some modules. When you use literal `proxy_pass http://backend:8080;`, nginx resolves **once at startup** and caches. If the backend IP changes at runtime, nginx only notices on `nginx -s reload` or a new resolution. In Docker Compose this *can* cause 502 after a backend restart. Fix: use upstream with `resolve` (plus module), or accept that nginx also needs a restart.

```nginx
    map $http_upgrade $connection_upgrade {
        default upgrade;
        ''      close;
    }
```

**`map`** creates a variable derived from another. Syntax: `map <input variable> <output variable> { patterns... }`.

Here we map `$http_upgrade` (the request's `Upgrade:` header) to `$connection_upgrade`. If the client sends `Upgrade: websocket`, the output is `upgrade`. If it does not (empty string), the output is `close`. This pattern is canonical for proxying WebSocket — we use it later in `/ws/realtime` with:

```
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection $connection_upgrade;
```

Why not set `Connection "upgrade"` fixed? Because for normal HTTP requests that breaks keepalive. The `map` resolves it dynamically.

---

## 5. `nginx.conf` — `map`s, rate limiting, and SSL

```nginx
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=api:10m     rate=5r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m    rate=1r/s;
    limit_req_status 429;
    limit_req_log_level warn;
```

**`limit_req_zone`** defines a **rate limiting zone** — a shared memory area that counts requests per key. Syntax: `limit_req_zone <key> zone=<name>:<size> rate=<rate>;`.

- **`$binary_remote_addr`** — rate limit key. It is the client IP in binary format (4 or 16 bytes), more compact than `$remote_addr` (string). Each unique IP = one entry in the zone.
- **`zone=general:10m`** — name `general`, 10MB of memory. 10MB fits ~160 thousand unique IPs (each entry uses 64 bytes).
- **`rate=10r/s`** — sustained maximum rate: 10 requests per second per IP. Internally nginx uses the "leaky bucket" algorithm: each IP has a virtual bucket that fills as requests arrive and drains at the defined rate.
Three different zones for three protection levels:
- `general` (10r/s) — SPA static assets, tolerant.
- `api` (5r/s) — REST endpoints, tighter because each can trigger a heavy query.
- `auth` (1r/s) — login/register. Brute force becomes impractical.
**`limit_req_status 429;`** — When blocked, returns HTTP 429 (Too Many Requests). Default is 503. 429 is semantically correct.

**`limit_req_log_level warn;`** — Logs blocks as `warn`. Default is `error`. Since blocks are expected (not a "system error"), `warn` is more honest.

The zone only **defines**; actual use is per location: `limit_req zone=api burst=20 nodelay;`. `burst=20` allows queuing up to 20 requests above the rate without immediate rejection (absorbs legitimate spikes). `nodelay` processes those bursts immediately instead of spacing them out.

```nginx
    map $http_user_agent $bad_bot {
        default                                     0;
        ""                                          1;
        "~*(sqlmap|nikto|nessus|masscan|zgrab)"     1;
        "~*(nuclei|gobuster|dirbuster|hydra)"       1;
        "~*(wpscan|acunetix|appscan|fimap)"         1;
    }
```

Map that sets `$bad_bot` to `1` when `User-Agent` is empty or matches known scan/attack tool names. `~*` means case-insensitive regex. In each `server` we use:

```
if ($bad_bot) { return 444; }
```

`return 444` is nginx-specific — closes the TCP connection without sending any response. The attacker gets `connection reset`, with no error code or body. It costs zero server resources and gives no useful feedback to the scanner.

Limitation: User-Agent is trivially spoofable. Serious attackers switch to `Mozilla/5.0...`. This list only catches "noise" — automated scanners that do not bother.

```nginx
    map $request_method $not_allowed_method {
        default                                     1;
        GET                                         0;
        HEAD                                        0;
        POST                                        0;
        PUT                                         0;
        PATCH                                       0;
        DELETE                                      0;
        OPTIONS                                     0;
    }
```

HTTP method whitelist. Anything outside this list (`TRACE`, `CONNECT`, `LINK`, random junk) sets `$not_allowed_method = 1` and we fire `return 405`. Blocks old/exotic methods with no legitimate precedent in a REST API.

```nginx
    ssl_certificate /etc/nginx/certs/nginx.crt;
    ssl_certificate_key /etc/nginx/certs/nginx.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:...;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;
```

**`ssl_certificate` / `ssl_certificate_key`** — paths to the certificate (chain) and private key. Defined in `http` to inherit in all SSL `server` blocks.

**`ssl_protocols TLSv1.2 TLSv1.3;`** — accepted versions. TLS 1.0/1.1 have been deprecated since 2020 (RFC 8996). TLS 1.3 is dramatically faster (1-RTT handshake) and secure.

**`ssl_prefer_server_ciphers off;`** — History: in TLS 1.2 the server chose the cipher from the client's list. `on` switched to the server choosing (was recommended). In TLS 1.3 negotiation was redesigned and the current recommendation (Mozilla, IETF) is `off` — let the client choose among the ciphers the server accepts. For pure 1.2, `on` is still defensible.

**`ssl_ciphers`** — explicit list of allowed cipher suites. All here are AEAD (Authenticated Encryption) with PFS (Perfect Forward Secrecy via ECDHE/DHE). Note: this directive *does not affect TLS 1.3* — TLS 1.3 negotiates ciphers from a fixed internal list (`TLS_AES_128_GCM_SHA256`, etc). It only applies to 1.2.

**`ssl_session_timeout 1d;`** + **`ssl_session_cache shared:SSL:10m;`** — Caches TLS sessions for 1 day in 10MB of memory shared among workers. When the same client reconnects, we resume the session without redoing the full handshake (session resumption). 10MB ≈ 40 thousand sessions.

**`ssl_session_tickets off;`** — Another session resumption mechanism (ticket-based instead of server-side cache). It is `off` for security reasons: tickets are encrypted with a key that, if leaked, allows decrypting old sessions (breaks PFS). Keeping `off` forces using only the cache, which lives in memory.

---

## 6. `nginx.conf` — `server` blocks

### 6.1. Catch-all default

```nginx
server {
    listen 80 default_server;
    listen 443 ssl default_server;
    http2 on;
    server_name _;
    ssl_reject_handshake on;
    return 444;
}
```

This is the **first server block**, before the "real" servers. It handles any request whose `Host:` header does not match any configured `server_name`. Why does this matter? Without it, scanners hitting the IP directly (`https://203.0.113.5/`) would land on the first defined `server`, exposing the frontend. With it:

- **`listen ... default_server`** — declares this block as the fallback for that port. Only one per port.
- **`server_name _;`** — `_` is just a convention for "invalid name that will never match"; combined with `default_server`, it ensures entry here only via fallback.
- **`ssl_reject_handshake on;`** — Available since nginx 1.19.4. Makes the TLS handshake fail immediately with a TLS alert, without needing a valid certificate. The client gets handshake failure and the connection dies. Before this directive you needed a dummy certificate so the handshake could complete only to return 444.
- **`http2 on;`** — Harmless here (since the handshake is rejected), but innocuously survived from the template.
- **`return 444;`** — Applied to requests on port 80 (no SSL). Closes the connection without a response.
### 6.2. HTTP → HTTPS redirect

```nginx
server {
    listen 80;
    server_name FRONTEND_SERVER_NAME BACKEND_SERVER_NAME ...;
    return 301 https://$host$request_uri;
}
```

Handles requests on port 80 for *known* hostnames and redirects with 301 (permanent) to HTTPS. `$host` is the received hostname; `$request_uri` is the original path + query string. It is also common to use 308 (preserves method on redirect).

Note that this server has no `default_server` — so requests with unknown Host on :80 fall into the previous catch-all, which returns 444. Desired behavior.

### 6.3. Frontend SPA

```nginx
server {
    listen 443 ssl;
    http2 on;
    server_name FRONTEND_SERVER_NAME;

    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;
```

**`listen 443 ssl;`** + **`http2 on;`** — Listens on HTTPS with HTTP/2. Before nginx 1.25 the syntax was `listen 443 ssl http2;` on the same `listen`; now `http2` is a separate directive.

**`Strict-Transport-Security`** (HSTS) — tells the browser "for this domain, always use HTTPS for X seconds". 63072000s = 2 years. `includeSubDomains` extends to all subdomains. The `always` modifier on `add_header` makes the header emitted even on error responses (4xx/5xx) — without `always`, it only goes on 2xx/3xx.

```nginx
    if ($not_allowed_method) { return 405; }
    if ($bad_bot)            { return 444; }
```

Application of the maps defined earlier. On "if is evil" in nginx: the rule is that `if` is safe when the block contains only `return` or `rewrite`. This is exactly that case.

```nginx
    root /usr/share/nginx/html;
    index index.html;
    include /etc/nginx/spa-locations.conf;
}
```

**`root`** — root directory for serving static files. Paths in `try_files` are relative to this `root`. **`index`** — which file to serve if the request is for a directory. **`include`** — injects the contents of `spa-locations.conf` at this point (`server` scope).

### 6.4. Backend API

```nginx
server {
    listen 443 ssl;
    http2 on;
    server_name BACKEND_SERVER_NAME;

    add_header Strict-Transport-Security ... always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

Same structure as the frontend, plus two headers:

**`X-Content-Type-Options: nosniff`** — forbids the browser from "guessing" the MIME type based on content. Without this, a `.txt` file with HTML content could be interpreted as HTML in some older browsers, enabling XSS.

**`Referrer-Policy: strict-origin-when-cross-origin`** — controls what goes in the `Referer:` header on outgoing requests from the site. Chosen value: for same origin, send full URL; cross-origin to HTTPS, send only origin (`https://api.example.com`); HTTPS→HTTP, nothing. Good balance between analytics and privacy.

#### Location `/ws/realtime` (WebSocket)

```nginx
location = /ws/realtime {
    proxy_pass http://backend:8080/ws/realtime;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    ...
    proxy_read_timeout 86400s;
    proxy_send_timeout 86400s;
    proxy_buffering off;
}
```

**`location = /ws/realtime`** — `=` is exact match. Faster than prefix match because nginx can hash without walking the tree.

**`proxy_pass http://backend:8080/ws/realtime;`** — `backend` is a Docker container name, resolved to IP via internal resolver. *Note an important subtlety*: when the URI in `proxy_pass` has a path (`/ws/realtime`), nginx **replaces** the request prefix with the `proxy_pass` path. When there is no path (e.g. `http://backend:8080;`), it passes the original URI intact. Here both match, so it does not matter, but in other locations see the difference.

**`proxy_http_version 1.1;`** — WebSocket requires HTTP/1.1 (RFC 6455 bases upgrade on 1.1). Default for `proxy_*` is 1.0, which does not support `Upgrade:`.

**`proxy_set_header Upgrade $http_upgrade;`** + **`proxy_set_header Connection $connection_upgrade;`** — Forwards the WebSocket upgrade handshake using the `map` defined above.

**`proxy_set_header Host $http_host;`** — Forwards the original `Host:`. `$http_host` includes the port if it was sent (`example.com:443`), while `$host` does not. By default nginx would set `Host: backend:8080` (the proxy destination), which confuses frameworks that use Host to build absolute URLs.

**`X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto`, `X-Forwarded-Host`** — Conventional headers so the upstream knows the client's real identity. Without them, the backend only sees nginx's IP. **`$proxy_add_x_forwarded_for`** is special: takes the existing `X-Forwarded-For` value (if any, e.g. from a CDN) and *appends* the current client IP. In a chain CDN → nginx → backend, the backend sees `X-Forwarded-For: <real-ip>, <cdn-ip>`.

**`proxy_read_timeout 86400s;`** + **`proxy_send_timeout 86400s;`** — 86400s = 24h. WebSockets can stay idle for long periods without exchanging messages (chat, notifications), so the default 60s would kill legitimate connections. 24h is a "practically forever" value. Ideally the backend sends periodic pings (RFC 6455 PING frames) so the connection has active keepalive.

**`proxy_buffering off;`** — Nginx by default buffers (stores) the entire upstream response before sending to the client. For WebSocket that is fatal — frames must flow in real time. `off` does immediate pass-through.

#### Locations `/posts`, `/user/avatar`

```nginx
location = /posts {
    client_max_body_size 21M;
    limit_req zone=api burst=20 nodelay;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    ...
    proxy_pass http://backend:8080;
}
```

**`client_max_body_size 21M;`** — Override of the global limit (1M). Posts allow image upload, so 21M gives margin (image ~20M + form data).

**`limit_req zone=api burst=20 nodelay;`** — Applies rate limiting from the `api` zone (5r/s). `burst=20` allows peaks of up to 20 queued requests; `nodelay` releases those bursts immediately instead of spacing them by the rate.

**`proxy_http_version 1.1;`** + **`proxy_set_header Connection "";`** — Pattern to allow keepalive between nginx and upstream. Why clear `Connection`? Because the original `Connection:` from the client may have values that confuse the upstream. Clearing and using HTTP/1.1 default lets nginx use a connection pool to the backend (with `upstream { keepalive N; }` directive — not in this config, so each request opens a new connection, acceptable cost).

**`proxy_pass http://backend:8080;`** — No path in the destination. The original URI (`/posts`) is forwarded intact. Backend receives `GET /posts HTTP/1.1`.

#### Location `/auth/(login|register)`

```nginx
location ~ ^/auth/(login|register)$ {
    limit_req zone=auth burst=5 nodelay;
    ...
}
```

**`location ~ ^/auth/(login|register)$`** — `~` is case-sensitive regex (use `~*` for insensitive). Exact path match: accepts `/auth/login` and `/auth/register`, does not accept `/auth/login/`, `/auth/login?foo=bar` (query string is separate from path in matching), or `/auth/loginX`.

**`limit_req zone=auth burst=5 nodelay;`** — Very tight rate limit (1r/s, burst=5). Password brute force becomes impractical: ~6 attempts/second per IP, at most. May be *too* tight for legitimate users who mistype the password 2–3 times in a row — monitor 429 logs to tune.

#### Location `/` (backend catch-all)

```nginx
location / {
    limit_req zone=api burst=20 nodelay;
    ...
    proxy_pass http://backend:8080;
}
```

Default for any URI not caught by earlier locations. Since nginx applies the most specific match first (see section 8), special endpoints (`/ws/realtime`, `/posts`, `/auth/...`) are handled before this.

### 6.5. MinIO API and Console

```nginx
server {
    server_name MINIO_API_ENDPOINT;
    ...
    location / {
        proxy_pass http://minio:9000;
    }
}

server {
    server_name MINIO_ENDPOINT;
    ...
    location / {
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_pass http://minio:9001;
    }
}
```

MinIO exposes two services on different ports:
- **9000** — S3-compatible API (PUT/GET objects, presigned URLs, etc).
- **9001** — Web console (admin UI).
The console uses WebSocket for real-time updates (logs, metrics), which is why the second block forwards upgrade headers. The API block does not need them.

**Note the asymmetry:** the API block has no `if ($not_allowed_method)`. It was intentional — S3 APIs may use methods that might fall outside the whitelist in some client (rarely, but safer to let through). The current whitelist covers `GET/PUT/POST/DELETE/HEAD/OPTIONS/PATCH`, which is everything MinIO uses, so technically it could have the `if` too. It is a decision to "keep an easy path for any S3 client".

### 6.6. Grafana and Prometheus

```nginx
server {
    server_name GRAFANA_SERVER_NAME;
    ...
    auth_basic "Monitoring";
    auth_basic_user_file /etc/nginx/.htpasswd;

    location = /api/live/ws {
        proxy_pass http://grafana:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        ...
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
        proxy_buffering off;
    }

    location / {
        proxy_pass http://grafana:3000;
        ...
    }
}
```

**`auth_basic "Monitoring";`** — Enables HTTP Basic Authentication. The browser will prompt for username/password in a native popup. The string "Monitoring" is the "realm", shown in the popup.

**`auth_basic_user_file /etc/nginx/.htpasswd;`** — File with hashed usernames and passwords (Apache htpasswd format). Generated with `htpasswd -c .htpasswd admin`.

Why basic auth here? Grafana and Prometheus already have their own authentication, but an extra layer helps in two scenarios: (1) blocks bots before they reach the app (reduces attack surface); (2) Prometheus in particular has no native auth.

**`/api/live/ws`** — Grafana-specific endpoint for WebSocket "live dashboards". Same structure as backend WebSocket, with shorter timeout (1h) — dashboards are rarely open longer than that.

Prometheus is structurally identical, without WebSocket.

---

## 7. `spa-locations.conf`

This file is included **inside the frontend server block**, so everything here is in `server` scope. Note a consequence: variables defined with `set` here live in that scope (and descendants).

```nginx
set $csp "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; ...";
```

**`set $csp "...";`** — Defines the `$csp` variable with the long Content-Security-Policy value. Why a variable instead of inline in each `add_header`? Reuse. If you change the CSP, change it in one place only.

### 7.1. CSP anatomy

Content-Security-Policy is a whitelist of allowed sources for each resource type. When the browser renders the page, it checks each `<script>`, `<img>`, `fetch()`, etc. against this policy.

| Directive | What it controls | Our value |
|---|---|---|
| `default-src 'self'` | Fallback for any unspecified type | Same domain only |
| `script-src` | Where executable JS scripts come from | self + inline + eval + any HTTPS |
| `script-src-elem` | Specifies `<script>` tags (newer) | Same |
| `style-src` | Where CSS comes from | self + inline + any HTTPS |
| `style-src-elem` | Specifies `<style>` tags | Same |
| `img-src` | Images (`<img>`, `background-image`) | self + data: + blob: + any HTTPS |
| `media-src` | `<audio>`, `<video>` | self + blob: + any HTTPS |
| `connect-src` | `fetch()`, `XMLHttpRequest`, WebSocket | self + any HTTPS/WSS |
| `font-src` | Webfonts | self + data: + any HTTPS |
| `frame-src` | Allowed `<iframe>` | self + any HTTPS |
| `frame-ancestors` | Who can embed **this** site in an iframe | Same origin only |
| `form-action` | Where `<form>` can submit | self + any HTTPS |
| `base-uri` | Valid values for `<base>` tag | self |
| `object-src` | `<object>`, `<embed>`, `<applet>` (legacy plugins) | nothing (`'none'`) |
| `worker-src` | Web Workers, Service Workers | self + blob: |
| `manifest-src` | Web App Manifest (`manifest.json`) | self |

**`'self'`** — same origin as the page (scheme + host + port).
**`'unsafe-inline'`** — allows `<script>code</script>` or `<div onclick="...">` (dangerous, but needed for frameworks that inject style/event handlers).
**`'unsafe-eval'`** — allows `eval()`, `new Function()` (rarely needed in production).
**`data:`** — data URLs (`data:image/png;base64,...`).
**`blob:`** — blob URLs created with `URL.createObjectURL()` (uploads, image preview before sending).
**`https:`** — any URL with https scheme.
**`'none'`** — blocks everything.

**Historical conflict we resolved:** `frame-ancestors 'self'` in CSP and `X-Frame-Options "SAMEORIGIN"` (in the header) say the same thing — "only my own domain can iframe me". Modern browsers prefer `frame-ancestors`. We keep both for compatibility with older browsers that ignored CSP.

### 7.2. Blocking locations

```nginx
location ~* \.(php|asp|aspx|jsp|cgi)$ { return 444; }
location ~* /(wp-admin|wp-login|wp-content|wp-includes|wordpress) { return 444; }
location ~* /(zabbix|phpmyadmin|adminer|webmail|cpanel|xmlrpc) { return 444; }
location ~* /\.(env|git|aws|ssh|htaccess|htpasswd|svn) { return 444; }
```

These blocks do *not* defend against real attacks — they defend against **log noise**. Automated scanners bombard IPs with attempts on common URLs of vulnerable applications (WordPress, phpMyAdmin) looking for targets. Without these blocks, each attempt generates a 404 in nginx logs and maybe the backend.

- **`~*`** — case-insensitive regex. Catches `/WP-ADMIN`, `/Wp-Admin`, etc.
- **`\.(php|asp|aspx|jsp|cgi)$`** — `$` anchors at the end. URLs ending in `.php` etc.
- **`/\.(env|git|...)`** — `\.` matches a literal dot. Catches `/.env`, `/.git/config`, `/folder/.aws/credentials`.
`return 444` kills the connection silently. The attacker gets `connection reset` and typically moves to the next IP.

### 7.3. Location `= /index.html`

```nginx
location = /index.html {
    try_files $uri =404;
    add_header Strict-Transport-Security ... always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "..." always;
    add_header Content-Security-Policy $csp always;
    add_header Cache-Control "no-cache, no-store, must-revalidate" always;
}
```

**`location = /index.html`** — exact match. Exists separately from `location /` because `index.html` needs special cache handling: it is the SPA entry point that references hashed JS/CSS bundles (e.g. `main.a3f8c2.js`). If the browser caches old `index.html`, it keeps requesting old bundles that may no longer exist on the server. `Cache-Control: no-store` forces the browser to always fetch the current version.

**`try_files $uri =404;`** — Tries to serve the file at `$root$uri`. If not found, returns 404. Different from `location /`, which falls back to `/index.html` (SPA routing).

#### Security headers applied

**`Permissions-Policy`** (formerly `Feature-Policy`) — disables browser APIs this application does not use: camera, microphone, geolocation, etc. If an attacker injects script (e.g. via XSS), the script cannot call `navigator.geolocation.getCurrentPosition()` because the policy is `()` (empty list = nobody).

Syntax: `feature=(allowlist)`. `()` is empty (not even `self` can), `(self)` allows only same origin, `(self "https://trusted.com")` adds third parties.

**`Cache-Control: no-cache, no-store, must-revalidate`** — three directives with intentional overlap to cover older browsers:
- `no-cache` — may cache, but must revalidate with server before use.
- `no-store` — must not cache, anywhere.
- `must-revalidate` — if cached (in violation above), always revalidate before serving.
Effective combination: nobody caches `index.html`.

### 7.4. Location `/`

```nginx
location / {
    limit_req zone=general burst=30 nodelay;
    try_files $uri $uri/ /index.html;
    add_header Strict-Transport-Security ... always;
    ...
}
```

**`location /`** — no modifier, prefix match. Matches any URI starting with `/` — i.e. *everything*. It is the "catch-all".

**`limit_req zone=general burst=30 nodelay;`** — More tolerant rate limit (10r/s, burst=30) because the SPA loads multiple assets on open.

**`try_files $uri $uri/ /index.html;`** — Heart of SPA routing. Tries in order:
1. `$uri` — literal file (e.g. `/about` → `/usr/share/nginx/html/about`).
2. `$uri/` — directory with the same name (`/about/` → `/usr/share/nginx/html/about/index.html` if `index` is configured).
3. `/index.html` — final fallback. Serves the SPA, and the client-side router (React Router, Vue Router) reads `window.location.pathname` to show the right page.
Critical: the third item is a URI (with slash), not a file. So nginx does an **internal redirect** to `/index.html`, which hits `location = /index.html`. *But* — `location = /index.html` applies its own `add_header`, so headers from `location /` are *not* inherited. Here it does not matter because both locations have the same headers.

### 7.5. Static assets location

```nginx
location ~* \.(?:js|mjs|css|png|jpg|jpeg|gif|ico|svg|webp|avif|woff|woff2|ttf|map)$ {
    try_files $uri =404;
    add_header ... always;
    expires 1y;
    add_header Cache-Control "public, immutable" always;
}
```

**`location ~* \.(?:...)$`** — case-insensitive regex ending in one of the listed extensions. `(?:...)` is a non-capturing group — small optimization because we do not need to reference the group later.

**`try_files $uri =404;`** — If it does not exist, direct 404. Does not fall back to SPA (would make little sense to serve HTML for a `.js` request).

**`expires 1y;`** — Convenient nginx directive that automatically generates `Expires:` (absolute date) and `Cache-Control: max-age=...` headers. `1y` ≈ 31536000s.

**`Cache-Control: public, immutable`** — overrides what `expires` generated:
- `public` — can be cached by intermediate proxies/CDNs, not only the browser.
- `immutable` — tells the browser "this resource never changes while the URL is the same". Modern browsers skip the "if-modified-since" check, gaining latency.
This works because bundlers (Vite, Webpack) generate filenames with content hash (e.g. `main.a3f8c2.js`). When content changes, the hash changes, the URL changes — old cache never conflicts with new.

**Note on `add_header` here:** the `add_header Cache-Control` comes *after* `expires`. `expires` already added `Cache-Control: max-age=31536000`. The second `add_header` *adds* another header — does not replace! Client receives:

```
Cache-Control: max-age=31536000
Cache-Control: public, immutable
```

Browsers combine multiple headers by comma, so effectively it becomes `max-age=31536000, public, immutable`, which is exactly what we want.

---

## 8. Location evaluation order

When a request arrives, nginx chooses **one** location following this order:

1. **Exact match (`=`)** — if any matches, wins immediately. Most efficient.
2. **Prefix match with `^~`** — if any matches, wins (skips regex).
3. **Regex (`~` or `~*`)** — tested in the order they appear in the file. The **first match wins**.
4. **Prefix match without modifier** — the **longest** wins.
In `spa-locations.conf` in real order:

| Line | Type | Pattern | When it wins |
|---|---|---|---|
| 1 | regex | `\.(php\|asp\|...)$` | URI ends in `.php`, `.asp`, etc. |
| 2 | regex | `/(wp-admin\|wp-login\|...)` | URI contains those paths |
| 3 | regex | `/(zabbix\|phpmyadmin\|...)` | same |
| 4 | regex | `/\.(env\|git\|...)` | URI has dotfile |
| 5 | `=` exact | `/index.html` | URI exactly `/index.html` |
| 6 | prefix | `/` | catch-all |
| 7 | regex | `\.(js\|mjs\|css\|...)$` | URI ends in asset |

Flow for a request `GET /assets/main.a3f8c2.js`:

1. Look for exact match → no `=` matches.
2. Look for `^~` → none.
3. Test regex in order:
   - `\.(php|asp|...)$` → does not end in .php → no match
   - `/(wp-admin|...)` → does not contain wp-admin → no match
   - `/(zabbix|...)` → no match
   - `/\.(env|...)` → no dotfile → no match
   - **`\.(js|mjs|...)$` → matches! Wins.**
4. Apply that location → serve with 1 year cache.
Note that `location /` is *above* the assets regex in the file, but regex has priority over prefix, so visual position is misleading. This is a common gotcha.

Flow for `GET /about` (SPA route):

1. No `=` matches.
2. No `^~`.
3. Regex: none match (does not end in .js, not a dotfile, etc).
4. Longest prefix: `/` matches.
5. Apply `location /` → `try_files $uri $uri/ /index.html` → file `/about` does not exist → directory `/about/` does not exist → fallback `/index.html` → internal redirect to `location = /index.html` → serve SPA.
---

## 9. Gotchas and final tips

### The broken inheritance of `add_header`

This is **the** most common nginx gotcha. If you define `add_header` in the `server` context and the child location has **no `add_header`**, it inherits. If the child location has **any** `add_header`, it **cancels all** parent headers and only applies its own.

```nginx
server {
    add_header X-A "1" always;
    add_header X-B "2" always;

    location /foo {
        # inherits X-A and X-B
    }

    location /bar {
        add_header X-C "3" always;
        # does NOT inherit X-A or X-B. Only X-C is sent.
    }
}
```

That is why `spa-locations.conf` repeats headers in each location.

### `if is evil`

In locations, `if` has bizarre behavior with directives other than `return` or `rewrite`. For example:

```nginx
location /foo {
    if ($condition) {
        proxy_pass http://backup;   # may work, may not
    }
    proxy_pass http://primary;
}
```

Can lead to undefined behavior (directive ignored, config leaking between requests, etc). Safe rule: **`if` only with `return` or `rewrite`**. For complex conditionals, use `map` to create a variable and route.

### Resolver and literal `proxy_pass`

Nginx resolves `proxy_pass http://backend:8080;` **once at boot** and caches forever. If `backend`'s IP changes at runtime (container restarts on a different IP), nginx keeps sending to the old IP and you get 502.

Mitigation in Docker Compose:
- Accept restarting nginx together.
- Use a variable: `set $backend "http://backend:8080"; proxy_pass $backend;` forces runtime resolution using `resolver`.
### `listen 443 ssl http2` vs `listen 443 ssl; http2 on;`

Syntax changed in nginx 1.25 (Mar/2023). The new form is `listen 443 ssl;` + separate `http2 on;` directive. The old one still works but emits a warning. This config uses the new form.

### Test before reload

Always run `nginx -t` before applying changes. In a container:

```bash
docker exec <nginx-container> nginx -t
docker exec <nginx-container> nginx -s reload
```

`nginx -t` parses + validates syntax + tries to open certificates and referenced files, without changing the running config. Failures here avoid taking down the server in production.

### Difference between `$host`, `$http_host`, and `$server_name`

- **`$host`** — the `Host:` header *normalized* (lowercase, no port). If no Host came, uses `$server_name`.
- **`$http_host`** — `Host:` exactly as received (case and port preserved). Empty string if none came.
- **`$server_name`** — the `server_name` defined in the block that is serving.
In general use `$http_host` when forwarding to upstream (preserves fidelity) and `$host` to build internal URLs.

### `proxy_pass` with and without path

```nginx
location /api/ {
    proxy_pass http://backend/;          # WITH path (/)
}
# /api/users → http://backend/users
```

```nginx
location /api/ {
    proxy_pass http://backend;           # WITHOUT path
}
# /api/users → http://backend/api/users
```

The presence of a path (even just `/`) makes nginx **replace** the location prefix with the `proxy_pass` path. Without path, the URI goes intact. Common mistake: copy/paste and lose the trailing `/`.

### Closing

This configuration shows a modern pattern of nginx as a multi-purpose reverse proxy: serves SPA, API proxy (with WebSocket, per-endpoint rate limit, upload), object storage proxy (MinIO), and observability proxy (Grafana/Prometheus with extra auth), with basic defenses at every point (HSTS, bot/method/scanner blocking, default catch-all). Each piece is simple in isolation; the combination covers most of what you need in a typical web stack.
