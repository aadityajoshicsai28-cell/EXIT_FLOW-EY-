const { initializeDatabase, createCase } = require('./db');

initializeDatabase();
console.log('Database initialized.');

const seedStatus = createCase('Demo Exit Case', 'Demo Client');
console.log('Seeded demo case with id', seedStatus.id);
