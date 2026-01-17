const { dbAsync } = require('./sqlite-db');

// SQL statements to create tables
const createTablesSQL = `
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Wellness logs table
  CREATE TABLE IF NOT EXISTS wellness_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    water_intake REAL NOT NULL,
    mood TEXT NOT NULL,
    sleep_hours REAL NOT NULL,
    energy_level INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Health tips table
  CREATE TABLE IF NOT EXISTS health_tips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Body parts table
  CREATE TABLE IF NOT EXISTS body_parts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT
  );

  -- Symptoms table
  CREATE TABLE IF NOT EXISTS symptoms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT
  );

  -- Body part symptoms relationship table
  CREATE TABLE IF NOT EXISTS body_part_symptoms (
    body_part_id INTEGER NOT NULL,
    symptom_id INTEGER NOT NULL,
    PRIMARY KEY (body_part_id, symptom_id),
    FOREIGN KEY (body_part_id) REFERENCES body_parts(id) ON DELETE CASCADE,
    FOREIGN KEY (symptom_id) REFERENCES symptoms(id) ON DELETE CASCADE
  );

  -- Conditions table
  CREATE TABLE IF NOT EXISTS conditions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    self_care TEXT,
    when_to_see_doctor TEXT
  );

  -- Condition symptoms relationship table
  CREATE TABLE IF NOT EXISTS condition_symptoms (
    condition_id INTEGER NOT NULL,
    symptom_id INTEGER NOT NULL,
    PRIMARY KEY (condition_id, symptom_id),
    FOREIGN KEY (condition_id) REFERENCES conditions(id) ON DELETE CASCADE,
    FOREIGN KEY (symptom_id) REFERENCES symptoms(id) ON DELETE CASCADE
  );
`;

// Sample data insertion
const insertSampleDataSQL = `
  -- Insert sample health tips
  INSERT OR IGNORE INTO health_tips (category, title, content) VALUES
    ('nutrition', 'Stay Hydrated', 'Drink at least 8 glasses of water daily to maintain proper hydration.'),
    ('nutrition', 'Balanced Diet', 'Include a variety of fruits, vegetables, whole grains, and lean proteins in your diet.'),
    ('nutrition', 'Portion Control', 'Be mindful of portion sizes to avoid overeating and maintain a healthy weight.'),
    ('nutrition', 'Limit Processed Foods', 'Reduce consumption of processed foods high in sugar, salt, and unhealthy fats.'),
    ('fitness', 'Regular Exercise', 'Aim for at least 150 minutes of moderate-intensity exercise per week.'),
    ('fitness', 'Strength Training', 'Include strength training exercises at least twice a week to maintain muscle mass.'),
    ('fitness', 'Active Lifestyle', 'Incorporate physical activity into your daily routine, such as taking stairs instead of elevators.'),
    ('fitness', 'Proper Form', 'Focus on proper form during exercises to prevent injuries and maximize benefits.'),
    ('mental', 'Meditation Practice', 'Practice mindfulness meditation for 10 minutes daily to reduce stress and improve focus.'),
    ('mental', 'Quality Sleep', 'Aim for 7-9 hours of quality sleep each night for optimal mental health.'),
    ('mental', 'Digital Detox', 'Take regular breaks from screens and social media to reduce mental fatigue.'),
    ('mental', 'Social Connections', 'Maintain meaningful social connections as they are crucial for mental wellbeing.'),
    ('sleep', 'Consistent Schedule', 'Maintain a consistent sleep schedule, even on weekends.'),
    ('sleep', 'Bedtime Routine', 'Establish a relaxing bedtime routine to signal your body it\'s time to sleep.'),
    ('sleep', 'Optimal Environment', 'Keep your bedroom dark, quiet, and at a comfortable temperature for better sleep.'),
    ('sleep', 'Limit Caffeine', 'Avoid caffeine and stimulants several hours before bedtime.');

  -- Insert sample body parts
  INSERT OR IGNORE INTO body_parts (name, description) VALUES
    ('head', 'Includes the skull, brain, eyes, ears, nose, and mouth'),
    ('chest', 'Includes the heart, lungs, and upper part of the torso'),
    ('abdomen', 'Includes the stomach, intestines, liver, and other digestive organs'),
    ('back', 'Includes the spine and surrounding muscles');

  -- Insert sample symptoms
  INSERT OR IGNORE INTO symptoms (name, description) VALUES
    ('headache', 'Pain in the head or upper neck'),
    ('fever', 'Elevated body temperature above the normal range'),
    ('cough', 'Sudden expulsion of air from the lungs to clear the air passages'),
    ('fatigue', 'Extreme tiredness resulting from mental or physical exertion'),
    ('nausea', 'Feeling of sickness with an inclination to vomit'),
    ('sore throat', 'Pain or irritation in the throat that often worsens when swallowing'),
    ('runny nose', 'Excess discharge of fluid from the nose'),
    ('body aches', 'Generalized pain or soreness in muscles and joints'),
    ('dizziness', 'Feeling of lightheadedness or unsteadiness'),
    ('shortness of breath', 'Difficulty breathing or feeling like you cannot get enough air');

  -- Associate symptoms with body parts
  INSERT OR IGNORE INTO body_part_symptoms (body_part_id, symptom_id) VALUES
    (1, 1), -- head - headache
    (1, 9), -- head - dizziness
    (2, 3), -- chest - cough
    (2, 10), -- chest - shortness of breath
    (3, 5), -- abdomen - nausea
    (1, 6), -- head - sore throat
    (1, 7), -- head - runny nose
    (4, 8); -- back - body aches

  -- Insert sample conditions
  INSERT OR IGNORE INTO conditions (name, description, self_care, when_to_see_doctor) VALUES
    ('Common Cold', 'A viral infectious disease of the upper respiratory tract that primarily affects the nose.', 'Rest and stay hydrated, Use over-the-counter cold medications, Use a humidifier to add moisture to the air, Gargle with salt water to soothe a sore throat', 'If symptoms last more than 10 days or are severe'),
    ('Influenza (Flu)', 'A contagious respiratory illness caused by influenza viruses that infect the nose, throat, and lungs.', 'Rest and stay hydrated, Take over-the-counter pain relievers, Stay home to avoid spreading the illness', 'If you have difficulty breathing, persistent high fever, or are in a high-risk group'),
    ('Migraine', 'A neurological condition characterized by intense, debilitating headaches often accompanied by other symptoms.', 'Rest in a quiet, dark room, Apply cold or warm compresses to your head or neck, Practice relaxation techniques, Stay hydrated', 'If you have severe headaches that don\'t respond to over-the-counter treatments'),
    ('Gastroenteritis', 'An intestinal infection marked by diarrhea, abdominal cramps, nausea, vomiting, and sometimes fever.', 'Stay hydrated with clear fluids, Eat bland, easy-to-digest foods, Get plenty of rest, Avoid dairy products, caffeine, and fatty foods', 'If you have severe dehydration, bloody stools, or symptoms last more than a few days');

  -- Associate conditions with symptoms
  INSERT OR IGNORE INTO condition_symptoms (condition_id, symptom_id) VALUES
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
    (4, 4); -- Gastroenteritis - fatigue
`;

// Initialize the database
async function initializeSQLiteDatabase() {
  try {
    // Create tables
    await dbAsync.exec(createTablesSQL);
    console.log('SQLite tables created or already exist');
    
    // Insert sample data
    await dbAsync.exec(insertSampleDataSQL);
    console.log('Sample data inserted into SQLite database');
    
    console.log('SQLite database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing SQLite database:', error.message);
    throw error;
  }
}

// Export the function directly
module.exports = initializeSQLiteDatabase;

// If this script is run directly (not imported), initialize the database
if (require.main === module) {
  initializeSQLiteDatabase()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('SQLite database initialization failed:', error);
      process.exit(1);
    });
}