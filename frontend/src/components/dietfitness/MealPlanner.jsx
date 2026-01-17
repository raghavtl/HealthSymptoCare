import React, { useState } from 'react';
import { dietAndFitnessApi } from '../../services/api';
import { toast } from 'react-toastify';

const MealPlanner = () => {
  const [form, setForm] = useState({ healthGoal: 'general', dietaryPreference: 'none', fitnessLevel: 'beginner' });
  const [loading, setLoading] = useState(false);
  const [dietPlan, setDietPlan] = useState([]);
  const [workoutPlan, setWorkoutPlan] = useState([]);

  const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const generate = async () => {
    try {
      setLoading(true);
      const { data } = await dietAndFitnessApi.getPlans(form.healthGoal, form.dietaryPreference, form.fitnessLevel);
      setDietPlan(data.dietPlan || []);
      setWorkoutPlan(data.workoutPlan || []);
    } catch (e) {
      toast.error('Failed to generate plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Personalized Meal & Workout Plan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm mb-1">Goal</label>
          <select name="healthGoal" value={form.healthGoal} onChange={onChange} className="w-full border rounded px-3 py-2">
            <option value="general">General Fitness</option>
            <option value="weightLoss">Weight Loss</option>
            <option value="muscleGain">Muscle Gain</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Dietary Preference</label>
          <select name="dietaryPreference" value={form.dietaryPreference} onChange={onChange} className="w-full border rounded px-3 py-2">
            <option value="none">No Preference</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Fitness Level</label>
          <select name="fitnessLevel" value={form.fitnessLevel} onChange={onChange} className="w-full border rounded px-3 py-2">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>
      <button onClick={generate} disabled={loading} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50">{loading? 'Generating...' : 'Generate Plan'}</button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded p-3">
          <h3 className="font-medium mb-2">Diet Plan</h3>
          {dietPlan.length === 0 ? <div className="text-sm text-gray-500">No plan generated yet.</div> : (
            <ul className="space-y-2">
              {dietPlan.map((item, idx) => (
                <li key={idx} className="border rounded p-2">
                  <div className="font-medium">{item.meal}</div>
                  <div className="text-sm text-gray-600">{item.suggestion}</div>
                  <div className="text-xs text-gray-500">Calories: {item.calories}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border rounded p-3">
          <h3 className="font-medium mb-2">Workout Plan (Week)</h3>
          {workoutPlan.length === 0 ? <div className="text-sm text-gray-500">No plan generated yet.</div> : (
            <ul className="space-y-2">
              {workoutPlan.map((item, idx) => (
                <li key={idx} className="border rounded p-2">
                  <div className="font-medium">{item.day}</div>
                  <div className="text-sm text-gray-600">{item.activity}</div>
                  <div className="text-xs text-gray-500">Focus: {item.focus}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MealPlanner;
