const { dbAsync } = require('./sqlite-db');
const path = require('path');
const fs = require('fs');

// Function to clear all tables in the database
async function clearDatabase() {
  try {
    console.log('Starting database clearing process...');
    
    // Get all tables in the database
    const tables = await dbAsync.all(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
    );
    
    console.log(`Found ${tables.length} tables to clear`);
    
    // Begin transaction
    await dbAsync.exec('BEGIN TRANSACTION;');
    
    // Disable foreign key constraints temporarily
    await dbAsync.exec('PRAGMA foreign_keys = OFF;');
    
    // Delete all data from each table
    for (const table of tables) {
      const tableName = table.name;
      console.log(`Clearing table: ${tableName}`);
      await dbAsync.exec(`DELETE FROM ${tableName};`);
      
      // Reset auto-increment counters
      await dbAsync.exec(`DELETE FROM sqlite_sequence WHERE name='${tableName}';`);
    }
    
    // Re-enable foreign key constraints
    await dbAsync.exec('PRAGMA foreign_keys = ON;');
    
    // Commit transaction
    await dbAsync.exec('COMMIT;');
    
    console.log('Database cleared successfully!');
    return true;
  } catch (error) {
    // Rollback transaction in case of error
    try {
      await dbAsync.exec('ROLLBACK;');
    } catch (rollbackError) {
      console.error('Error during rollback:', rollbackError.message);
    }
    
    console.error('Error clearing database:', error.message);
    return false;
  }
}

// Export the function
module.exports = { clearDatabase };

// If this script is run directly (not imported), clear the database
if (require.main === module) {
  clearDatabase()
    .then(success => {
      if (success) {
        console.log('Database clearing completed.');
        process.exit(0);
      } else {
        console.error('Database clearing failed.');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Unexpected error during database clearing:', error);
      process.exit(1);
    });
}