const BaseModel = require('./BaseModel');

class WellnessLog extends BaseModel {
  // Create a new wellness log entry
  static async create(logData) {
    try {
      const result = await this.execute(
        'INSERT INTO wellness_logs (user_id, date, water_intake, mood, sleep_hours, energy_level, notes, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          logData.user_id,
          logData.date,
          logData.water_intake,
          logData.mood,
          logData.sleep_hours,
          logData.energy_level,
          logData.notes || null,
          logData.images ? JSON.stringify(logData.images) : null
        ]
      );
      return { id: result.lastID, ...logData };
    } catch (error) {
      console.error('Error creating wellness log:', error.message);
      throw error;
    }
  }

  // Get all logs for a user
  static async findByUserId(userId, startDate = null, endDate = null) {
    try {
      let query = 'SELECT * FROM wellness_logs WHERE user_id = ?';
      const params = [userId];
      
      if (startDate && endDate) {
        query += ' AND date BETWEEN ? AND ?';
        params.push(startDate, endDate);
      } else if (startDate) {
        query += ' AND date >= ?';
        params.push(startDate);
      } else if (endDate) {
        query += ' AND date <= ?';
        params.push(endDate);
      }
      
      query += ' ORDER BY date DESC';
      
      const rows = await this.query(query, params);
      
      // Parse images JSON for each row
      rows.forEach(row => {
        if (row.images) {
          try {
            row.images = JSON.parse(row.images);
          } catch (e) {
            console.error('Error parsing images JSON:', e.message);
            row.images = [];
          }
        } else {
          row.images = [];
        }
      });
      
      return rows;
    } catch (error) {
      console.error('Error finding wellness logs:', error.message);
      throw error;
    }
  }

  // Get a specific log by ID
  static async findById(id) {
    try {
      const row = await this.queryOne(
        'SELECT * FROM wellness_logs WHERE id = ?',
        [id]
      );
      
      if (row) {
        // Parse images JSON if it exists
        if (row.images) {
          try {
            row.images = JSON.parse(row.images);
          } catch (e) {
            console.error('Error parsing images JSON:', e.message);
            row.images = [];
          }
        } else {
          row.images = [];
        }
      }
      
      return row || null;
    } catch (error) {
      console.error('Error finding wellness log by ID:', error.message);
      throw error;
    }
  }

  // Update a wellness log
  static async update(id, logData) {
    try {
      // Build the query dynamically based on what fields are provided
      let fields = [];
      let values = [];
      
      if (logData.water_intake !== undefined) {
        fields.push('water_intake = ?');
        values.push(logData.water_intake);
      }
      
      if (logData.mood !== undefined) {
        fields.push('mood = ?');
        values.push(logData.mood);
      }
      
      if (logData.sleep_hours !== undefined) {
        fields.push('sleep_hours = ?');
        values.push(logData.sleep_hours);
      }
      
      if (logData.energy_level !== undefined) {
        fields.push('energy_level = ?');
        values.push(logData.energy_level);
      }
      
      if (logData.notes !== undefined) {
        fields.push('notes = ?');
        values.push(logData.notes || null);
      }
      
      if (logData.images !== undefined) {
        fields.push('images = ?');
        values.push(JSON.stringify(logData.images));
      }
      
      // Add the ID to the values array
      values.push(id);
      
      // If no fields to update, return false
      if (fields.length === 0) {
        return false;
      }
      
      const query = `UPDATE wellness_logs SET ${fields.join(', ')} WHERE id = ?`;
      const result = await this.execute(query, values);
      return result.changes > 0;
    } catch (error) {
      console.error('Error updating wellness log:', error.message);
      throw error;
    }
  }

  // Delete a wellness log
  static async delete(id) {
    try {
      const result = await this.execute(
        'DELETE FROM wellness_logs WHERE id = ?',
        [id]
      );
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting wellness log:', error.message);
      throw error;
    }
  }

  // Get wellness stats for a user
  static async getStats(userId, startDate = null, endDate = null) {
    try {
      let query = `
        SELECT 
          AVG(water_intake) as avg_water_intake,
          AVG(sleep_hours) as avg_sleep_hours,
          AVG(energy_level) as avg_energy_level,
          COUNT(*) as total_entries
        FROM wellness_logs 
        WHERE user_id = ?
      `;
      
      const params = [userId];
      
      if (startDate && endDate) {
        query += ' AND date BETWEEN ? AND ?';
        params.push(startDate, endDate);
      } else if (startDate) {
        query += ' AND date >= ?';
        params.push(startDate);
      } else if (endDate) {
        query += ' AND date <= ?';
        params.push(endDate);
      }
      
      const stats = await this.queryOne(query, params);
      
      // Get mood distribution
      const moodQuery = `
        SELECT mood, COUNT(*) as count
        FROM wellness_logs
        WHERE user_id = ?
      `;
      
      const moodParams = [userId];
      
      if (startDate && endDate) {
        moodQuery += ' AND date BETWEEN ? AND ?';
        moodParams.push(startDate, endDate);
      } else if (startDate) {
        moodQuery += ' AND date >= ?';
        moodParams.push(startDate);
      } else if (endDate) {
        moodQuery += ' AND date <= ?';
        moodParams.push(endDate);
      }
      
      moodQuery += ' GROUP BY mood';
      
      const moods = await this.query(moodQuery, moodParams);
      
      return {
        ...stats,
        mood_distribution: moods
      };
    } catch (error) {
      console.error('Error getting wellness stats:', error.message);
      throw error;
    }
  }
}

module.exports = WellnessLog;