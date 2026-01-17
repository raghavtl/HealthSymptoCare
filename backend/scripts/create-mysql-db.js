require('dotenv').config();
const mysql = require('mysql2/promise');

async function createDatabase() {
  // Create a connection without specifying a database
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  try {
    // Create the database if it doesn't exist
    const dbName = process.env.DB_NAME || 'health_buddy';
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`Database '${dbName}' created or already exists`);

    // Grant privileges to the user
    await connection.query(`GRANT ALL PRIVILEGES ON ${dbName}.* TO '${process.env.DB_USER || 'root'}'@'${process.env.DB_HOST || 'localhost'}'`);
    await connection.query('FLUSH PRIVILEGES');
    console.log('User privileges granted');

    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error creating database:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run the script
createDatabase()
  .then(() => {
    console.log('Database creation script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Database creation script failed:', error);
    process.exit(1);
  });