const BaseModel = require('./BaseModel');

class WorkoutSchedule extends BaseModel {
  static async schedule(userId, date, workoutId, notes = null) {
    const res = await this.execute(
      `INSERT INTO workout_schedules (user_id, date, workout_id, status, notes) VALUES (?, ?, ?, 'scheduled', ?)`,
      [userId, date, workoutId, notes]
    );
    return { id: res.lastID, user_id: userId, date, workout_id: workoutId, status: 'scheduled', notes };
  }

  static async listByDate(userId, date) {
    return await this.query(
      `SELECT ws.*, w.name as workout_name, w.category, w.level, w.image_url, w.video_url
       FROM workout_schedules ws LEFT JOIN workouts w ON ws.workout_id = w.id
       WHERE ws.user_id = ? AND ws.date = ? ORDER BY ws.created_at ASC`,
      [userId, date]
    );
  }

  static async countsRange(userId, startDate, endDate) {
    return await this.query(
      `SELECT date,
              SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled,
              SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
              SUM(CASE WHEN status = 'skipped' THEN 1 ELSE 0 END) as skipped
       FROM workout_schedules
       WHERE user_id = ? AND date BETWEEN ? AND ?
       GROUP BY date
       ORDER BY date`,
      [userId, startDate, endDate]
    );
  }

  static async updateStatus(id, userId, status) {
    const res = await this.execute(
      `UPDATE workout_schedules SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`,
      [status, id, userId]
    );
    return res.changes > 0;
  }
}

module.exports = WorkoutSchedule;
