const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');
const { validateRegistration, validateLogin, handleValidationErrors } = require('../middleware/validation');
const User = require('../models/User');

// Get user profile - protected route
router.get('/profile/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register a new user
router.post('/register', validateRegistration, handleValidationErrors, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // Email should already be normalized by the validation middleware
    console.log(`Registration attempt for email: ${email}, username: ${username}`);
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      console.log(`Registration failed: User already exists with email: ${email}`);
      return res.status(409).json({ message: 'User already exists with this email' });
    }
    
    // Create new user
    // Password is hashed in the User.create method
    const newUser = await User.create({ username, email, password });
    console.log(`User registered successfully: ${username} (${email}), ID: ${newUser.id}`);
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('Error registering user:', error.message);
    console.error('Error stack:', error.stack);
    
    // Provide more specific error messages when possible
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ message: 'User already exists with this email' });
    }
    
    res.status(500).json({ message: 'Registration failed. Please try again later.' });
  }
});

// Login user
router.post('/login', validateLogin, handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;
    // Email should already be normalized by the validation middleware
    console.log(`Login attempt for email: ${email}`);
    
    // Normalize the login email for consistent comparison
    const normalizedLoginEmail = email.toLowerCase().trim();
    console.log(`Normalized login email: ${normalizedLoginEmail}`);
    
    // Find user by email - this will try exact match first, then case-insensitive match
    const user = await User.findByEmail(email);
    if (!user) {
      console.log(`Login failed: User not found for email: ${email}`);
      // Don't reveal whether the email exists or not for security
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Log email comparison for debugging
    console.log(`Email comparison:`, {
      loginEmail: normalizedLoginEmail,
      databaseEmail: user.email.toLowerCase().trim(),
      match: normalizedLoginEmail === user.email.toLowerCase().trim()
    });
    
    // Verify password
    const isPasswordValid = await User.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      console.log(`Login failed: Invalid password for email: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = User.generateToken(user);
    console.log(`Login successful for user: ${user.username} (${user.email})`);
    
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error logging in user:', error.message);
    console.error('Error details:', error.stack);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Update user profile - protected route
router.put('/profile/:id', authenticateToken, async (req, res) => {
  try {
    const { username, email } = req.body;
    
    // Update user
    const updated = await User.update(req.params.id, { username, email });
    
    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ message: 'User profile updated successfully' });
  } catch (error) {
    console.error('Error updating user profile:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user account
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await User.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Error deleting user account:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users - admin only route
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  // JWT is stateless, so we don't need to do anything server-side
  // The client should remove the token from storage
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;