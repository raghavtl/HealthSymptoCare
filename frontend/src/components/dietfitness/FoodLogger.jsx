import React, { useEffect, useMemo, useState } from 'react';
import { dietAndFitnessApi } from '../../services/api';
import { toast } from 'react-toastify';

const todayStr = () => new Date().toISOString().slice(0,10);

const macrosTotal = (items) => items.reduce((acc, it) => ({
  calories: acc.calories + (it.calories || 0),
  protein_g: acc.protein_g + (it.protein_g || 0),
  carbs_g: acc.carbs_g + (it.carbs_g || 0),
  fat_g: acc.fat_g + (it.fat_g || 0),
}), { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 });

const FoodLogger = () => {
  const [date, setDate] = useState(todayStr());
  const [q, setQ] = useState('');
  const [veg, setVeg] = useState('any');
  const [searching, setSearching] = useState(false);
  const [foods, setFoods] = useState([]);
  const [logs, setLogs] = useState([]);
  const [adding, setAdding] = useState({}); // foodId -> { meal_type, quantity_g }

  const refreshLogs = async (d = date) => {
    try {
      const { data } = await dietAndFitnessApi.getFoodLogsByDate(d);
      setLogs(data || []);
    } catch (e) {
      toast.error('Failed to load food logs');
    }
  };

  useEffect(() => {
    refreshLogs();
  }, [date]);

  const search = async () => {
    try {
      setSearching(true);
      const vegParam = veg === 'any' ? undefined : (veg === 'veg' ? 1 : 0);
      const { data } = await dietAndFitnessApi.searchFoods(q, vegParam);
      const list = Array.isArray(data) ? data : [];
      // Deduplicate by lowercase name
      const uniq = Array.from(new Map(list.map(f => [(f.name || '').toLowerCase(), f])).values());
      // Group by veg/nonveg/other
      const groups = {
        veg: uniq.filter(f => f.is_veg === 1 || f.is_veg === true),
        nonveg: uniq.filter(f => f.is_veg === 0 || f.is_veg === false),
        other: uniq.filter(f => f.is_veg == null)
      };
      // Shuffle helper
      const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);
      const pool = [...shuffle(groups.veg), ...shuffle(groups.nonveg), ...shuffle(groups.other)];
      // Take first 20 varied results
      setFoods(pool.slice(0, 20));
    } catch (e) {
      toast.error('Failed to search foods');
    } finally {
      setSearching(false);
    }
  };

  const onStartAdd = (food) => {
    setAdding(prev => ({ ...prev, [food.id]: { meal_type: 'breakfast', quantity_g: 100 } }));
  };

  const onChangeAdd = (foodId, key, value) => {
    setAdding(prev => ({ ...prev, [foodId]: { ...prev[foodId], [key]: value } }));
  };

  const onSubmitAdd = async (food) => {
    const form = adding[food.id];
    if (!form) return;
    try {
      await dietAndFitnessApi.addFoodLog({
        date,
        meal_type: form.meal_type,
        food_id: food.id,
        quantity_g: parseFloat(form.quantity_g)
      });
      toast.success('Added to log');
      setAdding(prev => { const cp = { ...prev }; delete cp[food.id]; return cp; });
      refreshLogs();
    } catch (e) {
      toast.error('Failed to add');
    }
  };

  const total = useMemo(() => macrosTotal(logs), [logs]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Food Logging & Calorie Tracker</h2>

      <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
        <div>
          <label className="block text-sm mb-1">Date</label>
          <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="border rounded px-3 py-2" />
        </div>
        <QuickAddWater date={date} onAdded={()=>toast.success('Water logged')} />
        <div className="md:ml-auto w-full md:w-1/2">
          <label className="block text-sm mb-1">Search food</label>
          <div className="flex gap-2">
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="e.g., Apple, Rice, Chicken" className="border rounded px-3 py-2 flex-1" />
            <select value={veg} onChange={e=>setVeg(e.target.value)} className="border rounded px-3 py-2">
              <option value="any">Any</option>
              <option value="veg">Veg</option>
              <option value="nonveg">Non-veg</option>
            </select>
            <button onClick={search} disabled={searching} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50">{searching? 'Searching...' : 'Search'}</button>
          </div>
        </div>
      </div>

      {/* Results */}
      {foods.length > 0 && (
        <div className="border rounded p-3">
          <h3 className="font-medium mb-2">Search Results</h3>
          <div className="space-y-2">
            {foods.map(food => (
              <div key={food.id} className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b pb-2">
                <div>
                  <div className="font-medium">{food.name}</div>
                  <div className="text-xs text-gray-500">Per 100g · Cal {food.calories_per_100g ?? '-'} · P {food.protein_g_per_100g ?? '-'}g · C {food.carbs_g_per_100g ?? '-'}g · F {food.fat_g_per_100g ?? '-'}g</div>
                </div>
                {adding[food.id] ? (
                  <div className="flex flex-wrap gap-2 items-center">
                    <select value={adding[food.id].meal_type} onChange={(e)=>onChangeAdd(food.id,'meal_type', e.target.value)} className="border rounded px-2 py-1">
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="snack">Snack</option>
                      <option value="dinner">Dinner</option>
                    </select>
                    <div className="flex items-center gap-1">
                      <input type="number" value={adding[food.id].quantity_g} onChange={(e)=>onChangeAdd(food.id,'quantity_g', e.target.value)} className="w-24 border rounded px-2 py-1" />
                      <span className="text-sm">g</span>
                    </div>
                    <button onClick={()=>onSubmitAdd(food)} className="px-3 py-1 bg-green-600 text-white rounded">Add</button>
                    <button onClick={()=>setAdding(prev=>{const cp={...prev}; delete cp[food.id]; return cp;})} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
                  </div>
                ) : (
                  <button onClick={()=>onStartAdd(food)} className="px-3 py-1 bg-primary text-white rounded">Log</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logs */}
      <div className="border rounded p-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Your Logs ({date})</h3>
          <div className="text-sm text-gray-600">Total: Cal {total.calories} · P {total.protein_g.toFixed(1)}g · C {total.carbs_g.toFixed(1)}g · F {total.fat_g.toFixed(1)}g</div>
        </div>
        {logs.length === 0 ? (
          <div className="text-sm text-gray-500 mt-2">No entries yet for this day.</div>
        ) : (
          <div className="mt-2 space-y-2">
            {logs.map(item => (
              <div key={item.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <div className="font-medium">{item.food_name || item.meal_type}</div>
                  <div className="text-xs text-gray-500">{item.meal_type} · {item.quantity_g}g · Cal {item.calories ?? '-'} · P {item.protein_g ?? '-'}g · C {item.carbs_g ?? '-'}g · F {item.fat_g ?? '-'}g</div>
                </div>
                <button onClick={async ()=>{await dietAndFitnessApi.deleteFoodLog(item.id); toast.success('Deleted'); refreshLogs();}} className="text-red-600 text-sm">Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const QuickAddWater = ({ date, onAdded }) => {
  const [ml, setMl] = useState(250);
  const [saving, setSaving] = useState(false);
  const add = async () => {
    try {
      setSaving(true);
      await dietAndFitnessApi.addWaterLog({ date, amount_ml: parseInt(ml,10) });
      onAdded?.();
    } catch (e) {
      toast.error('Failed to add water');
    } finally {
      setSaving(false);
    }
  };
  return (
    <div>
      <label className="block text-sm mb-1">Quick add water (ml)</label>
      <div className="flex gap-2 items-center">
        <input type="number" value={ml} onChange={(e)=>setMl(e.target.value)} className="w-28 border rounded px-3 py-2" />
        <button onClick={add} disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50">{saving? 'Adding...' : 'Add'}</button>
      </div>
    </div>
  );
};

export default FoodLogger;
