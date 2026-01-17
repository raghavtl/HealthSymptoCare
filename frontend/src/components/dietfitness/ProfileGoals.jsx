import React, { useEffect, useState } from 'react';
import { dietAndFitnessApi } from '../../services/api';
import { toast } from 'react-toastify';

const round = (n, d = 0) => {
  if (n == null || isNaN(+n)) return '';
  const p = Math.pow(10, d);
  return Math.round(n * p) / p;
};

const ProfileGoals = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    age: '', gender: 'female', height_cm: '', weight_kg: '', activity_level: 'moderate',
    dietary_preference: 'none', goal: 'general', target_calories: '', target_protein_g: '', target_carbs_g: '', target_fat_g: ''
  });
  const [hint, setHint] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await dietAndFitnessApi.getProfile();
        if (data) setForm(prev => ({ ...prev, ...data }));
      } catch (e) {
        // ignore missing profile
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const applyPreset = (level) => {
    // Beginner-friendly presets based on body weight (fallback to 70kg)
    const w = parseFloat(form.weight_kg) || 70;
    const presets = {
      low:  { kcalPerKg: 28, proteinPerKg: 1.2, fatPerKg: 0.8 },   // gentle/medium-low
      medium: { kcalPerKg: 32, proteinPerKg: 1.6, fatPerKg: 1.0 }, // moderate
      high: { kcalPerKg: 36, proteinPerKg: 2.0, fatPerKg: 1.2 }     // moderate-high
    };
    const p = presets[level] || presets.medium;
    const calories = p.kcalPerKg * w;
    const protein = p.proteinPerKg * w; // grams
    const fat = p.fatPerKg * w; // grams
    const carbs = Math.max(0, (calories - (protein * 4 + fat * 9)) / 4);

    setForm(prev => ({
      ...prev,
      target_calories: Math.round(calories),
      target_protein_g: round(protein, 0),
      target_fat_g: round(fat, 0),
      target_carbs_g: round(carbs, 0)
    }));

    setHint(`Applied ${level} preset: approx ${Math.round(calories)} kcal · P ${round(protein,0)}g · C ${round(carbs,0)}g · F ${round(fat,0)}g`);
  };

  const onSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await dietAndFitnessApi.saveProfile(form);
      toast.success('Profile saved');
    } catch (e) {
      toast.error('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Profile & Goals</h2>

      {/* Quick beginner-friendly presets */}
      <div className="rounded border p-3 bg-gray-50">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-700 mr-2">Quick presets (beginner-friendly):</span>
          <button type="button" onClick={()=>applyPreset('low')} className="text-xs px-3 py-1 rounded border hover:bg-white bg-gray-100">Medium (low)</button>
          <button type="button" onClick={()=>applyPreset('medium')} className="text-xs px-3 py-1 rounded border hover:bg-white bg-gray-100">Moderate</button>
          <button type="button" onClick={()=>applyPreset('high')} className="text-xs px-3 py-1 rounded border hover:bg-white bg-gray-100">Moderate‑High</button>
          <span className="text-xs text-gray-500">Uses your weight to auto-calc. Adjust anytime.</span>
        </div>
        {hint && <div className="text-xs text-gray-600 mt-2">{hint}</div>}
      </div>

      <form onSubmit={onSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Age</label>
          <input type="number" name="age" value={form.age ?? ''} onChange={onChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Gender</label>
          <select name="gender" value={form.gender ?? 'female'} onChange={onChange} className="w-full border rounded px-3 py-2">
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Height (cm)</label>
          <input type="number" name="height_cm" value={form.height_cm ?? ''} onChange={onChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Weight (kg)</label>
          <input type="number" step="0.1" name="weight_kg" value={form.weight_kg ?? ''} onChange={onChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Activity Level</label>
          <select name="activity_level" value={form.activity_level ?? 'moderate'} onChange={onChange} className="w-full border rounded px-3 py-2">
            <option value="sedentary">Sedentary</option>
            <option value="light">Light</option>
            <option value="moderate">Moderate</option>
            <option value="active">Active</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Dietary Preference</label>
          <select name="dietary_preference" value={form.dietary_preference ?? 'none'} onChange={onChange} className="w-full border rounded px-3 py-2">
            <option value="none">No Preference</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Goal</label>
          <select name="goal" value={form.goal ?? 'general'} onChange={onChange} className="w-full border rounded px-3 py-2">
            <option value="general">General Fitness</option>
            <option value="weightLoss">Weight Loss</option>
            <option value="muscleGain">Muscle Gain</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Target Calories</label>
          <input type="number" name="target_calories" value={form.target_calories ?? ''} onChange={onChange} className="w-full border rounded px-3 py-2" />
          <p className="text-xs text-gray-500 mt-1">Tip: choose a preset above if you	are unsure.</p>
        </div>
        <div>
          <label className="block text-sm mb-1">Protein (g)</label>
          <input type="number" step="0.1" name="target_protein_g" value={form.target_protein_g ?? ''} onChange={onChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Carbs (g)</label>
          <input type="number" step="0.1" name="target_carbs_g" value={form.target_carbs_g ?? ''} onChange={onChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Fat (g)</label>
          <input type="number" step="0.1" name="target_fat_g" value={form.target_fat_g ?? ''} onChange={onChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="md:col-span-2">
          <button disabled={loading} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileGoals;
