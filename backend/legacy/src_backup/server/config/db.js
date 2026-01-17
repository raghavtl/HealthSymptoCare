const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
require('dotenv').config();

// Create a connection to SQLite database
let db = null;

// Initialize database connection
const initializeDb = async () => {
  if (!db) {
    db = await open({
      filename: './health_buddy.sqlite',
      driver: sqlite3.Database
    });
    console.log('SQLite database connection established successfully');
  }
  return db;
};

// Test database connection
const testConnection = async () => {
  try {
    const connection = await initializeDb();
    await connection.get('SELECT 1');
    console.log('Database connection tested successfully');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
};

module.exports = { initializeDb, testConnection };