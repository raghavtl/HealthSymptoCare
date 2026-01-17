import React, { useState, useEffect } from 'react';
import { healthTipsApi } from '../services/api';

const HealthTips = () => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Tips' },
    { id: 'nutrition', name: 'Nutrition' },
    { id: 'fitness', name: 'Fitness' },
    { id: 'sleep', name: 'Sleep' },
    { id: 'mental', name: 'Mental Health' },
    { id: 'hydration', name: 'Hydration' },
  ];

  useEffect(() => {
    const fetchTips = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch all health tips from the API
        const response = await healthTipsApi.getAll();
        setTips(response.data);
      
      } catch (err) {
        console.error('Error fetching health tips:', err);
        setError('An error occurred while fetching health tips. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTips();
  }, []);

  useEffect(() => {
    const fetchTipsByCategory = async () => {
      setLoading(true);
      setError('');
      
      try {
        if (selectedCategory === 'all') {
          const response = await healthTipsApi.getAll();
          setTips(response.data);
        } else {
          const response = await healthTipsApi.getByCategory(selectedCategory);
          setTips(response.data);
        }
      } catch (err) {
        console.error('Error fetching health tips by category:', err);
        setError('An error occurred while fetching health tips. Please try again.');
        
        // If API fails, filter locally as fallback
        if (selectedCategory !== 'all') {
          const filteredTips = tips.filter(tip => tip.category === selectedCategory);
          setTips(filteredTips);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchTipsByCategory();
  }, [selectedCategory]);
  
  // No need for filteredTips anymore since we're fetching filtered data from the API

  const getCategoryIcon = (category) => {
    const icons = {
      'nutrition': '🥗',
      'fitness': '💪',
      'sleep': '😴',
      'mental': '🧠',
      'hydration': '💧',
      'all': '✨',
    };
    return icons[category] || '✨';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">AI Health Tips</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Category Filter */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Filter by Category</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full ${selectedCategory === category.id ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
            >
              {getCategoryIcon(category.id)} {category.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Tips List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-2 text-gray-600">Loading health tips...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tips.length > 0 ? (
            tips.map((tip) => (
              <div key={tip.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-2">{getCategoryIcon(tip.category)}</span>
                  <h3 className="text-lg font-semibold">{tip.title}</h3>
                </div>
                <p className="text-gray-600 mb-4">{tip.content}</p>
                <div className="text-sm text-gray-500 italic">Source: {tip.source || 'Health Buddy'}</div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-8 text-gray-500">
              No health tips found for this category.
            </div>
          )}
        </div>
      )}
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Personalized Tip</h3>
        <p className="text-gray-700">
          Based on your recent wellness logs, we recommend focusing on staying hydrated and getting consistent sleep. 
          Both can significantly improve your energy levels and overall well-being.
        </p>
        <div className="mt-2 text-sm text-gray-500">
          Note: For more personalized health tips, regularly update your wellness logs and ensure you're logged in.
        </div>
      </div>
    </div>
  );
};

export default HealthTips;