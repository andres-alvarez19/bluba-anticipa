.PHONY: setup dev mobile api predictor db-up db-down db-migrate typecheck test test-mobile test-api test-model contracts generate generate-check lint eval

PYTHON ?= python3
PIP ?= $(PYTHON) -m pip
ALEMBIC ?= $(shell if command -v alembic >/dev/null 2>&1; then command -v alembic; elif [ -x .venv/bin/alembic ]; then printf '../../.venv/bin/alembic'; else printf alembic; fi)

setup:
	npm install
	$(PIP) install -e services/predictor -e services/api

dev:
	@echo "Use 'make mobile' and 'make api' in separate terminals."

mobile:
	npm --workspace apps/mobile run start

api:
	$(PYTHON) -m services.api

predictor:
	$(PYTHON) -m bluba_predictor

db-up:
	docker compose up -d postgres

db-down:
	docker compose down

db-migrate:
	cd services/api && $(ALEMBIC) upgrade head

typecheck:
	npm --workspace apps/mobile exec -- tsc --noEmit

test:
	npm test
	$(PYTHON) -m pytest -q

test-mobile:
	npm --workspace apps/mobile run test

test-api:
	$(PYTHON) -m pytest -q services/api tests/integration/api

test-model:
	$(PYTHON) -m pytest -q services/predictor tests/model

contracts:
	$(PYTHON) scripts/validate_contracts.py

generate:
	npm run generate

generate-check:
	npm run generate:check

lint:
	npm run lint
	$(PYTHON) scripts/lint_python.py

eval:
	@echo "No model evals are implemented in BOOTSTRAP-01."
