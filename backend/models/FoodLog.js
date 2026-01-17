const BaseModel = require('./BaseModel');

class FoodLog extends BaseModel {
  static async create(entry) {
    const { user_id, date, meal_type, food_id, quantity_g, calories, protein_g, carbs_g, fat_g } = entry;
    const res = await this.execute(
      `INSERT INTO food_logs (user_id, date, meal_type, food_id, quantity_g, calories, protein_g, carbs_g, fat_g)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, date, meal_type, food_id, quantity_g, calories, protein_g, carbs_g, fat_g]
    );
    return { id: res.lastID, ...entry };
  }

  static async listByDate(userId, date) {
    return await this.query(
      `SELECT fl.*, f.name as food_name FROM food_logs fl
       LEFT JOIN foods f ON fl.food_id = f.id
       WHERE fl.user_id = ? AND fl.date = ? ORDER BY fl.created_at ASC`,
      [userId, date]
    );
  }

  static async listRange(userId, startDate, endDate) {
    return await this.query(
      `SELECT date, SUM(calories) as calories, SUM(protein_g) as protein_g, SUM(carbs_g) as carbs_g, SUM(fat_g) as fat_g
       FROM food_logs WHERE user_id = ? AND date BETWEEN ? AND ?
       GROUP BY date ORDER BY date`,
      [userId, startDate, endDate]
    );
  }

  static async delete(id, userId) {
    const result = await this.execute('DELETE FROM food_logs WHERE id = ? AND user_id = ?', [id, userId]);
    return result.changes > 0;
  }

  static async update(id, userId, data) {
    const fields = [];
    const params = [];
    for (const k of ['meal_type','quantity_g','calories','protein_g','carbs_g','fat_g']) {
      if (data[k] !== undefined) { fields.push(`${k} = ?`); params.push(data[k]); }
    }
    if (fields.length === 0) return false;
    params.push(id, userId);
    const res = await this.execute(`UPDATE food_logs SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`, params);
    return res.changes > 0;
  }
}

module.exports = FoodLog;
