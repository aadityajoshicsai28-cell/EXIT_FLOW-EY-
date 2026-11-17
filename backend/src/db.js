const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const { stringify } = require('csv-stringify/sync');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'db', 'database.sqlite');
const dbDirectory = path.dirname(dbPath);
fs.mkdirSync(dbDirectory, { recursive: true });

const db = new DatabaseSync(dbPath);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

const STAGE_NAMES = [
  'Internal Review',
  'Exit Request Preparation',
  'Review and Clarifications',
  'Asset and Financial Review',
  'Dues and Clearance Tracking',
  'Final Closure Tracking',
];

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_name TEXT NOT NULL,
      client_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'In Progress',
      progress_percentage INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      order_index INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS checklist_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stage_id INTEGER NOT NULL,
      task_name TEXT NOT NULL,
      purpose TEXT,
      default_owner TEXT,
      default_due_days INTEGER NOT NULL,
      FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      stage_id INTEGER NOT NULL,
      task_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      owner TEXT,
      due_date TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
      FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      user_role TEXT NOT NULL DEFAULT 'Analyst',
      timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_items_case_id ON items(case_id);
    CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
    CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
  `);

  const stageCount = db.prepare('SELECT COUNT(*) as total FROM stages').get().total;
  if (stageCount === 0) {
    const insertStage = db.prepare('INSERT INTO stages (name, order_index) VALUES (?, ?)');
    STAGE_NAMES.forEach((name, index) => insertStage.run(name, index + 1));
  }

  const templateCount = db.prepare('SELECT COUNT(*) as total FROM checklist_templates').get().total;
  if (templateCount === 0) {
    const stageMap = new Map(
      db.prepare('SELECT id, name FROM stages').all().map((stage) => [stage.name, stage.id])
    );

    const tasksByStage = {
      'Internal Review': [
        ['Review notice and scope', 'Confirm exit timeline and scope', 'Analyst', 3],
        ['Validate internal approvals', 'Ensure relevant approvals are aligned', 'Manager', 5],
        ['Prepare checklist summary', 'Summarize the initial case pack', 'Consultant', 7],
      ],
      'Exit Request Preparation': [
        ['Draft exit request letter', 'Compile the primary exit request document', 'Analyst', 4],
        ['Collect supporting records', 'Gather exit evidence and reference docs', 'Consultant', 6],
        ['Sanity-check document completeness', 'Check completeness before review', 'Manager', 8],
      ],
      'Review and Clarifications': [
        ['Respond to clarifications', 'Reconcile queries from stakeholders', 'Analyst', 5],
        ['Verify client confirmations', 'Validate client-side submissions', 'Consultant', 7],
        ['Track pending queries', 'Monitor unresolved clarifications', 'Manager', 9],
      ],
      'Asset and Financial Review': [
        ['Assess asset records', 'Review product and asset documentation', 'Finance Lead', 4],
        ['Validate dues and balances', 'Check financial obligations and dues', 'Finance Analyst', 6],
        ['Confirm closure readiness', 'Prepare closure note for financial signoff', 'Manager', 8],
      ],
      'Dues and Clearance Tracking': [
        ['Check outstanding liabilities', 'Verify unsettled items are closed', 'Finance Analyst', 5],
        ['Clear compliance checks', 'Ensure the clearance list is complete', 'Analyst', 7],
        ['Prepare final clearance record', 'Document the final clearance status', 'Manager', 9],
      ],
      'Final Closure Tracking': [
        ['Authorize closure package', 'Submit the final exit package for sign-off', 'Manager', 3],
        ['Archive evidence and logs', 'Store final supporting records', 'Consultant', 5],
        ['Confirm project closure', 'Close the case and issue final status', 'Analyst', 7],
      ],
    };

    const insertTemplate = db.prepare(
      'INSERT INTO checklist_templates (stage_id, task_name, purpose, default_owner, default_due_days) VALUES (?, ?, ?, ?, ?)'
    );

    for (const [stageName, tasks] of Object.entries(tasksByStage)) {
      const stageId = stageMap.get(stageName);
      tasks.forEach(([taskName, purpose, defaultOwner, defaultDueDays]) => {
        insertTemplate.run(stageId, taskName, purpose, defaultOwner, defaultDueDays);
      });
    }
  }

  const sampleCaseCount = db.prepare('SELECT COUNT(*) as total FROM cases').get().total;
  if (sampleCaseCount === 0) {
    insertSeedCases();
  }
}

function insertSeedCases() {
  const insertCase = db.prepare(
    'INSERT INTO cases (case_name, client_name, status, progress_percentage, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const seedCases = [
    { case_name: 'Alpha Exit', client_name: 'Acme Systems', status: 'In Progress', progress_percentage: 45 },
    { case_name: 'Beacon Closure', client_name: 'Lattice Labs', status: 'Completed', progress_percentage: 100 },
    { case_name: 'Delta Exit Review', client_name: 'North Star', status: 'On Hold', progress_percentage: 30 },
  ];

  const stageMap = new Map(db.prepare('SELECT id, name FROM stages').all().map((stage) => [stage.name, stage.id]));
  const templateRows = db.prepare('SELECT * FROM checklist_templates ORDER BY stage_id, id').all();

  seedCases.forEach((seedCase, index) => {
    const date = new Date();
    date.setDate(date.getDate() - ((index + 1) * 4));
    const createdAt = date.toISOString();
    const result = insertCase.run(seedCase.case_name, seedCase.client_name, seedCase.status, seedCase.progress_percentage, createdAt, createdAt);
    const caseId = result.lastInsertRowid;

    templateRows.forEach((template, taskIndex) => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (taskIndex % 7) + template.default_due_days);
      const status = taskIndex % 5 === 0 ? 'Approved' : taskIndex % 3 === 0 ? 'Under Review' : 'Pending';
      db.prepare(
        'INSERT INTO items (case_id, stage_id, task_name, status, owner, due_date, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(
        caseId,
        template.stage_id,
        template.task_name,
        status,
        template.default_owner,
        dueDate.toISOString().slice(0, 10),
        taskIndex % 2 === 0 ? 'Checklist item prepared for review.' : '',
        createdAt,
        createdAt
      );
    });

    db.prepare(
      'INSERT INTO activity_log (case_id, action, user_role, timestamp) VALUES (?, ?, ?, ?)'
    ).run(caseId, 'Case created and checklist generated', 'Analyst', createdAt);
  });

  recalculateAllCaseProgress();
}

function recalculateProgress(caseId) {
  const result = db.prepare(
    'SELECT COUNT(*) as total, SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as approved FROM items WHERE case_id = ?'
  ).get('Approved', caseId);

  const total = Number(result.total || 0);
  const approved = Number(result.approved || 0);
  const progressPercentage = total === 0 ? 0 : Math.round((approved / total) * 100);

  db.prepare('UPDATE cases SET progress_percentage = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(progressPercentage, caseId);
  return progressPercentage;
}

function recalculateAllCaseProgress() {
  const caseIds = db.prepare('SELECT id FROM cases').all();
  caseIds.forEach((row) => recalculateProgress(row.id));
}

function formatCaseRow(row) {
  return {
    ...row,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function listCases(search = '', status = '') {
  const searchText = String(search).trim().toLowerCase();
  const filters = [];
  const params = [];

  if (searchText) {
    filters.push('(LOWER(case_name) LIKE ? OR LOWER(client_name) LIKE ? OR CAST(id as TEXT) LIKE ?)');
    params.push(`%${searchText}%`, `%${searchText}%`, `%${searchText}%`);
  }

  if (status) {
    filters.push('status = ?');
    params.push(status);
  }

  let query = 'SELECT * FROM cases';
  if (filters.length) {
    query += ' WHERE ' + filters.join(' AND ');
  }
  query += ' ORDER BY updated_at DESC';

  const rows = db.prepare(query).all(...params);
  return rows.map(formatCaseRow);
}

function createCase(caseName, clientName) {
  const now = new Date().toISOString();
  const result = db.prepare(
    'INSERT INTO cases (case_name, client_name, status, progress_percentage, created_at, updated_at) VALUES (?, ?, ?, 0, ?, ?)'
  ).run(caseName, clientName, 'In Progress', now, now);

  const caseId = Number(result.lastInsertRowid);
  const templateRows = db.prepare('SELECT * FROM checklist_templates ORDER BY id').all();

  const insertItem = db.prepare(
    'INSERT INTO items (case_id, stage_id, task_name, status, owner, due_date, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  templateRows.forEach((template) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + Number(template.default_due_days));
    insertItem.run(
      caseId,
      template.stage_id,
      template.task_name,
      'Pending',
      template.default_owner,
      dueDate.toISOString().slice(0, 10),
      '',
      now,
      now
    );
  });

  db.prepare('INSERT INTO activity_log (case_id, action, user_role, timestamp) VALUES (?, ?, ?, ?)')
    .run(caseId, 'Case created and templates assigned', 'Analyst', now);

  return { id: caseId };
}

function getCaseById(id) {
  const row = db.prepare('SELECT * FROM cases WHERE id = ?').get(id);
  if (!row) {
    return null;
  }
  return formatCaseRow(row);
}

function updateCase(caseId, updates) {
  const original = db.prepare('SELECT * FROM cases WHERE id = ?').get(caseId);
  if (!original) {
    return null;
  }

  const fields = [];
  const values = [];

  if (updates.case_name) {
    fields.push('case_name = ?');
    values.push(updates.case_name);
  }

  if (updates.client_name) {
    fields.push('client_name = ?');
    values.push(updates.client_name);
  }

  if (updates.status) {
    fields.push('status = ?');
    values.push(updates.status);
  }

  if (!fields.length) {
    return original;
  }

  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(caseId);

  db.prepare(`UPDATE cases SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  const updated = db.prepare('SELECT * FROM cases WHERE id = ?').get(caseId);
  db.prepare('INSERT INTO activity_log (case_id, action, user_role, timestamp) VALUES (?, ?, ?, ?)')
    .run(caseId, `Case updated: ${Object.keys(updates).join(', ')}`, 'Analyst', new Date().toISOString());
  return formatCaseRow(updated);
}

function deleteCase(caseId) {
  const result = db.prepare('DELETE FROM cases WHERE id = ?').run(caseId);
  return result.changes > 0;
}

function listCaseItems(caseId) {
  const rows = db.prepare(`
    SELECT i.*, s.name as stage_name
    FROM items i
    INNER JOIN stages s ON s.id = i.stage_id
    WHERE i.case_id = ?
    ORDER BY s.order_index, i.id
  `).all(caseId);

  return rows.map((row) => ({
    ...row,
    overdue: row.status !== 'Approved' && row.status !== 'Rejected' && new Date(row.due_date) < new Date(new Date().toDateString()),
  }));
}

function updateCaseItem(itemId, updates) {
  const original = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId);
  if (!original) {
    return null;
  }

  const fields = [];
  const values = [];

  if (updates.status) {
    fields.push('status = ?');
    values.push(updates.status);
  }

  if (updates.owner !== undefined) {
    fields.push('owner = ?');
    values.push(updates.owner || 'Unassigned');
  }

  if (updates.due_date) {
    fields.push('due_date = ?');
    values.push(updates.due_date);
  }

  if (updates.notes !== undefined) {
    fields.push('notes = ?');
    values.push(updates.notes || '');
  }

  if (!fields.length) {
    return original;
  }

  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(itemId);

  db.prepare(`UPDATE items SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  const updated = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId);
  const caseId = updated.case_id;
  recalculateProgress(caseId);

  const caseStatus = db.prepare('SELECT status FROM cases WHERE id = ?').get(caseId)?.status;
  if (caseStatus !== 'Completed' && updated.status === 'Approved' && checkIfCaseFinished(caseId)) {
    db.prepare('UPDATE cases SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('Completed', caseId);
  }

  db.prepare('INSERT INTO activity_log (case_id, action, user_role, timestamp) VALUES (?, ?, ?, ?)')
    .run(caseId, `Checklist item updated: ${updated.task_name} -> ${updated.status}`, 'Analyst', new Date().toISOString());

  return { ...updated, overdue: updated.status !== 'Approved' && updated.status !== 'Rejected' && new Date(updated.due_date) < new Date(new Date().toDateString()) };
}

function checkIfCaseFinished(caseId) {
  const total = db.prepare('SELECT COUNT(*) as total FROM items WHERE case_id = ?').get(caseId).total;
  const approved = db.prepare('SELECT COUNT(*) as approved FROM items WHERE case_id = ? AND status = ?').get(caseId, 'Approved').approved;
  return total > 0 && approved === total;
}

function listCaseLogs(caseId) {
  return db.prepare(
    'SELECT * FROM activity_log WHERE case_id = ? ORDER BY timestamp DESC LIMIT 20'
  ).all(caseId);
}

function exportCasesCsv() {
  const rows = db.prepare(`
    SELECT c.id as case_id, c.case_name, c.client_name, c.status, c.progress_percentage,
           i.task_name, i.stage_id, i.status as item_status, i.owner, i.due_date, i.notes
    FROM cases c
    LEFT JOIN items i ON i.case_id = c.id
    ORDER BY c.id, i.id
  `).all();

  const records = rows.map((row) => ({
    case_id: row.case_id,
    case_name: row.case_name,
    client_name: row.client_name,
    case_status: row.status,
    progress_percentage: row.progress_percentage,
    task_name: row.task_name || '',
    item_status: row.item_status || '',
    owner: row.owner || '',
    due_date: row.due_date || '',
    notes: row.notes || '',
  }));

  return stringify(records, {
    header: true,
    columns: ['case_id', 'case_name', 'client_name', 'case_status', 'progress_percentage', 'task_name', 'item_status', 'owner', 'due_date', 'notes'],
  });
}

function getDashboardStats() {
  const totalCases = db.prepare('SELECT COUNT(*) as total FROM cases').get().total;
  const pendingItems = db.prepare('SELECT COUNT(*) as total FROM items WHERE status = ?').get('Pending').total;
  const approvedItems = db.prepare('SELECT COUNT(*) as total FROM items WHERE status = ?').get('Approved').total;
  const overdueItems = db.prepare(`
    SELECT COUNT(*) as total FROM items WHERE status NOT IN (?, ?) AND due_date < date('now')
  `).get('Approved', 'Rejected').total;

  return {
    total: totalCases,
    pending: pendingItems,
    approved: approvedItems,
    overdue: overdueItems,
  };
}

module.exports = {
  initializeDatabase,
  getDashboardStats,
  listCases,
  createCase,
  getCaseById,
  updateCase,
  deleteCase,
  listCaseItems,
  updateCaseItem,
  listCaseLogs,
  exportCasesCsv,
  STAGE_NAMES,
};
