.PHONY: dev install migrate ingest-pdf gen-mcqs test lint

dev:
	docker-compose up

dev-backend:
	cd backend && uvicorn main:app --reload --port 8000

dev-frontend:
	cd frontend && npm run dev

install:
	cd backend && pip install -r requirements.txt
	cd frontend && npm install

migrate:
	@echo "Run these SQL files in order against your Supabase project:"
	@ls backend/migrations/*.sql

test:
	cd backend && pytest tests/ -v

lint:
	cd backend && python -m py_compile main.py routers/*.py services/*.py models/*.py utils/*.py

ingest-pdf:
	@echo "Usage: make ingest-pdf PDF=path/to/file.pdf COURSE=course-id MODULE=module-id TITLE='My Notes'"
	cd pipeline && python ingest_pdf.py $(PDF) $(COURSE) $(MODULE) "$(TITLE)"

gen-mcqs:
	@echo "Usage: make gen-mcqs COURSE=course-id COUNT=5"
	cd pipeline && python generate_mcqs.py $(COURSE) $(COUNT)

ingest-sheet:
	@echo "Usage: make ingest-sheet SHEET=sheet-id"
	cd pipeline && python ingest_sheet.py $(SHEET)

build:
	cd frontend && npm run build
	docker-compose build

setup: install
	cp .env.example .env
	@echo "✅ Project ready. Edit .env with your credentials, then run: make dev"
