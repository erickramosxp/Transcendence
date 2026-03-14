
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
	@echo "  make frontend      # Frontend (React/Vite)"
	@echo "  make db            # Apenas Database (PostgreSQL)"
	@echo "  make ps            # Listar containers rodando"
	@echo ""
	@echo "⚙️  Controle:"
	@echo "  make down          # Parar todos os serviços"
	@echo "  make down_dev      # Parar todos os serviços de dev"
	@echo "  make stop          # Pausar serviços (mantém containers)"
	@echo "  make stop_dev      # Pauser serviços de dev"
	@echo "  make restart       # Reiniciar todos os serviços"
	@echo "  mkae restart_dev   # Reiniciar todos os serviços no ambiente dev"
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
	@echo "📋 URLs:"
	@echo "  Backend:  http://localhost:8080"
	@echo "  Frontend: http://localhost:5173"
	@echo "  Database: aws-1-us-east-1.pooler.supabase.com:5432"

env:
	@cp -n .env.example .env || true
	@echo ".env pronto. Edite DATABASE_NAME/DATABASE_USER/DATABASE_PASSWORD."

build:
	$(COMPOSE) up --build -d

build_dev:
	$(COMPOSE_DEV) up --build -d

up:
	$(COMPOSE) up -d

uo_dev:
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
	$(COMPOSE) up --build -d frontend

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
	@docker ps --filter "label=com.docker.compose.project=transcendence" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

.PHONY: help env up down restart logs backend frontend db stop clean fclean re build ps re build ps
