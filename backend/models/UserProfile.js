const BaseModel = require('./BaseModel');

class UserProfile extends BaseModel {
  static async upsert(userId, data) {
    // Ensure a single profile per user
    const existing = await this.queryOne('SELECT id FROM user_profiles WHERE user_id = ?', [userId]);
    const fields = [
      'age','gender','height_cm','weight_kg','activity_level','dietary_preference','goal',
      'target_calories','target_protein_g','target_carbs_g','target_fat_g'
    ];
    const values = fields.map(f => data[f] ?? null);

    if (existing) {
      const setClause = fields.map(f => `${f} = ?`).join(', ');
      await this.execute(`UPDATE user_profiles SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`, [...values, userId]);
      return true;
    } else {
      await this.execute(
        `INSERT INTO user_profiles (user_id, ${fields.join(', ')}) VALUES (?, ${fields.map(_=>'?').join(', ')})`,
        [userId, ...values]
      );
      return true;
    }
  }

  static async getByUserId(userId) {
    return await this.queryOne('SELECT * FROM user_profiles WHERE user_id = ?', [userId]);
  }
}

module.exports = UserProfile;
