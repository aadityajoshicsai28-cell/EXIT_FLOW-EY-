# Project Memory & Context Tracker

## Project Identity
- **Name:** ExitFlow
- **Full Title:** ExitFlow – STPI Exit Checklist & Document Tracker
- **Objective:** Build an MVP web application for tracking illustrative STPI exit compliance workflows to support a B.Tech internship report.

## Strict Scope Rules (Do NOT Implement)
- ❌ AI document analysis / OCR
- ❌ Real file uploads to cloud storage
- ❌ Email / SMS notifications
- ❌ SAP / PowerBI / Outlook / Teams integration
- ❌ Official government portal integration
- ❌ Production-level Auth (RBAC, JWT)
- ❌ Real client or personal data (FICTIONAL DATA ONLY)

## Technology Decisions
- **Frontend:** React.js (Vite), React Router, CSS Modules, Recharts, Zod.
- **Backend:** Node.js, Express.js, Zod.
- **Database:** SQLite (local) via better-sqlite3.
- **Testing:** Vitest (UI), Jest & Supertest (API).

## Database Summary (5 Entities)
- `cases`: Tracking entity (id, name, status, progress).
- `stages`: 6 hardcoded illustrative stages.
- `checklist_templates`: Seeded templates for auto-generating items.
- `items`: Checklist tasks mapped to cases and stages.
- `activity_log`: Audit trail for case updates.

## Important Business Logic
- **Progress** = (Approved Items / Total Items) * 100. (Rejected stays in denominator).
- **Overdue** = `due_date < today` AND `status` NOT IN ('Approved', 'Rejected').

## Current Development Status
**Status:** 🔴 Not Started

### Phase-wise Progress Checklist
- [ ] **Phase 0:** Project Setup
- [ ] **Phase 1:** Database and Sample Data
- [ ] **Phase 2:** Backend Development
- [ ] **Phase 3:** Frontend Development
- [ ] **Phase 4:** Export and Finalization
- [ ] **Phase 5:** Demonstration and Documentation

## Important Directives for AI Assistants
- Always read `PRD.md` before suggesting features.
- Keep components simple and strictly aligned with the B.Tech MVP scope.
- Use `better-sqlite3` strictly for database operations.
- Zod must be used for API and form validation.
