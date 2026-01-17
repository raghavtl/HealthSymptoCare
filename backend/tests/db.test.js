const { resetDatabase } = require('../reset-database');
const { testConnection } = require('../config/sqlite-db');

describe('Database utilities', () => {
  it('connects to SQLite', async () => {
    const ok = await testConnection();
    expect(ok).toBe(true);
  });

  it('can reset the database', async () => {
    const ok = await resetDatabase();
    expect(ok).toBe(true);
  });
});
