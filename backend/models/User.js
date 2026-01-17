const BaseModel = require('./BaseModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class User extends BaseModel {
  // Create a new user
  static async create(userData) {
    try {
      console.log(`Creating new user with email: ${userData.email}, username: ${userData.username}`);
      
      // Validate required fields
      if (!userData.username || !userData.email || !userData.password) {
        console.error('Missing required user data:', { 
          hasUsername: !!userData.username, 
          hasEmail: !!userData.email, 
          hasPassword: !!userData.password 
        });
        throw new Error('Missing required user data');
      }
      
      // Ensure email is normalized to lowercase for consistent storage
      const normalizedEmail = userData.email.toLowerCase().trim();
      console.log(`Original email: ${userData.email}, Normalized email: ${normalizedEmail}`);
      
      // Check if user already exists with this email (case-insensitive)
      const existingUser = await this.queryOne(
        'SELECT id FROM users WHERE LOWER(email) = LOWER(?)',
        [normalizedEmail]
      );
      
      if (existingUser) {
        console.error(`User already exists with email: ${normalizedEmail}`);
        throw new Error('User already exists with this email');
      }
      
      // Hash the password
      console.log('Hashing password...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Set default role if not provided
      const role = userData.role || 'user';
      console.log(`User role set to: ${role}`);
      
      console.log('Inserting user into database...');
      const result = await this.execute(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [userData.username, normalizedEmail, hashedPassword, role]
      );
      
      console.log(`User created successfully with ID: ${result.lastID}`);
      
      // Don't return the password
      const { password, ...userWithoutPassword } = userData;
      return { id: result.lastID, role, email: normalizedEmail, ...userWithoutPassword };
    } catch (error) {
      console.error('Error creating user:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const row = await this.queryOne(
        'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
        [id]
      );
      return row || null;
    } catch (error) {
      console.error('Error finding user by ID:', error.message);
      throw error;
    }
  }
  
  // Find all users
  static async findAll() {
    try {
      const rows = await this.query(
        'SELECT id, username, email, role, created_at FROM users'
      );
      return rows || [];
    } catch (error) {
      console.error('Error finding all users:', error.message);
      throw error;
    }
  }

  // Find a user by email
  static async findByEmail(email) {
    try {
      console.log(`Looking for user with email: ${email}`);
      if (!email) {
        console.error('No email provided for findByEmail');
        return null;
      }
      
      // Normalize email to lowercase for consistent lookup
      const normalizedEmail = email.toLowerCase().trim();
      console.log(`Normalized email for lookup: ${normalizedEmail}`);
      
      // First try exact match with normalized email
      let row = await this.queryOne(
        'SELECT id, username, email, password, role, created_at FROM users WHERE email = ?',
        [normalizedEmail]
      );
      
      // If no exact match, try case-insensitive comparison
      if (!row) {
        console.log(`No exact match found, trying case-insensitive search for: ${normalizedEmail}`);
        row = await this.queryOne(
          'SELECT id, username, email, password, role, created_at FROM users WHERE LOWER(email) = LOWER(?)',
          [normalizedEmail]
        );
      }
      
      if (row) {
        console.log(`User found with ID: ${row.id}, email: ${row.email}`);
        console.log(`Comparing input email: ${normalizedEmail} with stored email: ${row.email.toLowerCase()}`);
      } else {
        console.log('No user found with this email');
      }
      
      return row || null;
    } catch (error) {
      console.error('Error finding user by email:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }
  
  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      console.log('Verifying password...');
      if (!plainPassword || !hashedPassword) {
        console.error('Missing password data:', { 
          hasPlainPassword: !!plainPassword, 
          hasHashedPassword: !!hashedPassword 
        });
        return false;
      }
      
      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      console.log('Password verification result:', isMatch);
      return isMatch;
    } catch (error) {
      console.error('Error verifying password:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }
  
  // Generate JWT token
  static generateToken(user) {
    try {
      console.log(`Generating token for user ID: ${user.id}, email: ${user.email}`);
      
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined in environment variables');
        throw new Error('JWT_SECRET is not defined');
      }
      
      if (!process.env.JWT_EXPIRES_IN) {
        console.warn('JWT_EXPIRES_IN is not defined, using default of 7d');
      }
      
      const payload = {
        id: user.id,
        email: user.email,
        role: user.role
      };
      
      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
      
      console.log('Token generated successfully');
      return token;
    } catch (error) {
      console.error('Error generating token:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  // Update user
  static async update(id, userData) {
    try {
      const result = await this.execute(
        'UPDATE users SET username = ?, email = ? WHERE id = ?',
        [userData.username, userData.email, id]
      );
      return result.changes > 0;
    } catch (error) {
      console.error('Error updating user:', error.message);
      throw error;
    }
  }

  // Delete user
  static async delete(id) {
    try {
      const result = await this.execute(
        'DELETE FROM users WHERE id = ?',
        [id]
      );
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting user:', error.message);
      throw error;
    }
  }
}

module.exports = User;