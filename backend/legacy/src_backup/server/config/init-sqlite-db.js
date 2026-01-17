const { dbAsync } = require('./sqlite-db');

// SQL statements to create tables
const createTablesSQL = `
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
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
  
  -- Diet plans table
  CREATE TABLE IF NOT EXISTS diet_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    health_goal TEXT NOT NULL,
    dietary_preference TEXT NOT NULL,
    meal TEXT NOT NULL,
    suggestion TEXT NOT NULL,
    calories INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  
  -- Workout plans table
  CREATE TABLE IF NOT EXISTS workout_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    health_goal TEXT NOT NULL,
    fitness_level TEXT NOT NULL,
    day TEXT NOT NULL,
    activity TEXT NOT NULL,
    focus TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    
    // Insert health tips one by one to avoid syntax issues
     const healthTipsData = [
       ['nutrition', 'Stay Hydrated', 'Drink at least 8 glasses of water daily to maintain proper hydration.'],
       ['nutrition', 'Balanced Diet', 'Include a variety of fruits, vegetables, whole grains, and lean proteins in your diet.'],
       ['nutrition', 'Portion Control', 'Be mindful of portion sizes to avoid overeating and maintain a healthy weight.'],
       ['nutrition', 'Limit Processed Foods', 'Reduce consumption of processed foods high in sugar, salt, and unhealthy fats.'],
       ['fitness', 'Regular Exercise', 'Aim for at least 150 minutes of moderate-intensity exercise per week.'],
       ['fitness', 'Strength Training', 'Include strength training exercises at least twice a week to maintain muscle mass.'],
       ['fitness', 'Active Lifestyle', 'Incorporate physical activity into your daily routine, such as taking stairs instead of elevators.'],
       ['fitness', 'Proper Form', 'Focus on proper form during exercises to prevent injuries and maximize benefits.'],
       ['hydration', 'Water Intake Timing', 'Drink water consistently throughout the day rather than all at once for better absorption.'],
       ['hydration', 'Hydration Signs', 'Monitor your urine color - pale yellow indicates good hydration, while dark yellow suggests dehydration.'],
       ['hydration', 'Electrolyte Balance', 'For intense exercise or hot weather, consider drinks with electrolytes to maintain proper fluid balance.'],
       ['hydration', 'Food Sources', 'Consume water-rich foods like cucumbers, watermelon, and oranges to supplement your fluid intake.'],
       ['mental', 'Meditation Practice', 'Practice mindfulness meditation for 10 minutes daily to reduce stress and improve focus.'],
       ['mental', 'Quality Sleep', 'Aim for 7-9 hours of quality sleep each night for optimal mental health.'],
       ['mental', 'Digital Detox', 'Take regular breaks from screens and social media to reduce mental fatigue.'],
       ['mental', 'Social Connections', 'Maintain meaningful social connections as they are crucial for mental wellbeing.'],
       ['sleep', 'Consistent Schedule', 'Maintain a consistent sleep schedule, even on weekends.'],
       ['sleep', 'Bedtime Routine', 'Establish a relaxing bedtime routine to signal your body it\'s time to sleep.'],
       ['sleep', 'Optimal Environment', 'Keep your bedroom dark, quiet, and at a comfortable temperature for better sleep.'],
       ['sleep', 'Limit Caffeine', 'Avoid caffeine and stimulants several hours before bedtime.']
     ];
     
     // Function to insert health tips one by one
     async function insertHealthTips() {
       for (const [category, title, content] of healthTipsData) {
         const sql = `INSERT OR IGNORE INTO health_tips (category, title, content) VALUES (?, ?, ?)`;
         await dbAsync.run(sql, [category, title, content]);
       }
       console.log('Health tips inserted successfully');
     }

    
    // Body parts data
    const bodyPartsData = [
      ['head', 'Includes the skull, brain, eyes, ears, nose, and mouth'],
      ['chest', 'Includes the heart, lungs, and upper part of the torso'],
      ['abdomen', 'Includes the stomach, intestines, liver, and other digestive organs'],
      ['back', 'Includes the spine and surrounding muscles']
    ];
    
    // Function to insert body parts one by one
    async function insertBodyParts() {
      for (const [name, description] of bodyPartsData) {
        const sql = `INSERT OR IGNORE INTO body_parts (name, description) VALUES (?, ?)`;
        await dbAsync.run(sql, [name, description]);
      }
      console.log('Body parts inserted successfully');
    }
    
    // Symptoms data
    const symptomsData = [
      ['headache', 'Pain in the head or upper neck'],
      ['fever', 'Elevated body temperature above the normal range'],
      ['cough', 'Sudden expulsion of air from the lungs to clear the air passages'],
      ['fatigue', 'Extreme tiredness resulting from mental or physical exertion'],
      ['nausea', 'Feeling of sickness with an inclination to vomit'],
      ['sore throat', 'Pain or irritation in the throat that often worsens when swallowing'],
      ['runny nose', 'Excess discharge of fluid from the nose'],
      ['body aches', 'Generalized pain or soreness in muscles and joints'],
      ['dizziness', 'Feeling of lightheadedness or unsteadiness'],
      ['shortness of breath', 'Difficulty breathing or feeling like you cannot get enough air']
    ];
    
    // Function to insert symptoms one by one
    async function insertSymptoms() {
      for (const [name, description] of symptomsData) {
        const sql = `INSERT OR IGNORE INTO symptoms (name, description) VALUES (?, ?)`;
        await dbAsync.run(sql, [name, description]);
      }
      console.log('Symptoms inserted successfully');
    }
    
    // Body part symptoms data
    const bodyPartSymptomsData = [
      [1, 1], // head - headache
      [1, 9], // head - dizziness
      [2, 3], // chest - cough
      [2, 10], // chest - shortness of breath
      [3, 5], // abdomen - nausea
      [1, 6], // head - sore throat
      [1, 7], // head - runny nose
      [4, 8]  // back - body aches
    ];
    
    // Function to insert body part symptoms one by one
    async function insertBodyPartSymptoms() {
      for (const [bodyPartId, symptomId] of bodyPartSymptomsData) {
        const sql = `INSERT OR IGNORE INTO body_part_symptoms (body_part_id, symptom_id) VALUES (?, ?)`;
        await dbAsync.run(sql, [bodyPartId, symptomId]);
      }
      console.log('Body part symptoms inserted successfully');
    }
    
    // Conditions data
    const conditionsData = [
      ['Common Cold', 'A viral infectious disease of the upper respiratory tract that primarily affects the nose.', 'Rest and stay hydrated, Use over-the-counter cold medications, Use a humidifier to add moisture to the air, Gargle with salt water to soothe a sore throat', 'If symptoms last more than 10 days or are severe'],
      ['Influenza (Flu)', 'A contagious respiratory illness caused by influenza viruses that infect the nose, throat, and lungs.', 'Rest and stay hydrated, Take over-the-counter pain relievers, Stay home to avoid spreading the illness', 'If you have difficulty breathing, persistent high fever, or are in a high-risk group'],
      ['Migraine', 'A neurological condition characterized by intense, debilitating headaches often accompanied by other symptoms.', 'Rest in a quiet, dark room, Apply cold or warm compresses to your head or neck, Practice relaxation techniques, Stay hydrated', 'If you have severe headaches that don\'t respond to over-the-counter treatments'],
      ['Gastroenteritis', 'An intestinal infection marked by diarrhea, abdominal cramps, nausea, vomiting, and sometimes fever.', 'Stay hydrated with clear fluids, Eat bland, easy-to-digest foods, Get plenty of rest, Avoid dairy products, caffeine, and fatty foods', 'If you have severe dehydration, bloody stools, or symptoms last more than a few days']
    ];
    
    // Function to insert conditions one by one
    async function insertConditions() {
      for (const [name, description, selfCare, whenToSeeDoctor] of conditionsData) {
        const sql = `INSERT OR IGNORE INTO conditions (name, description, self_care, when_to_see_doctor) VALUES (?, ?, ?, ?)`;
        await dbAsync.run(sql, [name, description, selfCare, whenToSeeDoctor]);
      }
      console.log('Conditions inserted successfully');
    }
    
    // Condition symptoms data
    const conditionSymptomsData = [
      [1, 3], // Common Cold - cough
      [1, 6], // Common Cold - sore throat
      [1, 7], // Common Cold - runny nose
      [2, 2], // Flu - fever
      [2, 3], // Flu - cough
      [2, 4], // Flu - fatigue
      [2, 8], // Flu - body aches
      [3, 1], // Migraine - headache
      [3, 5], // Migraine - nausea
      [3, 9], // Migraine - dizziness
      [4, 5], // Gastroenteritis - nausea
      [4, 2], // Gastroenteritis - fever
      [4, 4]  // Gastroenteritis - fatigue
    ];
    
    // Function to insert condition symptoms one by one
    async function insertConditionSymptoms() {
      for (const [conditionId, symptomId] of conditionSymptomsData) {
        const sql = `INSERT OR IGNORE INTO condition_symptoms (condition_id, symptom_id) VALUES (?, ?)`;
        await dbAsync.run(sql, [conditionId, symptomId]);
      }
      console.log('Condition symptoms inserted successfully');
    }
    
    // Diet plans data
    const dietPlansData = [
      // General - None
      ['general', 'none', 'Breakfast', 'Oatmeal with fruits and nuts', 350],
      ['general', 'none', 'Lunch', 'Grilled chicken salad with olive oil dressing', 450],
      ['general', 'none', 'Snack', 'Greek yogurt with honey', 200],
      ['general', 'none', 'Dinner', 'Baked salmon with roasted vegetables', 500],
      // General - Vegetarian
      ['general', 'vegetarian', 'Breakfast', 'Whole grain toast with avocado and eggs', 400],
      ['general', 'vegetarian', 'Lunch', 'Quinoa bowl with roasted vegetables and feta', 500],
      ['general', 'vegetarian', 'Snack', 'Hummus with carrot sticks', 150],
      ['general', 'vegetarian', 'Dinner', 'Lentil soup with whole grain bread', 450],
      // General - Vegan
      ['general', 'vegan', 'Breakfast', 'Chia seed pudding with almond milk and berries', 300],
      ['general', 'vegan', 'Lunch', 'Buddha bowl with tofu and tahini dressing', 450],
      ['general', 'vegan', 'Snack', 'Trail mix with nuts and dried fruits', 200],
      ['general', 'vegan', 'Dinner', 'Chickpea curry with brown rice', 500],
      // Weight Loss - None
      ['weightLoss', 'none', 'Breakfast', 'Protein smoothie with spinach and berries', 250],
      ['weightLoss', 'none', 'Lunch', 'Grilled chicken with steamed broccoli', 350],
      ['weightLoss', 'none', 'Snack', 'Apple with a tablespoon of almond butter', 150],
      ['weightLoss', 'none', 'Dinner', 'Baked white fish with asparagus', 300],
      // Muscle Gain - None
      ['muscleGain', 'none', 'Breakfast', 'Protein pancakes with banana and honey', 550],
      ['muscleGain', 'none', 'Lunch', 'Steak with sweet potato and mixed vegetables', 650],
      ['muscleGain', 'none', 'Snack', 'Protein shake with banana and peanut butter', 350],
      ['muscleGain', 'none', 'Dinner', 'Grilled chicken with quinoa and avocado', 600]
    ];
    
    // Function to insert diet plans one by one
    async function insertDietPlans() {
      for (const [healthGoal, dietaryPreference, meal, suggestion, calories] of dietPlansData) {
        const sql = `INSERT OR IGNORE INTO diet_plans (health_goal, dietary_preference, meal, suggestion, calories) VALUES (?, ?, ?, ?, ?)`;
        await dbAsync.run(sql, [healthGoal, dietaryPreference, meal, suggestion, calories]);
      }
      console.log('Diet plans inserted successfully');
    }
    
    // Workout plans data
    const workoutPlansData = [
      // General - Beginner
      ['general', 'beginner', 'Monday', '30 min brisk walking', 'Cardio'],
      ['general', 'beginner', 'Tuesday', 'Rest or light stretching', 'Recovery'],
      ['general', 'beginner', 'Wednesday', '20 min bodyweight exercises (squats, push-ups)', 'Strength'],
      ['general', 'beginner', 'Thursday', '30 min brisk walking', 'Cardio'],
      ['general', 'beginner', 'Friday', 'Rest or yoga', 'Flexibility'],
      ['general', 'beginner', 'Saturday', '30 min mixed cardio and strength', 'Full Body'],
      ['general', 'beginner', 'Sunday', 'Rest day', 'Recovery'],
      // Weight Loss - Intermediate
      ['weightLoss', 'intermediate', 'Monday', '45 min HIIT workout', 'Cardio'],
      ['weightLoss', 'intermediate', 'Tuesday', '30 min strength training (upper body)', 'Strength'],
      ['weightLoss', 'intermediate', 'Wednesday', '45 min cycling or swimming', 'Cardio'],
      ['weightLoss', 'intermediate', 'Thursday', '30 min strength training (lower body)', 'Strength'],
      ['weightLoss', 'intermediate', 'Friday', '45 min HIIT workout', 'Cardio'],
      ['weightLoss', 'intermediate', 'Saturday', '60 min hiking or jogging', 'Cardio'],
      ['weightLoss', 'intermediate', 'Sunday', 'Active recovery - light walking or yoga', 'Recovery'],
      // Muscle Gain - Advanced
      ['muscleGain', 'advanced', 'Monday', 'Heavy lifting - Chest and Triceps (5 sets of 5 reps)', 'Strength'],
      ['muscleGain', 'advanced', 'Tuesday', 'HIIT cardio - 30 min', 'Cardio'],
      ['muscleGain', 'advanced', 'Wednesday', 'Heavy lifting - Back and Biceps (5 sets of 5 reps)', 'Strength'],
      ['muscleGain', 'advanced', 'Thursday', 'HIIT cardio - 30 min', 'Cardio'],
      ['muscleGain', 'advanced', 'Friday', 'Heavy lifting - Legs and Shoulders (5 sets of 5 reps)', 'Strength'],
      ['muscleGain', 'advanced', 'Saturday', 'Active recovery - light cardio and stretching', 'Recovery'],
      ['muscleGain', 'advanced', 'Sunday', 'Complete rest day', 'Recovery']
    ];
    
    // Function to insert workout plans one by one
    async function insertWorkoutPlans() {
      for (const [healthGoal, fitnessLevel, day, activity, focus] of workoutPlansData) {
        const sql = `INSERT OR IGNORE INTO workout_plans (health_goal, fitness_level, day, activity, focus) VALUES (?, ?, ?, ?, ?)`;
        await dbAsync.run(sql, [healthGoal, fitnessLevel, day, activity, focus]);
      }
      console.log('Workout plans inserted successfully');
    }
    
    // Execute all insert functions in sequence
    try {
      await insertHealthTips();
      await insertBodyParts();
      await insertSymptoms();
      await insertBodyPartSymptoms();
      await insertConditions();
      await insertConditionSymptoms();
      await insertDietPlans();
      await insertWorkoutPlans();
      
      console.log('Sample data inserted into SQLite database');
      console.log('SQLite database initialization completed successfully');
    } catch (err) {
      console.error('Error inserting sample data:', err.message);
      throw err;
    }
    
    console.log('Sample data inserted into SQLite database');
    console.log('SQLite database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing SQLite database:', error.message);
    throw error;
  }
}

// Export the function
module.exports = { initializeSQLiteDatabase };

// If this script is run directly (not imported), initialize the database
if (require.main === module) {
  initializeSQLiteDatabase()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('SQLite database initialization failed:', error);
      process.exit(1);
    });
}