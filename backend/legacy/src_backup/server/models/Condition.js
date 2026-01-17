const BaseModel = require('./BaseModel');

class Condition extends BaseModel {
  // Get all conditions
  static async getAll() {
    try {
      const rows = await this.query('SELECT * FROM conditions');
      return rows;
    } catch (error) {
      console.error('Error getting conditions:', error.message);
      throw error;
    }
  }

  // Get condition by ID
  static async getById(id) {
    try {
      const row = await this.queryOne('SELECT * FROM conditions WHERE id = ?', [id]);
      return row;
    } catch (error) {
      console.error('Error getting condition by ID:', error.message);
      throw error;
    }
  }

  // Get medicines for a condition
  static async getMedicines(conditionId) {
    try {
      const rows = await this.query(
        'SELECT m.* FROM medicines m JOIN condition_medicines cm ON m.id = cm.medicine_id WHERE cm.condition_id = ?',
        [conditionId]
      );
      return rows;
    } catch (error) {
      console.error('Error getting medicines for condition:', error.message);
      throw error;
    }
  }

  // Add a new condition (admin function)
  static async create(conditionData) {
    try {
      const result = await this.execute(
        'INSERT INTO conditions (name, description, self_care, when_to_see_doctor) VALUES (?, ?, ?, ?)',
        [conditionData.name, conditionData.description, conditionData.selfCare, conditionData.whenToSeeDoctor]
      );
      
      return { id: result.lastID, ...conditionData };
    } catch (error) {
      console.error('Error creating condition:', error.message);
      throw error;
    }
  }

  // Update a condition (admin function)
  static async update(id, conditionData) {
    try {
      const result = await this.execute(
        'UPDATE conditions SET name = ?, description = ?, self_care = ?, when_to_see_doctor = ? WHERE id = ?',
        [conditionData.name, conditionData.description, conditionData.selfCare, conditionData.whenToSeeDoctor, id]
      );
      
      return result.changes > 0;
    } catch (error) {
      console.error('Error updating condition:', error.message);
      throw error;
    }
  }

  // Delete a condition (admin function)
  static async delete(id) {
    try {
      // First delete associations with symptoms
      await this.execute(
        'DELETE FROM condition_symptoms WHERE condition_id = ?',
        [id]
      );
      
      // Then delete associations with medicines
      await this.execute(
        'DELETE FROM condition_medicines WHERE condition_id = ?',
        [id]
      );
      
      // Finally delete the condition
      const result = await this.execute(
        'DELETE FROM conditions WHERE id = ?',
        [id]
      );
      
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting condition:', error.message);
      throw error;
    }
  }
}

module.exports = Condition;