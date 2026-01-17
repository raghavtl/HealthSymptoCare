const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const Condition = require('../models/Condition');

// Get all medicines
router.get('/', async (req, res) => {
  try {
    const medicines = await Medicine.getAll();
    res.json(medicines);
  } catch (error) {
    console.error('Error fetching medicines:', error);
    res.status(500).json({ error: 'Failed to fetch medicines' });
  }
});

// Get medicine by ID
router.get('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.getById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }
    res.json(medicine);
  } catch (error) {
    console.error('Error fetching medicine:', error);
    res.status(500).json({ error: 'Failed to fetch medicine' });
  }
});

// Get medicines by condition ID
router.get('/condition/:conditionId', async (req, res) => {
  try {
    const medicines = await Medicine.getByCondition(req.params.conditionId);
    res.json(medicines);
  } catch (error) {
    console.error('Error fetching medicines for condition:', error);
    res.status(500).json({ error: 'Failed to fetch medicines for condition' });
  }
});

// Create a new medicine (admin route)
router.post('/', async (req, res) => {
  try {
    const { name, description, dosage, sideEffects, precautions, interactions, conditionIds } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Medicine name is required' });
    }
    
    // Create medicine
    const medicineData = {
      name,
      description: description || '',
      dosage: dosage || '',
      sideEffects: sideEffects || '',
      precautions: precautions || '',
      interactions: interactions || '',
      conditionIds: conditionIds || []
    };
    
    const newMedicine = await Medicine.create(medicineData);
    res.status(201).json(newMedicine);
  } catch (error) {
    console.error('Error creating medicine:', error);
    res.status(500).json({ error: 'Failed to create medicine' });
  }
});

// Update a medicine (admin route)
router.put('/:id', async (req, res) => {
  try {
    const { name, description, dosage, sideEffects, precautions, interactions, conditionIds } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Medicine name is required' });
    }
    
    // Check if medicine exists
    const existingMedicine = await Medicine.getById(req.params.id);
    if (!existingMedicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }
    
    // Update medicine
    const medicineData = {
      name,
      description: description || '',
      dosage: dosage || '',
      sideEffects: sideEffects || '',
      precautions: precautions || '',
      interactions: interactions || '',
      conditionIds: conditionIds || []
    };
    
    const updated = await Medicine.update(req.params.id, medicineData);
    if (updated) {
      res.json({ id: req.params.id, ...medicineData });
    } else {
      res.status(500).json({ error: 'Failed to update medicine' });
    }
  } catch (error) {
    console.error('Error updating medicine:', error);
    res.status(500).json({ error: 'Failed to update medicine' });
  }
});

// Delete a medicine (admin route)
router.delete('/:id', async (req, res) => {
  try {
    // Check if medicine exists
    const existingMedicine = await Medicine.getById(req.params.id);
    if (!existingMedicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }
    
    const deleted = await Medicine.delete(req.params.id);
    if (deleted) {
      res.json({ message: 'Medicine deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete medicine' });
    }
  } catch (error) {
    console.error('Error deleting medicine:', error);
    res.status(500).json({ error: 'Failed to delete medicine' });
  }
});

module.exports = router;