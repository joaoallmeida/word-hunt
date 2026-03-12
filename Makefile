# Makefile for Docker environments

.PHONY: build up down logs ps rebuild

build:
	@echo "🚧 Building image..."
	docker build --rm --no-cache -f docker/Dockerfile -t wordhunt:latest .
	docker builder prune -f

up:
	@echo "🚀 Starting environment..."
	docker compose -f docker/compose.yml up -d

down:
	@echo "🧹 Stopping environment..."
	docker compose -f docker/compose.yml down -v

rebuild: down build up

deploy: build up

destroy: down
	docker rmi wordhunt:latest
	docker builder prune -f
