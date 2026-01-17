const BaseModel = require('./BaseModel');

class WeightLog extends BaseModel {
  static async add(userId, date, weight_kg) {
    const res = await this.execute(
      `INSERT INTO weight_logs (user_id, date, weight_kg) VALUES (?, ?, ?)`,
      [userId, date, weight_kg]
    );
    return { id: res.lastID, user_id: userId, date, weight_kg };
  }

  static async listRange(userId, startDate, endDate) {
    return await this.query(
      `SELECT date, weight_kg FROM weight_logs WHERE user_id = ? AND date BETWEEN ? AND ? ORDER BY date`,
      [userId, startDate, endDate]
    );
  }
}

module.exports = WeightLog;
