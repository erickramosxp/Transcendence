
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
	@echo "  make up            # Iniciar todos os serviços"
	@echo ""
	@echo "🐳 Containers:"
	@echo "  make backend       # Backend (Java/Quarkus) + Database"
	@echo "  make frontend      # Frontend (React/Vite)"
	@echo "  make db            # Apenas Database (PostgreSQL)"
	@echo "  make ps            # Listar containers rodando"
	@echo ""
	@echo "⚙️  Controle:"
	@echo "  make down          # Parar todos os serviços"
	@echo "  make stop          # Pausar serviços (mantém containers)"
	@echo "  make restart       # Reiniciar todos os serviços"
	@echo "  make logs          # Ver logs em tempo real"
	@echo ""
	@echo "🧹 Limpeza:"
	@echo "  make clean         # Remove containers, rede e volumes"
	@echo "  make fclean        # Limpeza completa (+ prune + .env)"
	@echo "  make re            # Rebuild completo (fclean + build)"
	@echo ""
	@echo "📋 URLs:"
	@echo "  Backend:  http://localhost:8080"
	@echo "  Frontend: http://localhost:5173"
	@echo "  Database: localhost:5433"

env:
	@cp -n .env.example .env || true
	@echo ".env pronto. Edite DATABASE_NAME/DATABASE_USER/DATABASE_PASSWORD."

build:
	$(COMPOSE) up --build -d

up:
	$(COMPOSE) up

down:
	$(COMPOSE) down

down_dev:
	$(COMPOSE_DEV) down

restart:
	$(COMPOSE) down
	$(COMPOSE) up --build -d

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

db:
	$(COMPOSE) up --build -d database

stop:
	$(COMPOSE) stop

clean:
	$(COMPOSE) down --volumes --remove-orphans

fclean:
	$(COMPOSE) down --volumes --remove-orphans
	docker system prune -af
	rm -f .env

re: fclean build

ps:
	@docker ps --filter "label=com.docker.compose.project=transcendence" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

.PHONY: help env up down restart logs backend frontend db stop clean fclean re build ps re build ps
