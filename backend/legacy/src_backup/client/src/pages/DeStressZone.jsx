import React, { useState, useEffect } from 'react';

const DeStressZone = () => {
  const [activeTab, setActiveTab] = useState('breathing');
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [breathingPhase, setBreathingPhase] = useState('inhale');
  const [breathingCount, setBreathingCount] = useState(4);
  const [quote, setQuote] = useState({});
  
  // Timer effect
  useEffect(() => {
    let interval = null;
    
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(seconds => seconds + 1);
      }, 1000);
    } else if (!timerRunning && timerSeconds !== 0) {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);
  
  // Breathing exercise effect
  useEffect(() => {
    let breathingInterval = null;
    
    if (activeTab === 'breathing' && timerRunning) {
      breathingInterval = setInterval(() => {
        setBreathingPhase(phase => {
          if (phase === 'inhale') return 'hold';
          if (phase === 'hold') return 'exhale';
          return 'inhale';
        });
      }, breathingCount * 1000);
    }
    
    return () => clearInterval(breathingInterval);
  }, [activeTab, timerRunning, breathingCount]);
  
  // Load random quote on mount
  useEffect(() => {
    getRandomQuote();
  }, []);
  
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const toggleTimer = () => {
    setTimerRunning(!timerRunning);
  };
  
  const resetTimer = () => {
    setTimerRunning(false);
    setTimerSeconds(0);
    setBreathingPhase('inhale');
  };
  
  const getRandomQuote = () => {
    const quotes = [
      {
        text: "The greatest weapon against stress is our ability to choose one thought over another.",
        author: "William James"
      },
      {
        text: "It's not stress that kills us, it is our reaction to it.",
        author: "Hans Selye"
      },
      {
        text: "Breath is the power behind all things. I breathe in and know that good things will happen.",
        author: "Tao Porchon-Lynch"
      },
      {
        text: "Within you, there is a stillness and a sanctuary to which you can retreat at any time and be yourself.",
        author: "Hermann Hesse"
      },
      {
        text: "The time to relax is when you don't have time for it.",
        author: "Sydney J. Harris"
      },
      {
        text: "Your calm mind is the ultimate weapon against your challenges.",
        author: "Bryant McGill"
      },
      {
        text: "Almost everything will work again if you unplug it for a few minutes, including you.",
        author: "Anne Lamott"
      },
      {
        text: "Life should be touched, not strangled. You've got to relax, let it happen at times, and at others move forward with it.",
        author: "Ray Bradbury"
      },
      {
        text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
        author: "Nelson Mandela"
      },
      {
        text: "Peace is the result of retraining your mind to process life as it is, rather than as you think it should be.",
        author: "Wayne Dyer"
      }
    ];
    
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);
  };
  
  const getBreathingInstructions = () => {
    switch (breathingPhase) {
      case 'inhale':
        return 'Inhale slowly through your nose...';
      case 'hold':
        return 'Hold your breath...';
      case 'exhale':
        return 'Exhale slowly through your mouth...';
      default:
        return 'Breathe naturally...';
    }
  };
  
  const getBreathingCircleClass = () => {
    if (!timerRunning) return 'w-40 h-40';
    
    switch (breathingPhase) {
      case 'inhale':
        return 'w-40 h-40 animate-expand';
      case 'hold':
        return 'w-64 h-64';
      case 'exhale':
        return 'w-64 h-64 animate-contract';
      default:
        return 'w-40 h-40';
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">De-Stress Zone</h1>
      
      <div className="card mb-6">
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'breathing' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('breathing')}
          >
            Breathing Exercise
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'meditation' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('meditation')}
          >
            Guided Meditation
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'quotes' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('quotes')}
          >
            Calming Quotes
          </button>
        </div>
        
        <div className="py-6">
          {activeTab === 'breathing' && (
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">4-4-4 Breathing Technique</h2>
              <p className="text-gray-600 mb-6">This simple breathing exercise can help reduce stress and anxiety. Inhale for 4 seconds, hold for 4 seconds, and exhale for 4 seconds.</p>
              
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className={`${getBreathingCircleClass()} rounded-full bg-blue-100 flex items-center justify-center transition-all duration-1000 ease-in-out`}>
                    <span className="text-primary font-medium">{timerRunning ? getBreathingInstructions() : 'Press Start'}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="text-3xl font-bold mb-2">{formatTime(timerSeconds)}</div>
                <div className="text-sm text-gray-500">Total Time</div>
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={toggleTimer}
                  className={`px-6 py-2 rounded-full font-medium ${timerRunning ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-primary hover:bg-primary-dark'} text-white transition-colors`}
                >
                  {timerRunning ? 'Pause' : 'Start'}
                </button>
                <button
                  onClick={resetTimer}
                  className="px-6 py-2 rounded-full font-medium bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
                >
                  Reset
                </button>
              </div>
              
              <div className="mt-8">
                <h3 className="font-medium mb-2">Breathing Speed</h3>
                <div className="flex items-center justify-center space-x-2">
                  <button 
                    onClick={() => setBreathingCount(Math.max(2, breathingCount - 1))}
                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                    disabled={breathingCount <= 2}
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{breathingCount}s</span>
                  <button 
                    onClick={() => setBreathingCount(Math.min(8, breathingCount + 1))}
                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                    disabled={breathingCount >= 8}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'meditation' && (
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">Guided Meditation</h2>
              <p className="text-gray-600 mb-6">Take a few minutes to relax with these guided meditation videos.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card bg-gray-50">
                  <h3 className="font-medium mb-2">5-Minute Meditation</h3>
                  <div className="aspect-w-16 aspect-h-9 mb-2">
                    <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                      <p className="text-gray-500 text-sm">YouTube Embed: 5-Minute Meditation for Stress Relief</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">A quick meditation session perfect for busy days.</p>
                </div>
                
                <div className="card bg-gray-50">
                  <h3 className="font-medium mb-2">10-Minute Mindfulness</h3>
                  <div className="aspect-w-16 aspect-h-9 mb-2">
                    <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                      <p className="text-gray-500 text-sm">YouTube Embed: 10-Minute Mindfulness Meditation</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Focus on the present moment with this mindfulness practice.</p>
                </div>
              </div>
              
              <div className="mt-6 text-gray-600">
                <p>Note: In a real application, these would be embedded YouTube videos using the YouTube API.</p>
              </div>
            </div>
          )}
          
          {activeTab === 'quotes' && (
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">Calming Quotes</h2>
              <p className="text-gray-600 mb-6">Find inspiration and peace in these thoughtful quotes.</p>
              
              <div className="max-w-lg mx-auto bg-blue-50 p-6 rounded-lg mb-6">
                <blockquote className="text-xl italic text-gray-800 mb-2">"{quote.text}"</blockquote>
                <cite className="text-gray-600">— {quote.author}</cite>
              </div>
              
              <button
                onClick={getRandomQuote}
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded transition-colors"
              >
                New Quote
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="card bg-gradient-to-r from-blue-50 to-purple-50">
        <h2 className="text-xl font-semibold mb-4">Quick Stress Relief Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-primary mb-2">Physical Techniques</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span><strong>Progressive Muscle Relaxation:</strong> Tense and then release each muscle group in your body.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span><strong>Take a Walk:</strong> Even a short 5-minute walk can help clear your mind.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span><strong>Stretch:</strong> Simple stretches can release tension in your body.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span><strong>Hydrate:</strong> Drink a glass of water slowly, focusing on the sensation.</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-primary mb-2">Mental Techniques</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span><strong>5-4-3-2-1 Method:</strong> Name 5 things you see, 4 things you feel, 3 things you hear, 2 things you smell, and 1 thing you taste.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span><strong>Visualization:</strong> Imagine a peaceful place in detail.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span><strong>Gratitude:</strong> List three things you're grateful for right now.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span><strong>Music:</strong> Listen to calming music for a few minutes.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes expand {
          from { transform: scale(1); }
          to { transform: scale(1.6); }
        }
        
        @keyframes contract {
          from { transform: scale(1.6); }
          to { transform: scale(1); }
        }
        
        .animate-expand {
          animation: expand ${breathingCount}s ease-in-out;
        }
        
        .animate-contract {
          animation: contract ${breathingCount}s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default DeStressZone;