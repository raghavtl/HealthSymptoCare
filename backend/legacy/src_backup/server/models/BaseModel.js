const { dbAsync } = require('../config/sqlite-db');

class BaseModel {
  // Execute a query with parameters and return all rows
  static async query(sql, params = []) {
    try {
      const rows = await dbAsync.all(sql, params);
      return rows;
    } catch (error) {
      console.error('Error executing query:', error.message);
      throw error;
    }
  }

  // Execute a query and get the first row
  static async queryOne(sql, params = []) {
    try {
      const row = await dbAsync.get(sql, params);
      return row;
    } catch (error) {
      console.error('Error executing query:', error.message);
      throw error;
    }
  }

  // Execute a query and get the last inserted ID
  static async execute(sql, params = []) {
    try {
      const result = await dbAsync.run(sql, params);
      return {
        lastID: result.lastID || 0,
        changes: result.changes || 0
      };
    } catch (error) {
      console.error('Error executing statement:', error.message);
      throw error;
    }
  }
}

module.exports = BaseModel;