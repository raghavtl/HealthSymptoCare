const BaseModel = require('./BaseModel');

class Recipe extends BaseModel {
  static async search(query = '', isVeg = null, filters = {}, limit = 100) {
    let sql = 'SELECT id, name, is_veg, calories, protein_g, carbs_g, fat_g, tags FROM recipes WHERE 1=1';
    const params = [];
    if (query) { sql += ' AND name LIKE ?'; params.push(`%${query}%`); }
    if (isVeg !== null) { sql += ' AND is_veg = ?'; params.push(isVeg ? 1 : 0); }
    if (filters.minCal != null) { sql += ' AND calories >= ?'; params.push(filters.minCal); }
    if (filters.maxCal != null) { sql += ' AND calories <= ?'; params.push(filters.maxCal); }
    if (filters.tags && Array.isArray(filters.tags) && filters.tags.length) {
      for (const tag of filters.tags) {
        sql += ' AND (tags LIKE ?)';
        params.push(`%${tag}%`);
      }
    }
    sql += ' ORDER BY name, id LIMIT ?';
    params.push(limit);
    const rows = await this.query(sql, params);
    // Deduplicate by name to avoid repeated cards even if DB has duplicates
    const seen = new Set();
    const clean = [];
    for (const r of rows) {
      const key = (r.name || '').toLowerCase();
      if (!seen.has(key)) { seen.add(key); clean.push(r); }
    }
    return clean.map(r => ({ ...r, tags: r.tags ? JSON.parse(r.tags) : [] }));
  }

  static async findById(id) {
    const row = await this.queryOne('SELECT * FROM recipes WHERE id = ?', [id]);
    if (!row) return null;
    return {
      ...row,
      ingredients: row.ingredients ? JSON.parse(row.ingredients) : [],
      steps: row.steps ? JSON.parse(row.steps) : []
    };
  }
}

module.exports = Recipe;
