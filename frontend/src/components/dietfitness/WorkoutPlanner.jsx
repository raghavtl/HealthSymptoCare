import React, { useEffect, useState } from 'react';
import { dietAndFitnessApi } from '../../services/api';
import { toast } from 'react-toastify';

const WorkoutPlanner = () => {
  const [level, setLevel] = useState('beginner');
  const [category, setCategory] = useState('');
  const [workouts, setWorkouts] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      const { data } = await dietAndFitnessApi.listWorkouts(level, category || undefined);
      const list = Array.isArray(data) ? data : [];
      // Deduplicate by name+level and shuffle for variety
      const key = (w) => `${(w.name||'').toLowerCase()}|${(w.level||'').toLowerCase()}`;
      const uniq = Array.from(new Map(list.map(w => [key(w), w])).values());
      const shuffled = uniq.sort(() => Math.random() - 0.5);
      setWorkouts(shuffled);
    } catch (e) {
      toast.error('Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  const loadSchedule = async () => {
    try {
      const { data } = await dietAndFitnessApi.getWorkoutScheduleByDate(date);
      setSchedule(data || []);
    } catch (e) {
      toast.error('Failed to load schedule');
    }
  };

  useEffect(() => { loadWorkouts(); }, [level, category]);
  useEffect(() => { loadSchedule(); }, [date]);

  const addToSchedule = async (w) => {
    try {
      await dietAndFitnessApi.scheduleWorkout({ date, workout_id: w.id });
      toast.success('Scheduled');
      loadSchedule();
    } catch (e) {
      toast.error('Failed to schedule');
    }
  };

  const setStatus = async (item, status) => {
    try {
      await dietAndFitnessApi.setWorkoutStatus(item.id, status);
      loadSchedule();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Workout Plans & Scheduling</h2>
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
        <div>
          <label className="block text-sm mb-1">Level</label>
          <select value={level} onChange={(e)=>setLevel(e.target.value)} className="border rounded px-3 py-2">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Category</label>
          <input value={category} onChange={(e)=>setCategory(e.target.value)} placeholder="e.g., Strength, Cardio" className="border rounded px-3 py-2" />
        </div>
        <div className="md:ml-auto">
          <label className="block text-sm mb-1">Schedule Date</label>
          <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="border rounded px-3 py-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded p-3">
          <h3 className="font-medium mb-2">Workouts</h3>
          {loading ? <div>Loading...</div> : (
            <div className="space-y-2">
              {workouts.map(w => (
                <div key={w.id} className="border rounded p-2">
                  <div className="font-medium">{w.name}</div>
                  <div className="text-xs text-gray-500">{w.category} · {w.level}</div>
                  <div className="text-sm text-gray-600">{w.description}</div>
                  <button onClick={()=>addToSchedule(w)} className="mt-2 px-3 py-1 bg-primary text-white rounded">Schedule on {date}</button>
                </div>
              ))}
              {workouts.length === 0 && <div className="text-sm text-gray-500">No workouts found for filters.</div>}
            </div>
          )}
        </div>
        <div className="border rounded p-3">
          <h3 className="font-medium mb-2">Schedule for {date}</h3>
          <div className="space-y-2">
            {schedule.map(item => (
              <div key={item.id} className="flex items-center justify-between border rounded p-2">
                <div>
                  <div className="font-medium">{item.workout_name}</div>
                  <div className="text-xs text-gray-500">{item.category} · {item.level} · Status: {item.status}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>setStatus(item,'completed')} className="text-green-700 text-sm">Done</button>
                  <button onClick={()=>setStatus(item,'skipped')} className="text-orange-600 text-sm">Skip</button>
                </div>
              </div>
            ))}
            {schedule.length === 0 && <div className="text-sm text-gray-500">No workouts scheduled.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutPlanner;
