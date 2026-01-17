const BaseModel = require('./BaseModel');

class Food extends BaseModel {
  static async search(query = '', isVeg = null, limit = 50) {
    let sql = 'SELECT * FROM foods WHERE 1=1';
    const params = [];
    if (query) { sql += ' AND name LIKE ?'; params.push(`%${query}%`); }
    if (isVeg !== null) { sql += ' AND is_veg = ?'; params.push(isVeg ? 1 : 0); }
    sql += ' ORDER BY name LIMIT ?';
    params.push(limit);
    return await this.query(sql, params);
  }

  static async findById(id) {
    return await this.queryOne('SELECT * FROM foods WHERE id = ?', [id]);
  }
}

module.exports = Food;
