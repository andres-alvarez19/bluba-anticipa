.PHONY: setup dev mobile api predictor seed-demo demo-reset demo db-up db-down db-migrate typecheck test test-mobile test-demo-web test-api test-model demo-web-build contracts generate generate-check lint eval eval-current-risk smoke-current-risk demo-check

PYTHON ?= $(shell if [ -x .venv/bin/python ]; then printf ./.venv/bin/python; else printf python3; fi)
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
	$(PYTHON) -m bluba_api

predictor:
	$(PYTHON) -m bluba_predictor

seed-demo:
	$(PYTHON) scripts/seed_demo.py

demo-reset: db-up
	$(PYTHON) scripts/prepare_demo_db.py
	$(PYTHON) scripts/seed_demo.py

demo: demo-reset
	BLUBA_DEMO_PYTHON=$(PYTHON) bash scripts/run_demo.sh

db-up:
	docker compose up -d postgres

db-down:
	docker compose down

db-migrate:
	cd services/api && $(ALEMBIC) upgrade head

typecheck:
	npm --workspace apps/mobile exec -- tsc --noEmit
	npm --workspace packages/api-client run typecheck
	npm --workspace apps/demo-web run typecheck

test:
	npm test
	npm --workspace packages/api-client run test
	npm --workspace apps/demo-web run test
	$(PYTHON) -m pytest -q

test-mobile:
	npm --workspace apps/mobile run test

test-demo-web:
	npm --workspace apps/demo-web run test

demo-web-build:
	npm --workspace apps/demo-web run build

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
	npm --workspace apps/demo-web run lint
	$(PYTHON) scripts/lint_python.py

eval:
	$(MAKE) eval-current-risk

eval-current-risk:
	$(PYTHON) scripts/eval_current_risk.py

smoke-current-risk:
	$(PYTHON) scripts/smoke_current_risk.py

demo-check:
	$(MAKE) contracts
	$(MAKE) generate-check
	$(MAKE) typecheck
	$(MAKE) test
	$(MAKE) eval
	$(MAKE) lint
	$(MAKE) demo-web-build
