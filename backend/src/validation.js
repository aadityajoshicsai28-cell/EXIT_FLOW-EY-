const { z } = require('zod');

const caseSchema = z.object({
  case_name: z.string().trim().min(2, 'Case name is required.').max(120),
  client_name: z.string().trim().min(2, 'Client name is required.').max(120),
});

const updateCaseSchema = z.object({
  case_name: z.string().trim().min(2).max(120).optional(),
  client_name: z.string().trim().min(2).max(120).optional(),
  status: z.enum(['In Progress', 'On Hold', 'Completed', 'Closed']).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided.'
});

const itemUpdateSchema = z.object({
  status: z.enum(['Pending', 'Submitted', 'Under Review', 'Approved', 'Rejected']).optional(),
  owner: z.string().trim().max(100).optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must use YYYY-MM-DD format.').optional(),
  notes: z.string().max(500).optional(),
});

module.exports = { caseSchema, updateCaseSchema, itemUpdateSchema };
