const Database = require('better-sqlite3');
const path = require('path');

// Connect to SQLite db
const dbPath = path.join(__dirname, '..', 'fooddrop.db');
const db = new Database(dbPath, { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

module.exports = db;
