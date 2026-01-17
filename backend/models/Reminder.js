const BaseModel = require('./BaseModel');

class Reminder extends BaseModel {
  static async upsert(userId, type, time, frequency = 'daily', enabled = 1, label = null) {
    const existing = await this.queryOne('SELECT id FROM reminders WHERE user_id = ? AND type = ?', [userId, type]);
    if (existing) {
      await this.execute(
        `UPDATE reminders SET time = ?, frequency = ?, enabled = ?, label = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [time, frequency, enabled ? 1 : 0, label, existing.id]
      );
      return true;
    } else {
      await this.execute(
        `INSERT INTO reminders (user_id, type, time, frequency, enabled, label) VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, type, time, frequency, enabled ? 1 : 0, label]
      );
      return true;
    }
  }

  static async list(userId) {
    return await this.query('SELECT * FROM reminders WHERE user_id = ? ORDER BY type', [userId]);
  }
}

module.exports = Reminder;
