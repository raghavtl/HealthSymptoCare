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
app.use(cors({
  origin: ['http://localhost:3010', 'http://127.0.0.1:3010', 'http://localhost:3011', 'http://127.0.0.1:3011', 'http://localhost:5173', 'http://localhost:3006', 'http://127.0.0.1:3006', 'http://localhost:5174', 'http://127.0.0.1:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json({ limit: '10mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Request logging middleware (sanitized in production)
app.use((req, res, next) => {
  const isProd = process.env.NODE_ENV === 'production';
  const now = new Date().toISOString();
  const { authorization, ...restHeaders } = req.headers || {};
  console.log(`[${now}] ${req.method} ${req.url}`);
  // In production, avoid logging full headers and never log Authorization
  if (!isProd) {
    console.log('Request Headers:', { ...restHeaders, authorization: authorization ? '***redacted***' : undefined });
    if (req.method !== 'GET') {
      console.log('Request Body:', req.body && JSON.stringify(req.body).slice(0, 2000));
    }
  }

  const originalSend = res.send;
  res.send = function(body) {
    const ts = new Date().toISOString();
    console.log(`[${ts}] Response Status:`, res.statusCode);
    if (!isProd && res.statusCode >= 400) {
      console.log('Response Body:', typeof body === 'string' ? body.slice(0, 2000) : body);
    }
    return originalSend.call(this, body);
  };

  next();
});
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting more lightly in development to avoid noisy reloads
if (process.env.NODE_ENV === 'production') {
  app.use('/api', apiLimiter);
}

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


// Enhanced API for symptom checking with medication info
app.post('/api/symptom-check-enhanced', (req, res) => {
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
      whenToSeeDoctor: 'If symptoms last more than 10 days or are severe',
      doctorSpecialist: 'General Practitioner or ENT Specialist',
      riskLevel: 'Low',
      medications: [
        { name: 'Paracetamol', dosage: '500mg every 6 hours', sideEffects: 'Rare when taken as directed' },
        { name: 'Cetirizine', dosage: '10mg once daily', sideEffects: 'Mild drowsiness, dry mouth' },
        { name: 'Cough Syrup (Dextromethorphan)', dosage: '15ml every 4 hours', sideEffects: 'Drowsiness, nausea' }
      ]
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
      whenToSeeDoctor: 'If you have difficulty breathing, persistent high fever, or are in a high-risk group',
      doctorSpecialist: 'General Practitioner or Internal Medicine Specialist',
      riskLevel: 'Moderate',
      medications: [
        { name: 'Oseltamivir (Tamiflu)', dosage: '75mg twice daily for 5 days', sideEffects: 'Nausea, vomiting, headache' },
        { name: 'Ibuprofen', dosage: '400mg every 6 hours', sideEffects: 'Stomach upset, dizziness' },
        { name: 'Paracetamol', dosage: '1000mg every 6 hours', sideEffects: 'Rare when taken as directed' }
      ]
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
      whenToSeeDoctor: 'If you have severe headaches that don\'t respond to over-the-counter treatments',
      doctorSpecialist: 'Neurologist',
      riskLevel: 'Moderate',
      medications: [
        { name: 'Sumatriptan', dosage: '50mg at onset, max 200mg/day', sideEffects: 'Chest tightness, dizziness' },
        { name: 'Rizatriptan', dosage: '10mg at onset', sideEffects: 'Drowsiness, dry mouth' },
        { name: 'Propranolol (Prevention)', dosage: '40mg twice daily', sideEffects: 'Fatigue, cold hands' }
      ]
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
      whenToSeeDoctor: 'If you have severe dehydration, bloody stools, or symptoms last more than a few days',
      doctorSpecialist: 'General Practitioner or Gastroenterologist',
      riskLevel: 'Low to Moderate',
      medications: [
        { name: 'ORS (Oral Rehydration Solution)', dosage: 'As needed for hydration', sideEffects: 'None when used properly' },
        { name: 'Loperamide', dosage: '2mg after each loose stool', sideEffects: 'Constipation, dizziness' },
        { name: 'Ondansetron', dosage: '4mg every 8 hours for nausea', sideEffects: 'Headache, constipation' }
      ]
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
      whenToSeeDoctor: 'If over-the-counter medications don\'t relieve your symptoms or if you have severe allergic reactions',
      doctorSpecialist: 'Allergist or ENT Specialist',
      riskLevel: 'Low',
      medications: [
        { name: 'Loratadine', dosage: '10mg once daily', sideEffects: 'Mild drowsiness, headache' },
        { name: 'Fluticasone Nasal Spray', dosage: '2 sprays per nostril daily', sideEffects: 'Nasal irritation, nosebleeds' },
        { name: 'Montelukast', dosage: '10mg once daily', sideEffects: 'Headache, stomach upset' }
      ]
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
      whenToSeeDoctor: 'If headaches are severe, frequent, or interfere with daily activities',
      doctorSpecialist: 'General Practitioner or Neurologist',
      riskLevel: 'Low',
      medications: [
        { name: 'Ibuprofen', dosage: '400mg every 6 hours', sideEffects: 'Stomach upset, dizziness' },
        { name: 'Aspirin', dosage: '325mg every 4 hours', sideEffects: 'Stomach irritation, bleeding risk' },
        { name: 'Amitriptyline (Prevention)', dosage: '10-25mg at bedtime', sideEffects: 'Drowsiness, dry mouth' }
      ]
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
      whenToSeeDoctor: 'If insomnia lasts for more than a few weeks or interferes with daily activities',
      doctorSpecialist: 'Sleep Medicine Specialist or Psychiatrist',
      riskLevel: 'Low to Moderate',
      medications: [
        { name: 'Melatonin', dosage: '1-3mg 30 minutes before bedtime', sideEffects: 'Daytime drowsiness, headache' },
        { name: 'Zolpidem', dosage: '5-10mg at bedtime', sideEffects: 'Morning drowsiness, dizziness' },
        { name: 'Trazodone', dosage: '25-50mg at bedtime', sideEffects: 'Drowsiness, dry mouth' }
      ]
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
      whenToSeeDoctor: 'If you have severe diarrhea, bloody stool, moderate to high fever, or can\'t keep fluids down',
      doctorSpecialist: 'General Practitioner or Emergency Medicine',
      riskLevel: 'Low to High (depending on severity)',
      medications: [
        { name: 'ORS (Oral Rehydration Solution)', dosage: 'As needed for rehydration', sideEffects: 'None when used properly' },
        { name: 'Electrolyte supplements', dosage: 'As directed on package', sideEffects: 'Stomach upset if taken in excess' }
      ]
    },
    {
      id: 9,
      name: 'COVID-19',
      symptoms: ['fever', 'dry cough', 'shortness of breath', 'loss of taste', 'loss of smell', 'fatigue', 'body aches'],
      description: 'A respiratory illness caused by the SARS-CoV-2 virus, which can range from mild to severe symptoms.',
      selfCare: [
        'Isolate from others',
        'Rest and stay hydrated',
        'Monitor symptoms closely',
        'Use a pulse oximeter if available'
      ],
      whenToSeeDoctor: 'If you have difficulty breathing, chest pain, confusion, or oxygen saturation below 95%',
      doctorSpecialist: 'General Practitioner or Pulmonologist',
      riskLevel: 'Moderate to High',
      medications: [
        { name: 'Paracetamol', dosage: '1000mg every 6 hours for fever', sideEffects: 'Rare when taken as directed' },
        { name: 'Dexamethasone', dosage: '6mg daily (if prescribed)', sideEffects: 'Increased blood sugar, mood changes' },
        { name: 'Remdesivir', dosage: 'IV administration (hospital only)', sideEffects: 'Nausea, elevated liver enzymes' }
      ]
    },
    {
      id: 10,
      name: 'Heart Attack Symptoms',
      symptoms: ['chest pain', 'shortness of breath', 'nausea', 'lightheadedness', 'cold sweat', 'pain in arm or jaw'],
      description: 'A medical emergency where blood flow to part of the heart is blocked, potentially causing permanent heart damage.',
      selfCare: [
        'Call emergency services immediately',
        'Chew aspirin if not allergic',
        'Stay calm and avoid physical activity',
        'Loosen tight clothing'
      ],
      whenToSeeDoctor: 'IMMEDIATE EMERGENCY - Call 108/102 or go to nearest hospital',
      doctorSpecialist: 'Emergency Medicine/Cardiologist',
      riskLevel: 'Critical/Emergency',
      medications: [
        { name: 'Aspirin', dosage: '300mg chewed immediately', sideEffects: 'Bleeding risk, stomach irritation' },
        { name: 'Nitroglycerin', dosage: 'Under tongue as prescribed', sideEffects: 'Headache, low blood pressure' }
      ]
    },
    {
      id: 11,
      name: 'Cancer Symptoms (General)',
      symptoms: ['unexplained weight loss', 'persistent fatigue', 'fever', 'pain', 'skin changes', 'unusual bleeding'],
      description: 'Cancer can manifest in many ways. Early detection and treatment are crucial for better outcomes.',
      selfCare: [
        'Maintain a healthy lifestyle',
        'Regular health screenings',
        'Document symptom patterns',
        'Stay informed about family history'
      ],
      whenToSeeDoctor: 'Persistent symptoms lasting more than 2 weeks, unexplained changes in body',
      doctorSpecialist: 'Oncologist, depending on type and location',
      riskLevel: 'Varies (Low to Critical)',
      medications: [
        { name: 'Pain management varies by type', dosage: 'Individualized treatment plan', sideEffects: 'Varies by specific medication' },
        { name: 'Anti-nausea medication', dosage: 'As prescribed during treatment', sideEffects: 'Drowsiness, constipation' }
      ]
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
      matchScore,
      probability: matchScore > 0.7 ? 'High' : matchScore > 0.4 ? 'Medium' : 'Low'
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

// Original Mock API for symptom checking (kept for backward compatibility)
app.post('/api/symptom-check', (req, res) => {
  const { symptoms } = req.body;
  
  if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
    return res.status(400).json({ error: 'Please provide a valid array of symptoms' });
  }
  
  // Use the same database but return simpler format for backward compatibility
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

// Enhanced Health Tips API with comprehensive unique tips
app.get('/api/health-tips-enhanced', (req, res) => {
  const { category } = req.query;
  
  const enhancedHealthTips = {
    nutrition: [
      {
        id: 'n1',
        category: 'nutrition',
        title: 'The Rainbow Plate Rule',
        content: 'Aim to eat fruits and vegetables of different colors every day. Each color provides different nutrients: red for lycopene, orange for beta-carotene, green for folate, purple for anthocyanins. A colorful plate ensures diverse nutrition.',
        source: 'Harvard School of Public Health'
      },
      {
        id: 'n2',
        category: 'nutrition',
        title: 'Intermittent Hydration with Meals',
        content: 'Drink water 30 minutes before meals and 2 hours after meals for optimal digestion. Avoid drinking large amounts during meals as it can dilute digestive enzymes.',
        source: 'Mayo Clinic'
      },
      {
        id: 'n3',
        category: 'nutrition',
        title: 'Mindful Portion Control',
        content: 'Use your hand as a portion guide: palm-sized protein, fist-sized vegetables, cupped-hand carbs, and thumb-sized fats. This natural measuring system adapts to your body size.',
        source: 'Precision Nutrition'
      },
      {
        id: 'n4',
        category: 'nutrition',
        title: 'Fermented Foods for Gut Health',
        content: 'Include fermented foods like yogurt, kefir, kimchi, or sauerkraut daily. These provide probiotics that support digestive health and may boost immunity.',
        source: 'International Scientific Association for Probiotics'
      },
      {
        id: 'n5',
        category: 'nutrition',
        title: 'Strategic Snacking',
        content: 'Choose snacks that combine protein and fiber: apple with almond butter, Greek yogurt with berries, or hummus with vegetables. This combination keeps blood sugar stable.',
        source: 'American Diabetes Association'
      }
    ],
    fitness: [
      {
        id: 'f1',
        category: 'fitness',
        title: 'The 2-Minute Rule',
        content: 'Start any new exercise habit with just 2 minutes daily. This builds consistency without overwhelming your schedule. Gradually increase duration once the habit is established.',
        source: 'James Clear, Atomic Habits'
      },
      {
        id: 'f2',
        category: 'fitness',
        title: 'Functional Movement Patterns',
        content: 'Focus on movements you use daily: squatting, pushing, pulling, and walking. These functional exercises improve real-world strength and reduce injury risk.',
        source: 'American College of Sports Medicine'
      },
      {
        id: 'f3',
        category: 'fitness',
        title: 'High-Intensity Interval Training (HIIT)',
        content: 'Alternate between 30 seconds of high-intensity exercise and 90 seconds of rest. Just 15-20 minutes can provide significant cardiovascular and metabolic benefits.',
        source: 'Journal of Sports Medicine'
      },
      {
        id: 'f4',
        category: 'fitness',
        title: 'Recovery is Training Too',
        content: 'Schedule rest days as actively as workout days. Your muscles grow and strengthen during recovery, not during the workout itself. Aim for 1-2 full rest days weekly.',
        source: 'National Academy of Sports Medicine'
      },
      {
        id: 'f5',
        category: 'fitness',
        title: 'Micro-Workouts Throughout the Day',
        content: 'Break up sedentary time with 5-minute activity bursts: desk push-ups, stair climbing, or stretching. These micro-workouts can be as effective as longer sessions.',
        source: 'British Journal of Sports Medicine'
      }
    ],
    sleep: [
      {
        id: 's1',
        category: 'sleep',
        title: 'The 3-2-1 Sleep Rule',
        content: 'Stop eating 3 hours before bed, stop working 2 hours before bed, and stop screens 1 hour before bed. This progression helps your body and mind prepare for quality sleep.',
        source: 'Sleep Foundation'
      },
      {
        id: 's2',
        category: 'sleep',
        title: 'Temperature Control for Sleep',
        content: 'Keep your bedroom between 60-67°F (15-19°C). Your core body temperature naturally drops for sleep, and a cool environment supports this process.',
        source: 'National Sleep Foundation'
      },
      {
        id: 's3',
        category: 'sleep',
        title: 'Morning Light Exposure',
        content: 'Get 10-15 minutes of natural sunlight within the first hour of waking. This helps regulate your circadian rhythm and improves nighttime sleep quality.',
        source: 'Stanford Sleep Medicine Center'
      },
      {
        id: 's4',
        category: 'sleep',
        title: 'The 4-7-8 Breathing Technique',
        content: 'Before sleep, inhale for 4 counts, hold for 7 counts, exhale for 8 counts. Repeat 4 times. This activates your parasympathetic nervous system for relaxation.',
        source: 'Dr. Andrew Weil'
      },
      {
        id: 's5',
        category: 'sleep',
        title: 'Weekend Sleep Consistency',
        content: 'Keep the same sleep schedule on weekends as weekdays, within 1 hour. "Sleeping in" disrupts your circadian rhythm and can cause "social jet lag."',
        source: 'American Academy of Sleep Medicine'
      }
    ],
    mental: [
      {
        id: 'm1',
        category: 'mental',
        title: 'The 5-4-3-2-1 Grounding Technique',
        content: 'When anxious, name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. This brings you back to the present moment.',
        source: 'Anxiety and Depression Association of America'
      },
      {
        id: 'm2',
        category: 'mental',
        title: 'Gratitude Journaling',
        content: 'Write down 3 specific things you\'re grateful for each day, and why. This practice rewires your brain to notice positive aspects of life and improves overall well-being.',
        source: 'Greater Good Science Center, UC Berkeley'
      },
      {
        id: 'm3',
        category: 'mental',
        title: 'The Two-Minute Rule for Worry',
        content: 'When a worry arises, give yourself exactly 2 minutes to think about it fully. Then decide: take action or let it go. This prevents endless rumination cycles.',
        source: 'Cognitive Behavioral Therapy Principles'
      },
      {
        id: 'm4',
        category: 'mental',
        title: 'Social Connection Priority',
        content: 'Prioritize face-to-face social interactions. Strong relationships are linked to 50% increased survival odds and better mental health than any other factor.',
        source: 'Harvard Study of Adult Development'
      },
      {
        id: 'm5',
        category: 'mental',
        title: 'Progressive Muscle Relaxation',
        content: 'Tense each muscle group for 5 seconds, then relax for 10 seconds, starting from your toes up to your head. This reduces physical tension and mental stress.',
        source: 'American Psychological Association'
      }
    ],
    hydration: [
      {
        id: 'h1',
        category: 'hydration',
        title: 'The Urine Color Chart',
        content: 'Use your urine color as a hydration guide: pale yellow is optimal, dark yellow means you need more fluids. Clear urine might indicate overhydration.',
        source: 'National Athletic Trainers Association'
      },
      {
        id: 'h2',
        category: 'hydration',
        title: 'Electrolyte Balance',
        content: 'Add a pinch of sea salt to your water, especially after exercise or in hot weather. Sodium helps your body retain and utilize water effectively.',
        source: 'International Society of Sports Nutrition'
      },
      {
        id: 'h3',
        category: 'hydration',
        title: 'Strategic Water Timing',
        content: 'Drink water upon waking to rehydrate after sleep, before meals to aid digestion, and before exercise to optimize performance. Avoid chugging large amounts at once.',
        source: 'American Council on Exercise'
      },
      {
        id: 'h4',
        category: 'hydration',
        title: 'Hydrating Foods',
        content: '20% of your fluid intake comes from food. Incorporate water-rich foods like watermelon (92% water), cucumber (96% water), and yogurt for extra hydration.',
        source: 'Academy of Nutrition and Dietetics'
      },
      {
        id: 'h5',
        category: 'hydration',
        title: 'Climate Adaptation',
        content: 'Increase fluid intake in hot weather, high altitudes, or dry air. You need 12-16oz extra per hour of hot weather activity. Air conditioning and heating can also increase fluid needs.',
        source: 'Wilderness Medical Associates'
      }
    ]
  };
  
  if (category && enhancedHealthTips[category]) {
    res.json(enhancedHealthTips[category]);
  } else if (!category) {
    // Return all tips if no category specified
    const allTips = Object.values(enhancedHealthTips).flat();
    res.json(allTips);
  } else {
    res.status(404).json({ error: 'Category not found' });
  }
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

const { dbAsync } = require('./config/sqlite-db');
const { sendMail } = require('./utils/mailer');

async function ensureReminderLastSentColumn() {
  try {
    const columns = await dbAsync.all("PRAGMA table_info('reminders')");
    const hasCol = columns.some(c => c.name === 'last_sent_date');
    if (!hasCol) {
      await dbAsync.exec("ALTER TABLE reminders ADD COLUMN last_sent_date TEXT");
      console.log('Added last_sent_date column to reminders table');
    }
  } catch (e) {
    console.error('Error ensuring last_sent_date column:', e.message);
  }
}

function pad(n) { return n.toString().padStart(2, '0'); }
function todayStr(d=new Date()) { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function nowHHMM(d=new Date()) { return `${pad(d.getHours())}:${pad(d.getMinutes())}`; }

async function checkAndSendReminderEmails() {
  try {
    const nowTime = nowHHMM();
    const today = todayStr();
    const reminders = await dbAsync.all(
      `SELECT r.*, u.email as user_email, u.username as user_name
       FROM reminders r INNER JOIN users u ON u.id = r.user_id
       WHERE r.enabled = 1`
    );

    for (const r of reminders) {
      if (!r.time) continue;
      if (r.last_sent_date === today) continue;

      // Send within a 1-minute tolerance window to avoid clock drift issues
      const [h, m] = (r.time || '').split(':').map(x => parseInt(x, 10));
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const targetMinutes = (isNaN(h) || isNaN(m)) ? -9999 : (h * 60 + m);
      const diff = Math.abs(nowMinutes - targetMinutes);

      if (diff <= 1) {
        const subject = `HealthSymptomCare Reminder: ${r.label || r.type} at ${r.time}`;
        const bodyText = `Hello ${r.user_name || ''},\n\nThis is your scheduled ${r.type} reminder from HealthSymptomCare.\n\nLabel: ${r.label || '-'}\nTime: ${r.time}\nFrequency: ${r.frequency || 'daily'}\n\nStay healthy!\n- HealthSymptomCare`;
        const bodyHtml = `<p>Hello <strong>${r.user_name || ''}</strong>,</p>
          <p>This is your scheduled <strong>${r.type}</strong> reminder from <strong>HealthSymptomCare</strong>.</p>
          <ul>
            <li><b>Label:</b> ${r.label || '-'}</li>
            <li><b>Time:</b> ${r.time}</li>
            <li><b>Frequency:</b> ${r.frequency || 'daily'}</li>
          </ul>
          <p>Stay healthy!<br/>- HealthSymptomCare</p>`;

        try {
          const { previewUrl } = await sendMail({ to: r.user_email, subject, text: bodyText, html: bodyHtml });
          await dbAsync.run('UPDATE reminders SET last_sent_date = ? WHERE id = ?', [today, r.id]);
          if (previewUrl) console.log('Reminder email preview URL:', previewUrl);
        } catch (e) {
          console.error('Failed sending reminder email:', e.message);
        }
      }
    }
  } catch (e) {
    console.error('Error in reminder scheduler:', e.message);
  }
}

let schedulerHandle = null;
function startReminderScheduler() {
  if (schedulerHandle) return;
  schedulerHandle = setInterval(checkAndSendReminderEmails, 60 * 1000);
  console.log('Reminder email scheduler started (every 60s)');
}

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

    // Ensure reminders table has last_sent_date
    await ensureReminderLastSentColumn();

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API is available at http://localhost:${PORT}/api`);
      startReminderScheduler();
    });
  } catch (error) {
    console.error('Error starting server:', error.message);
    process.exit(1);
  }
}

startServer();
