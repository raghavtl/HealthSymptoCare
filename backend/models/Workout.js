const BaseModel = require('./BaseModel');

class Workout extends BaseModel {
  static async list(level = null, category = null) {
    let sql = 'SELECT * FROM workouts WHERE 1=1';
    const params = [];
    if (level) { sql += ' AND level = ?'; params.push(level); }
    if (category) { sql += ' AND category = ?'; params.push(category); }
    sql += ' ORDER BY name';
    return await this.query(sql, params);
  }

  static async findById(id) {
    return await this.queryOne('SELECT * FROM workouts WHERE id = ?', [id]);
  }
}

module.exports = Workout;
