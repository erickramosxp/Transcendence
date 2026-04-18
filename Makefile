
COMPOSE := docker compose

COMPOSE_DEV := docker compose -f docker-compose_dev.yml

help:
	@echo "╔════════════════════════════════════════════════════════════╗"
	@echo "║           Transcendence - Makefile Commands                ║"
	@echo "╚════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "🚀 Primeiros passos:"
	@echo "  make env           # Criar .env a partir do .env.example"
	@echo "  make build         # Build das imagens Docker"
	@echo "  make build_dev     # Build das imagens Docker do ambiente de desenvolvimento"
	@echo "  make up            # Iniciar todos os serviços"
	@echo "  make up_dev        # Iniciar todos os serviços no ambiente de desenvolvimento"
	@echo ""
	@echo "🐳 Containers:"
	@echo "  make backend       # Backend (Java/Quarkus) + Database(supabase)"
	@echo "  make backend_dev   # Backend (Java/Quarkus) + Database(local) ambiente de desenvolvimento"
	@echo "  make frontend      # Nginx + SPA estática (prod; build em nginx/)"
	@echo "  make db            # Apenas Database (PostgreSQL)"
	@echo "  make ps            # Listar containers rodando"
	@echo ""
	@echo "⚙️  Controle:"
	@echo "  make down          # Parar todos os serviços"
	@echo "  make down_dev      # Parar todos os serviços de dev"
	@echo "  make stop          # Pausar serviços (mantém containers)"
	@echo "  make stop_dev      # Pauser serviços de dev"
	@echo "  make restart       # Reiniciar todos os serviços"
	@echo "  make restart_dev   # Reiniciar todos os serviços no ambiente dev"
	@echo "  make logs          # Ver logs em tempo real"
	@echo "  make logs_dev      # Ver logs do ambiente de desenvolvimento"
	@echo ""
	@echo "🧹 Limpeza:"
	@echo "  make clean         # Remove containers e redes"
	@echo "  make clean_dev     # Remove containers, rede e volumes do ambiente dev"
	@echo "  make fclean        # Limpeza completa (+ prune)"
	@echo "  make fclean_dev    # Limpeza completa (+ prune) do ambiente dev"
	@echo "  make re            # Rebuild completo (fclean + build)"
	@echo "  make re_dev        # Rebuild completo (fclean + build) em ambiente dev"
	@echo ""
	@echo "📋 URLs (dependem do ambiente):"
	@echo "  make build / up     → prod: site :80/:443, API só em /api (backend sem porta pública)"
	@echo "  make build_dev      → dev:  Frontend http://localhost:5173 (Vite), Backend :8080"
	@echo "  Database (prod): Supabase pooler (ver .env)"

env:
	@cp -n .env.example .env || true
	@echo ".env pronto. Edite as variáveis de ambiente conforme necessário."

build:
	@mkdir -p ~/minio/data
	$(COMPOSE) up --build -d

build_dev:
	@mkdir -p ~/minio/data
	$(COMPOSE_DEV) up --build -d

up:
	@mkdir -p ~/minio/data
	$(COMPOSE) up -d

up_dev:
	@mkdir -p ~/minio/data
	$(COMPOSE_DEV) up -d

down:
	$(COMPOSE) down

down_dev:
	$(COMPOSE_DEV) down

restart:
	$(COMPOSE) down
	$(COMPOSE) up --build -d

restart_dev:
	$(COMPOSE_DEV) down
	$(COMPOSE_DEV) up --build -d

logs:
	$(COMPOSE) logs -f --tail=200

logs_dev:
	$(COMPOSE_DEV) logs -f --tail=200

backend:
	$(COMPOSE) up --build -d backend

backend_dev:
	$(COMPOSE_DEV) up -d database_dev backend_dev

backend-clean:
	sudo rm -rf backend/target backend/.quarkus

frontend:
	$(COMPOSE) up --build -d nginx

stop:
	$(COMPOSE) stop

stop_dev:
	$(COMPOSE_DEV) stop

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

.PHONY: help env build build_dev up up_dev down down_dev restart restart_dev logs logs_dev backend backend_dev frontend stop stop_dev clean clean_dev fclean fclean_dev re re_dev ps env
