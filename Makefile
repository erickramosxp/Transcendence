
COMPOSE := docker compose

help:
	@echo "Targets:"
	@echo "  make env        # cria .env a partir do .env.example"
	@echo "  make up         # sobe tudo (db + backend + frontend)"
	@echo "  make down       # derruba tudo"
	@echo "  make restart    # reinicia tudo"
	@echo "  make logs       # logs de todos os serviços"
	@echo "  make backend    # sobe apenas backend + db"
	@echo "  make frontend   # sobe apenas frontend"
	@echo "  make db         # sobe apenas db"
	@echo "  make stop       # para serviços (mantém containers)"
	@echo "  make clean      # remove containers, rede e volumes"
	@echo "  make fclean     # full clean (containers + volumes + .env)"

env:
	@cp -n .env.example .env || true
	@echo ".env pronto. Edite DATABASE_NAME/DATABASE_USER/DATABASE_PASSWORD."

build:
	$(COMPOSE) up --build -d

up:
	$(COMPOSE) up 

down:
	$(COMPOSE) down

restart:
	$(COMPOSE) down
	$(COMPOSE) up --build -d

logs:
	$(COMPOSE) logs -f --tail=200

backend:
	$(COMPOSE) up --build -d database backend

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

.PHONY: help env up down restart logs backend frontend db stop clean fclean
