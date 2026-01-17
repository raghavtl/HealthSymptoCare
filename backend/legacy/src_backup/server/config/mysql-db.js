const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool to MySQL database
let pool = null;

// Initialize database connection pool
const initializeDb = async () => {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'raghavtl',
      database: process.env.DB_NAME || 'project',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    console.log('MySQL database connection pool established successfully');
  }
  return pool;
};

// Test database connection
const testConnection = async () => {
  try {
    const connection = await initializeDb();
    const [rows] = await connection.query('SELECT 1');
    console.log('MySQL database connection tested successfully');
    return true;
  } catch (error) {
    console.error('MySQL database connection failed:', error.message);
    return false;
  }
};

module.exports = { initializeDb, testConnection };