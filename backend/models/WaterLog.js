const BaseModel = require('./BaseModel');

class WaterLog extends BaseModel {
  static async add(userId, date, amount_ml) {
    const res = await this.execute(
      `INSERT INTO water_logs (user_id, date, amount_ml) VALUES (?, ?, ?)`,
      [userId, date, amount_ml]
    );
    return { id: res.lastID, user_id: userId, date, amount_ml };
  }

  static async totalByDate(userId, date) {
    return await this.queryOne(
      `SELECT COALESCE(SUM(amount_ml), 0) as total_ml FROM water_logs WHERE user_id = ? AND date = ?`,
      [userId, date]
    );
  }

  static async listRange(userId, startDate, endDate) {
    return await this.query(
      `SELECT date, COALESCE(SUM(amount_ml), 0) as total_ml FROM water_logs WHERE user_id = ? AND date BETWEEN ? AND ? GROUP BY date ORDER BY date`,
      [userId, startDate, endDate]
    );
  }
}

module.exports = WaterLog;
