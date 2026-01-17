const express = require('express');
const router = express.Router();
const HealthTip = require('../models/HealthTip');

// Get all health tips
router.get('/', async (req, res) => {
  try {
    const tips = await HealthTip.getAll();
    res.status(200).json(tips);
  } catch (error) {
    console.error('Error fetching health tips:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get health tips by category
router.get('/category/:category', async (req, res) => {
  try {
    const tips = await HealthTip.getByCategory(req.params.category);
    res.status(200).json(tips);
  } catch (error) {
    console.error('Error fetching health tips by category:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific health tip
router.get('/:id', async (req, res) => {
  try {
    const tip = await HealthTip.findById(req.params.id);
    
    if (!tip) {
      return res.status(404).json({ message: 'Health tip not found' });
    }
    
    res.status(200).json(tip);
  } catch (error) {
    console.error('Error fetching health tip:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new health tip (admin only)
router.post('/', async (req, res) => {
  try {
    const { category, title, content } = req.body;
    
    // Validate required fields
    if (!category || !title || !content) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const newTip = await HealthTip.create({ category, title, content });
    
    res.status(201).json({
      message: 'Health tip created successfully',
      tip: newTip
    });
  } catch (error) {
    console.error('Error creating health tip:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a health tip (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { category, title, content } = req.body;
    
    // Validate required fields
    if (!category || !title || !content) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const updated = await HealthTip.update(req.params.id, { category, title, content });
    
    if (!updated) {
      return res.status(404).json({ message: 'Health tip not found' });
    }
    
    res.status(200).json({ message: 'Health tip updated successfully' });
  } catch (error) {
    console.error('Error updating health tip:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a health tip (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await HealthTip.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Health tip not found' });
    }
    
    res.status(200).json({ message: 'Health tip deleted successfully' });
  } catch (error) {
    console.error('Error deleting health tip:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;