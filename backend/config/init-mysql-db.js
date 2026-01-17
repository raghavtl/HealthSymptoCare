const { initializeDb } = require('./mysql-db');
require('dotenv').config();

// SQL statements to create tables
const createTablesSQL = [
  // Users table
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  // Wellness logs table
  `CREATE TABLE IF NOT EXISTS wellness_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    water_intake FLOAT NOT NULL,
    mood VARCHAR(50) NOT NULL,
    sleep_hours FLOAT NOT NULL,
    energy_level INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,

  // Health tips table
  `CREATE TABLE IF NOT EXISTS health_tips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  // Body parts table
  `CREATE TABLE IF NOT EXISTS body_parts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
  )`,

  // Symptoms table
  `CREATE TABLE IF NOT EXISTS symptoms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Symptom-body part relationship table
  `CREATE TABLE IF NOT EXISTS symptom_body_parts (
    symptom_id INT NOT NULL,
    body_part_id INT NOT NULL,
    PRIMARY KEY (symptom_id, body_part_id),
    FOREIGN KEY (symptom_id) REFERENCES symptoms(id) ON DELETE CASCADE,
    FOREIGN KEY (body_part_id) REFERENCES body_parts(id) ON DELETE CASCADE
  )`,

  // Health conditions table
  `CREATE TABLE IF NOT EXISTS conditions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    self_care TEXT,
    when_to_see_doctor TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Condition-symptom relationship table
  `CREATE TABLE IF NOT EXISTS condition_symptoms (
    condition_id INT NOT NULL,
    symptom_id INT NOT NULL,
    PRIMARY KEY (condition_id, symptom_id),
    FOREIGN KEY (condition_id) REFERENCES conditions(id) ON DELETE CASCADE,
    FOREIGN KEY (symptom_id) REFERENCES symptoms(id) ON DELETE CASCADE
  )`,
  
  // Diet plans table
  `CREATE TABLE IF NOT EXISTS diet_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    health_goal VARCHAR(50) NOT NULL,
    dietary_preference VARCHAR(50) NOT NULL,
    meal VARCHAR(50) NOT NULL,
    suggestion TEXT NOT NULL,
    calories INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  
  // Workout plans table
  `CREATE TABLE IF NOT EXISTS workout_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    health_goal VARCHAR(50) NOT NULL,
    fitness_level VARCHAR(50) NOT NULL,
    day VARCHAR(20) NOT NULL,
    activity TEXT NOT NULL,
    focus VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`
];

// Sample data insertion statements
const sampleDataInsertions = [
  // Insert sample health tips
  `INSERT IGNORE INTO health_tips (category, title, content) VALUES
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
    ('sleep', 'Bedtime Routine', 'Establish a relaxing bedtime routine to signal your body it''s time to sleep.'),
    ('sleep', 'Optimal Environment', 'Keep your bedroom dark, quiet, and at a comfortable temperature for better sleep.'),
    ('sleep', 'Limit Stimulants', 'Avoid caffeine, nicotine, and alcohol close to bedtime.')
  `,

  // Insert sample body parts
  `INSERT IGNORE INTO body_parts (name, description) VALUES
    ('Head', 'Includes the skull, brain, and facial features.'),
    ('Chest', 'Contains the heart, lungs, and associated structures.'),
    ('Abdomen', 'Contains the stomach, liver, intestines, and other organs.'),
    ('Back', 'Includes the spine and surrounding muscles.'),
    ('Arms', 'Upper limbs including shoulders, elbows, and hands.'),
    ('Legs', 'Lower limbs including hips, knees, and feet.'),
    ('Skin', 'The body''s largest organ covering the entire body.'),
    ('Throat', 'Passage connecting the mouth to the esophagus and trachea.'),
    ('Eyes', 'Organs of vision.'),
    ('Ears', 'Organs of hearing and balance.')
  `,

  // Insert sample symptoms
  `INSERT IGNORE INTO symptoms (name, description) VALUES
    ('Headache', 'Pain in any region of the head.'),
    ('Fever', 'Elevated body temperature above the normal range.'),
    ('Cough', 'Sudden expulsion of air from the lungs to clear the air passages.'),
    ('Fatigue', 'Extreme tiredness resulting from mental or physical exertion.'),
    ('Nausea', 'Sensation of unease and discomfort in the stomach with an urge to vomit.'),
    ('Sore Throat', 'Pain, irritation, or scratchiness in the throat.'),
    ('Runny Nose', 'Excess discharge of mucus from the nose.'),
    ('Body Aches', 'Generalized pain felt throughout the body.'),
    ('Dizziness', 'Feeling faint, woozy, or unsteady.'),
    ('Shortness of Breath', 'Difficulty breathing or intense tightening in the chest.')
  `,

  // Associate symptoms with body parts
  `INSERT IGNORE INTO symptom_body_parts (symptom_id, body_part_id) VALUES
    (1, 1), -- headache - head
    (2, 7), -- fever - skin
    (3, 2), -- cough - chest
    (4, 7), -- fatigue - skin (general)
    (5, 3), -- nausea - abdomen
    (6, 8), -- sore throat - throat
    (7, 1), -- runny nose - head
    (8, 4), -- body aches - back
    (9, 1), -- dizziness - head
    (10, 2) -- shortness of breath - chest
  `,

  // Insert sample conditions
  `INSERT IGNORE INTO conditions (name, description, self_care, when_to_see_doctor) VALUES
    ('Common Cold', 'A viral infectious disease of the upper respiratory tract that primarily affects the nose.', 'Rest and stay hydrated, Use over-the-counter cold medications, Use a humidifier to add moisture to the air, Gargle with salt water to soothe a sore throat', 'If symptoms last more than 10 days or are severe'),
    ('Influenza (Flu)', 'A contagious respiratory illness caused by influenza viruses that infect the nose, throat, and lungs.', 'Rest and stay hydrated, Take over-the-counter pain relievers, Stay home to avoid spreading the illness', 'If you have difficulty breathing, persistent high fever, or are in a high-risk group'),
    ('Migraine', 'A neurological condition characterized by intense, debilitating headaches often accompanied by other symptoms.', 'Rest in a quiet, dark room, Apply cold or warm compresses to your head or neck, Practice relaxation techniques, Stay hydrated', 'If you have severe headaches that don''t respond to over-the-counter medications, or if the pattern of your headaches changes'),
    ('Gastroenteritis', 'An intestinal infection marked by diarrhea, abdominal cramps, nausea, vomiting, and sometimes fever.', 'Stay hydrated with clear fluids, Eat bland, easy-to-digest foods, Get plenty of rest, Avoid dairy products, caffeine, and fatty foods', 'If you have severe dehydration, bloody diarrhea, or symptoms that last more than a few days')
  `,

  // Associate conditions with symptoms
  `INSERT IGNORE INTO condition_symptoms (condition_id, symptom_id) VALUES
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
    (4, 4)  -- Gastroenteritis - fatigue
  `,
  
  // Insert sample diet plans
  `INSERT IGNORE INTO diet_plans (health_goal, dietary_preference, meal, suggestion, calories) VALUES
    ('general', 'none', 'Breakfast', 'Oatmeal with fruits and nuts', 350),
    ('general', 'none', 'Lunch', 'Grilled chicken salad with olive oil dressing', 450),
    ('general', 'none', 'Snack', 'Greek yogurt with honey', 200),
    ('general', 'none', 'Dinner', 'Baked salmon with roasted vegetables', 500),
    ('general', 'vegetarian', 'Breakfast', 'Avocado toast with eggs', 350),
    ('general', 'vegetarian', 'Lunch', 'Quinoa bowl with roasted vegetables', 400),
    ('general', 'vegetarian', 'Snack', 'Hummus with carrot sticks', 150),
    ('general', 'vegetarian', 'Dinner', 'Lentil soup with whole grain bread', 450),
    ('general', 'vegan', 'Breakfast', 'Chia seed pudding with almond milk and berries', 300),
    ('general', 'vegan', 'Lunch', 'Buddha bowl with tofu and tahini dressing', 450),
    ('general', 'vegan', 'Snack', 'Trail mix with nuts and dried fruits', 200),
    ('general', 'vegan', 'Dinner', 'Chickpea curry with brown rice', 500),
    ('weightLoss', 'none', 'Breakfast', 'Protein smoothie with spinach and berries', 250),
    ('weightLoss', 'none', 'Lunch', 'Grilled chicken with steamed broccoli', 350),
    ('weightLoss', 'none', 'Snack', 'Apple with a tablespoon of almond butter', 150),
    ('weightLoss', 'none', 'Dinner', 'Baked white fish with asparagus', 300),
    ('muscleGain', 'none', 'Breakfast', 'Protein pancakes with banana and honey', 550),
    ('muscleGain', 'none', 'Lunch', 'Steak with sweet potato and mixed vegetables', 650),
    ('muscleGain', 'none', 'Snack', 'Protein shake with banana and peanut butter', 350),
    ('muscleGain', 'none', 'Dinner', 'Grilled chicken with quinoa and avocado', 600)
  `,
  
  // Insert sample workout plans
  `INSERT IGNORE INTO workout_plans (health_goal, fitness_level, day, activity, focus) VALUES
    ('general', 'beginner', 'Monday', '30 min brisk walking', 'Cardio'),
    ('general', 'beginner', 'Tuesday', 'Rest or light stretching', 'Recovery'),
    ('general', 'beginner', 'Wednesday', '20 min bodyweight exercises (squats, push-ups)', 'Strength'),
    ('general', 'beginner', 'Thursday', 'Rest or yoga', 'Flexibility'),
    ('general', 'beginner', 'Friday', '30 min cycling or swimming', 'Cardio'),
    ('general', 'beginner', 'Saturday', '20 min full body circuit', 'Strength'),
    ('general', 'beginner', 'Sunday', 'Rest day', 'Recovery'),
    ('weightLoss', 'beginner', 'Monday', '30 min brisk walking + 10 min bodyweight exercises', 'Cardio & Light Strength'),
    ('weightLoss', 'beginner', 'Tuesday', '20 min cycling or elliptical', 'Cardio'),
    ('weightLoss', 'beginner', 'Wednesday', 'Rest or gentle yoga', 'Recovery'),
    ('weightLoss', 'beginner', 'Thursday', '30 min walking + 10 min core exercises', 'Cardio & Core'),
    ('weightLoss', 'beginner', 'Friday', '20 min full body circuit (light weights)', 'Strength'),
    ('weightLoss', 'beginner', 'Saturday', '40 min brisk walking or hiking', 'Cardio'),
    ('weightLoss', 'beginner', 'Sunday', 'Rest day', 'Recovery'),
    ('muscleGain', 'beginner', 'Monday', 'Full body workout - 3 sets of 8-12 reps', 'Strength'),
    ('muscleGain', 'beginner', 'Tuesday', '20 min light cardio', 'Recovery'),
    ('muscleGain', 'beginner', 'Wednesday', 'Full body workout - different exercises than Monday', 'Strength'),
    ('muscleGain', 'beginner', 'Thursday', 'Rest day', 'Recovery'),
    ('muscleGain', 'beginner', 'Friday', 'Full body workout - mix of Monday & Wednesday', 'Strength'),
    ('muscleGain', 'beginner', 'Saturday', '20-30 min moderate cardio', 'Heart Health'),
    ('muscleGain', 'beginner', 'Sunday', 'Rest day', 'Recovery')
  `
];

// Initialize the database
async function initializeDatabase() {
  let connection = null;
  
  try {
    // Get database connection
    connection = await initializeDb();
    console.log('Connected to MySQL database');
    
    // Create tables
    for (const createTableSQL of createTablesSQL) {
      await connection.query(createTableSQL);
    }
    console.log('Tables created or already exist');
    
    // Insert sample data
    for (const insertSQL of sampleDataInsertions) {
      await connection.query(insertSQL);
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

module.exports = { initializeMySQLDatabase: initializeDatabase };