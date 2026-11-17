# Product Requirements Document (PRD)

## 1. Project Overview
**Project Name:** ExitFlow  
**Full Title:** ExitFlow – STPI Exit Checklist & Document Tracker  
ExitFlow is an academic web-based prototype built to demonstrate how a digital tracking system can improve visibility and coordination in a document-heavy workflow, specifically modeled on an illustrative STPI exit process.

## 2. Problem Statement
Complex compliance workflows often rely on manual spreadsheets, leading to fragmented communication, missed deadlines, and poor visibility into overall progress. Tracking individual document statuses across multiple stages is prone to error and inefficiency.

## 3. Proposed Solution
ExitFlow provides a centralized dashboard and case management system. It auto-generates workflow checklists, assigns ownership, tracks due dates, calculates progress automatically, and logs all activities in a structured manner.

## 4. Objectives
- Demonstrate practical application of web technologies (React/Node) in a business workflow context.
- Build a functional MVP that tracks cases across six specific stages.
- Create an artifact suitable for a B.Tech internship report.

## 5. Target Users (Demonstration Purposes)
- **Consultant/Analyst:** Creates cases, updates document statuses, uploads notes.
- **Manager:** Reviews progress, checks overdue items, monitors the dashboard.
*(Note: ExitFlow MVP does not implement role-based access control. These personas represent use cases only.)*

## 6. MVP Features (Functional Requirements)
1. **Dashboard:** Displays total cases, pending tasks, approved items, and overdue items.
2. **Case Management:** CRUD operations for tracking entities (cases).
3. **Automated Checklists:** Auto-generates standard checklist templates upon case creation.
4. **Workflow Stages:** Hardcoded to six specific stages (see section below).
5. **Document Status Tracking:** Items use statuses: `Pending`, `Submitted`, `Under Review`, `Approved`, `Rejected`.
6. **Task Ownership:** Assignment of fictional owners to checklist items.
7. **Deadlines & Notes:** Tracking due dates and text notes for items.
8. **Progress Calculation:** Automated percentage calculation based on approved items.
   - **Progress** = (Number of Approved items / Total checklist items) × 100.
   - Rejected items remain in the denominator but do not count as completed.
9. **Overdue Tracking:** Automatic flagging of items past their due date.
   - An item is **overdue** when its due date is earlier than the current date AND its status is neither Approved nor Rejected.
10. **Activity Log:** Audit trail for significant case updates.
11. **Search & Filter:** Find cases by name/ID and filter by status.
12. **CSV Export:** Export case and checklist data.
13. **Sample Data:** Seed script to populate fictional demonstration data.

## 7. Illustrative Workflow Stages
1. Internal Review
2. Exit Request Preparation
3. Review and Clarifications
4. Asset and Financial Review
5. Dues and Clearance Tracking
6. Final Closure Tracking

## 8. Non-Functional Requirements
- **Performance:** UI should respond within 200ms for local interactions.
- **Usability:** Clean, enterprise-style interface (Navy Blue/Yellow palette).
- **Data Persistence:** Local SQLite database (suitable for prototype).

## 9. Out-of-Scope Features
*The following are strictly excluded from the MVP:*
- AI document analysis or OCR.
- Real document/file uploads (cloud storage).
- Email or SMS notifications.
- SAP, Power BI, Teams, or Outlook integrations.
- Government portal integrations.
- Production-grade authentication (Auth0, JWT roles).
- Real client data (only fictional data allowed).

## 10. Acceptance Criteria
- User can create a new case, which immediately populates a 6-stage checklist using the database templates.
- User can change an item's status to 'Approved', automatically updating the case progress bar.
- Dashboard accurately reflects counts from the database.
- CSV export downloads a valid file containing the current case list.

## 11. Risks and Limitations
- **Data Loss:** Using local SQLite means data resets if the file is lost or deployed to ephemeral cloud storage without a volume.
- **Accuracy:** The workflow stages are illustrative and hold no legal/compliance validity. ExitFlow does not determine legal or tax compliance.

## 12. Future Enhancements
- Role-based Access Control (RBAC).
- Cloud storage integration (AWS S3) for real document uploads.
- Automated email reminders for overdue tasks.
