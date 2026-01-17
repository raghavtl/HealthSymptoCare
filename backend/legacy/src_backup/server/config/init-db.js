const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const { initializeDb } = require('./db');
require('dotenv').config();

// SQL statements to create tables
const createTablesSQL = [
  // Users table
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Wellness logs table
  `CREATE TABLE IF NOT EXISTS wellness_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date DATE NOT NULL,
    water_intake REAL NOT NULL,
    mood TEXT NOT NULL,
    sleep_hours REAL NOT NULL,
    energy_level INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,

  // Health tips table
  `CREATE TABLE IF NOT EXISTS health_tips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Body parts table
  `CREATE TABLE IF NOT EXISTS body_parts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT
  )`,

  // Symptoms table
  `CREATE TABLE IF NOT EXISTS symptoms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Symptom-body part relationship table
  `CREATE TABLE IF NOT EXISTS symptom_body_parts (
    symptom_id INTEGER NOT NULL,
    body_part_id INTEGER NOT NULL,
    PRIMARY KEY (symptom_id, body_part_id),
    FOREIGN KEY (symptom_id) REFERENCES symptoms(id) ON DELETE CASCADE,
    FOREIGN KEY (body_part_id) REFERENCES body_parts(id) ON DELETE CASCADE
  )`,

  // Health conditions table
  `CREATE TABLE IF NOT EXISTS conditions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    self_care TEXT,
    when_to_see_doctor TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Condition-symptom relationship table
  `CREATE TABLE IF NOT EXISTS condition_symptoms (
    condition_id INTEGER NOT NULL,
    symptom_id INTEGER NOT NULL,
    PRIMARY KEY (condition_id, symptom_id),
    FOREIGN KEY (condition_id) REFERENCES conditions(id) ON DELETE CASCADE,
    FOREIGN KEY (symptom_id) REFERENCES symptoms(id) ON DELETE CASCADE
  )`
];

// Sample data insertion statements
const sampleDataInsertions = [
  // Insert sample health tips
  `INSERT OR IGNORE INTO health_tips (category, title, content) VALUES
    ('nutrition', 'Stay Hydrated', 'Drink at least 8 glasses of water daily to maintain proper hydration.'),
    ('nutrition', 'Eat Colorful Foods', 'Include a variety of colorful fruits and vegetables in your diet for essential nutrients.'),
    ('nutrition', 'Limit Processed Foods', 'Reduce intake of processed foods high in sodium, sugar, and unhealthy fats.'),
    ('nutrition', 'Portion Control', 'Be mindful of portion sizes to avoid overeating and maintain a healthy weight.'),
    ('fitness', '150 Minutes Rule', 'Aim for at least 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity each week.'),
    ('fitness', 'Strength Training', 'Include strength training exercises at least twice a week to maintain muscle mass.'),
    ('fitness', 'Active Throughout Day', 'Take short walking breaks during the day, especially if you have a sedentary job.'),
    ('fitness', 'Proper Form', 'Focus on proper form during exercises to prevent injuries and maximize benefits.'),
    ('mental', 'Meditation Practice', 'Practice mindfulness meditation for 10 minutes daily to reduce stress and improve focus.'),
    ('mental', 'Quality Sleep', 'Aim for 7-9 hours of quality sleep each night for optimal mental health.'),
    ('mental', 'Digital Detox', 'Take regular breaks from screens and social media to reduce mental fatigue.'),
    ('mental', 'Social Connections', 'Maintain meaningful social connections as they are crucial for mental wellbeing.'),
    ('sleep', 'Consistent Schedule', 'Maintain a consistent sleep schedule, even on weekends.'),
    ('sleep', 'Bedtime Routine', 'Establish a relaxing bedtime routine to signal your body that it is time to sleep.'),
    ('sleep', 'Optimal Environment', 'Keep your bedroom dark, quiet, and at a comfortable temperature for better sleep.'),
    ('sleep', 'Limit Caffeine', 'Avoid caffeine and stimulants several hours before bedtime.')`,

  // Insert sample body parts
  `INSERT OR IGNORE INTO body_parts (name, description) VALUES
    ('head', 'Includes the skull, brain, and facial features'),
    ('chest', 'Includes the heart, lungs, and ribcage'),
    ('abdomen', 'Includes the stomach, intestines, liver, and other digestive organs'),
    ('back', 'Includes the spine and surrounding muscles'),
    ('arms', 'Includes the shoulders, upper arms, elbows, forearms, wrists, and hands'),
    ('legs', 'Includes the hips, thighs, knees, calves, ankles, and feet')`,

  // Insert sample symptoms
  `INSERT OR IGNORE INTO symptoms (name, description) VALUES
    ('headache', 'Pain in the head or upper neck'),
    ('fever', 'Elevated body temperature above the normal range'),
    ('cough', 'Sudden expulsion of air from the lungs'),
    ('fatigue', 'Extreme tiredness resulting from mental or physical exertion'),
    ('nausea', 'Feeling of sickness with an inclination to vomit'),
    ('sore throat', 'Pain or irritation in the throat'),
    ('runny nose', 'Excess discharge of mucus from the nose'),
    ('body aches', 'Generalized pain throughout the body'),
    ('dizziness', 'Feeling of being lightheaded or unsteady'),
    ('shortness of breath', 'Difficulty breathing or catching your breath')`,

  // Associate symptoms with body parts
  `INSERT OR IGNORE INTO symptom_body_parts (symptom_id, body_part_id) VALUES
    (1, 1), -- headache - head
    (2, 1), -- fever - head (though it affects the whole body)
    (3, 2), -- cough - chest
    (4, 1), -- fatigue - head (though it affects the whole body)
    (5, 3), -- nausea - abdomen
    (6, 1), -- sore throat - head
    (7, 1), -- runny nose - head
    (8, 4), -- body aches - back (though it affects the whole body)
    (9, 1), -- dizziness - head
    (10, 2) -- shortness of breath - chest
  `,

  // Insert sample conditions
  `INSERT OR IGNORE INTO conditions (name, description, self_care, when_to_see_doctor) VALUES
    ('Common Cold', 'A viral infectious disease of the upper respiratory tract that primarily affects the nose.', 'Rest and stay hydrated, Use over-the-counter cold medications, Use a humidifier to add moisture to the air, Gargle with salt water to soothe a sore throat', 'If symptoms last more than 10 days or are severe'),
    ('Influenza (Flu)', 'A contagious respiratory illness caused by influenza viruses that infect the nose, throat, and lungs.', 'Rest and stay hydrated, Take over-the-counter pain relievers, Stay home to avoid spreading the illness', 'If you have difficulty breathing, persistent high fever, or are in a high-risk group'),
    ('Migraine', 'A neurological condition characterized by intense, debilitating headaches often accompanied by other symptoms.', 'Rest in a quiet, dark room, Apply cold or warm compresses to your head or neck, Practice relaxation techniques, Stay hydrated', 'If you have severe headaches that do not respond to over-the-counter treatments'),
    ('Gastroenteritis', 'An intestinal infection marked by diarrhea, abdominal cramps, nausea, vomiting, and sometimes fever.', 'Stay hydrated with clear fluids, Eat bland, easy-to-digest foods, Get plenty of rest, Avoid dairy products, caffeine, and fatty foods', 'If you have severe dehydration, bloody stools, or symptoms last more than a few days')
  `,

  // Associate conditions with symptoms
  `INSERT OR IGNORE INTO condition_symptoms (condition_id, symptom_id) VALUES
    (1, 3), -- Common Cold - cough
    (1, 6), -- Common Cold - sore throat
    (1, 7), -- Common Cold - runny nose
    (2, 2), -- Flu - fever
    (2, 3), -- Flu - cough
    (2, 4), -- Flu - fatigue
    (2, 8), -- Flu - body aches
    (3, 1), -- Migraine - headache
    (3, 5), -- Migraine - nausea
    (3, 9), -- Migraine - dizziness
    (4, 5), -- Gastroenteritis - nausea
    (4, 2), -- Gastroenteritis - fever
    (4, 4) -- Gastroenteritis - fatigue
  `
];

// Initialize the database
async function initializeDatabase() {
  let db = null;
  
  try {
    // Get database connection
    db = await initializeDb();
    console.log('Connected to SQLite database');
    
    // Create tables
    for (const createTableSQL of createTablesSQL) {
      await db.exec(createTableSQL);
    }
    console.log('Tables created or already exist');
    
    // Insert sample data
    for (const insertSQL of sampleDataInsertions) {
      await db.exec(insertSQL);
    }
    console.log('Sample data inserted');
    
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error.message);
    throw error;
  }
}

// Export the function
module.exports = { initializeDatabase };

// If this script is run directly (not imported), initialize the database
if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}