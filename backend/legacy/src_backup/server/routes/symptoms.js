const express = require('express');
const router = express.Router();
const Symptom = require('../models/Symptom');

// Get all symptoms
router.get('/', async (req, res) => {
  try {
    const symptoms = await Symptom.getAll();
    res.status(200).json(symptoms);
  } catch (error) {
    console.error('Error fetching symptoms:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all body parts
router.get('/body-parts', async (req, res) => {
  try {
    const bodyParts = await Symptom.getAllBodyParts();
    res.status(200).json(bodyParts);
  } catch (error) {
    console.error('Error fetching body parts:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get symptoms by body part
router.get('/body-part/:bodyPart', async (req, res) => {
  try {
    const symptoms = await Symptom.getByBodyPart(req.params.bodyPart);
    res.status(200).json(symptoms);
  } catch (error) {
    console.error('Error fetching symptoms by body part:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get possible conditions based on symptoms
router.post('/check', async (req, res) => {
  try {
    const { symptomIds } = req.body;
    
    if (!symptomIds || !Array.isArray(symptomIds) || symptomIds.length === 0) {
      return res.status(400).json({ message: 'Please provide a valid array of symptom IDs' });
    }
    
    const conditions = await Symptom.getPossibleConditions(symptomIds);
    
    res.status(200).json({
      results: conditions,
      disclaimer: "This is not a medical diagnosis. Please consult with a healthcare professional for proper medical advice."
    });
  } catch (error) {
    console.error('Error checking symptoms:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add a new symptom (admin only)
router.post('/', async (req, res) => {
  try {
    const { name, description, bodyPartIds } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Symptom name is required' });
    }
    
    const newSymptom = await Symptom.create({ name, description, bodyPartIds });
    
    res.status(201).json({
      message: 'Symptom created successfully',
      symptom: newSymptom
    });
  } catch (error) {
    console.error('Error creating symptom:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a symptom (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { name, description, bodyPartIds } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Symptom name is required' });
    }
    
    const updated = await Symptom.update(req.params.id, { name, description, bodyPartIds });
    
    if (!updated) {
      return res.status(404).json({ message: 'Symptom not found' });
    }
    
    res.status(200).json({ message: 'Symptom updated successfully' });
  } catch (error) {
    console.error('Error updating symptom:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a symptom (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Symptom.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Symptom not found' });
    }
    
    res.status(200).json({ message: 'Symptom deleted successfully' });
  } catch (error) {
    console.error('Error deleting symptom:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;