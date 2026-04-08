# MVP Roadmap — Full Consulting Agent (Multi-user + Observability)

План доработок для запуска полнофункционального AI Consulting Agent для команды консультантов.

## TIER 1: Критические блокеры (Auth + RBAC)

### 1.1 Аутентификация и авторизация
- **Компонент**: Clerk (или Auth0) + FastAPI middleware
- **Фронт**: Login/logout UI, auth guard на `/dashboard`
- **Бэк**: 
  - `@require_auth` декоратор для всех API endpoints
  - RBAC: `user_role` (admin/analyst/viewer) на уровне проекта
  - Фильтрация проектов по `user_id` в `/api/projects`
- **Оценка**: ~3–4 дня

### 1.2 API для управления доступом
- `POST /api/projects/{id}/members` — добавить user в проект
- `DELETE /api/projects/{id}/members/{user_id}` — удалить доступ
- `GET /api/projects/{id}/members` — список пользователей проекта
- **Оценка**: ~1 день

## TIER 2: Надёжность (Job Queue + Idempotency)

### 2.1 Job Queue (Arq + Redis)
- **Setup**: Arq worker, очередь `diagnostic`, `report`, `hypothesis_verify`
- **Endpoints**:
  - `POST /api/projects/{id}/report/generate` → job_id (204 Accepted)
  - `GET /api/jobs/{job_id}` → status, result, error
- **Оценка**: ~2–3 дня

### 2.2 Idempotency + Deduplication
- Idempotency key в header (`Idempotency-Key`) + Redis cache
- Critical операции: POST /report, POST /hypotheses/verify-all, PATCH /workflow/confirm
- **Оценка**: ~1 день

### 2.3 Robust error states в UI
- Workflow, IQD, hypotheses, artifacts панели показывают:
  - Loading spinner
  - Success state
  - Error message + retry button
  - Timeout handling (5s × 3 retries)
- **Оценка**: ~2 дня

## TIER 3: Функциональная полнота

### 3.1 Artifact management detail view
- Modal/drawer для просмотра содержимого
- Download, Delete, Edit (rename, tags)
- **Оценка**: ~1 день

### 3.2 Multi-option workflow transition
- Если несколько `allowed_next` → dropdown selector
- POST: include `target_stage` parameter
- **Оценка**: ~0.5 дня

### 3.3 Structured logging (observability)
- `python-json-logger` для JSON logs в stdout
- Fields: timestamp, level, request_id, user_id, operation, duration_ms, status
- **Оценка**: ~1 день

## TIER 4: Polish & Deployment

### 4.1 E2E tests (Playwright)
### 4.2 Metrics (Prometheus)
### 4.3 Performance optimization

## Success Criteria

✅ Team of 3 consultants can log in independently  
✅ Each consultant sees only their projects  
✅ Long-running operations don't block UI  
✅ Duplicate operations return cached result  
✅ All UI errors are visible and actionable  
✅ E2E test covers full workflow  

**Target Launch**: 2026-04-30 (4 weeks, 1 developer)
