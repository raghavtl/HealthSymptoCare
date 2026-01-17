const User = require('../models/User');
const { dbAsync } = require('../config/sqlite-db');
require('dotenv').config();

async function createAdminUser() {
  try {
    // Database connection is already initialized in the sqlite-db.js file
    
    // Admin user data
    const adminData = {
      username: 'admin',
      email: 'admin@healthbuddy.com',
      password: 'Admin@123',  // This is just an example, use a strong password in production
      role: 'admin'
    };
    
    // Check if admin user already exists
    const existingUser = await User.findByEmail(adminData.email);
    
    if (existingUser) {
      console.log('Admin user already exists!');
      process.exit(0);
    }
    
    // Create admin user
    const newAdmin = await User.create(adminData);
    
    console.log('Admin user created successfully:');
    console.log(`Username: ${newAdmin.username}`);
    console.log(`Email: ${newAdmin.email}`);
    console.log(`Role: ${newAdmin.role}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  }
}

// Run the function
createAdminUser();