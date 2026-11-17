# ExitFlow

ExitFlow is a lightweight STPI exit workflow tracker built as an academic prototype for managing closure cases, due dates, approval checkpoints, and case progress in one dashboard.

This project is designed for demo and portfolio use. It is not an official EY system or a production-grade compliance platform.

## Overview

ExitFlow helps users:
- create exit-related cases
- auto-generate checklist items across six closure stages
- assign owners and update due dates
- track item status and case progress
- review activity history
- search, filter, and export case data

The workflow follows a simplified STPI-style exit process:
1. Internal Review
2. Exit Request Preparation
3. Review and Clarifications
4. Asset and Financial Review
5. Dues and Clearance Tracking
6. Final Closure Tracking

## Problem addressed

Many exit and closure workflows still rely on fragmented spreadsheets and manual follow-up. ExitFlow brings that process into a single local dashboard so users can quickly view case status, identify overdue items, and track completion across the workflow.

## Features

- Dashboard summary for total cases, pending items, approved items, and overdue items
- Case creation with case name and client name
- Automatic checklist generation when a case is added
- Item-level updates for status, owner, due date, and notes
- Case progress calculation based on approved checklist items
- Search and filter by case name, client, or case status
- Activity log for key updates
- CSV export of case and item data
- Local SQLite persistence for prototype use

## Technology stack

### Frontend
- React
- Vite
- JavaScript (JSX)
- Custom CSS styling

### Backend
- Node.js
- Express.js
- SQLite via the built-in `node:sqlite` module
- Zod for request validation
- `csv-stringify` for CSV export

## Project structure

```text
EXIT_FLOW(EY)/
├── backend/
│   ├── src/
│   ├── package.json
│   ├── server.js
│   └── db/
│       └── database.sqlite
├── frontend/
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
├── .gitignore
└── .env.example (if created locally)
```

## Prerequisites

- Node.js 18 or newer
- npm 9 or newer
- Git

## Setup

### 1. Install backend dependencies

```bash
cd backend
npm install
```

### 2. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 3. Optional environment variables

The backend will work with its default database location, but you can set a local `.env` file if needed:

```env
PORT=5000
DB_PATH=./src/db/database.sqlite
```

## Running the application

Open two terminals.

### Terminal 1: Backend

```bash
cd backend
npm run dev
```

### Terminal 2: Frontend

```bash
cd frontend
npm run dev -- --host 0.0.0.0
```

Then open the app in the browser:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Default app behavior

When the backend starts, it:
- creates the SQLite database if it does not exist
- seeds default stages and checklist templates
- creates demo cases and sample activity records

This gives the UI a working dataset for demonstration without needing a separate data source.

## API endpoints

### Dashboard
- `GET /api/dashboard`

### Cases
- `GET /api/cases`
- `POST /api/cases`
- `GET /api/cases/:id`
- `PUT /api/cases/:id`
- `DELETE /api/cases/:id`

### Checklist items
- `GET /api/cases/:id/items`
- `PUT /api/items/:id`

### Activity log
- `GET /api/cases/:id/logs`

### Export
- `GET /api/export/csv`

## Business rules

- Progress is calculated as the number of approved checklist items divided by the total checklist items for a case.
- Only items with status `Approved` count as complete for progress.
- Overdue items are flagged when the due date is in the past and the item is not already `Approved` or `Rejected`.
- Case status is updated in the app based on progress and workflow state, but the project remains a lightweight prototype.

## Known limitations

- Local SQLite storage only; not suited for multi-user production workloads
- No real authentication or authorization layer
- No document upload or file storage
- No external system integration or automated reminders
- Demo data is illustrative and not production-grade

## Future enhancements

- Role-based access control
- Multi-user collaboration support
- Real document repository integration
- Automated overdue alerts and notifications
- Enhanced analytics and reporting
- Better audit trails for compliance review

## Troubleshooting

- If the backend does not start, verify that Node dependencies are installed and that the database path is valid.
- If the frontend cannot load data, confirm the backend is running on port 5000.
- If there are port conflicts, update the `PORT` value in the backend environment and refresh the frontend configuration.
- If you are resetting the demo data, delete the SQLite database in `backend/src/db/` and restart the backend.

## Notes

This repository is intended as a project demonstration for workflow design, backend API development, local persistence, and front-end dashboard building in an academic setting.
