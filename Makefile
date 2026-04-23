COMPOSE := docker compose
COMPOSE_DEV := docker compose -f docker-compose_dev.yml

DEV_SERVICES := database_dev minio-dev backend_dev frontend_dev
DEV_PROXY_SERVICES := database_dev minio-dev backend_dev nginx_dev
DEV_BACKEND_SERVICES := database_dev minio-dev backend_dev

help:
	@echo "╔════════════════════════════════════════════════════════════╗"
	@echo "║           Transcendence - Makefile Commands                ║"
	@echo "╚════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "🚀 Primeiros passos:"
	@echo "  make env               # Criar .env a partir do .env.example"
	@echo "  make build             # Build das imagens Docker"
	@echo "  make build_dev         # Build das imagens Docker do ambiente de desenvolvimento"
	@echo "  make build_dev_proxy   # Build do ambiente dev com nginx para testar proxy/websocket"
	@echo "  make up                # Iniciar todos os serviços"
	@echo "  make up_dev            # Iniciar ambiente dev antigo (Vite + backend)"
	@echo "  make up_dev_proxy      # Iniciar ambiente dev com nginx proxy"
	@echo ""
	@echo "🐳 Containers:"
	@echo "  make backend           # Backend (Java/Quarkus) + Database(supabase)"
	@echo "  make backend_dev       # Backend (Java/Quarkus) + Database(local) ambiente de desenvolvimento"
	@echo "  make backend_dev_proxy # Backend dev + nginx dev"
	@echo "  make frontend          # Nginx + SPA estática (prod; build em nginx/)"
	@echo "  make db               # Apenas Database (PostgreSQL)"
	@echo "  make ps               # Listar containers rodando"
	@echo ""
	@echo "⚙️  Controle:"
	@echo "  make down             # Parar todos os serviços"
	@echo "  make down_dev         # Parar todos os serviços de dev"
	@echo "  make down_dev_proxy   # Parar os serviços do dev proxy"
	@echo "  make stop             # Pausar serviços (mantém containers)"
	@echo "  make stop_dev         # Pausar serviços de dev"
	@echo "  make stop_dev_proxy   # Pausar serviços do dev proxy"
	@echo "  make restart          # Reiniciar todos os serviços"
	@echo "  make restart_dev      # Reiniciar ambiente dev antigo"
	@echo "  make restart_dev_proxy # Reiniciar ambiente dev proxy"
	@echo "  make logs             # Ver logs em tempo real"
	@echo "  make logs_dev         # Ver logs do ambiente de desenvolvimento"
	@echo "  make logs_dev_proxy   # Ver logs do ambiente dev proxy"
	@echo ""
	@echo "🧹 Limpeza:"
	@echo "  make clean            # Remove containers e redes"
	@echo "  make clean_dev        # Remove containers, rede e volumes do ambiente dev"
	@echo "  make fclean           # Limpeza completa (+ prune)"
	@echo "  make fclean_dev       # Limpeza completa (+ prune) do ambiente dev"
	@echo "  make re               # Rebuild completo (fclean + build)"
	@echo "  make re_dev           # Rebuild completo (fclean + build) em ambiente dev"
	@echo ""
	@echo "📋 URLs (dependem do ambiente):"
	@echo "  make build / up       → prod: site :80/:443, API só em /api (backend sem porta pública)"
	@echo "  make up_dev           → dev: Frontend http://localhost:5173 (Vite), Backend :8080"
	@echo "  make up_dev_proxy     → dev proxy: Nginx http://localhost:8081, Backend via proxy"
	@echo "  Database (prod): Supabase pooler (ver .env)"

env:
	@cp -n .env.example .env || true
	@echo ".env pronto. Edite as variáveis de ambiente conforme necessário."

build:
	@mkdir -p ~/minio/data
	$(COMPOSE) up --build -d

build_dev:
	@mkdir -p ~/minio/data
	$(COMPOSE_DEV) up --build -d $(DEV_SERVICES)

build_dev_proxy:
	@mkdir -p ~/minio/data
	$(COMPOSE_DEV) up --build -d $(DEV_PROXY_SERVICES)

up:
	@mkdir -p ~/minio/data
	$(COMPOSE) up -d

up_dev:
	@mkdir -p ~/minio/data
	$(COMPOSE_DEV) up -d $(DEV_SERVICES)

up_dev_proxy:
	@mkdir -p ~/minio/data
	$(COMPOSE_DEV) up -d $(DEV_PROXY_SERVICES)

down:
	$(COMPOSE) down

down_dev:
	$(COMPOSE_DEV) down

down_dev_proxy:
	$(COMPOSE_DEV) stop $(DEV_PROXY_SERVICES)

restart:
	$(COMPOSE) down
	$(COMPOSE) up --build -d

restart_dev:
	$(COMPOSE_DEV) up --build -d $(DEV_SERVICES)

restart_dev_proxy:
	$(COMPOSE_DEV) up --build -d $(DEV_PROXY_SERVICES)

logs:
	$(COMPOSE) logs -f --tail=200

logs_dev:
	$(COMPOSE_DEV) logs -f --tail=200 $(DEV_SERVICES)

logs_dev_proxy:
	$(COMPOSE_DEV) logs -f --tail=200 $(DEV_PROXY_SERVICES)

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

stop:
	$(COMPOSE) stop

stop_dev:
	$(COMPOSE_DEV) stop $(DEV_SERVICES)

stop_dev_proxy:
	$(COMPOSE_DEV) stop $(DEV_PROXY_SERVICES)

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

ps:
	@echo "=== Produção (name: transcendence-prod) ==="
	@$(COMPOSE) ps -a
	@echo ""
	@echo "=== Desenvolvimento (docker-compose_dev.yml; projeto = pasta) ==="
	@$(COMPOSE_DEV) ps -a

.PHONY: help env build build_dev build_dev_proxy up up_dev up_dev_proxy down down_dev down_dev_proxy restart restart_dev restart_dev_proxy logs logs_dev logs_dev_proxy backend backend_dev backend_dev_proxy frontend stop stop_dev stop_dev_proxy clean clean_dev fclean fclean_dev re re_dev ps env