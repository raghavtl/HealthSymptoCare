import React, { useState, useEffect } from 'react';
import { healthTipsApi } from '../services/api';
import { FaShare, FaBookmark, FaRegBookmark, FaFacebook, FaTwitter, FaWhatsapp, FaLink } from 'react-icons/fa';

const HealthTips = () => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [savedTips, setSavedTips] = useState([]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [currentTipToShare, setCurrentTipToShare] = useState(null);

  const categories = [
    { id: 'all', name: 'All Tips' },
    { id: 'nutrition', name: 'Nutrition' },
    { id: 'fitness', name: 'Fitness' },
    { id: 'sleep', name: 'Sleep' },
    { id: 'mental', name: 'Mental Health' },
    { id: 'hydration', name: 'Hydration' },
    { id: 'stress', name: 'Stress Management' },
    { id: 'immunity', name: 'Immunity' },
    { id: 'skincare', name: 'Skin Care' },
    { id: 'digestion', name: 'Digestion' },
    { id: 'posture', name: 'Posture' },
  ];

  useEffect(() => {
    const fetchTips = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Try enhanced API first, fallback to original
        let response;
        try {
          response = await fetch('/api/health-tips-enhanced');
          if (!response.ok) {
            throw new Error('Enhanced API not available');
          }
          const data = await response.json();
          setTips(data);
        } catch (enhancedError) {
          // Fallback to original API
          response = await healthTipsApi.getAll();
          setTips(response.data);
        }
      
      } catch (err) {
        console.error('Error fetching health tips:', err);
        setError('An error occurred while fetching health tips. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTips();
    
    // Load saved tips from localStorage
    const loadSavedTips = () => {
      const saved = localStorage.getItem('savedHealthTips');
      if (saved) {
        setSavedTips(JSON.parse(saved));
      }
    };
    
    loadSavedTips();
  }, []);

  useEffect(() => {
    const fetchTipsByCategory = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Try enhanced API first, fallback to original
        let response;
        try {
          const categoryParam = selectedCategory === 'all' ? '' : `?category=${selectedCategory}`;
          response = await fetch(`/api/health-tips-enhanced${categoryParam}`);
          if (!response.ok) {
            throw new Error('Enhanced API not available');
          }
          const data = await response.json();
          setTips(data);
        } catch (enhancedError) {
          // Fallback to original API
          if (selectedCategory === 'all') {
            response = await healthTipsApi.getAll();
            setTips(response.data);
          } else {
            response = await healthTipsApi.getByCategory(selectedCategory);
            setTips(response.data);
          }
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
        // Add sample tips for new categories if none are returned from API
        if (['stress', 'immunity', 'skincare', 'digestion', 'posture'].includes(selectedCategory) && 
            !tips.some(tip => tip.category === selectedCategory)) {
          const categoryTips = getCategoryTips(selectedCategory);
          if (categoryTips.length > 0) {
            setTips(categoryTips);
          }
        }
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
      'stress': '🧘',
      'immunity': '🛡️',
      'skincare': '✨',
      'digestion': '🍽️',
      'posture': '🧍',
      'all': '📋',
    };
    return icons[category] || '📋';
  };
  
  const toggleSaveTip = (tip) => {
    const isSaved = savedTips.some(savedTip => savedTip.id === tip.id);
    let newSavedTips;
    
    if (isSaved) {
      newSavedTips = savedTips.filter(savedTip => savedTip.id !== tip.id);
    } else {
      newSavedTips = [...savedTips, tip];
    }
    
    setSavedTips(newSavedTips);
    localStorage.setItem('savedHealthTips', JSON.stringify(newSavedTips));
  };
  
  const isTipSaved = (tipId) => {
    return savedTips.some(tip => tip.id === tipId);
  };
  
  const handleShareTip = (tip) => {
    setCurrentTipToShare(tip);
    setShareModalOpen(true);
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Tip copied to clipboard!');
        setShareModalOpen(false);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };
  
  // Sample health tips content for each category
  const getCategoryTips = (category) => {
    const tipsByCategory = {
      'stress': [
        {
          id: 'stress-1',
          title: 'Deep Breathing Exercise',
          content: 'Practice 4-7-8 breathing: Inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds. Repeat 4 times to quickly reduce stress.',
          category: 'stress',
          source: 'Mindfulness Institute'
        },
        {
          id: 'stress-2',
          title: 'Progressive Muscle Relaxation',
          content: 'Tense each muscle group for 5 seconds, then release for 10 seconds, working from toes to head to relieve physical stress.',
          category: 'stress',
          source: 'Stress Management Center'
        },
        {
          id: 'stress-3',
          title: 'Nature Connection',
          content: 'Spending just 20 minutes in nature significantly lowers cortisol levels. Try forest bathing or a quick park walk during lunch.',
          category: 'stress',
          source: 'Environmental Psychology Journal'
        }
      ],
      'immunity': [
        {
          id: 'immunity-1',
          title: 'Vitamin D Boost',
          content: '15-20 minutes of morning sunlight exposure helps your body produce vitamin D, which is crucial for immune function.',
          category: 'immunity',
          source: 'Nutrition Research Institute'
        },
        {
          id: 'immunity-2',
          title: 'Probiotic Foods',
          content: 'Include fermented foods like yogurt, kefir, sauerkraut or kimchi daily to support gut health, where 70% of your immune system resides.',
          category: 'immunity',
          source: 'Gut Health Foundation'
        },
        {
          id: 'immunity-3',
          title: 'Adequate Sleep',
          content: 'During sleep, your immune system releases cytokines that fight infection. Aim for 7-9 hours nightly to maintain strong immunity.',
          category: 'immunity',
          source: 'Sleep Research Society'
        }
      ],
      'skincare': [
        {
          id: 'skincare-1',
          title: 'Gentle Cleansing',
          content: 'Wash your face with lukewarm (not hot) water and a gentle cleanser morning and night to remove impurities without stripping natural oils.',
          category: 'skincare',
          source: 'Dermatology Association'
        },
        {
          id: 'skincare-2',
          title: 'Antioxidant Protection',
          content: 'Apply vitamin C serum in the morning under sunscreen to neutralize free radicals and prevent photoaging from environmental exposure.',
          category: 'skincare',
          source: 'Skin Science Institute'
        },
        {
          id: 'skincare-3',
          title: 'Hydration Balance',
          content: 'Use hyaluronic acid serum on damp skin before moisturizer to attract and seal in moisture without clogging pores.',
          category: 'skincare',
          source: 'Cosmetic Chemistry Journal'
        }
      ],
      'digestion': [
        {
          id: 'digestion-1',
          title: 'Mindful Eating',
          content: 'Chew each bite 20-30 times and avoid distractions while eating to improve digestion and nutrient absorption.',
          category: 'digestion',
          source: 'Digestive Health Center'
        },
        {
          id: 'digestion-2',
          title: 'Fiber Timing',
          content: 'Consume soluble fiber (oats, beans) with protein and insoluble fiber (vegetables, whole grains) with plenty of water for optimal digestion.',
          category: 'digestion',
          source: 'Gastroenterology Research'
        },
        {
          id: 'digestion-3',
          title: 'Digestive Enzymes',
          content: 'Eat a small piece of fresh pineapple or papaya after meals - they contain natural enzymes that help break down proteins and ease digestion.',
          category: 'digestion',
          source: 'Nutritional Biochemistry Journal'
        }
      ],
      'posture': [
        {
          id: 'posture-1',
          title: '90-90-90 Rule',
          content: 'When sitting, maintain 90° angles at your hips, knees, and ankles with feet flat on the floor to support proper spinal alignment.',
          category: 'posture',
          source: 'Ergonomics Institute'
        },
        {
          id: 'posture-2',
          title: 'Tech Neck Prevention',
          content: 'Hold your phone at eye level instead of looking down, and take a 20-second break every 20 minutes when using screens.',
          category: 'posture',
          source: 'Spine Health Association'
        },
        {
          id: 'posture-3',
          title: 'Wall Angels Exercise',
          content: 'Stand with your back against a wall, arms at 90° angles. Slide arms up and down while maintaining contact with the wall to strengthen posture muscles.',
          category: 'posture',
          source: 'Physical Therapy Journal'
        }
      ]
    };
    
    return tipsByCategory[category] || [];
  };
  
  const getDisplayedTips = () => {
    if (showSavedOnly) {
      return savedTips;
    }
    return tips;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-gradient-to-b from-blue-100 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen transition-colors">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-blue-800 dark:text-blue-300 inline-block relative">
          <span className="relative inline-block">HealthSage</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-3 max-w-2xl mx-auto">Your personalized guide to wellness with expert tips for a healthier lifestyle</p>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md mb-6">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {/* View Toggle */}
      <div className="mb-6 flex justify-end">
        <button 
          onClick={() => setShowSavedOnly(!showSavedOnly)}
          className={`flex items-center px-5 py-2 rounded-lg transition-all duration-300 shadow-sm ${showSavedOnly ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white dark:bg-gray-800 dark:text-blue-200 text-blue-600 border border-blue-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700'}`}
        >
          {showSavedOnly ? <FaBookmark className="mr-2" /> : <FaRegBookmark className="mr-2" />}
          {showSavedOnly ? 'Viewing Saved Tips' : 'View Saved Tips'}
          <span className="ml-1 bg-blue-100 text-blue-800 text-xs rounded-full px-2 py-0.5">{savedTips.length}</span>
        </button>
      </div>
      
      {/* Category Filter */}
      <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-blue-100 dark:border-gray-700 transition-colors">
        <h2 className="text-xl font-semibold mb-4 text-blue-700 dark:text-blue-300 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Explore by Category
        </h2>
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategory(category.id);
                setShowSavedOnly(false);
              }}
              className={`px-4 py-2 rounded-full transition-all duration-300 flex items-center ${selectedCategory === category.id && !showSavedOnly ? 'bg-blue-600 text-white shadow-md transform scale-105' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow text-gray-800 dark:text-gray-200'}`}
            >
              <span className="mr-2 text-lg">{getCategoryIcon(category.id)}</span> 
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Tips List */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading health tips...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getDisplayedTips().length > 0 ? (
            getDisplayedTips().map((tip) => (
              <div key={tip.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-blue-50 dark:border-gray-700 transform hover:-translate-y-1">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 p-4 border-b border-blue-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3 bg-white dark:bg-gray-700 p-3 rounded-full shadow-sm">{getCategoryIcon(tip.category)}</span>
                      <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">{tip.title}</h3>
                    </div>
                    <span className="text-xs px-3 py-1 bg-blue-100 dark:bg-gray-600 text-blue-800 dark:text-gray-100 rounded-full font-medium">{tip.category}</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-700 dark:text-gray-200 mb-5 leading-relaxed">{tip.content}</p>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400 italic">Source: {tip.source || 'HealthSage'}</div>
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => handleShareTip(tip)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200 hover:scale-110 transform"
                        title="Share this tip"
                      >
                        <FaShare />
                      </button>
                      <button 
                        onClick={() => toggleSaveTip(tip)}
                        className={`p-2 rounded-full transition-all duration-200 hover:scale-110 transform ${isTipSaved(tip.id) ? 'text-yellow-500 hover:bg-yellow-50' : 'text-gray-400 hover:bg-gray-50'}`}
                        title={isTipSaved(tip.id) ? 'Remove from saved' : 'Save this tip'}
                      >
                        {isTipSaved(tip.id) ? <FaBookmark /> : <FaRegBookmark />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-md">
              {showSavedOnly ? (
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-blue-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <p className="text-gray-600 mb-2">You haven't saved any health tips yet.</p>
                  <button 
                    onClick={() => setShowSavedOnly(false)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Browse All Tips
                  </button>
                </div>
              ) : (
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-blue-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-600">No health tips found for this category.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
        <h3 className="text-xl font-semibold mb-4 text-blue-700 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Personalized Tip
        </h3>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex">
            <div className="text-3xl mr-4">💡</div>
            <div>
              <p className="text-gray-700">
                Based on your recent wellness logs, we recommend focusing on staying hydrated and getting consistent sleep. 
                Both can significantly improve your energy levels and overall well-being.
              </p>
              <div className="mt-4 text-sm text-gray-500 bg-white p-3 rounded-lg border border-gray-200">
                <p className="font-medium text-blue-600 mb-1">Pro Tip:</p>
                <p>For more personalized health tips, regularly update your wellness logs and ensure you're logged in.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Share Modal */}
      {shareModalOpen && currentTipToShare && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Share This Tip</h3>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="font-medium">{currentTipToShare.title}</p>
              <p className="text-sm text-gray-700 mt-2">{currentTipToShare.content}</p>
            </div>
            
            {/* Share Options Tabs */}
            <div className="mb-4 border-b border-gray-200">
              <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" role="tablist">
                <li className="mr-2" role="presentation">
                  <button 
                    className="inline-block p-4 border-b-2 rounded-t-lg border-blue-600 text-blue-600 active"
                    id="social-tab" 
                    type="button" 
                    role="tab"
                    aria-selected="true"
                  >
                    Social Media
                  </button>
                </li>
                <li className="mr-2" role="presentation">
                  <button 
                    className="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300"
                    id="text-tab" 
                    type="button" 
                    role="tab"
                    aria-selected="false"
                    onClick={() => copyToClipboard(`${currentTipToShare.title}: ${currentTipToShare.content}`)}
                  >
                    Copy Text
                  </button>
                </li>
                <li role="presentation">
                  <button 
                    className="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300"
                    id="link-tab" 
                    type="button" 
                    role="tab"
                    aria-selected="false"
                    onClick={() => copyToClipboard(`${window.location.origin}/health-tips?tip=${currentTipToShare.id}`)}
                  >
                    Copy Link
                  </button>
                </li>
              </ul>
            </div>
            
            {/* Social Media Sharing */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <a 
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(currentTipToShare.title + ': ' + currentTipToShare.content)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors duration-200"
              >
                <FaFacebook className="text-blue-600 text-xl mb-1" />
                <span className="text-xs">Facebook</span>
              </a>
              
              <a 
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(currentTipToShare.title + ': ' + currentTipToShare.content)}&url=${encodeURIComponent(window.location.href)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors duration-200"
              >
                <FaTwitter className="text-blue-400 text-xl mb-1" />
                <span className="text-xs">Twitter</span>
              </a>
              
              <a 
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(currentTipToShare.title + ': ' + currentTipToShare.content + ' ' + window.location.href)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors duration-200"
              >
                <FaWhatsapp className="text-green-500 text-xl mb-1" />
                <span className="text-xs">WhatsApp</span>
              </a>
              
              <a 
                href={`mailto:?subject=${encodeURIComponent('Health Tip: ' + currentTipToShare.title)}&body=${encodeURIComponent(currentTipToShare.content + '\n\nShared from Health Buddy App: ' + window.location.href)}`}
                className="flex flex-col items-center justify-center p-3 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-xs">Email</span>
              </a>
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={() => setShareModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthTips;