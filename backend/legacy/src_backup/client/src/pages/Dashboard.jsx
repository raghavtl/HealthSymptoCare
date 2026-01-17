import React, { useState, useEffect } from 'react';
import { wellnessLogsApi } from '../services/api';

const Dashboard = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('week');
  const [stats, setStats] = useState({
    avgWaterIntake: 0,
    avgSleepHours: 0,
    avgEnergyLevel: 0,
    moodDistribution: {},
  });

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError('');
      
      try {
        // For demo purposes, we'll use a hardcoded user ID
        // In a real app, this would come from authentication
        const userId = 1;
        const response = await wellnessLogsApi.getByUserId(userId);
        let logsData = response.data;
        
        // If API fails or returns no data, try localStorage as fallback
        if (!logsData || logsData.length === 0) {
          const savedLogs = localStorage.getItem('wellnessLogs');
          if (savedLogs) {
            logsData = JSON.parse(savedLogs);
          } else {
            // If no logs exist, create some mock data
            const today = new Date();
            logsData = Array.from({ length: 14 }, (_, i) => {
              const date = new Date(today);
              date.setDate(date.getDate() - i);
              return {
                date: date.toISOString().split('T')[0],
                water_intake: Math.floor(Math.random() * 10) + 1,
                mood: ['very-sad', 'sad', 'neutral', 'happy', 'very-happy'][Math.floor(Math.random() * 5)],
                sleep_hours: Math.floor(Math.random() * 4) + 5,
                energy_level: Math.floor(Math.random() * 10) + 1,
              };
            });
            localStorage.setItem('wellnessLogs', JSON.stringify(logsData));
          }
        }
        
        // Sort logs by date (newest first)
        logsData.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setLogs(logsData);
        calculateStats(logsData, timeRange);
      } catch (err) {
        console.error('Error fetching wellness logs:', err);
        setError('An error occurred while fetching your wellness data. Please try again.');
        
        // Try localStorage as fallback
        const savedLogs = localStorage.getItem('wellnessLogs');
        if (savedLogs) {
          const logsData = JSON.parse(savedLogs);
          setLogs(logsData);
          calculateStats(logsData, timeRange);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchLogs();
  }, []);

  useEffect(() => {
    calculateStats(logs, timeRange);
  }, [logs, timeRange]);

  const calculateStats = (logsData, range) => {
    if (!logsData.length) return;
    
    const today = new Date();
    let filteredLogs = [];
    
    // Filter logs based on selected time range
    switch (range) {
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filteredLogs = logsData.filter(log => new Date(log.date) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filteredLogs = logsData.filter(log => new Date(log.date) >= monthAgo);
        break;
      case 'all':
        filteredLogs = [...logsData];
        break;
      default:
        filteredLogs = [...logsData];
    }
    
    if (filteredLogs.length === 0) {
      setStats({
        avgWaterIntake: 0,
        avgSleepHours: 0,
        avgEnergyLevel: 0,
        moodDistribution: {},
      });
      return;
    }
    
    // Calculate averages
    const avgWaterIntake = filteredLogs.reduce((sum, log) => sum + Number(log.waterIntake), 0) / filteredLogs.length;
    const avgSleepHours = filteredLogs.reduce((sum, log) => sum + Number(log.sleepHours), 0) / filteredLogs.length;
    const avgEnergyLevel = filteredLogs.reduce((sum, log) => sum + Number(log.energyLevel), 0) / filteredLogs.length;
    
    // Calculate mood distribution
    const moodDistribution = filteredLogs.reduce((acc, log) => {
      acc[log.mood] = (acc[log.mood] || 0) + 1;
      return acc;
    }, {});
    
    setStats({
      avgWaterIntake,
      avgSleepHours,
      avgEnergyLevel,
      moodDistribution,
    });
  };

  const getMoodEmoji = (mood) => {
    const moodEmojis = {
      'very-sad': '😢',
      'sad': '😔',
      'neutral': '😐',
      'happy': '😊',
      'very-happy': '😁'
    };
    return moodEmojis[mood] || '😐';
  };

  const getMoodName = (mood) => {
    const moodNames = {
      'very-sad': 'Very Sad',
      'sad': 'Sad',
      'neutral': 'Neutral',
      'happy': 'Happy',
      'very-happy': 'Very Happy'
    };
    return moodNames[mood] || 'Neutral';
  };

  const getProgressColor = (value, max, isReversed = false) => {
    const percentage = value / max;
    if (isReversed) {
      if (percentage < 0.4) return 'bg-green-500';
      if (percentage < 0.7) return 'bg-yellow-500';
      return 'bg-red-500';
    } else {
      if (percentage < 0.4) return 'bg-red-500';
      if (percentage < 0.7) return 'bg-yellow-500';
      return 'bg-green-500';
    }
  };

  const renderMoodDistribution = () => {
    if (!stats.moodDistribution || Object.keys(stats.moodDistribution).length === 0) {
      return <p className="text-gray-500">No mood data available.</p>;
    }
    
    const totalEntries = Object.values(stats.moodDistribution).reduce((sum, count) => sum + count, 0);
    const moodOrder = ['very-happy', 'happy', 'neutral', 'sad', 'very-sad'];
    
    return (
      <div className="space-y-2">
        {moodOrder.map(mood => {
          const count = stats.moodDistribution[mood] || 0;
          const percentage = totalEntries > 0 ? (count / totalEntries) * 100 : 0;
          
          return (
            <div key={mood} className="flex items-center">
              <div className="w-8 text-center">{getMoodEmoji(mood)}</div>
              <div className="flex-1 mx-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${mood === 'very-happy' || mood === 'happy' ? 'bg-green-500' : mood === 'neutral' ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-16 text-xs text-gray-600">{getMoodName(mood)}</div>
              <div className="w-12 text-right text-xs font-medium">{percentage.toFixed(0)}%</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Health Analytics Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Time Range Selector */}
      <div className="mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded ${timeRange === 'week' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            Last Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded ${timeRange === 'month' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            Last Month
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-4 py-2 rounded ${timeRange === 'all' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            All Time
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-2 text-gray-600">Loading your health data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Summary Stats */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700">Average Water Intake</span>
                  <span className="font-medium">{stats.avgWaterIntake.toFixed(1)} glasses</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${getProgressColor(stats.avgWaterIntake, 8)}`}
                    style={{ width: `${Math.min(stats.avgWaterIntake / 8 * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>4</span>
                  <span>8+</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700">Average Sleep Hours</span>
                  <span className="font-medium">{stats.avgSleepHours.toFixed(1)} hours</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${getProgressColor(stats.avgSleepHours, 9)}`}
                    style={{ width: `${Math.min(stats.avgSleepHours / 9 * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>4.5</span>
                  <span>9+</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700">Average Energy Level</span>
                  <span className="font-medium">{stats.avgEnergyLevel.toFixed(1)}/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${getProgressColor(stats.avgEnergyLevel, 10)}`}
                    style={{ width: `${stats.avgEnergyLevel * 10}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mood Distribution */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Mood Distribution</h2>
            {renderMoodDistribution()}
          </div>
          
          {/* Recent Logs */}
          <div className="card md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Recent Logs</h2>
            {logs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Water</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mood</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sleep</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Energy</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {logs.slice(0, 7).map((log) => (
                      <tr key={log.date} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {new Date(log.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.waterIntake} glasses
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="text-lg" title={getMoodName(log.mood)}>{getMoodEmoji(log.mood)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.sleepHours} hours
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className={`h-2 rounded-full ${getProgressColor(log.energyLevel, 10)}`}
                                style={{ width: `${log.energyLevel * 10}%` }}
                              ></div>
                            </div>
                            <span>{log.energyLevel}/10</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No wellness logs available. Start tracking your daily wellness!</p>
            )}
          </div>
          
          {/* Insights */}
          <div className="card md:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-xl font-semibold mb-4">Insights & Recommendations</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-primary">Sleep Pattern</h3>
                <p className="text-gray-700">
                  Your average sleep of {stats.avgSleepHours.toFixed(1)} hours {stats.avgSleepHours < 7 ? 'is below the recommended 7-9 hours. Consider establishing a consistent sleep schedule.' : 'is within the healthy range. Keep maintaining your good sleep habits!'}
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-primary">Hydration</h3>
                <p className="text-gray-700">
                  You're drinking an average of {stats.avgWaterIntake.toFixed(1)} glasses of water daily. {stats.avgWaterIntake < 8 ? 'Try to increase your intake to at least 8 glasses for optimal hydration.' : 'Great job staying hydrated!'}
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-primary">Mood & Energy</h3>
                <p className="text-gray-700">
                  {stats.avgEnergyLevel < 5 ? 'Your energy levels are on the lower side. This might be connected to your sleep and hydration habits.' : 'Your energy levels are good! There appears to be a positive correlation with your sleep and hydration habits.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;