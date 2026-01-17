const BaseModel = require('./BaseModel');

class Symptom extends BaseModel {
  // Get all symptoms
  static async getAll() {
    try {
      const rows = await this.query('SELECT * FROM symptoms');
      return rows;
    } catch (error) {
      console.error('Error getting symptoms:', error.message);
      throw error;
    }
  }

  // Get symptoms by body part
  static async getByBodyPart(bodyPart) {
    try {
      const rows = await this.query(
        'SELECT s.* FROM symptoms s JOIN body_part_symptoms sbp ON s.id = sbp.symptom_id JOIN body_parts bp ON sbp.body_part_id = bp.id WHERE bp.name = ?',
        [bodyPart]
      );
      return rows;
    } catch (error) {
      console.error('Error getting symptoms by body part:', error.message);
      throw error;
    }
  }

  // Get all body parts
  static async getAllBodyParts() {
    try {
      const rows = await this.query('SELECT * FROM body_parts');
      return rows;
    } catch (error) {
      console.error('Error getting body parts:', error.message);
      throw error;
    }
  }

  // Get possible conditions based on symptoms
  static async getPossibleConditions(symptomIds) {
    try {
      // Convert symptomIds to placeholders for SQL query
      const placeholders = symptomIds.map(() => '?').join(',');
      
      const query = `
        SELECT 
          c.id,
          c.name,
          c.description,
          c.self_care,
          c.when_to_see_doctor,
          COUNT(cs.symptom_id) as matched_symptoms,
          (COUNT(cs.symptom_id) / (SELECT COUNT(*) FROM condition_symptoms WHERE condition_id = c.id)) as match_percentage
        FROM 
          conditions c
        JOIN 
          condition_symptoms cs ON c.id = cs.condition_id
        WHERE 
          cs.symptom_id IN (${placeholders})
        GROUP BY 
          c.id
        ORDER BY 
          matched_symptoms DESC, 
          match_percentage DESC
        LIMIT 5
      `;
      
      const rows = await this.query(query, symptomIds);
      return rows;
    } catch (error) {
      console.error('Error getting possible conditions:', error.message);
      throw error;
    }
  }

  // Add a new symptom (admin function)
  static async create(symptomData) {
    try {
      const result = await this.execute(
        'INSERT INTO symptoms (name, description) VALUES (?, ?)',
        [symptomData.name, symptomData.description]
      );
      
      // If body parts are provided, associate them with the symptom
      if (symptomData.bodyPartIds && symptomData.bodyPartIds.length > 0) {
        for (const bodyPartId of symptomData.bodyPartIds) {
          await this.execute(
            'INSERT INTO body_part_symptoms (symptom_id, body_part_id) VALUES (?, ?)',
            [result.lastID, bodyPartId]
          );
        }
      }
      
      return { id: result.lastID, ...symptomData };
    } catch (error) {
      console.error('Error creating symptom:', error.message);
      throw error;
    }
  }

  // Update a symptom (admin function)
  static async update(id, symptomData) {
    try {
      const result = await this.execute(
        'UPDATE symptoms SET name = ?, description = ? WHERE id = ?',
        [symptomData.name, symptomData.description, id]
      );
      
      // If body parts are provided, update the associations
      if (symptomData.bodyPartIds && symptomData.bodyPartIds.length > 0) {
        // Remove existing associations
        await this.execute(
          'DELETE FROM body_part_symptoms WHERE symptom_id = ?',
          [id]
        );
        
        // Add new associations
        for (const bodyPartId of symptomData.bodyPartIds) {
          await this.execute(
            'INSERT INTO body_part_symptoms (symptom_id, body_part_id) VALUES (?, ?)',
            [id, bodyPartId]
          );
        }
      }
      
      return result.changes > 0;
    } catch (error) {
      console.error('Error updating symptom:', error.message);
      throw error;
    }
  }

  // Delete a symptom (admin function)
  static async delete(id) {
    try {
      // First delete associations
      await this.execute(
        'DELETE FROM body_part_symptoms WHERE symptom_id = ?',
        [id]
      );
      
      // Then delete the symptom
      const result = await this.execute(
        'DELETE FROM symptoms WHERE id = ?',
        [id]
      );
      
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting symptom:', error.message);
      throw error;
    }
  }
}

module.exports = Symptom;