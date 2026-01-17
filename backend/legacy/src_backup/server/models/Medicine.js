const BaseModel = require('./BaseModel');

class Medicine extends BaseModel {
  // Get all medicines
  static async getAll() {
    try {
      const rows = await this.query('SELECT * FROM medicines');
      return rows;
    } catch (error) {
      console.error('Error getting medicines:', error.message);
      throw error;
    }
  }

  // Get medicine by ID
  static async getById(id) {
    try {
      const row = await this.queryOne('SELECT * FROM medicines WHERE id = ?', [id]);
      return row;
    } catch (error) {
      console.error('Error getting medicine by ID:', error.message);
      throw error;
    }
  }

  // Get medicines by condition ID
  static async getByCondition(conditionId) {
    try {
      const rows = await this.query(
        'SELECT m.* FROM medicines m JOIN condition_medicines cm ON m.id = cm.medicine_id WHERE cm.condition_id = ?',
        [conditionId]
      );
      return rows;
    } catch (error) {
      console.error('Error getting medicines by condition:', error.message);
      throw error;
    }
  }

  // Add a new medicine (admin function)
  static async create(medicineData) {
    try {
      const result = await this.execute(
        'INSERT INTO medicines (name, description, dosage, side_effects, precautions, interactions) VALUES (?, ?, ?, ?, ?, ?)',
        [
          medicineData.name, 
          medicineData.description, 
          medicineData.dosage, 
          medicineData.sideEffects, 
          medicineData.precautions, 
          medicineData.interactions
        ]
      );
      
      // If conditions are provided, associate them with the medicine
      if (medicineData.conditionIds && medicineData.conditionIds.length > 0) {
        for (const conditionId of medicineData.conditionIds) {
          await this.execute(
            'INSERT INTO condition_medicines (medicine_id, condition_id) VALUES (?, ?)',
            [result.lastID, conditionId]
          );
        }
      }
      
      return { id: result.lastID, ...medicineData };
    } catch (error) {
      console.error('Error creating medicine:', error.message);
      throw error;
    }
  }

  // Update a medicine (admin function)
  static async update(id, medicineData) {
    try {
      const result = await this.execute(
        'UPDATE medicines SET name = ?, description = ?, dosage = ?, side_effects = ?, precautions = ?, interactions = ? WHERE id = ?',
        [
          medicineData.name, 
          medicineData.description, 
          medicineData.dosage, 
          medicineData.sideEffects, 
          medicineData.precautions, 
          medicineData.interactions, 
          id
        ]
      );
      
      // If conditions are provided, update the associations
      if (medicineData.conditionIds && medicineData.conditionIds.length > 0) {
        // Remove existing associations
        await this.execute(
          'DELETE FROM condition_medicines WHERE medicine_id = ?',
          [id]
        );
        
        // Add new associations
        for (const conditionId of medicineData.conditionIds) {
          await this.execute(
            'INSERT INTO condition_medicines (medicine_id, condition_id) VALUES (?, ?)',
            [id, conditionId]
          );
        }
      }
      
      return result.changes > 0;
    } catch (error) {
      console.error('Error updating medicine:', error.message);
      throw error;
    }
  }

  // Delete a medicine (admin function)
  static async delete(id) {
    try {
      // First delete associations with conditions
      await this.execute(
        'DELETE FROM condition_medicines WHERE medicine_id = ?',
        [id]
      );
      
      // Then delete the medicine
      const result = await this.execute(
        'DELETE FROM medicines WHERE id = ?',
        [id]
      );
      
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting medicine:', error.message);
      throw error;
    }
  }
}

module.exports = Medicine;