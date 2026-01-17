const express = require('express');
const router = express.Router();
const WellnessLog = require('../models/WellnessLog');

// Get all logs for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const logs = await WellnessLog.findByUserId(req.params.userId, startDate, endDate);
    res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching wellness logs:', error.message);
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

module.exports = router;