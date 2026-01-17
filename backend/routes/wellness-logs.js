const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const WellnessLog = require('../models/WellnessLog');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/wellness-logs');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Get all logs for a user
router.get('/user/:userId', async (req, res) => {
  try {
    console.log(`Received request for wellness logs for user ID: ${req.params.userId}`);
    console.log('Query parameters:', req.query);
    
    const { startDate, endDate } = req.query;
    const logs = await WellnessLog.findByUserId(req.params.userId, startDate, endDate);
    
    console.log(`Found ${logs.length} wellness logs for user ID: ${req.params.userId}`);
    res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching wellness logs:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get statistics for a user's logs
router.get('/user/:userId/statistics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const statistics = await WellnessLog.getStatistics(req.params.userId, startDate, endDate);
    res.status(200).json(statistics);
  } catch (error) {
    console.error('Error fetching wellness statistics:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific log
router.get('/:id', async (req, res) => {
  try {
    const log = await WellnessLog.findById(req.params.id);
    
    if (!log) {
      return res.status(404).json({ message: 'Wellness log not found' });
    }
    
    res.status(200).json(log);
  } catch (error) {
    console.error('Error fetching wellness log:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new log
router.post('/', async (req, res) => {
  try {
    const { user_id, date, water_intake, mood, sleep_hours, energy_level, notes } = req.body;
    
    // Validate required fields
    if (!user_id || !date || water_intake === undefined || !mood || sleep_hours === undefined || energy_level === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const newLog = await WellnessLog.create({
      user_id,
      date,
      water_intake,
      mood,
      sleep_hours,
      energy_level,
      notes
    });
    
    res.status(201).json({
      message: 'Wellness log created successfully',
      log: newLog
    });
  } catch (error) {
    console.error('Error creating wellness log:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a log
router.put('/:id', async (req, res) => {
  try {
    const { water_intake, mood, sleep_hours, energy_level, notes } = req.body;
    
    // Validate required fields
    if (water_intake === undefined || !mood || sleep_hours === undefined || energy_level === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const updated = await WellnessLog.update(req.params.id, {
      water_intake,
      mood,
      sleep_hours,
      energy_level,
      notes
    });
    
    if (!updated) {
      return res.status(404).json({ message: 'Wellness log not found' });
    }
    
    res.status(200).json({ message: 'Wellness log updated successfully' });
  } catch (error) {
    console.error('Error updating wellness log:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a log
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await WellnessLog.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Wellness log not found' });
    }
    
    res.status(200).json({ message: 'Wellness log deleted successfully' });
  } catch (error) {
    console.error('Error deleting wellness log:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upload image for a wellness log
router.post('/:id/images', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const logId = req.params.id;
    const log = await WellnessLog.findById(logId);
    
    if (!log) {
      // Remove uploaded file if log doesn't exist
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Wellness log not found' });
    }

    // Create image URL
    const imageUrl = `/uploads/wellness-logs/${path.basename(req.file.path)}`;
    
    // Update log with image
    const images = log.images || [];
    images.push(imageUrl);
    
    await WellnessLog.update(logId, { images });
    
    res.status(200).json({ 
      message: 'Image uploaded successfully',
      imageUrl
    });
  } catch (error) {
    console.error('Error uploading image:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete image from a wellness log
router.delete('/:id/images/:imageIndex', async (req, res) => {
  try {
    const logId = req.params.id;
    const imageIndex = parseInt(req.params.imageIndex);
    
    if (isNaN(imageIndex)) {
      return res.status(400).json({ message: 'Invalid image index' });
    }
    
    const log = await WellnessLog.findById(logId);
    
    if (!log) {
      return res.status(404).json({ message: 'Wellness log not found' });
    }
    
    if (!log.images || !log.images[imageIndex]) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    // Get image path
    const imagePath = log.images[imageIndex];
    const fullPath = path.join(__dirname, '..', imagePath);
    
    // Remove image from filesystem if it exists
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
    
    // Remove image from log
    const images = [...log.images];
    images.splice(imageIndex, 1);
    
    await WellnessLog.update(logId, { images });
    
    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;