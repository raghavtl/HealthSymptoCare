const { dbAsync } = require('./sqlite-db');

async function updateWellnessLogsSchema() {
  try {
    console.log('Starting database schema update...');
    
    // Check if images column exists
    const tableInfo = await dbAsync.all("PRAGMA table_info(wellness_logs)");
    const hasImagesColumn = tableInfo.some(column => column.name === 'images');
    
    if (!hasImagesColumn) {
      console.log('Adding images column to wellness_logs table...');
      await dbAsync.run('ALTER TABLE wellness_logs ADD COLUMN images TEXT');
      console.log('Successfully added images column to wellness_logs table');
    } else {
      console.log('Images column already exists in wellness_logs table');
    }
    
    console.log('Database schema update completed successfully');
  } catch (error) {
    console.error('Error updating database schema:', error.message);
    throw error;
  }
}

// Run the update function
updateWellnessLogsSchema()
  .then(() => {
    console.log('Schema update script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Schema update failed:', error);
    process.exit(1);
  });