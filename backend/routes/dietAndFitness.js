const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const UserProfile = require('../models/UserProfile');
const Food = require('../models/Food');
const FoodLog = require('../models/FoodLog');
const Recipe = require('../models/Recipe');
const Workout = require('../models/Workout');
const WorkoutSchedule = require('../models/WorkoutSchedule');
const WeightLog = require('../models/WeightLog');
const WaterLog = require('../models/WaterLog');
const Reminder = require('../models/Reminder');

// Mock data for diet and fitness plans
const dietPlans = {
  general: {
    none: [
      { meal: 'Breakfast', suggestion: 'Oatmeal with fruits and nuts', calories: 350 },
      { meal: 'Lunch', suggestion: 'Grilled chicken salad with olive oil dressing', calories: 450 },
      { meal: 'Snack', suggestion: 'Greek yogurt with honey', calories: 200 },
      { meal: 'Dinner', suggestion: 'Baked salmon with roasted vegetables', calories: 500 }
    ],
    vegetarian: [
      { meal: 'Breakfast', suggestion: 'Avocado toast with eggs', calories: 350 },
      { meal: 'Lunch', suggestion: 'Quinoa bowl with roasted vegetables', calories: 400 },
      { meal: 'Snack', suggestion: 'Hummus with carrot sticks', calories: 150 },
      { meal: 'Dinner', suggestion: 'Lentil soup with whole grain bread', calories: 450 }
    ],
    vegan: [
      { meal: 'Breakfast', suggestion: 'Chia seed pudding with almond milk and berries', calories: 300 },
      { meal: 'Lunch', suggestion: 'Buddha bowl with tofu and tahini dressing', calories: 450 },
      { meal: 'Snack', suggestion: 'Trail mix with nuts and dried fruits', calories: 200 },
      { meal: 'Dinner', suggestion: 'Chickpea curry with brown rice', calories: 500 }
    ]
  },
  weightLoss: {
    none: [
      { meal: 'Breakfast', suggestion: 'Protein smoothie with spinach and berries', calories: 250 },
      { meal: 'Lunch', suggestion: 'Grilled chicken with steamed broccoli', calories: 350 },
      { meal: 'Snack', suggestion: 'Apple with a tablespoon of almond butter', calories: 150 },
      { meal: 'Dinner', suggestion: 'Baked white fish with asparagus', calories: 300 }
    ],
    vegetarian: [
      { meal: 'Breakfast', suggestion: 'Greek yogurt with berries and a sprinkle of granola', calories: 250 },
      { meal: 'Lunch', suggestion: 'Vegetable soup with a side of cottage cheese', calories: 300 },
      { meal: 'Snack', suggestion: 'Celery sticks with hummus', calories: 100 },
      { meal: 'Dinner', suggestion: 'Stuffed bell peppers with quinoa and black beans', calories: 350 }
    ],
    vegan: [
      { meal: 'Breakfast', suggestion: 'Green smoothie with spinach, banana, and plant protein', calories: 200 },
      { meal: 'Lunch', suggestion: 'Large salad with mixed greens, beans, and light vinaigrette', calories: 300 },
      { meal: 'Snack', suggestion: 'Handful of raw almonds', calories: 160 },
      { meal: 'Dinner', suggestion: 'Zucchini noodles with tomato sauce and nutritional yeast', calories: 250 }
    ]
  },
  muscleGain: {
    none: [
      { meal: 'Breakfast', suggestion: 'Protein pancakes with banana and honey', calories: 550 },
      { meal: 'Lunch', suggestion: 'Steak with sweet potato and mixed vegetables', calories: 650 },
      { meal: 'Snack', suggestion: 'Protein shake with banana and peanut butter', calories: 350 },
      { meal: 'Dinner', suggestion: 'Grilled chicken with quinoa and avocado', calories: 600 }
    ],
    vegetarian: [
      { meal: 'Breakfast', suggestion: 'Scrambled eggs with cheese, spinach, and whole grain toast', calories: 500 },
      { meal: 'Lunch', suggestion: 'Bean and cheese burrito with Greek yogurt', calories: 600 },
      { meal: 'Snack', suggestion: 'Cottage cheese with pineapple', calories: 250 },
      { meal: 'Dinner', suggestion: 'Lentil pasta with vegetable sauce and parmesan', calories: 550 }
    ],
    vegan: [
      { meal: 'Breakfast', suggestion: 'Tofu scramble with nutritional yeast and whole grain toast', calories: 450 },
      { meal: 'Lunch', suggestion: 'Tempeh stir-fry with brown rice', calories: 550 },
      { meal: 'Snack', suggestion: 'Vegan protein shake with hemp seeds', calories: 300 },
      { meal: 'Dinner', suggestion: 'Seitan with quinoa and roasted vegetables', calories: 600 }
    ]
  }
};

const workoutPlans = {
  general: {
    beginner: [
      { day: 'Monday', activity: '30 min brisk walking', focus: 'Cardio' },
      { day: 'Tuesday', activity: 'Rest or light stretching', focus: 'Recovery' },
      { day: 'Wednesday', activity: '20 min bodyweight exercises (squats, push-ups)', focus: 'Strength' },
      { day: 'Thursday', activity: 'Rest or yoga', focus: 'Flexibility' },
      { day: 'Friday', activity: '30 min cycling or swimming', focus: 'Cardio' },
      { day: 'Saturday', activity: '20 min full body circuit', focus: 'Strength' },
      { day: 'Sunday', activity: 'Rest day', focus: 'Recovery' }
    ],
    intermediate: [
      { day: 'Monday', activity: '30 min jogging + 15 min core exercises', focus: 'Cardio & Core' },
      { day: 'Tuesday', activity: '40 min upper body workout', focus: 'Strength' },
      { day: 'Wednesday', activity: '30 min HIIT workout', focus: 'Cardio' },
      { day: 'Thursday', activity: '40 min lower body workout', focus: 'Strength' },
      { day: 'Friday', activity: '45 min cycling or swimming', focus: 'Cardio' },
      { day: 'Saturday', activity: 'Yoga or Pilates class', focus: 'Flexibility' },
      { day: 'Sunday', activity: 'Rest or light activity', focus: 'Recovery' }
    ],
    advanced: [
      { day: 'Monday', activity: '45 min running + 20 min core workout', focus: 'Cardio & Core' },
      { day: 'Tuesday', activity: '60 min upper body & shoulders workout', focus: 'Strength' },
      { day: 'Wednesday', activity: '45 min HIIT or CrossFit', focus: 'Cardio & Strength' },
      { day: 'Thursday', activity: '60 min lower body & glutes workout', focus: 'Strength' },
      { day: 'Friday', activity: '45 min swimming or rowing', focus: 'Cardio' },
      { day: 'Saturday', activity: '60 min full body workout', focus: 'Strength' },
      { day: 'Sunday', activity: 'Active recovery (light hike, yoga)', focus: 'Recovery' }
    ]
  },
  weightLoss: {
    beginner: [
      { day: 'Monday', activity: '30 min brisk walking + 10 min bodyweight exercises', focus: 'Cardio & Light Strength' },
      { day: 'Tuesday', activity: '20 min cycling or elliptical', focus: 'Cardio' },
      { day: 'Wednesday', activity: 'Rest or gentle yoga', focus: 'Recovery' },
      { day: 'Thursday', activity: '30 min walking + 10 min core exercises', focus: 'Cardio & Core' },
      { day: 'Friday', activity: '20 min full body circuit (light weights)', focus: 'Strength' },
      { day: 'Saturday', activity: '40 min brisk walking or hiking', focus: 'Cardio' },
      { day: 'Sunday', activity: 'Rest day', focus: 'Recovery' }
    ],
    intermediate: [
      { day: 'Monday', activity: '30 min jogging + 20 min bodyweight circuit', focus: 'Cardio & Strength' },
      { day: 'Tuesday', activity: '45 min HIIT workout', focus: 'Cardio & Fat Burning' },
      { day: 'Wednesday', activity: '30 min strength training + 15 min core', focus: 'Strength' },
      { day: 'Thursday', activity: '45 min cycling or swimming', focus: 'Cardio' },
      { day: 'Friday', activity: '45 min circuit training', focus: 'Full Body' },
      { day: 'Saturday', activity: '60 min hiking or jogging', focus: 'Cardio' },
      { day: 'Sunday', activity: 'Yoga or light stretching', focus: 'Recovery' }
    ],
    advanced: [
      { day: 'Monday', activity: '30 min HIIT + 30 min strength training', focus: 'Cardio & Strength' },
      { day: 'Tuesday', activity: '60 min circuit training', focus: 'Full Body & Fat Burning' },
      { day: 'Wednesday', activity: '45 min running + 20 min core', focus: 'Cardio & Core' },
      { day: 'Thursday', activity: '60 min strength training', focus: 'Strength' },
      { day: 'Friday', activity: '45 min HIIT or Tabata', focus: 'Cardio & Fat Burning' },
      { day: 'Saturday', activity: '60-90 min outdoor activity (hiking, cycling)', focus: 'Endurance' },
      { day: 'Sunday', activity: 'Active recovery (swimming, yoga)', focus: 'Recovery' }
    ]
  },
  muscleGain: {
    beginner: [
      { day: 'Monday', activity: 'Full body workout - 3 sets of 8-12 reps', focus: 'Strength' },
      { day: 'Tuesday', activity: '20 min light cardio', focus: 'Recovery' },
      { day: 'Wednesday', activity: 'Full body workout - different exercises than Monday', focus: 'Strength' },
      { day: 'Thursday', activity: 'Rest day', focus: 'Recovery' },
      { day: 'Friday', activity: 'Full body workout - mix of Monday & Wednesday', focus: 'Strength' },
      { day: 'Saturday', activity: '20-30 min moderate cardio', focus: 'Heart Health' },
      { day: 'Sunday', activity: 'Rest day', focus: 'Recovery' }
    ],
    intermediate: [
      { day: 'Monday', activity: 'Upper body workout - 4 sets of 8-10 reps', focus: 'Strength' },
      { day: 'Tuesday', activity: 'Lower body workout - 4 sets of 8-10 reps', focus: 'Strength' },
      { day: 'Wednesday', activity: '20-30 min HIIT or cardio', focus: 'Conditioning' },
      { day: 'Thursday', activity: 'Push workout (chest, shoulders, triceps)', focus: 'Strength' },
      { day: 'Friday', activity: 'Pull workout (back, biceps)', focus: 'Strength' },
      { day: 'Saturday', activity: 'Leg workout + core', focus: 'Strength' },
      { day: 'Sunday', activity: 'Rest day', focus: 'Recovery' }
    ],
    advanced: [
      { day: 'Monday', activity: 'Chest & Triceps - 5 sets of 6-12 reps', focus: 'Strength & Hypertrophy' },
      { day: 'Tuesday', activity: 'Back & Biceps - 5 sets of 6-12 reps', focus: 'Strength & Hypertrophy' },
      { day: 'Wednesday', activity: 'Legs & Core - 5 sets of 6-12 reps', focus: 'Strength & Hypertrophy' },
      { day: 'Thursday', activity: 'Shoulders & Arms - 5 sets of 6-12 reps', focus: 'Strength & Hypertrophy' },
      { day: 'Friday', activity: 'Full Body Power workout - 5 sets of 4-6 reps', focus: 'Strength' },
      { day: 'Saturday', activity: '30 min HIIT or cardio', focus: 'Conditioning' },
      { day: 'Sunday', activity: 'Rest day', focus: 'Recovery' }
    ]
  }
};

// Get complete plans (both diet and workout)
router.post('/plans', (req, res) => {
  try {
    console.log('Received request for plans:', req.body);
    const { healthGoal, dietaryPreference, fitnessLevel } = req.body;
    
    // Validate inputs
    if (!healthGoal || !dietaryPreference || !fitnessLevel) {
      console.warn('Missing required parameters:', { healthGoal, dietaryPreference, fitnessLevel });
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Get diet plan
    const dietPlan = dietPlans[healthGoal]?.[dietaryPreference] || dietPlans.general.none;
    if (!dietPlan) {
      console.warn(`Diet plan not found for: ${healthGoal}, ${dietaryPreference}. Using default.`);
    }
    
    // Get workout plan
    const workoutPlan = workoutPlans[healthGoal]?.[fitnessLevel] || workoutPlans.general.beginner;
    if (!workoutPlan) {
      console.warn(`Workout plan not found for: ${healthGoal}, ${fitnessLevel}. Using default.`);
    }
    
    console.log('Sending response with plans:', { 
      dietPlanLength: dietPlan?.length || 0, 
      workoutPlanLength: workoutPlan?.length || 0 
    });
    
    res.json({ dietPlan, workoutPlan });
  } catch (error) {
    console.error('Error generating plans:', error);
    res.status(500).json({ error: 'Failed to generate plans' });
  }
});

// Get diet plan only
router.post('/diet-plan', (req, res) => {
  try {
    console.log('Received request for diet plan:', req.body);
    const { healthGoal, dietaryPreference } = req.body;
    
    // Validate inputs
    if (!healthGoal || !dietaryPreference) {
      console.warn('Missing required parameters for diet plan:', { healthGoal, dietaryPreference });
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Get diet plan
    const dietPlan = dietPlans[healthGoal]?.[dietaryPreference] || dietPlans.general.none;
    if (!dietPlan) {
      console.warn(`Diet plan not found for: ${healthGoal}, ${dietaryPreference}. Using default.`);
    }
    
    console.log('Sending diet plan response:', { dietPlanLength: dietPlan?.length || 0 });
    res.json({ dietPlan });
  } catch (error) {
    console.error('Error generating diet plan:', error);
    res.status(500).json({ error: 'Failed to generate diet plan' });
  }
});

// Get workout plan only
router.post('/workout-plan', (req, res) => {
  try {
    console.log('Received request for workout plan:', req.body);
    const { healthGoal, fitnessLevel } = req.body;
    
    // Validate inputs
    if (!healthGoal || !fitnessLevel) {
      console.warn('Missing required parameters for workout plan:', { healthGoal, fitnessLevel });
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Get workout plan
    const workoutPlan = workoutPlans[healthGoal]?.[fitnessLevel] || workoutPlans.general.beginner;
    if (!workoutPlan) {
      console.warn(`Workout plan not found for: ${healthGoal}, ${fitnessLevel}. Using default.`);
    }
    
    console.log('Sending workout plan response:', { workoutPlanLength: workoutPlan?.length || 0 });
    res.json({ workoutPlan });
  } catch (error) {
    console.error('Error generating workout plan:', error);
    res.status(500).json({ error: 'Failed to generate workout plan' });
  }
});

// User Profile & Goal Setup
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const profile = await UserProfile.getByUserId(req.user.id);
    res.json(profile || {});
  } catch (e) {
    console.error('Error fetching profile:', e.message);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.put('/profile', authenticateToken, async (req, res) => {
  try {
    await UserProfile.upsert(req.user.id, req.body);
    const profile = await UserProfile.getByUserId(req.user.id);
    res.json({ success: true, profile });
  } catch (e) {
    console.error('Error saving profile:', e.message);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

// Foods search
router.get('/foods', authenticateToken, async (req, res) => {
  try {
    const { q = '', veg } = req.query;
    const isVeg = veg === undefined ? null : (veg === '1' || veg === 'true');
    const foods = await Food.search(q, isVeg);
    res.json(foods);
  } catch (e) {
    console.error('Error searching foods:', e.message);
    res.status(500).json({ error: 'Failed to search foods' });
  }
});

// Food logging
router.get('/food-logs', authenticateToken, async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'date is required (YYYY-MM-DD)' });
    const rows = await FoodLog.listByDate(req.user.id, date);
    res.json(rows);
  } catch (e) {
    console.error('Error getting food logs:', e.message);
    res.status(500).json({ error: 'Failed to get food logs' });
  }
});

router.post('/food-logs', authenticateToken, async (req, res) => {
  try {
    const { date, meal_type, food_id, quantity_g } = req.body;
    if (!date || !meal_type || !quantity_g) return res.status(400).json({ error: 'date, meal_type, quantity_g are required' });

    let calories = req.body.calories;
    let protein_g = req.body.protein_g;
    let carbs_g = req.body.carbs_g;
    let fat_g = req.body.fat_g;

    if (food_id) {
      const food = await Food.findById(food_id);
      if (food) {
        const factor = (quantity_g || 0) / 100;
        if (calories === undefined && food.calories_per_100g != null) calories = Math.round(food.calories_per_100g * factor);
        if (protein_g === undefined && food.protein_g_per_100g != null) protein_g = +(food.protein_g_per_100g * factor).toFixed(2);
        if (carbs_g === undefined && food.carbs_g_per_100g != null) carbs_g = +(food.carbs_g_per_100g * factor).toFixed(2);
        if (fat_g === undefined && food.fat_g_per_100g != null) fat_g = +(food.fat_g_per_100g * factor).toFixed(2);
      }
    }

    const entry = await FoodLog.create({
      user_id: req.user.id,
      date,
      meal_type,
      food_id: food_id || null,
      quantity_g,
      calories: calories ?? null,
      protein_g: protein_g ?? null,
      carbs_g: carbs_g ?? null,
      fat_g: fat_g ?? null
    });
    res.status(201).json({ success: true, log: entry });
  } catch (e) {
    console.error('Error creating food log:', e.message);
    res.status(500).json({ error: 'Failed to create food log' });
  }
});

router.put('/food-logs/:id', authenticateToken, async (req, res) => {
  try {
    const ok = await FoodLog.update(req.params.id, req.user.id, req.body);
    if (!ok) return res.status(404).json({ error: 'Food log not found' });
    res.json({ success: true });
  } catch (e) {
    console.error('Error updating food log:', e.message);
    res.status(500).json({ error: 'Failed to update food log' });
  }
});

router.delete('/food-logs/:id', authenticateToken, async (req, res) => {
  try {
    const ok = await FoodLog.delete(req.params.id, req.user.id);
    if (!ok) return res.status(404).json({ error: 'Food log not found' });
    res.json({ success: true });
  } catch (e) {
    console.error('Error deleting food log:', e.message);
    res.status(500).json({ error: 'Failed to delete food log' });
  }
});

// Recipes
router.get('/recipes', authenticateToken, async (req, res) => {
  try {
    const { q = '', veg, minCal, maxCal, tags } = req.query;
    const isVeg = veg === undefined ? null : (veg === '1' || veg === 'true');
    const minC = minCal ? parseInt(minCal, 10) : null;
    const maxC = maxCal ? parseInt(maxCal, 10) : null;
    const tagList = (tags || '')
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    const rows = await Recipe.search(q, isVeg, { minCal: minC, maxCal: maxC, tags: tagList });
    res.json(rows);
  } catch (e) {
    console.error('Error searching recipes:', e.message);
    res.status(500).json({ error: 'Failed to search recipes' });
  }
});

// External recipes via DummyJSON (large dataset without API key)
router.get('/recipes/online', authenticateToken, async (req, res) => {
  try {
    const axios = require('axios');
    const { q = '', minCal, maxCal, veg } = req.query;
    const url = 'https://dummyjson.com/recipes/search';
    const { data } = await axios.get(url, { params: { q } });
    const items = (data?.recipes || []).map(r => ({
      id: 100000 + r.id,
      name: r.name,
      is_veg: (veg === '1' || veg === 'true') ? 1 : 0,
      calories: r.caloriesPerServing ?? null,
      protein_g: r.protein ?? null,
      carbs_g: r.carbohydrates ?? null,
      fat_g: r.fat ?? null,
      ingredients: r.ingredients || [],
      steps: r.instructions || [],
      description: r.cuisine ? `${r.cuisine} cuisine` : ''
    }));

    const minC = minCal ? parseInt(minCal, 10) : null;
    const maxC = maxCal ? parseInt(maxCal, 10) : null;
    const filtered = items.filter(r => {
      if (minC != null && (r.calories == null || r.calories < minC)) return false;
      if (maxC != null && (r.calories == null || r.calories > maxC)) return false;
      return true;
    });

    const seen = new Set();
    const clean = [];
    for (const r of filtered) {
      const key = (r.name || '').toLowerCase();
      if (!seen.has(key)) { seen.add(key); clean.push(r); }
    }

    res.json(clean);
  } catch (e) {
    console.error('Error fetching online recipes:', e.message);
    res.status(500).json({ error: 'Failed to fetch online recipes' });
  }
});

router.get('/recipes/:id', authenticateToken, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    res.json(recipe);
  } catch (e) {
    console.error('Error getting recipe:', e.message);
    res.status(500).json({ error: 'Failed to get recipe' });
  }
});

// Workouts and scheduling
router.get('/workouts', authenticateToken, async (req, res) => {
  try {
    const { level = null, category = null } = req.query;
    const rows = await Workout.list(level, category);
    res.json(rows);
  } catch (e) {
    console.error('Error getting workouts:', e.message);
    res.status(500).json({ error: 'Failed to get workouts' });
  }
});

router.post('/workout-schedule', authenticateToken, async (req, res) => {
  try {
    const { date, workout_id, notes } = req.body;
    if (!date || !workout_id) return res.status(400).json({ error: 'date and workout_id are required' });
    const row = await WorkoutSchedule.schedule(req.user.id, date, workout_id, notes || null);
    res.status(201).json({ success: true, schedule: row });
  } catch (e) {
    console.error('Error scheduling workout:', e.message);
    res.status(500).json({ error: 'Failed to schedule workout' });
  }
});

router.get('/workout-schedule', authenticateToken, async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'date is required (YYYY-MM-DD)' });
    const rows = await WorkoutSchedule.listByDate(req.user.id, date);
    res.json(rows);
  } catch (e) {
    console.error('Error listing workout schedule:', e.message);
    res.status(500).json({ error: 'Failed to list workout schedule' });
  }
});

router.put('/workout-schedule/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body; // scheduled | completed | skipped
    if (!status) return res.status(400).json({ error: 'status is required' });
    const ok = await WorkoutSchedule.updateStatus(req.params.id, req.user.id, status);
    if (!ok) return res.status(404).json({ error: 'Schedule not found' });
    res.json({ success: true });
  } catch (e) {
    console.error('Error updating schedule status:', e.message);
    res.status(500).json({ error: 'Failed to update schedule status' });
  }
});

// Water & Weight logs
router.post('/water-logs', authenticateToken, async (req, res) => {
  try {
    const { date, amount_ml } = req.body;
    if (!date || !amount_ml) return res.status(400).json({ error: 'date and amount_ml are required' });
    const row = await WaterLog.add(req.user.id, date, amount_ml);
    res.status(201).json({ success: true, log: row });
  } catch (e) {
    console.error('Error adding water log:', e.message);
    res.status(500).json({ error: 'Failed to add water log' });
  }
});

router.get('/water-logs', authenticateToken, async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'date is required (YYYY-MM-DD)' });
    const total = await WaterLog.totalByDate(req.user.id, date);
    res.json(total);
  } catch (e) {
    console.error('Error getting water logs:', e.message);
    res.status(500).json({ error: 'Failed to get water logs' });
  }
});

router.get('/water-logs/range', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) return res.status(400).json({ error: 'startDate and endDate are required' });
    const rows = await WaterLog.listRange(req.user.id, startDate, endDate);
    res.json(rows);
  } catch (e) {
    console.error('Error getting water range:', e.message);
    res.status(500).json({ error: 'Failed to get water logs' });
  }
});

router.post('/weight-logs', authenticateToken, async (req, res) => {
  try {
    const { date, weight_kg } = req.body;
    if (!date || weight_kg == null) return res.status(400).json({ error: 'date and weight_kg are required' });
    const row = await WeightLog.add(req.user.id, date, weight_kg);
    res.status(201).json({ success: true, log: row });
  } catch (e) {
    console.error('Error adding weight log:', e.message);
    res.status(500).json({ error: 'Failed to add weight log' });
  }
});

router.get('/weight-logs/range', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) return res.status(400).json({ error: 'startDate and endDate are required' });
    const rows = await WeightLog.listRange(req.user.id, startDate, endDate);
    res.json(rows);
  } catch (e) {
    console.error('Error getting weight logs:', e.message);
    res.status(500).json({ error: 'Failed to get weight logs' });
  }
});

// Reminders settings
router.get('/reminders', authenticateToken, async (req, res) => {
  try {
    const rows = await Reminder.list(req.user.id);
    res.json(rows);
  } catch (e) {
    console.error('Error getting reminders:', e.message);
    res.status(500).json({ error: 'Failed to get reminders' });
  }
});

router.put('/reminders', authenticateToken, async (req, res) => {
  try {
    const { type, time, frequency = 'daily', enabled = true, label = null } = req.body;
    if (!type || !time) return res.status(400).json({ error: 'type and time are required' });
    await Reminder.upsert(req.user.id, type, time, frequency, enabled, label);
    const rows = await Reminder.list(req.user.id);
    res.json({ success: true, reminders: rows });
  } catch (e) {
    console.error('Error saving reminder:', e.message);
    res.status(500).json({ error: 'Failed to save reminder' });
  }
});

// Dashboard aggregates
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const rangeDays = parseInt(req.query.rangeDays || '7', 10);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (rangeDays - 1));
    const fmt = d => d.toISOString().slice(0,10);
    const start = fmt(startDate);
    const end = fmt(endDate);

    const [calSeries, waterSeries, weightSeries, workoutSeries] = await Promise.all([
      FoodLog.listRange(req.user.id, start, end),
      WaterLog.listRange(req.user.id, start, end),
      WeightLog.listRange(req.user.id, start, end),
      WorkoutSchedule.countsRange(req.user.id, start, end)
    ]);

    res.json({ startDate: start, endDate: end, calories: calSeries, water: waterSeries, weight: weightSeries, workouts: workoutSeries });
  } catch (e) {
    console.error('Error building dashboard:', e.message);
    res.status(500).json({ error: 'Failed to build dashboard' });
  }
});

// Send email to the authenticated user
router.post('/email', authenticateToken, async (req, res) => {
  try {
    const { subject, text, html } = req.body || {};
    if (!subject || (!text && !html)) return res.status(400).json({ error: 'subject and text or html are required' });

    // Lazy require to avoid cost if not used
    const { getTransporter, fromAddress, isTestMode, getPreviewUrl } = require('../services/mailer');
    const transporter = await getTransporter();

    const info = await transporter.sendMail({
      from: fromAddress(),
      to: req.user.email,
      subject,
      text: text || undefined,
      html: html || undefined
    });
    const previewUrl = getPreviewUrl(info);
    res.json({ success: true, messageId: info.messageId, previewUrl, testMode: isTestMode() });
  } catch (e) {
    console.error('Error sending email:', e);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

module.exports = router;
