COMPOSE     := docker compose
COMPOSE_DEV := docker compose -f docker-compose_dev.yml

-include .env
export

# --- Grupos de serviços ---
DEV_SERVICES         := database_dev minio-dev backend_dev frontend_dev
DEV_PROXY_SERVICES   := database_dev minio-dev backend_dev nginx_dev
DEV_BACKEND_SERVICES := database_dev minio-dev backend_dev
MONITOR_SERVICES     := prometheus grafana alertmanager

# ============================================================
#  HELP
# ============================================================
help:
	@echo "╔════════════════════════════════════════════════════════════╗"
	@echo "║           Transcendence - Makefile Commands                ║"
	@echo "╚════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "🚀 Primeiros passos:"
	@echo "  make env                 # Criar .env a partir do .env.example"
	@echo "  make build               # Build + sobe prod (app)"
	@echo "  make build_dev           # Build + sobe dev (Vite + backend)"
	@echo "  make build_dev_proxy     # Build + sobe dev com nginx"
	@echo ""
	@echo "⬆️  Subir serviços:"
	@echo "  make up                  # Sobe prod (app)"
	@echo "  make up_dev              # Sobe dev (Vite + backend)"
	@echo "  make up_dev_proxy        # Sobe dev com nginx"
	@echo "  make up_dev_full         # Sobe dev completo (app + monitoramento)"
	@echo "  make up_metrics          # Sobe monitoramento dev (app já deve estar rodando)"
	@echo "  make up_full             # Sobe prod completo (app + monitoramento)"
	@echo "  make up_metrics_prod     # Sobe monitoramento prod (app já deve estar rodando)"
	@echo ""
	@echo "⬇️  Derrubar serviços:"
	@echo "  make down                # Derruba prod (tudo)"
	@echo "  make down_dev            # Derruba dev (tudo)"
	@echo "  make down_dev_proxy      # Derruba dev proxy"
	@echo "  make down_metrics        # Derruba monitoramento dev (mantém app)"
	@echo "  make down_metrics_prod   # Derruba monitoramento prod (mantém app)"
	@echo ""
	@echo "🐳 Serviços individuais:"
	@echo "  make backend             # Backend prod"
	@echo "  make backend_dev         # Backend dev + banco + minio"
	@echo "  make backend_dev_proxy   # Backend dev + nginx"
	@echo "  make frontend            # Nginx prod (SPA estática)"
	@echo "  make db                  # Apenas banco de dados dev"
	@echo ""
	@echo "⚙️  Controle:"
	@echo "  make stop                # Pausa prod (mantém containers)"
	@echo "  make stop_dev            # Pausa dev"
	@echo "  make stop_dev_proxy      # Pausa dev proxy"
	@echo "  make stop_metrics        # Pausa monitoramento dev"
	@echo "  make stop_metrics_prod   # Pausa monitoramento prod"
	@echo "  make restart             # Reinicia prod"
	@echo "  make restart_dev         # Reinicia dev"
	@echo "  make restart_dev_proxy   # Reinicia dev proxy"
	@echo ""
	@echo "📋 Logs:"
	@echo "  make logs                # Logs prod"
	@echo "  make logs_dev            # Logs dev"
	@echo "  make logs_dev_proxy      # Logs dev proxy"
	@echo "  make logs_metrics        # Logs monitoramento dev"
	@echo "  make logs_metrics_prod   # Logs monitoramento prod"
	@echo "  make ps                  # Lista containers"
	@echo ""
	@echo "🧹 Limpeza:"
	@echo "  make clean               # Remove containers + volumes prod"
	@echo "  make clean_dev           # Remove containers + volumes dev"
	@echo "  make fclean              # Limpeza total prod (+ docker prune)"
	@echo "  make fclean_dev          # Limpeza total dev (+ docker prune)"
	@echo "  make re                  # Rebuild completo prod"
	@echo "  make re_dev              # Rebuild completo dev"
	@echo "  make backend-clean       # Remove target/ do backend"
	@echo ""
	@echo "📋 URLs:"
	@echo "  Dev (Vite)    → http://localhost:5173"
	@echo "  Dev (Nginx)   → http://localhost:8081"
	@echo "  Backend       → http://localhost:8080"
	@echo "  MinIO Console → http://localhost:9001"
	@echo "  Grafana       → http://localhost:3001"
	@echo "  Prometheus    → http://localhost:9090"
	@echo "  Alertmanager  → http://localhost:9093"

# ============================================================
#  SETUP
# ============================================================
env:
	@cp -n .env.example .env || true
	@echo ".env criado. Edite as variáveis conforme necessário."

# ============================================================
#  BUILD + UP
# ============================================================
build:
	@mkdir -p $(POSTGRES_DIR)
	$(COMPOSE) up --build -d

build_dev:
	$(COMPOSE_DEV) up --build -d $(DEV_SERVICES)

build_dev_proxy:
	$(COMPOSE_DEV) up --build -d $(DEV_PROXY_SERVICES)

# ============================================================
#  UP
# ============================================================
up:
	@mkdir -p $(POSTGRES_DIR)
	$(COMPOSE) up -d

up_dev:
	$(COMPOSE_DEV) up -d $(DEV_SERVICES)

up_dev_proxy:
	$(COMPOSE_DEV) up -d $(DEV_PROXY_SERVICES)

# Sobe dev completo: app + monitoramento de uma vez
up_dev_full:
	$(COMPOSE_DEV) up -d $(DEV_SERVICES) $(MONITOR_SERVICES)

# Sobe só monitoramento dev (assume que a app já está no ar)
up_metrics:
	$(COMPOSE_DEV) up -d $(MONITOR_SERVICES)

# Sobe prod completo: app + monitoramento de uma vez
up_full:
	mkdir -p $(POSTGRES_DIR)
	$(COMPOSE) up -d

# Sobe só monitoramento prod (assume que a app já está no ar)
up_metrics_prod:
	$(COMPOSE) up -d $(MONITOR_SERVICES)

# ============================================================
#  DOWN
# ============================================================
down:
	$(COMPOSE) down

down_dev:
	$(COMPOSE_DEV) down

down_dev_proxy:
	$(COMPOSE_DEV) down $(DEV_PROXY_SERVICES)

# Derruba só monitoramento dev, mantém a app rodando
down_metrics:
	$(COMPOSE_DEV) stop $(MONITOR_SERVICES)
	$(COMPOSE_DEV) rm -f $(MONITOR_SERVICES)

# Derruba só monitoramento prod, mantém a app rodando
down_metrics_prod:
	$(COMPOSE) stop $(MONITOR_SERVICES)
	$(COMPOSE) rm -f $(MONITOR_SERVICES)

# ============================================================
#  STOP
# ============================================================
stop:
	$(COMPOSE) stop

stop_dev:
	$(COMPOSE_DEV) stop $(DEV_SERVICES)

stop_dev_proxy:
	$(COMPOSE_DEV) stop $(DEV_PROXY_SERVICES)

stop_metrics:
	$(COMPOSE_DEV) stop $(MONITOR_SERVICES)

stop_metrics_prod:
	$(COMPOSE) stop $(MONITOR_SERVICES)

# ============================================================
#  RESTART
# ============================================================
restart:
	$(COMPOSE) down
	$(COMPOSE) up --build -d

restart_dev:
	$(COMPOSE_DEV) stop $(DEV_SERVICES)
	$(COMPOSE_DEV) up --build -d $(DEV_SERVICES)

restart_dev_proxy:
	$(COMPOSE_DEV) stop $(DEV_PROXY_SERVICES)
	$(COMPOSE_DEV) up --build -d $(DEV_PROXY_SERVICES)

# ============================================================
#  LOGS
# ============================================================
logs:
	$(COMPOSE) logs -f --tail=200

logs_dev:
	$(COMPOSE_DEV) logs -f --tail=200 $(DEV_SERVICES)

logs_dev_proxy:
	$(COMPOSE_DEV) logs -f --tail=200 $(DEV_PROXY_SERVICES)

logs_metrics:
	$(COMPOSE_DEV) logs -f --tail=200 $(MONITOR_SERVICES)

logs_metrics_prod:
	$(COMPOSE) logs -f --tail=200 $(MONITOR_SERVICES)

# ============================================================
#  SERVIÇOS INDIVIDUAIS
# ============================================================
backend:
	$(COMPOSE) up --build -d backend

backend_dev:
	$(COMPOSE_DEV) up -d $(DEV_BACKEND_SERVICES)

backend_dev_proxy:
	$(COMPOSE_DEV) up -d database_dev minio-dev backend_dev nginx_dev

backend-clean:
	sudo rm -rf backend/target backend/.quarkus

frontend:
	$(COMPOSE) up --build -d nginx

db:
	$(COMPOSE_DEV) up -d database_dev

# ============================================================
#  STATUS
# ============================================================
ps:
	@echo "=== Produção (transcendence-prod) ==="
	@$(COMPOSE) ps -a
	@echo ""
	@echo "=== Desenvolvimento ==="
	@$(COMPOSE_DEV) ps -a

# ============================================================
#  LIMPEZA
# ============================================================
clean:
	$(COMPOSE) down --volumes --remove-orphans

clean_dev:
	$(COMPOSE_DEV) down --volumes --remove-orphans

fclean:
	$(COMPOSE) down --volumes --remove-orphans
	docker system prune -af

fclean_dev:
	$(COMPOSE_DEV) down --volumes --remove-orphans
	docker system prune -af

re: fclean build

re_dev: fclean_dev build_dev

# ============================================================
.PHONY: help env \
	build build_dev build_dev_proxy \
	up up_dev up_dev_proxy up_dev_full up_metrics up_full up_metrics_prod \
	down down_dev down_dev_proxy down_metrics down_metrics_prod \
	stop stop_dev stop_dev_proxy stop_metrics stop_metrics_prod \
	restart restart_dev restart_dev_proxy \
	logs logs_dev logs_dev_proxy logs_metrics logs_metrics_prod \
	backend backend_dev backend_dev_proxy backend-clean frontend db \
	ps clean clean_dev fclean fclean_dev re re_dev
