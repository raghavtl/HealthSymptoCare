import React, { useState, useEffect } from 'react';
import { dietAndFitnessApi } from '../services/api';

const DietAndFitness = () => {
  const [healthGoal, setHealthGoal] = useState('general');
  const [dietaryPreference, setDietaryPreference] = useState('none');
  const [fitnessLevel, setFitnessLevel] = useState('beginner');
  const [dietPlan, setDietPlan] = useState([]);
  const [workoutPlan, setWorkoutPlan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (healthGoal && dietaryPreference && fitnessLevel) {
      generatePlans();
    }
  }, [healthGoal, dietaryPreference, fitnessLevel]);
  
  const generatePlans = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Try to get plans from API
      const response = await dietAndFitnessApi.getPlans(healthGoal, dietaryPreference, fitnessLevel);
      
      if (response.data) {
        setDietPlan(response.data.dietPlan || []);
        setWorkoutPlan(response.data.workoutPlan || []);
      } else {
        // Fallback to mock data if API returns empty data
        setDietPlan(getMockDietPlan(healthGoal, dietaryPreference));
        setWorkoutPlan(getMockWorkoutPlan(healthGoal, fitnessLevel));
      }
    } catch (err) {
      console.error('Error fetching diet and fitness plans:', err);
      setError(
        `Unable to fetch plans from server: ${err.message}. Using mock data instead.`
      );
      // Fallback to mock data if API fails
      setDietPlan(getMockDietPlan(healthGoal, dietaryPreference));
      setWorkoutPlan(getMockWorkoutPlan(healthGoal, fitnessLevel));
    } finally {
      setLoading(false);
    }
  };
  
  const getMockDietPlan = (goal, preference) => {
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
    
    return dietPlans[goal][preference] || dietPlans.general.none;
  };
  
  const getMockWorkoutPlan = (goal, level) => {
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
    
    return workoutPlans[goal][level] || workoutPlans.general.beginner;
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Diet & Fitness Planner</h1>
      
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Customize Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Health Goal</label>
            <select
              value={healthGoal}
              onChange={(e) => setHealthGoal(e.target.value)}
              className="input w-full"
            >
              <option value="general">General Health</option>
              <option value="weightLoss">Weight Loss</option>
              <option value="muscleGain">Muscle Gain</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Preference</label>
            <select
              value={dietaryPreference}
              onChange={(e) => setDietaryPreference(e.target.value)}
              className="input w-full"
            >
              <option value="none">No Restrictions</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fitness Level</label>
            <select
              value={fitnessLevel}
              onChange={(e) => setFitnessLevel(e.target.value)}
              className="input w-full"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-2 text-gray-600">Generating your personalized plan...</p>
        </div>
      ) : error ? (
        <div className="card md:col-span-2 bg-red-50 text-red-700 p-4">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error}</p>
          <button 
            onClick={generatePlans} 
            className="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Diet Plan */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Your Diet Plan</h2>
            <div className="space-y-4">
              {dietPlan.map((meal, index) => (
                <div key={index} className="border-b pb-3 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-medium text-primary">{meal.meal}</h3>
                    <span className="text-sm text-gray-500">{meal.calories} cal</span>
                  </div>
                  <p className="text-gray-700">{meal.suggestion}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <h3 className="font-medium text-gray-700 mb-2">General Tips:</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Stay hydrated by drinking at least 8 glasses of water daily</li>
                <li>Eat slowly and mindfully to improve digestion</li>
                <li>Include a variety of colorful fruits and vegetables</li>
                <li>Limit processed foods and added sugars</li>
              </ul>
            </div>
          </div>
          
          {/* Workout Plan */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Your Workout Plan</h2>
            <div className="space-y-3">
              {workoutPlan.map((workout, index) => (
                <div key={index} className="flex items-start">
                  <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {workout.day.substring(0, 2)}
                  </div>
                  <div className="ml-3">
                    <div className="flex items-center">
                      <h3 className="font-medium">{workout.day}</h3>
                      <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{workout.focus}</span>
                    </div>
                    <p className="text-gray-700">{workout.activity}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <h3 className="font-medium text-gray-700 mb-2">Workout Tips:</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Always warm up before and cool down after exercise</li>
                <li>Stay hydrated during workouts</li>
                <li>Listen to your body and rest when needed</li>
                <li>Proper form is more important than weight or reps</li>
              </ul>
            </div>
          </div>
          
          {/* Disclaimer */}
          <div className="card md:col-span-2 bg-blue-50">
            <h2 className="text-lg font-semibold mb-2">Important Note</h2>
            <p className="text-gray-700">
              This plan is generated based on general guidelines and your selections. It's always recommended to consult with healthcare professionals, registered dietitians, or certified fitness trainers before starting any new diet or exercise program, especially if you have any health conditions or concerns.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DietAndFitness;