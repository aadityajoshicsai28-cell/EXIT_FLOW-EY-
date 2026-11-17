const express = require('express');
const cors = require('cors');
const {
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
} = require('./src/db');
const { caseSchema, updateCaseSchema, itemUpdateSchema } = require('./src/validation');

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());

initializeDatabase();

app.get('/api/dashboard', (req, res) => {
  try {
    res.json(getDashboardStats());
  } catch (error) {
    res.status(500).json({ error: error.message || 'Unable to load dashboard data.' });
  }
});

app.get('/api/cases', (req, res) => {
  try {
    const { search = '', status = '' } = req.query;
    res.json(listCases(search, status));
  } catch (error) {
    res.status(500).json({ error: error.message || 'Unable to list cases.' });
  }
});

app.post('/api/cases', (req, res) => {
  try {
    const parsed = caseSchema.parse(req.body);
    const record = createCase(parsed.case_name, parsed.client_name);
    res.status(201).json({ id: record.id, message: 'Case created successfully' });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0]?.message || 'Invalid case payload.' });
    }
    res.status(500).json({ error: error.message || 'Unable to create case.' });
  }
});

app.get('/api/cases/:id', (req, res) => {
  try {
    const caseRecord = getCaseById(Number(req.params.id));
    if (!caseRecord) {
      return res.status(404).json({ error: 'Case not found.' });
    }
    res.json(caseRecord);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Unable to fetch case.' });
  }
});

app.put('/api/cases/:id', (req, res) => {
  try {
    const parsed = updateCaseSchema.parse(req.body);
    const updated = updateCase(Number(req.params.id), parsed);
    if (!updated) {
      return res.status(404).json({ error: 'Case not found.' });
    }
    res.json(updated);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0]?.message || 'Invalid update payload.' });
    }
    res.status(500).json({ error: error.message || 'Unable to update case.' });
  }
});

app.delete('/api/cases/:id', (req, res) => {
  try {
    const deleted = deleteCase(Number(req.params.id));
    if (!deleted) {
      return res.status(404).json({ error: 'Case not found.' });
    }
    res.json({ message: 'Case deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Unable to delete case.' });
  }
});

app.get('/api/cases/:id/items', (req, res) => {
  try {
    res.json(listCaseItems(Number(req.params.id)));
  } catch (error) {
    res.status(500).json({ error: error.message || 'Unable to load checklist items.' });
  }
});

app.put('/api/items/:id', (req, res) => {
  try {
    const parsed = itemUpdateSchema.parse(req.body);
    const updated = updateCaseItem(Number(req.params.id), parsed);
    if (!updated) {
      return res.status(404).json({ error: 'Checklist item not found.' });
    }
    res.json(updated);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0]?.message || 'Invalid item payload.' });
    }
    res.status(500).json({ error: error.message || 'Unable to update checklist item.' });
  }
});

app.get('/api/cases/:id/logs', (req, res) => {
  try {
    res.json(listCaseLogs(Number(req.params.id)));
  } catch (error) {
    res.status(500).json({ error: error.message || 'Unable to load activity logs.' });
  }
});

app.get('/api/export/csv', (req, res) => {
  try {
    const csv = exportCasesCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="exitflow-export.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Unable to export CSV.' });
  }
});

app.listen(PORT, () => {
  console.log(`ExitFlow backend running on http://localhost:${PORT}`);
});
