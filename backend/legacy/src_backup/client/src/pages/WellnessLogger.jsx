import React, { useState, useEffect } from 'react';
import { wellnessLogsApi } from '../services/api';

const WellnessLogger = () => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    water_intake: 0,
    mood: 'neutral',
    sleep_hours: 7,
    energy_level: 5,
    notes: ''
  });

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Fetch existing logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        // For demo purposes, we'll use a hardcoded user ID
        // In a real app, this would come from authentication
        const userId = 1;
        const response = await wellnessLogsApi.getByUserId(userId);
        setLogs(response.data);
      } catch (error) {
        console.error('Error fetching wellness logs:', error);
        setMessage({
          text: 'Failed to load wellness logs. Please try again later.',
          type: 'error'
        });
        // Fallback to localStorage if API fails
        const savedLogs = localStorage.getItem('wellnessLogs');
        if (savedLogs) {
          setLogs(JSON.parse(savedLogs));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // For demo purposes, we'll use a hardcoded user ID
      // In a real app, this would come from authentication
      const userId = 1;
      
      // Check if a log for this date already exists
      const existingLog = logs.find(log => log.date === formData.date);
      
      if (existingLog) {
        // Update existing log
        await wellnessLogsApi.update(existingLog.id, {
          water_intake: parseFloat(formData.water_intake),
          mood: formData.mood,
          sleep_hours: parseFloat(formData.sleep_hours),
          energy_level: parseInt(formData.energy_level),
          notes: formData.notes || ''
        });
      } else {
        // Add new log
        await wellnessLogsApi.create({
          user_id: userId,
          date: formData.date,
          water_intake: parseFloat(formData.water_intake),
          mood: formData.mood,
          sleep_hours: parseFloat(formData.sleep_hours),
          energy_level: parseInt(formData.energy_level),
          notes: formData.notes || ''
        });
      }
      
      // Fetch updated logs
      const response = await wellnessLogsApi.getByUserId(userId);
      setLogs(response.data);
      
      // Also update localStorage as a backup
      localStorage.setItem('wellnessLogs', JSON.stringify(response.data));
      
      setMessage({
        text: existingLog ? 'Wellness log updated successfully!' : 'Wellness log added successfully!',
        type: 'success'
      });
      
      // Reset form if it's a new entry
      if (!existingLog) {
        setFormData({
          date: new Date().toISOString().split('T')[0],
          water_intake: 0,
          mood: 'neutral',
          sleep_hours: 7,
          energy_level: 5,
          notes: ''
        });
      }
    } catch (err) {
      console.error('Error saving wellness log:', err);
      setMessage({
        text: 'An error occurred while saving your wellness log. Please try again.',
        type: 'error'
      });
      
      // Fallback to localStorage if API fails
      const existingLogIndex = logs.findIndex(log => log.date === formData.date);
      
      let updatedLogs;
      if (existingLogIndex >= 0) {
        updatedLogs = [...logs];
        updatedLogs[existingLogIndex] = formData;
      } else {
        updatedLogs = [...logs, formData];
      }
      
      updatedLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setLogs(updatedLogs);
      localStorage.setItem('wellnessLogs', JSON.stringify(updatedLogs));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await wellnessLogsApi.delete(id);
      
      // Update local state
      const updatedLogs = logs.filter(log => log.id !== id);
      setLogs(updatedLogs);
      
      // Update localStorage as backup
      localStorage.setItem('wellnessLogs', JSON.stringify(updatedLogs));
      
      setMessage({
        text: 'Wellness log deleted successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('Error deleting wellness log:', error);
      setMessage({
        text: 'Failed to delete wellness log. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Daily Wellness Logger</h1>
      
      {message.text && (
        <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Log Form */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Log Your Wellness</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="date">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="waterIntake">
                Water Intake (glasses)
              </label>
              <input
                type="number"
                id="water_intake"
                name="water_intake"
                min="0"
                max="20"
                value={formData.water_intake}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="mood">
                Mood
              </label>
              <select
                id="mood"
                name="mood"
                value={formData.mood}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="very-sad">Very Sad 😢</option>
                <option value="sad">Sad 😔</option>
                <option value="neutral">Neutral 😐</option>
                <option value="happy">Happy 😊</option>
                <option value="very-happy">Very Happy 😁</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="sleepHours">
                Sleep Hours
              </label>
              <input
                type="number"
                id="sleep_hours"
                name="sleep_hours"
                min="0"
                max="24"
                step="0.5"
                value={formData.sleep_hours}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="energyLevel">
                Energy Level (1-10)
              </label>
              <input
                type="range"
                id="energy_level"
                name="energy_level"
                min="1"
                max="10"
                value={formData.energy_level}
                onChange={handleChange}
                className="w-full"
                required
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
              <div className="text-center font-bold mt-1">{formData.energy_level}</div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Saving...' : 'Save Wellness Log'}
            </button>
          </form>
        </div>
        
        {/* Recent Logs */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Recent Logs</h2>
          {logs.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {logs.map((log) => (
                <div key={log.id || log.date} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">{new Date(log.date).toLocaleDateString()}</h3>
                    <button
                      onClick={() => handleDelete(log.id || log.date)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete log"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Water:</span> {log.water_intake || log.waterIntake} glasses
                    </div>
                    <div>
                      <span className="text-gray-600">Mood:</span> {getMoodEmoji(log.mood)}
                    </div>
                    <div>
                      <span className="text-gray-600">Sleep:</span> {log.sleep_hours || log.sleepHours} hours
                    </div>
                    <div>
                      <span className="text-gray-600">Energy:</span> {log.energy_level || log.energyLevel}/10
                    </div>
                  </div>
                  {log.notes && (
                    <div className="mt-2 text-sm">
                      <span className="text-gray-600">Notes:</span> {log.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No wellness logs yet. Start tracking your daily wellness!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WellnessLogger;