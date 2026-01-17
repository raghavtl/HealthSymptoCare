import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTarget, FiCalendar, FiList, FiActivity, FiBell, FiBookOpen, FiTrendingUp } from 'react-icons/fi';
import ProfileGoals from '../components/dietfitness/ProfileGoals';
import MealPlanner from '../components/dietfitness/MealPlanner';
import FoodLogger from '../components/dietfitness/FoodLogger';
import WorkoutPlanner from '../components/dietfitness/WorkoutPlanner';
import Reminders from '../components/dietfitness/Reminders';
import RecipeLibrary from '../components/dietfitness/RecipeLibrary';
import HealthDisclaimer from '../components/HealthDisclaimer';

const DietAndFitness = () => {
  const [tab, setTab] = useState('profile');
  const navigate = useNavigate();

  const tabs = [
    { id: 'profile', label: 'Profile & Goals', icon: <FiTarget /> },
    { id: 'planner', label: 'Meal Planner', icon: <FiCalendar /> },
    { id: 'food', label: 'Food Log', icon: <FiList /> },
    { id: 'workout', label: 'Workouts', icon: <FiActivity /> },
    { id: 'reminders', label: 'Reminders', icon: <FiBell /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Diet & Fitness</h1>
          <p className="text-slate-500 text-sm">Plan meals, log food and workouts, and hit your goals.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/diet-fitness/dashboard')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <FiTrendingUp /> Open Dashboard
          </button>
        </div>
      </div>

      {/* Tabs */}
      <nav role="tablist" aria-label="Diet & Fitness sections" className="sticky top-16 z-10 bg-white/80 backdrop-blur border rounded-full p-1 mb-6">
        <div className="flex flex-wrap gap-1">
          {tabs.map(t => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab===t.id}
              onClick={()=>setTab(t.id)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 ${tab===t.id? 'bg-blue-600 text-white shadow': 'text-slate-600 hover:bg-slate-100'}`}
            >
              <span className="text-base">{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="space-y-8">
        {tab === 'profile' && (
          <section aria-labelledby="sec-profile">
            <ProfileGoals />
          </section>
        )}
        {tab === 'planner' && (
          <section aria-labelledby="sec-planner">
            <MealPlanner />
          </section>
        )}
        {tab === 'food' && (
          <section aria-labelledby="sec-food">
            <FoodLogger />
          </section>
        )}
        {tab === 'workout' && (
          <section aria-labelledby="sec-workout">
            <WorkoutPlanner />
          </section>
        )}
        {tab === 'reminders' && (
          <section aria-labelledby="sec-reminders">
            <Reminders />
          </section>
        )}
        {tab === 'recipes' && (
          <section aria-labelledby="sec-recipes">
            <RecipeLibrary />
          </section>
        )}
        <div className="pt-2"><HealthDisclaimer /></div>
      </main>
    </div>
  );
};

export default DietAndFitness;
