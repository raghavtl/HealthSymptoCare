const { dbAsync } = require('./config/sqlite-db');

async function checkWellnessLogs() {
  try {
    console.log('Checking wellness_logs table...');
    
    // Check if the table exists
    const tableExists = await dbAsync.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='wellness_logs'"
    );
    
    if (!tableExists) {
      console.log('wellness_logs table does not exist!');
      return;
    }
    
    // Count records
    const count = await dbAsync.get('SELECT COUNT(*) as count FROM wellness_logs');
    console.log(`Total wellness logs: ${count.count}`);
    
    // Get sample records
    if (count.count > 0) {
      const logs = await dbAsync.all('SELECT * FROM wellness_logs LIMIT 5');
      console.log('Sample wellness logs:');
      console.log(JSON.stringify(logs, null, 2));
    } else {
      console.log('No wellness logs found. Creating a sample log...');
      
      // Insert a sample log for user ID 1
      const today = new Date().toISOString().split('T')[0];
      await dbAsync.run(
        'INSERT INTO wellness_logs (user_id, date, water_intake, mood, sleep_hours, energy_level, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [1, today, 8, 4, 7, 8, 'Sample log created for testing']
      );
      
      console.log('Sample wellness log created for user ID 1');
      
      // Verify the insertion
      const logs = await dbAsync.all('SELECT * FROM wellness_logs');
      console.log('Wellness logs after insertion:');
      console.log(JSON.stringify(logs, null, 2));
    }
  } catch (error) {
    console.error('Error checking wellness logs:', error);
  } finally {
    process.exit(0);
  }
}

checkWellnessLogs();