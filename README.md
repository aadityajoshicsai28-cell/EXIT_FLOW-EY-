# ExitFlow

**ExitFlow – STPI Exit Checklist & Document Tracker**

ExitFlow is an academic prototype designed to demonstrate how a digital workflow system can help manage an illustrative STPI exit process. The application tracks document readiness, checklist completion, stage-wise review activity, due dates, and progress across a six-stage closure workflow.

*Note: This project is an independent academic prototype developed for educational and portfolio purposes. It is not an official EY product, government system, or production-grade compliance solution.*

## 1. Overview

ExitFlow centralizes case tracking into a single dashboard where users can:
- create and manage exit-related cases,
- review process stages and checklist items,
- update item status and ownership,
- monitor progress and overdue tasks,
- review case activity history,
- export case data as CSV.

The prototype models a simplified STPI exit workflow using six workflow stages:
1. Internal Review
2. Exit Request Preparation
3. Review and Clarifications
4. Asset and Financial Review
5. Dues and Clearance Tracking
6. Final Closure Tracking

## 2. Problem Addressed

Traditional compliance workflows often depend on spreadsheets and fragmented communication. This creates delays, misalignment, and poor visibility into the overall status of a case. ExitFlow addresses that by providing a structured system for checklist generation, status visibility, and deadline tracking.

## 3. Product Specification

### Functional Requirements
- Dashboard displays total cases, pending items, approved items, and overdue items.
- User can create new cases with case name and client name.
- New cases automatically generate checklist items based on templates for the six stages.
- Checklist items include task name, stage, owner, due date, and notes.
- Item statuses support: Pending, Submitted, Under Review, Approved, and Rejected.
- Case progress is automatically recalculated using approved item count over total checklist items.
- Overdue items are flagged when due date is in the past and the item is not Approved or Rejected.
- Activity log records meaningful case and item updates.
- Users can filter and search cases by name, client, or status.
- CSV export downloads current data for reporting.

### Non-Functional Requirements
- Responsive single-page interface for local use.
- Fast local interactions for demo scenarios.
- Local SQLite persistence for prototype data storage.
- Validation of API inputs to prevent malformed payloads.

### Out-of-Scope Features
- Real authentication or authorization
- Real document upload or file storage
- Government system integration
- Email or SMS reminders
- AI document analysis
- Production-grade compliance approval workflows

## 4. Project Structure
```text
ExitFlow/
├── backend/            # Express API and SQLite data layer
│   ├── src/
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/           # React + Vite SPA
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── README.md
├── START-HERE.md
├── PRD.md
├── architecture.md
├── phases.md
├── document-catalogue.md
├── style-guide.md
├── memory.md
└── .gitignore (if present)
```

## 5. Technology Stack

### Frontend
- React
- Vite
- CSS Modules / custom CSS

### Backend
- Node.js
- Express.js
- SQLite (via Node's built-in sqlite module)
- Zod for validation
- CSV stringifier for export

## 6. Prerequisites
- Node.js v18 or higher
- npm v9 or higher
- Git

## 7. Environment Setup

Create a `.env` file in the `backend` directory with:
```env
PORT=5000
DB_PATH=./src/db/database.sqlite
```

## 8. Installation

### 1) Clone the repository
```bash
git clone <repository-url>
cd EXIT_FLOW(EY)
```

### 2) Install backend dependencies
```bash
cd backend
npm install
```

### 3) Install frontend dependencies
Open a separate terminal:
```bash
cd frontend
npm install
```

## 9. Running the Application

You must run both services in separate terminals.

### Terminal 1: Backend
```bash
cd backend
$env:PORT='5000'
$env:DB_PATH='./src/db/database.sqlite'
node server.js
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev -- --host 0.0.0.0
```

Then open:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 10. Seed and Demo Data

The backend initializes a local SQLite database and seeds sample case data automatically when the server starts. This includes:
- sample cases,
- six workflow stages,
- checklist templates,
- activity log entries.

This is useful for demo and testing the dashboard without any external data source.

## 11. API Endpoints

### Dashboard
- `GET /api/dashboard`

### Cases
- `GET /api/cases`
- `POST /api/cases`
- `GET /api/cases/:id`
- `PUT /api/cases/:id`
- `DELETE /api/cases/:id`

### Checklist Items
- `GET /api/cases/:id/items`
- `PUT /api/items/:id`

### Activity Logs
- `GET /api/cases/:id/logs`

### Export
- `GET /api/export/csv`

## 12. Business Rules

- Progress = (Approved items / Total checklist items) × 100
- Rejected items remain in the denominator but do not count as completed
- An item is overdue if its due date is before today and its status is not Approved or Rejected
- Case status updates can reflect progress milestones but remain a lightweight prototype status field

## 13. Acceptance Criteria

The prototype satisfies the following expectations:
- User can create a new case and generate a six-stage checklist automatically
- Item updates reflect in total case progress
- Dashboard reflects counts from the backend database
- CSV export produces downloadable case data
- Users can search and filter the case list

## 14. Known Limitations
- Uses local SQLite data storage; not suitable for multi-user production deployment
- No role-based access or authentication
- Sample data is fictional and illustrative only

## 15. Future Enhancements
- Role-based access control
- Real document storage integration
- Automated reminders for overdue tasks
- Better analytics and charts
- Multi-user collaboration features

## 16. Troubleshooting
- If the backend fails to start, confirm the `.env` file exists and contains the correct values.
- If the app cannot connect to the API, ensure the backend is running on port 5000.
- If the frontend does not load data, verify the backend API is reachable and the database has been initialized.
- If port conflicts exist, change the values in the environment and frontend configuration accordingly.

## 17. Notes for Academic Use

This project is intended as a demonstration of a business workflow dashboard, built to align with the requirements of a software engineering academic project. It is designed to help explain software architecture, API design, data modeling, workflow design, and front-end development in a realistic but simplified setting.
