import React, { useState, useEffect, useRef } from 'react';
import { wellnessLogsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/dashboard.css';

// Import sound effects
// Note: These are empty files that should be replaced with actual sound files
import addLogSound from '../assets/sounds/add-log.mp3';
import deleteLogSound from '../assets/sounds/delete-log.mp3';

const WellnessLogger = () => {
  const { currentUser } = useAuth();
  // Create refs for audio elements
  const addSoundRef = useRef(null);
  const deleteSoundRef = useRef(null);
  
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
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch existing logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        // Use authenticated user id; if missing, do not show any logs
        const userId = currentUser?.id;
        if (!userId) throw new Error('No current user');
        const response = await wellnessLogsApi.getByUserId(userId);
        setLogs(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching wellness logs:', error);
        setMessage({
          text: 'Failed to load wellness logs. Please try again later.',
          type: 'error'
        });
        // Fallback to localStorage if API fails
        const hasUserLogs = localStorage.getItem('userHasWellnessLogs') === 'true';
        const savedLogs = hasUserLogs ? localStorage.getItem('wellnessLogs') : null;
        if (savedLogs) {
          setLogs(JSON.parse(savedLogs));
        } else {
          setLogs([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      // Handle file input separately
      if (name === 'images') {
        const fileArray = Array.from(files);
        setSelectedImages(fileArray);
      }
    } else {
      // Handle other inputs
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    
    // Play add sound effect
    if (addSoundRef.current) {
      addSoundRef.current.currentTime = 0;
      addSoundRef.current.play().catch(e => console.log('Error playing sound:', e));
    }

    try {
      // Create a copy of formData with numeric values properly parsed
      const processedFormData = {
        ...formData,
        water_intake: parseFloat(formData.water_intake),
        sleep_hours: parseFloat(formData.sleep_hours),
        energy_level: parseFloat(formData.energy_level)
      };

      // Use authenticated user id
      const userId = currentUser?.id;
      
      // Check if a log for this date already exists
      const existingLog = logs.find(log => log.date === formData.date);
      
      if (existingLog) {
        // Update existing log
        await wellnessLogsApi.update(existingLog.id, {
          water_intake: processedFormData.water_intake,
          mood: formData.mood,
          sleep_hours: processedFormData.sleep_hours,
          energy_level: processedFormData.energy_level,
          notes: formData.notes || ''
        });
        
        // Upload images if any are selected
        if (selectedImages.length > 0) {
          setUploadingImages(true);
          try {
            for (const image of selectedImages) {
              const formData = new FormData();
              formData.append('image', image);
              await wellnessLogsApi.uploadImage(existingLog.id, formData);
            }
          } catch (error) {
            console.error('Error uploading images:', error);
            setMessage({
              text: 'Error uploading images. Please try again.',
              type: 'error'
            });
          } finally {
            setUploadingImages(false);
          }
        }
      } else {
        // Add new log
        const newLog = await wellnessLogsApi.create({
          user_id: userId,
          date: formData.date,
          water_intake: processedFormData.water_intake,
          mood: formData.mood,
          sleep_hours: processedFormData.sleep_hours,
          energy_level: processedFormData.energy_level,
          notes: formData.notes || ''
        });
        
        // Upload images if any are selected
        if (selectedImages.length > 0) {
          setUploadingImages(true);
          try {
            for (const image of selectedImages) {
              const formData = new FormData();
              formData.append('image', image);
              await wellnessLogsApi.uploadImage(newLog.data.id, formData);
            }
          } catch (error) {
            console.error('Error uploading images:', error);
            setMessage({
              text: 'Error uploading images. Please try again.',
              type: 'error'
            });
          } finally {
            setUploadingImages(false);
          }
        }
      }
      
      // Fetch updated logs
      const response = await wellnessLogsApi.getByUserId(userId);
      const nextLogs = Array.isArray(response.data) ? response.data : [];
      setLogs(nextLogs);
      
      // Mark that user has entered logs and update localStorage backup
      localStorage.setItem('userHasWellnessLogs', 'true');
      localStorage.setItem('wellnessLogs', JSON.stringify(nextLogs));
      // Notify dashboard/pages to update immediately
      window.dispatchEvent(new CustomEvent('wellnesslogs:updated', { detail: { logs: nextLogs } }));
      
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
        
        // Clear selected images
        setSelectedImages([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (err) {
      console.error('Error saving wellness log:', err);
      
      // More descriptive error message based on the error
      let errorMessage = 'An error occurred while saving your wellness log. Please try again.';
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = err.response.data.message || errorMessage;
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setMessage({
        text: errorMessage,
        type: 'error'
      });
      
      // Fallback to localStorage if API fails
      try {
        const existingLogIndex = logs.findIndex(log => log.date === formData.date);
        
        let updatedLogs;
        if (existingLogIndex >= 0) {
          updatedLogs = [...logs];
          updatedLogs[existingLogIndex] = {
            ...formData,
            water_intake: processedFormData.water_intake,
            sleep_hours: processedFormData.sleep_hours,
            energy_level: processedFormData.energy_level
          };
        } else {
          updatedLogs = [...logs, {
            ...formData,
            water_intake: processedFormData.water_intake,
            sleep_hours: processedFormData.sleep_hours,
            energy_level: processedFormData.energy_level
          }];
        }
        
        updatedLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setLogs(updatedLogs);
        localStorage.setItem('userHasWellnessLogs', 'true');
        localStorage.setItem('wellnessLogs', JSON.stringify(updatedLogs));
        window.dispatchEvent(new CustomEvent('wellnesslogs:updated', { detail: { logs: updatedLogs } }));
      } catch (localStorageError) {
        console.error('Error saving to localStorage:', localStorageError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      
      // Play delete sound effect
      if (deleteSoundRef.current) {
        deleteSoundRef.current.currentTime = 0;
        deleteSoundRef.current.play().catch(e => console.log('Error playing sound:', e));
      }
      
      await wellnessLogsApi.delete(id);
      
      // Update local state
      const updatedLogs = logs.filter(log => log.id !== id);
      setLogs(updatedLogs);
      
      // Update localStorage as backup
      if (updatedLogs.length > 0) {
        localStorage.setItem('wellnessLogs', JSON.stringify(updatedLogs));
      } else {
        // If no logs left, remove the item from localStorage completely
        localStorage.removeItem('userHasWellnessLogs');
        localStorage.removeItem('wellnessLogs');
        window.dispatchEvent(new CustomEvent('wellnesslogs:updated', { detail: { logs: [] } }));
        console.log('Removed wellnessLogs from localStorage as there are no logs left');
      }
      
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

  // Sleep Hours data preparation function removed as per requirement

  // Water Intake data preparation function removed as per requirement

  // Energy Level data preparation function removed as per requirement

  // Mood Distribution data preparation function removed as per requirement

  // Chart options removed as per requirement
  // Sleep Hours chart options removed as per requirement

  // Water Intake chart options removed as per requirement

  // Energy Level chart options removed as per requirement

  // Mood Distribution chart options removed as per requirement

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen transition-colors">
      {/* Audio elements for sound effects */}
      <audio ref={addSoundRef} src={addLogSound} preload="auto"></audio>
      <audio ref={deleteSoundRef} src={deleteLogSound} preload="auto"></audio>
      
      <div className="flex justify-center items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-medium text-blue-800 dark:text-blue-300 px-5 py-3 rounded-lg bg-white dark:bg-gray-800 shadow-md inline-block">
          Daily Wellness Logger
        </h1>
      </div>
      
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg shadow-md ${message.type === 'success' ? 'bg-green-100 text-green-800 border-l-4 border-green-500' : 'bg-red-100 text-red-800 border-l-4 border-red-500'} animate-fadeIn transition-all duration-500 ease-in-out transform`}>
          <div className="flex items-center">
            <span className="text-2xl mr-3">{message.type === 'success' ? '✅' : '❌'}</span>
            <p>{message.text}</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Log Form */}
        <div id="log-form" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-5 hover:shadow-lg transition-all duration-300">
          <h2 className="text-xl font-medium mb-4 text-blue-700 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Log Your Wellness
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="transition-all duration-200 hover:bg-blue-50 p-2 rounded-md">
              <label className="block text-gray-700 dark:text-gray-300 mb-1 text-base" htmlFor="date">
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Date
                </span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
            
            <div className="transition-all duration-200 hover:bg-blue-50 p-2 rounded-md">
              <label className="block text-gray-700 dark:text-gray-300 mb-1 text-base" htmlFor="waterIntake">
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Water Intake (glasses)
                </span>
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  id="water_intake"
                  name="water_intake"
                  min="0"
                  max="20"
                  value={formData.water_intake}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
                <span className="ml-3 text-2xl">🥤</span>
              </div>
            </div>
            
            <div className="transition-all duration-200 hover:bg-blue-50 p-3 rounded-lg">
              <label className="block text-gray-700 dark:text-gray-300 mb-1 text-base" htmlFor="mood">
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Mood
                </span>
              </label>
              <select
                id="mood"
                name="mood"
                value={formData.mood}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              >
                <option value="very-sad">Very Sad 😢</option>
                <option value="sad">Sad 😔</option>
                <option value="neutral">Neutral 😐</option>
                <option value="happy">Happy 😊</option>
                <option value="very-happy">Very Happy 😁</option>
              </select>
            </div>
            
            <div className="transition-all duration-200 hover:bg-blue-50 p-3 rounded-lg">
              <label className="block text-gray-700 dark:text-gray-300 mb-1 text-base" htmlFor="sleepHours">
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  Sleep Hours
                </span>
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  id="sleep_hours"
                  name="sleep_hours"
                  min="0"
                  max="24"
                  step="0.5"
                  value={formData.sleep_hours}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
                <span className="ml-3 text-2xl">😴</span>
              </div>
            </div>
            
            <div className="transition-all duration-200 hover:bg-blue-50 p-3 rounded-lg">
              <label className="block text-gray-700 dark:text-gray-300 mb-1 text-base" htmlFor="energyLevel">
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Energy Level: <span className="ml-2 font-bold text-blue-600">{formData.energy_level}/10</span>
                </span>
              </label>
              <input
                type="range"
                id="energy_level"
                name="energy_level"
                min="1"
                max="10"
                step="1"
                value={formData.energy_level}
                onChange={handleChange}
                className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
              <div className="flex justify-between text-xs text-gray-500 px-1 mt-1">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>
            
            <div className="transition-all duration-200 hover:bg-blue-50 p-3 rounded-lg">
              <label className="block text-gray-700 dark:text-gray-300 mb-1 text-base" htmlFor="notes">
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Notes (optional)
                </span>
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                rows="3"
                placeholder="How are you feeling today? Any additional notes?"
              ></textarea>
            </div>
            
            {/* Image Upload */}
            <div className="transition-all duration-200 hover:bg-blue-50 p-2 rounded-md">
              <label className="block text-gray-700 dark:text-gray-300 mb-1 text-base" htmlFor="images">
                <span className="flex items-center">
                  <svg className="h-5 w-5 mr-2 text-blue-600">
                    <use href="#image-icon" />
                  </svg>
                  Upload Images
                </span>
              </label>
              <input
                type="file"
                id="images"
                name="images"
                accept="image/*"
                multiple
                onChange={handleChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  cursor-pointer"
                ref={fileInputRef}
              />
              {selectedImages.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">{selectedImages.length} image(s) selected</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedImages.map((file, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={`Preview ${index}`} 
                          className="h-16 w-16 object-cover rounded-md border border-gray-300" 
                        />
                        <button
                          type="button"
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          onClick={() => {
                            const newImages = [...selectedImages];
                            newImages.splice(index, 1);
                            setSelectedImages(newImages);
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading || uploadingImages}
              className="w-full py-2 sm:py-3 px-4 sm:px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium text-lg rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center mt-4"
            >
              {loading || uploadingImages ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {uploadingImages ? 'Uploading Images...' : 'Saving...'}
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save Wellness Log
                </>
              )}
            </button>
          </form>
        </div>
        
        {/* Recent Logs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-5 hover:shadow-lg transition-all duration-300">
          <h2 className="text-xl font-medium mb-4 text-blue-700 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Recent Logs
          </h2>
          {logs.length > 0 ? (
            <div className="space-y-2 sm:space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
              {logs.map((log) => (
                <div key={log.id || log.date} className="border border-blue-100 dark:border-gray-700 rounded-md p-3 sm:p-4 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-gray-700">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-blue-800 dark:text-blue-300 flex items-center text-base">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </h3>
                    <button
                      onClick={() => handleDelete(log.id || log.date)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors duration-200"
                      title="Delete log"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-blue-50 p-2 rounded-md flex items-center">
                      <span className="text-xl mr-2">🥤</span>
                      <div>
                        <span className="text-gray-600 dark:text-gray-300 block">Water Intake:</span>
                        <span className="font-medium text-blue-800 dark:text-blue-300">{log.water_intake || log.waterIntake} glasses</span>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-2 rounded-lg flex items-center">
                      <span className="text-xl mr-2">{getMoodEmoji(log.mood)}</span>
                      <div>
                        <span className="text-gray-600 dark:text-gray-300 block">Mood:</span>
                        <span className="font-medium text-blue-800 dark:text-blue-300">{log.mood.replace('-', ' ')}</span>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-2 rounded-lg flex items-center">
                      <span className="text-xl mr-2">😴</span>
                      <div>
                        <span className="text-gray-600 dark:text-gray-300 block">Sleep:</span>
                        <span className="font-medium text-blue-800 dark:text-blue-300">{log.sleep_hours || log.sleepHours} hours</span>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-2 rounded-lg flex items-center">
                      <span className="text-xl mr-2">⚡</span>
                      <div>
                        <span className="text-gray-600 dark:text-gray-300 block">Energy:</span>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${(log.energy_level || 0) * 10}%` }}
                          ></div>
                        </div>
                        <span className="font-medium text-blue-800 dark:text-blue-300">{log.energy_level || 0}/10</span>
                      </div>
                    </div>
                  </div>
                  {log.notes && (
                    <div className="mt-3 text-sm bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg border-l-4 border-yellow-400">
                      <span className="text-gray-700 dark:text-gray-200 font-medium block mb-1">Notes:</span>
                      <p className="text-gray-800 dark:text-gray-100 whitespace-pre-wrap">{log.notes}</p>
                    </div>
                  )}
                  
                  {log.images && log.images.length > 0 && (
                    <div className="mt-3">
                      <span className="text-gray-700 font-medium block mb-1 text-sm">Images:</span>
                      <div className="flex flex-wrap gap-2">
                        {log.images.map((image, index) => (
                          <img 
                            key={index} 
                            src={image.url || image} 
                            alt={`Log image ${index + 1}`} 
                            className="h-20 w-20 object-cover rounded-md border border-gray-300 hover:border-blue-500 cursor-pointer transition-all" 
                            onClick={() => window.open(image.url || image, '_blank')}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-blue-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-600 dark:text-gray-300 mb-2">No wellness logs yet.</p>
              <p className="text-blue-600 dark:text-blue-300 font-medium">Start tracking your daily wellness journey!</p>
            </div>
          )}
        </div>
      </div>

      {/* Wellness Tips */}
      <div className="mt-4 sm:mt-5 bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 hover:shadow-lg transition-all duration-300">
        <h2 className="text-xl font-medium mb-4 text-blue-700 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Wellness Tips
        </h2>
        <div className="p-4 bg-blue-50 rounded-md border-l-4 border-blue-400">
          <div className="flex">
            <div className="text-2xl mr-3">💡</div>
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-1 text-base">Daily Wellness Reminder</h3>
              <p className="text-gray-700 dark:text-gray-200 text-base">Consistency is key to wellness. Try to log your data at the same time each day to build a healthy habit. Remember that small improvements add up to significant changes over time!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WellnessLogger;