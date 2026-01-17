const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure the data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database file path
const dbPath = path.join(dataDir, 'health_buddy.sqlite');

// Create a new database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Promisify database operations
const dbAsync = {
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) {
          console.error('Error running query:', sql);
          console.error('Error details:', err.message);
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  },
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) {
          console.error('Error running query:', sql);
          console.error('Error details:', err.message);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },
  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('Error running query:', sql);
          console.error('Error details:', err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },
  exec: (sql) => {
    return new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) {
          console.error('Error running query:', sql);
          console.error('Error details:', err.message);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
};

// Test database connection
const testConnection = async () => {
  try {
    await dbAsync.get('SELECT 1');
    console.log('SQLite database connection established successfully');
    return true;
  } catch (error) {
    console.error('SQLite database connection failed:', error.message);
    return false;
  }
};

module.exports = { db, dbAsync, testConnection };