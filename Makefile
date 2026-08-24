# ==============================================================================
# AI Social Media Automation - Developer & Operations Makefile
# ==============================================================================

.PHONY: help dev workers test setup build lint typecheck docker-build docker-up docker-down monitor k8s-deploy backup restore vacuum clean

help:
	@echo "Available commands:"
	@echo "  make dev           Start Next.js dev server"
	@echo "  make workers       Start BullMQ background workers"
	@echo "  make test          Run all unit and integration test suites"
	@echo "  make typecheck     Run TypeScript compiler with 8GB heap"
	@echo "  make lint          Run ESLint"
	@echo "  make setup         Run Prisma client generation & migration deploy"
	@echo "  make build         Build Next.js production standalone bundle"
	@echo "  make docker-build  Build multi-stage Docker images (app & worker)"
	@echo "  make docker-up     Start production Docker Compose stack"
	@echo "  make docker-down   Stop production Docker Compose stack"
	@echo "  make monitor       Launch Prometheus, Grafana, Alertmanager & Loki"
	@echo "  make k8s-deploy    Deploy production stack to Kubernetes via Kustomize"
	@echo "  make backup        Run automated gzip database backup"
	@echo "  make vacuum        Run PostgreSQL maintenance & autovacuum"
	@echo "  make clean         Remove build artifacts and temporary caches"

dev:
	bun run dev

workers:
	bun run workers

test:
	npm test && bun test

typecheck:
	node --max-old-space-size=8192 ./node_modules/typescript/bin/tsc --noEmit

lint:
	npm run lint

setup:
	bun run setup

build:
	npm run build

docker-build:
	docker build --target runner -t social-automation-app:latest .
	docker build --target worker -t social-automation-worker:latest .

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

monitor:
	docker-compose -f docker-compose.monitoring.yml up -d

monitor-down:
	docker-compose -f docker-compose.monitoring.yml down

k8s-deploy:
	kubectl apply -k infrastructure/kubernetes/overlays/production/

backup:
	./scripts/backup-db.sh ./backups/postgres

vacuum:
	./scripts/vacuum-db.sh

clean:
	rm -rf .next dist coverage
