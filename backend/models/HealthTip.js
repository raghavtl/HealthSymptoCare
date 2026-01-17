const BaseModel = require('./BaseModel');

class HealthTip extends BaseModel {
  // Get all health tips
  static async getAll() {
    try {
      const rows = await this.query('SELECT * FROM health_tips');
      return rows;
    } catch (error) {
      console.error('Error getting health tips:', error.message);
      throw error;
    }
  }

  // Get health tips by category
  static async getByCategory(category) {
    try {
      const rows = await this.query(
        'SELECT * FROM health_tips WHERE category = ?',
        [category]
      );
      return rows;
    } catch (error) {
      console.error('Error getting health tips by category:', error.message);
      throw error;
    }
  }

  // Get a specific health tip by ID
  static async findById(id) {
    try {
      const row = await this.queryOne(
        'SELECT * FROM health_tips WHERE id = ?',
        [id]
      );
      return row || null;
    } catch (error) {
      console.error('Error finding health tip by ID:', error.message);
      throw error;
    }
  }

  // Create a new health tip (admin function)
  static async create(tipData) {
    try {
      const result = await this.execute(
        'INSERT INTO health_tips (category, title, content) VALUES (?, ?, ?)',
        [tipData.category, tipData.title, tipData.content]
      );
      return { id: result.lastID, ...tipData };
    } catch (error) {
      console.error('Error creating health tip:', error.message);
      throw error;
    }
  }

  // Update a health tip (admin function)
  static async update(id, tipData) {
    try {
      const result = await this.execute(
        'UPDATE health_tips SET category = ?, title = ?, content = ? WHERE id = ?',
        [tipData.category, tipData.title, tipData.content, id]
      );
      return result.changes > 0;
    } catch (error) {
      console.error('Error updating health tip:', error.message);
      throw error;
    }
  }

  // Delete a health tip (admin function)
  static async delete(id) {
    try {
      const result = await this.execute(
        'DELETE FROM health_tips WHERE id = ?',
        [id]
      );
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting health tip:', error.message);
      throw error;
    }
  }

  // Get random health tips
  static async getRandom(limit = 5) {
    try {
      const rows = await this.query(
        'SELECT * FROM health_tips ORDER BY RANDOM() LIMIT ?',
        [limit]
      );
      return rows;
    } catch (error) {
      console.error('Error getting random health tips:', error.message);
      throw error;
    }
  }
}

module.exports = HealthTip;