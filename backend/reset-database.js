const { clearDatabase } = require('./config/clear-database');
const { initializeSQLiteDatabase } = require('./config/init-sqlite-db');

// Function to reset the database (clear and reinitialize)
async function resetDatabase() {
  try {
    console.log('Starting database reset process...');
    
    // Step 1: Clear the database
    console.log('Step 1: Clearing the database...');
    const clearSuccess = await clearDatabase();
    
    if (!clearSuccess) {
      throw new Error('Failed to clear the database');
    }
    
    // Step 2: Reinitialize the database
    console.log('Step 2: Reinitializing the database...');
    await initializeSQLiteDatabase();
    
    console.log('Database reset completed successfully!');
    return true;
  } catch (error) {
    console.error('Error resetting database:', error.message);
    return false;
  }
}

// If this script is run directly (not imported), reset the database
if (require.main === module) {
  resetDatabase()
    .then(success => {
      if (success) {
        console.log('Database reset completed.');
        process.exit(0);
      } else {
        console.error('Database reset failed.');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Unexpected error during database reset:', error);
      process.exit(1);
    });
}

module.exports = { resetDatabase };