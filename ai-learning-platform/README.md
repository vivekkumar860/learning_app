# AI Learning Platform

An AI-powered learning platform with RAG-based tutoring, auto-generated MCQs, role-based access, and file ingestion.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | FastAPI + Python 3.12 |
| Database | Supabase (PostgreSQL + pgvector) |
| File Storage | Supabase Storage |
| AI | Anthropic Claude (chat/MCQ gen) + OpenAI (embeddings) |
| Auth | JWT (access + refresh tokens) |

## Quick Start

```bash
# 1. Clone and enter the project
cd ai-learning-platform

# 2. Install dependencies
make install

# 3. Configure environment
cp .env.example .env
# Edit .env with your Supabase, Anthropic, and OpenAI credentials

# 4. Run database migrations
# Go to Supabase SQL editor and run files in backend/migrations/ in order (001 → 005)

# 5. Start development servers
make dev
# Backend:  http://localhost:8000
# Frontend: http://localhost:5173
# API docs: http://localhost:8000/docs
```

## Roles

| Role | Permissions |
|---|---|
| Student | Browse & enroll in courses, study, take quizzes, suggest content |
| Teacher | All student permissions + create courses, upload materials, review suggestions |
| Admin | All teacher permissions + manage users, change roles |

## Ingestion Pipeline

```bash
# Ingest a PDF into a module
make ingest-pdf PDF=lecture1.pdf COURSE=<course-id> MODULE=<module-id> TITLE="Lecture 1"

# Bulk generate MCQs for a course
make gen-mcqs COURSE=<course-id> COUNT=5

# Import MCQs from a Google Sheet
make ingest-sheet SHEET=<google-sheet-id>
```

## Project Structure

```
ai-learning-platform/
├── backend/          # FastAPI API server
│   ├── routers/      # Route handlers
│   ├── services/     # Business logic (LLM, ingestion, storage)
│   ├── models/       # Pydantic schemas
│   ├── utils/        # Parsers, chunker, auth helpers
│   └── migrations/   # SQL migration files (run in Supabase)
├── frontend/         # React + Vite + Tailwind
│   └── src/
│       ├── pages/    # Route pages by role
│       ├── components/ # Reusable UI components
│       ├── store/    # Zustand state
│       ├── api/      # Axios API wrappers
│       └── hooks/    # Custom hooks
├── pipeline/         # Standalone ingestion & generation scripts
│   └── prompts/      # LLM prompt templates (.txt)
├── docker-compose.yml
├── Makefile
└── .env.example
```

## Environment Variables

See `.env.example` for all required variables.
Key ones:
- `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` — from your Supabase project settings
- `ANTHROPIC_API_KEY` — from console.anthropic.com
- `OPENAI_API_KEY` — for text embeddings
- `JWT_SECRET` — generate with: `python -c "import secrets; print(secrets.token_hex(32))"`
