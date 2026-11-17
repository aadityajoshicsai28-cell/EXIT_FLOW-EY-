# Implementation Phases

**Estimated Timeline:** 10–14 Days

## Phase 0: Project Setup (Day 1)
- **Objective:** Establish the development environment.
- **Tasks:**
  - Initialize Git repository.
  - Set up standard folder structure (frontend/backend).
  - Scaffold React app using Vite.
  - Initialize Node.js/Express app.
- **Output:** Running placeholder frontend and basic Express server.

## Phase 1: Database and Sample Data (Days 2-3)
- **Objective:** Configure data layer and populate demonstration data.
- **Tasks:**
  - Setup SQLite and `better-sqlite3`.
  - Write SQL schema for `cases`, `stages`, `items`, `activity_log`, and `checklist_templates` (including indexes).
  - Create a seed script with fictional data representing the templates and dummy cases.
- **Output:** Local `database.sqlite` file populated with test data.

## Phase 2: Backend Development (Days 4-6)
- **Objective:** Build REST APIs and core business logic.
- **Tasks:**
  - Implement Zod validation middleware.
  - Implement Case CRUD controllers and checklist template generation logic.
  - Implement progress calculation and activity logging triggers.
  - Write API tests (Jest/Supertest).
- **Output:** Fully functional API testable via Postman/cURL.

## Phase 3: Frontend Development (Days 7-9)
- **Objective:** Build the user interface.
- **Tasks:**
  - Develop the Dashboard using Recharts.
  - Create Case Listing view with search/filters.
  - Build Case Detail view with structured workflow stages.
  - Implement interactive checklist (status dropdowns, notes, due dates).
- **Output:** Connected SPA interacting with the backend.

## Phase 4: Export and Finalization (Days 10-11)
- **Objective:** Add final features and polish.
- **Tasks:**
  - Implement CSV Export endpoint with proper CSV escaping.
  - Apply styling polish based on the Style Guide (CSS Modules).
  - Run Vitest for frontend component testing.
  - Bug fixing and edge-case handling.
- **Output:** Feature-complete MVP.

## Phase 5: Demonstration and Documentation (Days 12-14)
- **Objective:** Prepare project for academic submission.
- **Tasks:**
  - Capture screenshots of all main screens.
  - Write/update final README instructions.
  - Verify all documentation matches the developed product.
  - Prepare the internship report supplementary section.
- **Output:** Final source code ZIP and documentation pack.
