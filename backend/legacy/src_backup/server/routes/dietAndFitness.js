const express = require('express');
const router = express.Router();

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
    const { healthGoal, dietaryPreference, fitnessLevel } = req.body;
    
    // Validate inputs
    if (!healthGoal || !dietaryPreference || !fitnessLevel) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Get diet plan
    const dietPlan = dietPlans[healthGoal]?.[dietaryPreference] || dietPlans.general.none;
    
    // Get workout plan
    const workoutPlan = workoutPlans[healthGoal]?.[fitnessLevel] || workoutPlans.general.beginner;
    
    res.json({ dietPlan, workoutPlan });
  } catch (error) {
    console.error('Error generating plans:', error);
    res.status(500).json({ error: 'Failed to generate plans' });
  }
});

// Get diet plan only
router.post('/diet-plan', (req, res) => {
  try {
    const { healthGoal, dietaryPreference } = req.body;
    
    // Validate inputs
    if (!healthGoal || !dietaryPreference) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Get diet plan
    const dietPlan = dietPlans[healthGoal]?.[dietaryPreference] || dietPlans.general.none;
    
    res.json({ dietPlan });
  } catch (error) {
    console.error('Error generating diet plan:', error);
    res.status(500).json({ error: 'Failed to generate diet plan' });
  }
});

// Get workout plan only
router.post('/workout-plan', (req, res) => {
  try {
    const { healthGoal, fitnessLevel } = req.body;
    
    // Validate inputs
    if (!healthGoal || !fitnessLevel) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Get workout plan
    const workoutPlan = workoutPlans[healthGoal]?.[fitnessLevel] || workoutPlans.general.beginner;
    
    res.json({ workoutPlan });
  } catch (error) {
    console.error('Error generating workout plan:', error);
    res.status(500).json({ error: 'Failed to generate workout plan' });
  }
});

module.exports = router;