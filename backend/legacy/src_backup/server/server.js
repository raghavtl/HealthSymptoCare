const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { testConnection } = require('./config/sqlite-db');
const { initializeSQLiteDatabase } = require('./config/init-sqlite-db');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to all routes
app.use('/api', apiLimiter);

// Import routes
const userRoutes = require('./routes/users');
const wellnessLogRoutes = require('./routes/wellness-logs');
const healthTipRoutes = require('./routes/health-tips');
const symptomRoutes = require('./routes/symptoms');
const dietAndFitnessRoutes = require('./routes/dietAndFitness');
const medicineRoutes = require('./routes/medicines');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/wellness-logs', wellnessLogRoutes);
app.use('/api/health-tips', healthTipRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/diet-and-fitness', dietAndFitnessRoutes);
app.use('/api/medicines', medicineRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Database reset route
app.post('/api/reset-database', async (req, res) => {
  try {
    const { resetDatabase } = require('./reset-database');
    const success = await resetDatabase();
    
    if (success) {
      res.status(200).json({ success: true, message: 'Database reset successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to reset database' });
    }
  } catch (error) {
    console.error('Error in reset-database route:', error.message);
    res.status(500).json({ success: false, message: 'Error resetting database', error: error.message });
  }
});

// Mock API for health tips
app.get('/api/health-tips', (req, res) => {
  const tips = [
    { id: 1, category: 'nutrition', title: 'Stay Hydrated', content: 'Drink at least 8 glasses of water daily to maintain proper hydration.' },
    { id: 2, category: 'nutrition', title: 'Eat Colorful Foods', content: 'Include a variety of colorful fruits and vegetables in your diet for essential nutrients.' },
    { id: 3, category: 'nutrition', title: 'Limit Processed Foods', content: 'Reduce intake of processed foods high in sodium, sugar, and unhealthy fats.' },
    { id: 4, category: 'nutrition', title: 'Portion Control', content: 'Be mindful of portion sizes to avoid overeating and maintain a healthy weight.' },
    { id: 5, category: 'fitness', title: '150 Minutes Rule', content: 'Aim for at least 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity each week.' },
    { id: 6, category: 'fitness', title: 'Strength Training', content: 'Include strength training exercises at least twice a week to maintain muscle mass.' },
    { id: 7, category: 'fitness', title: 'Active Throughout Day', content: 'Take short walking breaks during the day, especially if you have a sedentary job.' },
    { id: 8, category: 'fitness', title: 'Proper Form', content: 'Focus on proper form during exercises to prevent injuries and maximize benefits.' },
    { id: 9, category: 'mental', title: 'Meditation Practice', content: 'Practice mindfulness meditation for 10 minutes daily to reduce stress and improve focus.' },
    { id: 10, category: 'mental', title: 'Quality Sleep', content: 'Aim for 7-9 hours of quality sleep each night for optimal mental health.' },
    { id: 11, category: 'mental', title: 'Digital Detox', content: 'Take regular breaks from screens and social media to reduce mental fatigue.' },
    { id: 12, category: 'mental', title: 'Social Connections', content: 'Maintain meaningful social connections as they are crucial for mental wellbeing.' },
    { id: 13, category: 'sleep', title: 'Consistent Schedule', content: 'Maintain a consistent sleep schedule, even on weekends.' },
    { id: 14, category: 'sleep', title: 'Bedtime Routine', content: 'Establish a relaxing bedtime routine to signal your body it\'s time to sleep.' },
    { id: 15, category: 'sleep', title: 'Optimal Environment', content: 'Keep your bedroom dark, quiet, and at a comfortable temperature for better sleep.' },
    { id: 16, category: 'sleep', title: 'Limit Caffeine', content: 'Avoid caffeine and stimulants several hours before bedtime.' },
  ];
  
  // Simulate a delay to mimic a real API call
  setTimeout(() => {
    res.status(200).json(tips);
  }, 500);
});

// Mock API for symptom checking
app.post('/api/symptom-check', (req, res) => {
  const { symptoms } = req.body;
  
  if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
    return res.status(400).json({ error: 'Please provide a valid array of symptoms' });
  }
  
  // Mock database of conditions and their associated symptoms
  const conditionsDatabase = [
    {
      id: 1,
      name: 'Common Cold',
      symptoms: ['runny nose', 'sore throat', 'cough', 'congestion', 'mild fever', 'sneezing'],
      description: 'A viral infectious disease of the upper respiratory tract that primarily affects the nose.',
      selfCare: [
        'Rest and stay hydrated',
        'Use over-the-counter cold medications',
        'Use a humidifier to add moisture to the air',
        'Gargle with salt water to soothe a sore throat'
      ],
      whenToSeeDoctor: 'If symptoms last more than 10 days or are severe'
    },
    {
      id: 2,
      name: 'Influenza (Flu)',
      symptoms: ['high fever', 'body aches', 'fatigue', 'cough', 'headache', 'sore throat'],
      description: 'A contagious respiratory illness caused by influenza viruses that infect the nose, throat, and lungs.',
      selfCare: [
        'Rest and stay hydrated',
        'Take over-the-counter pain relievers',
        'Stay home to avoid spreading the illness'
      ],
      whenToSeeDoctor: 'If you have difficulty breathing, persistent high fever, or are in a high-risk group'
    },
    {
      id: 3,
      name: 'Migraine',
      symptoms: ['severe headache', 'throbbing pain', 'nausea', 'sensitivity to light', 'sensitivity to sound'],
      description: 'A neurological condition characterized by intense, debilitating headaches often accompanied by other symptoms.',
      selfCare: [
        'Rest in a quiet, dark room',
        'Apply cold or warm compresses to your head or neck',
        'Practice relaxation techniques',
        'Stay hydrated'
      ],
      whenToSeeDoctor: 'If you have severe headaches that don\'t respond to over-the-counter treatments'
    },
    {
      id: 4,
      name: 'Gastroenteritis',
      symptoms: ['nausea', 'vomiting', 'diarrhea', 'abdominal pain', 'mild fever', 'headache'],
      description: 'An intestinal infection marked by diarrhea, abdominal cramps, nausea, vomiting, and sometimes fever.',
      selfCare: [
        'Stay hydrated with clear fluids',
        'Eat bland, easy-to-digest foods',
        'Get plenty of rest',
        'Avoid dairy products, caffeine, and fatty foods'
      ],
      whenToSeeDoctor: 'If you have severe dehydration, bloody stools, or symptoms last more than a few days'
    },
    {
      id: 5,
      name: 'Allergic Rhinitis',
      symptoms: ['sneezing', 'itchy eyes', 'runny nose', 'congestion', 'watery eyes'],
      description: 'An allergic response to specific allergens such as pollen, dust, or pet dander that causes cold-like symptoms.',
      selfCare: [
        'Avoid known allergens',
        'Use over-the-counter antihistamines',
        'Try nasal irrigation with saline solution',
        'Keep windows closed during high pollen seasons'
      ],
      whenToSeeDoctor: 'If over-the-counter medications don\'t relieve your symptoms or if you have severe allergic reactions'
    },
    {
      id: 6,
      name: 'Tension Headache',
      symptoms: ['dull headache', 'pressure around forehead', 'tenderness around forehead and scalp'],
      description: 'The most common type of headache that causes mild to moderate pain in your head, neck, and behind your eyes.',
      selfCare: [
        'Over-the-counter pain relievers',
        'Stress management techniques',
        'Regular physical activity',
        'Maintain good posture'
      ],
      whenToSeeDoctor: 'If headaches are severe, frequent, or interfere with daily activities'
    },
    {
      id: 7,
      name: 'Insomnia',
      symptoms: ['difficulty falling asleep', 'waking up during the night', 'waking up too early', 'daytime fatigue', 'irritability'],
      description: 'A sleep disorder that can make it hard to fall asleep, stay asleep, or cause you to wake up too early and not be able to get back to sleep.',
      selfCare: [
        'Maintain a regular sleep schedule',
        'Create a restful environment',
        'Limit caffeine and screen time before bed',
        'Try relaxation techniques before sleeping'
      ],
      whenToSeeDoctor: 'If insomnia lasts for more than a few weeks or interferes with daily activities'
    },
    {
      id: 8,
      name: 'Dehydration',
      symptoms: ['extreme thirst', 'less frequent urination', 'dark-colored urine', 'fatigue', 'dizziness'],
      description: 'A condition that occurs when you lose more fluids than you take in, and your body doesn\'t have enough water to carry out its normal functions.',
      selfCare: [
        'Drink water or other fluids',
        'Take small, frequent sips of fluid',
        'Consume sports drinks with electrolytes if active',
        'Eat foods high in water content'
      ],
      whenToSeeDoctor: 'If you have severe diarrhea, bloody stool, moderate to high fever, or can\'t keep fluids down'
    }
  ];
  
  // Simple matching algorithm
  const matchedConditions = conditionsDatabase.map(condition => {
    const matchedSymptoms = symptoms.filter(symptom => 
      condition.symptoms.some(conditionSymptom => 
        conditionSymptom.toLowerCase().includes(symptom.toLowerCase())
      )
    );
    
    const matchScore = matchedSymptoms.length / condition.symptoms.length;
    
    return {
      ...condition,
      matchedSymptoms,
      matchScore
    };
  })
  .filter(condition => condition.matchScore > 0)
  .sort((a, b) => b.matchScore - a.matchScore);
  
  // Simulate a delay to mimic a real API call
  setTimeout(() => {
    res.status(200).json({
      results: matchedConditions.slice(0, 3),
      disclaimer: "This is not a medical diagnosis. Please consult with a healthcare professional for proper medical advice."
    });
  }, 1000);
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      console.error('Failed to connect to the SQLite database. Server will not start.');
      process.exit(1);
    }
    
    // Initialize the SQLite database
    await initializeSQLiteDatabase();
    console.log('SQLite database initialized successfully');
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API is available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Error starting server:', error.message);
    process.exit(1);
  }
}

startServer();