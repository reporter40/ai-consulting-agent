# Technical Handoff Report — AI Consulting Agent

**Статус проекта**: Фазы 1-7 завершены, ведётся TIER 1-4 доработки  
**Live**: https://ai-consulting-agent.vercel.app/dashboard  
**Дата**: 2026-04-08

## 1. Исполнительное резюме

✅ **Завершено:**
- Frontend (Next.js 14) + Backend (FastAPI) развёрнуты на production
- Все 7 фаз разработки завершены (диагностика, гипотезы, отчёты, граф знаний)
- P5-P9 интегрированы: артефакты, граф, IQD, workflow UX

❌ **Блокеры для MVP:**
- Auth/RBAC не реализована
- Job queue отсутствует (отчёты генерируются sync)
- Error states неполные

## 2. Реализованный функционал

### Frontend (Next.js)
**Файлы**:
- `frontend/src/app/dashboard/[projectId]/page.tsx` — главная страница проекта
- `frontend/src/components/dashboard/` — все панели (workflow, diagnostic, hypotheses, artifacts, graph, iqd)
- `frontend/src/lib/api.ts` — API клиент со всеми endpoints
- `frontend/src/lib/api-types.ts` — TypeScript типы

**Панели**:
| Компонент | Файл | Функциональность |
|-----------|------|------------------|
| Workflow | workflow-panel.tsx | Polling 5s, HITL approve/reject |
| Diagnostic Chat | diagnostics-panel.tsx | EventSource SSE, streaming |
| Hypotheses | hypothesis-panel.tsx | CRUD, verify, voting |
| Artifacts | artifacts-panel.tsx | List, filter, sort, detail, delete |
| Graph | graph-panel.tsx | KG status, metrics, verify-all |
| IQD | iqd-panel.tsx | Score 0-100%, breakdown, recommendations |

### Backend (FastAPI)
**Структура**:
```
backend/app/
├── main.py — FastAPI app + error handling
├── exceptions.py — AppError с status_code support
├── models.py — ORM models
├── schemas/ — Pydantic schemas
├── api/ — все endpoints
│   ├── projects.py
│   ├── workflow.py — POST /confirm, GET /events
│   ├── diagnostic.py — GET /stream (EventSource)
│   ├── hypotheses.py — CRUD endpoints
│   ├── artifacts.py — CRUD + list with filtering
│   ├── knowledge_graph.py — GET /status (503 on error)
│   ├── iqd.py — GET /{project_id}
│   └── report.py
└── services/ — бизнес-логика
```

**Ключевые endpoints**:
- `GET/POST /api/projects/{id}` — CRUD проектов
- `GET /api/projects/{id}/workflow` — workflow status
- `POST /api/projects/{id}/workflow/confirm` — HITL (approve/reject)
- `GET /api/projects/{id}/diagnostic/stream` — SSE диагностики
- `GET/POST/PATCH/DELETE /api/projects/{id}/hypotheses` — CRUD
- `GET/POST/PATCH/DELETE /api/projects/{id}/artifacts` — CRUD
- `GET /api/knowledge-graph/status` — KG status (503 on error)
- `POST /api/projects/{id}/hypotheses/verify-all` — batch verify
- `GET /api/projects/{id}/iqd` — aggregate quality score

**Error handling**:
```json
{
  "error": {
    "code": "string",
    "message": "string",
    "detail": "optional"
  }
}
```

## 3. Архитектурные решения

**Стек**:
| Слой | Технология |
|------|-----------|
| Frontend | Next.js 14 (App Router) + React + Zustand + Tailwind |
| Backend | FastAPI + SQLAlchemy (async) + Pydantic |
| Database | PostgreSQL (Neon) |
| Cache/Queue | Redis (Upstash) |
| Knowledge Graph | Neo4j Aura Free |
| LLM Orchestration | LangGraph |
| Deployment | Vercel (frontend) + Render/Docker (backend) |

**Request flow**:
```
Browser → Next.js (Vercel) → [rewrite] → FastAPI (Render) → PostgreSQL + Redis + Neo4j
```

## 4. Известные ошибки и TODO

| Проблема | Статус | Действие |
|----------|--------|---------|
| Auth/RBAC | ⚠️ Блокер | TIER 1: Clerk integration |
| Job queue | ⚠️ Блокер | TIER 2: Arq + Redis |
| Error states | ⚠️ Блокер | TIER 2: error boundaries |
| Idempotency | ⚠️ Блокер | TIER 2: Idempotency-Key header |
| KgStatusBar 503 handling | 🟡 Дублирование | Унифицировать с GraphPanel |
| History IQD "во времени" | 🟡 Временное | Добавить iqd_history таблицу |
| Дубли тестов KG | 🟡 Tech debt | Объединить test_kg_api.py |
| Metrics/Traces | 🔵 Future | TIER 4: Prometheus + OpenTelemetry |
| E2E tests | 🔵 Future | TIER 4: Playwright smoke tests |

## 5. Next Steps (приоритет)

### НЕДЕЛЯ 1: TIER 1 — Auth & RBAC
- [ ] Выбрать auth (Clerk recommended)
- [ ] Backend: @require_auth middleware
- [ ] Backend: Project.owner_id + members RBAC
- [ ] Frontend: Login/Logout UI
- [ ] Test: Team of 3 can log in independently

### НЕДЕЛЯ 2: TIER 2 — Job Queue & Error Handling
- [ ] Backend: Arq setup + Redis
- [ ] Migrate report generation to job queue
- [ ] Idempotency-Key header support
- [ ] Frontend: Robust error states (all panels)
- [ ] Test: No duplicate reports on retry

### НЕДЕЛЯ 3: TIER 3 — Artifacts & Observability
- [ ] Frontend: Artifact detail view + download
- [ ] Backend: Structured logging (JSON)
- [ ] Frontend: Multi-option workflow transitions
- [ ] Test: Full artifact lifecycle

### НЕДЕЛЯ 4: TIER 4 — Deployment & Polish
- [ ] Fix git remote + push
- [ ] E2E Playwright smoke test
- [ ] Vercel/Render deployment verify
- [ ] Live smoke test

## 6. Команды для старта

```bash
# Войти в проект
cd "/Users/Orlova/Desktop/_ИИ-ПРОЕКТЫ/ИИ проекты/ИИ консультирование/project_docs/ai-consulting-agent"

# Git
git status -sb
git log -5 --oneline
git remote -v

# Backend (локально)
cd backend && source .venv/bin/activate
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# Frontend (локально)
cd ../frontend && BACKEND_URL=http://localhost:8000 npm run dev

# Тесты
cd ../backend && python -m pytest -v

# Production build
cd ../frontend && npm run build
```

## 7. Critical URLs

- **Live**: https://ai-consulting-agent.vercel.app/dashboard
- **GitHub**: https://github.com/reporter40/ai-consulting-agent.git
- **Auth**: https://clerk.com (recommended)
- **Database**: https://neon.tech (PostgreSQL free)
- **Redis**: https://upstash.com (free)
- **Knowledge Graph**: https://neo4j.com/cloud/aura (free)

## 8. Структура repo

```
ai-consulting-agent/
├── backend/ — FastAPI app
├── frontend/ — Next.js app
├── kg/ — Knowledge Graph seed
├── infra/ — Nginx config
├── scripts/ — utilities
├── docker-compose.yml
├── MVP_ROADMAP.md — 4-week plan
├── USER_STORIES_AND_FLOWS.md — scenarios + UI
└── TECHNICAL_HANDOFF_REPORT.md — этот документ
```

---

**Версия**: 1.0  
**Дата**: 2026-04-08  
**Автор**: AI Consulting Agent development session

Этот документ готов к передаче следующему разработчику или ИИ-агенту.
