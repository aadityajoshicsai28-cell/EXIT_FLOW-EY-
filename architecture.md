# System Architecture

## 1. System Overview
ExitFlow follows a standard three-tier architecture suitable for an MVP prototype.
- **Presentation Layer:** React.js Single Page Application (SPA).
- **Application Layer:** Node.js / Express.js REST API.
- **Data Layer:** SQLite relational database.

## 2. Technology Stack
**Frontend:**
- **React.js (Vite):** Core framework for UI rendering.
- **React Router:** Client-side routing.
- **CSS Modules:** Scoped styling.
- **Recharts:** Dashboard visualizations.
- **Zod:** Form validation (Input validation for frontend forms).

**Backend:**
- **Node.js & Express.js:** API server and routing.
- **better-sqlite3:** Synchronous, high-performance SQLite driver.
- **Zod:** Schema validation for incoming API requests.
- **csv-stringify:** For safe CSV escaping during export.

**Testing:**
- **Vitest:** Frontend component testing.
- **Jest & Supertest:** Backend API testing.

## 3. Database Architecture (SQLite)
The database design avoids unnecessary complexity while satisfying MVP constraints. 
**Keys & Constraints:** Primary keys (`id`) are auto-incrementing integers. Foreign keys use `ON DELETE CASCADE` where appropriate to prevent orphaned records. Indexes are added on foreign keys and commonly searched fields.

### Entities:
1. **`cases`**
   - **Fields:** `id` (PK), `case_name`, `client_name`, `status`, `progress_percentage`, `created_at`, `updated_at`
   - **Description:** The core tracking entity.
2. **`stages`**
   - **Fields:** `id` (PK), `name`, `order_index`
   - **Description:** The 6 illustrative workflow stages. Static reference table.
3. **`checklist_templates`**
   - **Fields:** `id` (PK), `stage_id` (FK -> `stages.id`), `task_name`, `purpose`, `default_owner`, `default_due_days`
   - **Description:** Read-only templates used to generate the 6 illustrative stages and associated checklist items when a new case is created.
4. **`items`**
   - **Fields:** `id` (PK), `case_id` (FK -> `cases.id` ON DELETE CASCADE), `stage_id` (FK -> `stages.id`), `task_name`, `status`, `owner`, `due_date`, `notes`, `created_at`, `updated_at`
   - **Description:** The actual checklist tasks mapped to a specific case.
   - **Indexes:** `idx_items_case_id` (`case_id`), `idx_items_status` (`status`)
5. **`activity_log`**
   - **Fields:** `id` (PK), `case_id` (FK -> `cases.id` ON DELETE CASCADE), `action`, `user_role`, `timestamp`
   - **Description:** Audit trail for case updates.

## 4. REST API Documentation
*All successful responses return JSON. All error responses follow a consistent format: `{ "error": "Message" }`.*

- **GET /api/dashboard**
  - **Purpose:** Fetch aggregate stats.
  - **Response:** `{ "total": 10, "pending": 4, "approved": 5, "overdue": 1 }`
- **GET /api/cases**
  - **Purpose:** List all cases.
  - **Parameters:** `?search=text&status=text` (optional)
  - **Response:** `[ { "id": 1, "case_name": "...", ... } ]`
- **POST /api/cases**
  - **Purpose:** Create a new case. Triggers generation of items from `checklist_templates`.
  - **Body:** `{ "case_name": "Project Alpha", "client_name": "Acme Corp" }`
  - **Response:** `{ "id": 1, "message": "Case created successfully" }`
- **GET /api/cases/:id**
  - **Purpose:** Get details of a specific case.
- **PUT /api/cases/:id**
  - **Purpose:** Update case details.
  - **Body:** `{ "status": "In Progress" }`
- **DELETE /api/cases/:id**
  - **Purpose:** Delete a case and cascade delete its items and logs.
- **GET /api/cases/:id/items**
  - **Purpose:** Get checklist items for a case.
- **PUT /api/items/:id**
  - **Purpose:** Update item status, owner, or due date. Recalculates case progress and logs activity.
  - **Body:** `{ "status": "Approved", "notes": "Done" }`
- **GET /api/cases/:id/logs**
  - **Purpose:** Get activity log for a specific case.
- **GET /api/export/csv**
  - **Purpose:** Download case and checklist data as a CSV file. Includes safe CSV escaping.

## 5. Core Business Logic Definitions
- **Progress Calculation:**
  **Progress = (Number of Approved items / Total checklist items) × 100.**
  *(Rejected items remain in the denominator but do not count as completed.)*
- **Overdue Calculation:**
  An item is overdue when its `due_date` is earlier than the current date AND its status is neither 'Approved' nor 'Rejected'.
- **Date Handling:**
  All dates should be stored in ISO 8601 format (`YYYY-MM-DD`) in SQLite and parsed consistently on the frontend.

## 6. Security & Limitations
- **Persistence:** Local SQLite persistence means data is lost if deployed to an ephemeral container without a persistent volume.
- **Validation:** Zod schemas must validate all POST/PUT bodies to prevent SQL injection or malformed data.
- **Security:** As a local academic prototype, production authentication and authorization are excluded.

## 7. Folder Structure
```text
ExitFlow/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   └── package.json
└── backend/
    ├── src/
    │   ├── controllers/
    │   ├── routes/
    │   ├── models/
    │   └── db/
    ├── server.js
    └── package.json
```
