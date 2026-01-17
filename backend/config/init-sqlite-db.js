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
    images TEXT,
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

  -- Medicines table
  CREATE TABLE IF NOT EXISTS medicines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    dosage TEXT,
    side_effects TEXT,
    precautions TEXT,
    interactions TEXT
  );

  -- Pivot table linking conditions to medicines
  CREATE TABLE IF NOT EXISTS condition_medicines (
    medicine_id INTEGER NOT NULL,
    condition_id INTEGER NOT NULL,
    PRIMARY KEY (medicine_id, condition_id),
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
    FOREIGN KEY (condition_id) REFERENCES conditions(id) ON DELETE CASCADE
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

  -- User profiles & goals
  CREATE TABLE IF NOT EXISTS user_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    age INTEGER,
    gender TEXT,
    height_cm REAL,
    weight_kg REAL,
    activity_level TEXT,
    dietary_preference TEXT,
    goal TEXT,
    target_calories INTEGER,
    target_protein_g REAL,
    target_carbs_g REAL,
    target_fat_g REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Foods library
  CREATE TABLE IF NOT EXISTS foods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    calories_per_100g INTEGER,
    protein_g_per_100g REAL,
    carbs_g_per_100g REAL,
    fat_g_per_100g REAL,
    is_veg INTEGER DEFAULT 1
  );

  -- Food logs
  CREATE TABLE IF NOT EXISTS food_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    meal_type TEXT NOT NULL,
    food_id INTEGER,
    quantity_g REAL NOT NULL,
    calories INTEGER,
    protein_g REAL,
    carbs_g REAL,
    fat_g REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE SET NULL
  );

  -- Recipes library
  CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    is_veg INTEGER DEFAULT 1,
    calories INTEGER,
    protein_g REAL,
    carbs_g REAL,
    fat_g REAL,
    ingredients TEXT,
    steps TEXT,
    tags TEXT
  );

  -- Workouts library
  CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    level TEXT,
    image_url TEXT,
    video_url TEXT,
    description TEXT
  );

  -- Workout schedules per user
  CREATE TABLE IF NOT EXISTS workout_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    workout_id INTEGER NOT NULL,
    status TEXT DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
  );

  -- Weight logs per user
  CREATE TABLE IF NOT EXISTS weight_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    weight_kg REAL NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Water logs per user
  CREATE TABLE IF NOT EXISTS water_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    amount_ml INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Reminder settings per user
  CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL, -- 'water' | 'meal'
    time TEXT NOT NULL, -- 'HH:MM'
    frequency TEXT DEFAULT 'daily',
    enabled INTEGER DEFAULT 1,
    label TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, type),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
    ('shortness of breath', 'Difficulty breathing or feeling like you cannot get enough air'),
    ('diarrhea', 'Loose, watery stools occurring more frequently than usual'),
    ('chest pain', 'Discomfort or pain in the chest area'),
    ('unexplained weight loss', 'Significant weight loss without trying'),
    ('persistent cough', 'Cough that lasts for more than 8 weeks'),
    ('blood in stool', 'Presence of blood in bowel movements'),
    ('abdominal pain', 'Pain in the area between the chest and groin');

  -- Associate symptoms with body parts
  INSERT OR IGNORE INTO body_part_symptoms (body_part_id, symptom_id) VALUES
    (1, 1), -- head - headache
    (1, 9), -- head - dizziness
    (2, 3), -- chest - cough
    (2, 10), -- chest - shortness of breath
    (3, 5), -- abdomen - nausea
    (1, 6), -- head - sore throat
    (1, 7), -- head - runny nose
    (4, 8), -- back - body aches
    (3, 11), -- abdomen - diarrhea
    (2, 12), -- chest - chest pain
    (3, 13), -- abdomen - unexplained weight loss
    (2, 14), -- chest - persistent cough
    (3, 15), -- abdomen - blood in stool
    (3, 16); -- abdomen - abdominal pain

  -- Insert sample conditions
  INSERT OR IGNORE INTO conditions (name, description, self_care, when_to_see_doctor) VALUES
    ('Common Cold', 'A viral infectious disease of the upper respiratory tract that primarily affects the nose.', 'Rest and stay hydrated, Use over-the-counter cold medications, Use a humidifier to add moisture to the air, Gargle with salt water to soothe a sore throat', 'If symptoms last more than 10 days or are severe'),
    ('Influenza (Flu)', 'A contagious respiratory illness caused by influenza viruses that infect the nose, throat, and lungs.', 'Rest and stay hydrated, Take over-the-counter pain relievers, Stay home to avoid spreading the illness', 'If you have difficulty breathing, persistent high fever, or are in a high-risk group'),
    ('Migraine', 'A neurological condition characterized by intense, debilitating headaches often accompanied by other symptoms.', 'Rest in a quiet, dark room, Apply cold or warm compresses to your head or neck, Practice relaxation techniques, Stay hydrated', 'If you have severe headaches that don\'t respond to over-the-counter treatments'),
    ('Gastroenteritis', 'An intestinal infection marked by diarrhea, abdominal cramps, nausea, vomiting, and sometimes fever.', 'Stay hydrated with clear fluids, Eat bland, easy-to-digest foods, Get plenty of rest, Avoid dairy products, caffeine, and fatty foods', 'If you have severe dehydration, bloody stools, or symptoms last more than a few days'),
    ('Diarrhea', 'Loose, watery stools occurring more frequently than usual, often accompanied by abdominal cramps.', 'Stay hydrated with water and electrolyte solutions, Eat bland foods like bananas, rice, and toast, Avoid dairy, caffeine, and high-fiber foods temporarily', 'If diarrhea persists more than 2 days, contains blood, or is accompanied by severe pain or high fever'),
    ('Heart Attack', 'A serious medical condition where blood flow to the heart is blocked, causing damage to the heart muscle.', 'Call emergency services immediately (911), Chew and swallow aspirin if not allergic, Rest in a position that eases breathing while waiting for help', 'ALWAYS seek immediate emergency medical attention if you suspect a heart attack'),
    ('Colorectal Cancer', 'Cancer that starts in the colon or rectum, often developing from precancerous polyps.', 'Follow medical treatment plan, Maintain a healthy diet high in fruits, vegetables, and whole grains, Stay physically active, Manage stress', 'Seek immediate care for severe abdominal pain, rectal bleeding, or changes in bowel habits');

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
    (4, 4), -- Gastroenteritis - fatigue
    (5, 11), -- Diarrhea - diarrhea
    (5, 16), -- Diarrhea - abdominal pain
    (6, 12), -- Heart Attack - chest pain
    (6, 10), -- Heart Attack - shortness of breath
    (6, 4), -- Heart Attack - fatigue
    (7, 15), -- Colorectal Cancer - blood in stool
    (7, 13), -- Colorectal Cancer - unexplained weight loss
    (7, 16); -- Colorectal Cancer - abdominal pain

  -- Insert sample medicines
  INSERT OR IGNORE INTO medicines (name, description, dosage, side_effects, precautions, interactions) VALUES
    ('Paracetamol', 'Pain reliever and fever reducer', '500mg every 4-6 hours as needed (max 4g/day)', 'Nausea, rash (rare)', 'Avoid exceeding max daily dose, caution in liver disease', 'Alcohol may increase risk of liver damage'),
    ('Ibuprofen', 'Nonsteroidal anti-inflammatory drug (NSAID) for pain/fever', '200-400mg every 6-8 hours with food', 'Stomach upset, dizziness', 'Avoid in ulcers/renal disease; take with food', 'Anticoagulants increase bleeding risk'),
    ('Antihistamine', 'Relieves allergy symptoms like runny nose and sneezing', 'As per label (e.g., cetirizine 10mg once daily)', 'Drowsiness (varies by drug)', 'Avoid driving if drowsy', 'Alcohol increases sedation'),
    ('Oral Rehydration Salts', 'Replaces fluids and electrolytes in dehydration', 'As directed; frequent small amounts', 'Rare', 'Use clean water; seek care if severe dehydration', 'None'),
    ('Ondansetron', 'Helps relieve nausea and vomiting', '4-8mg every 8-12 hours as needed', 'Headache, constipation', 'Use under medical advice if severe', 'Caution with QT-prolonging drugs'),
    ('Loperamide', 'Anti-diarrheal medication that slows gut movement', 'Initially 4mg, then 2mg after each loose stool (max 8mg/day)', 'Constipation, abdominal pain', 'Avoid in bloody diarrhea or bacterial enterocolitis', 'Interacts with certain antibiotics and antifungals'),
    ('Aspirin', 'Blood thinner for heart attack prevention', '81-325mg daily as advised; 325mg chewed during heart attack', 'Stomach irritation, bleeding', 'Avoid if allergic to NSAIDs or have bleeding disorders', 'Interacts with blood thinners and NSAIDs'),
    ('Nitroglycerin', 'Relaxes blood vessels to treat angina', '0.3-0.6mg under tongue at first sign of attack', 'Headache, dizziness, flushing', 'Use caution with anemia or glaucoma', 'Severe drop in blood pressure with ED medications'),
    ('FOLFOX', 'Chemotherapy regimen for colorectal cancer', 'IV administration every 2 weeks based on body surface area', 'Nausea, low blood counts, neuropathy', 'Requires regular blood tests and hydration', 'Interacts with blood thinners and live vaccines');

  -- Map medicines to conditions
  INSERT OR IGNORE INTO condition_medicines (medicine_id, condition_id) VALUES
    (1, 1), -- Paracetamol for Common Cold
    (2, 2), -- Ibuprofen for Flu
    (3, 1), -- Antihistamine for Common Cold
    (4, 4), -- ORS for Gastroenteritis (dehydration risk)
    (5, 4), -- Ondansetron for Gastroenteritis
    (4, 5), -- ORS for Diarrhea
    (6, 5), -- Loperamide for Diarrhea
    (7, 6), -- Aspirin for Heart Attack
    (8, 6), -- Nitroglycerin for Heart Attack
    (9, 7); -- FOLFOX for Colorectal Cancer
`;

// Initialize the database
async function initializeSQLiteDatabase() {
  try {
    // Create tables
    await dbAsync.exec(createTablesSQL);
    console.log('SQLite tables created or already exist');
    
    // Insert comprehensive health tips with no duplicates
     const healthTipsData = [
       // Nutrition Tips
       ['nutrition', 'Rainbow Diet', 'Eat a variety of colorful fruits and vegetables daily to ensure you get diverse nutrients and antioxidants.'],
       ['nutrition', 'Mindful Eating', 'Eat slowly and pay attention to hunger cues to improve digestion and prevent overeating.'],
       ['nutrition', 'Whole Grains', 'Choose whole grain options over refined grains for better fiber content and sustained energy.'],
       ['nutrition', 'Healthy Fats', 'Include sources of healthy fats like avocados, nuts, seeds, and olive oil in your diet.'],
       ['nutrition', 'Meal Prep', 'Plan and prepare meals in advance to make healthier choices throughout the week.'],
       ['nutrition', 'Sugar Awareness', 'Read food labels and be aware of hidden sugars in processed foods and beverages.'],
       ['nutrition', 'Protein Balance', 'Include lean protein sources in every meal to maintain muscle mass and feel satisfied.'],
       
       // Fitness Tips
       ['fitness', 'Start Small', 'Begin with 10-15 minutes of exercise daily and gradually increase duration and intensity.'],
       ['fitness', 'Mix It Up', 'Vary your workout routine to prevent boredom and work different muscle groups.'],
       ['fitness', 'Warm-Up First', 'Always start with a 5-10 minute warm-up to prepare your muscles and prevent injury.'],
       ['fitness', 'Recovery Time', 'Allow at least one rest day between intense workouts for muscle recovery and growth.'],
       ['fitness', 'Functional Movement', 'Focus on exercises that mimic daily activities to improve overall functional strength.'],
       ['fitness', 'Track Progress', 'Keep a workout log to monitor your progress and stay motivated.'],
       ['fitness', 'Find Your Joy', 'Choose physical activities you enjoy - dancing, hiking, swimming, or sports.'],
       
       // Mental Health Tips
       ['mental', 'Gratitude Practice', 'Write down three things you are grateful for each day to improve mental wellbeing.'],
       ['mental', 'Deep Breathing', 'Practice deep breathing exercises for 5 minutes daily to reduce stress and anxiety.'],
       ['mental', 'Nature Time', 'Spend at least 20 minutes outdoors daily to boost mood and reduce stress hormones.'],
       ['mental', 'Learn Something New', 'Engage in lifelong learning to keep your mind sharp and boost self-confidence.'],
       ['mental', 'Positive Affirmations', 'Practice positive self-talk and affirmations to build mental resilience.'],
       ['mental', 'Boundaries', 'Set healthy boundaries with work and relationships to protect your mental energy.'],
       ['mental', 'Seek Support', 'Don\'t hesitate to reach out to friends, family, or professionals when you need help.'],
       
       // Sleep Tips
       ['sleep', 'Blue Light Reduction', 'Use blue light filters on devices or avoid screens 1 hour before bedtime.'],
       ['sleep', 'Cool Temperature', 'Keep your bedroom between 65-68°F (18-20°C) for optimal sleep quality.'],
       ['sleep', 'Comfortable Mattress', 'Replace your mattress every 7-10 years or when it no longer provides good support.'],
       ['sleep', 'No Late Meals', 'Avoid large meals, alcohol, and caffeine within 3 hours of bedtime.'],
       ['sleep', 'Morning Light', 'Get 10-15 minutes of natural sunlight in the morning to regulate your circadian rhythm.'],
       ['sleep', 'Wind-Down Ritual', 'Create a 30-minute pre-sleep routine with calming activities like reading or stretching.'],
       ['sleep', 'Weekend Consistency', 'Try to wake up within 1 hour of your usual time even on weekends.'],
       
       // Hydration Tips
       ['hydration', 'Start Your Day', 'Drink a glass of water first thing in the morning to kickstart your metabolism.'],
       ['hydration', 'Flavor Your Water', 'Add lemon, cucumber, or mint to plain water for variety without added sugars.'],
       ['hydration', 'Pre-Meal Hydration', 'Drink water 30 minutes before meals to aid digestion and portion control.'],
       ['hydration', 'Exercise Hydration', 'Drink 16-24 oz of water 2 hours before exercise and 6-8 oz every 15-20 minutes during.'],
       ['hydration', 'Temperature Matters', 'Room temperature water is absorbed faster than ice-cold water.'],
       ['hydration', 'Herbal Teas Count', 'Herbal teas (caffeine-free) contribute to your daily fluid intake and provide antioxidants.']
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
    
    // Expanded Symptoms data
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
      ['shortness of breath', 'Difficulty breathing or feeling like you cannot get enough air'],
      ['chest pain', 'Discomfort or pain in the chest area'],
      ['loss of taste', 'Inability to taste flavors properly'],
      ['loss of smell', 'Inability to detect odors'],
      ['persistent cough', 'Cough that lasts for more than 8 weeks'],
      ['dry cough', 'Cough without phlegm or mucus production'],
      ['blood in urine', 'Presence of blood in urine'],
      ['blood in stool', 'Presence of blood in bowel movements'],
      ['unexplained weight loss', 'Significant weight loss without trying'],
      ['night sweats', 'Excessive sweating during sleep'],
      ['swollen lymph nodes', 'Enlarged lymph glands in neck, armpits, or groin'],
      ['difficulty swallowing', 'Problems swallowing food or liquids'],
      ['persistent hoarseness', 'Long-lasting changes in voice quality'],
      ['changes in moles', 'Alterations in size, color, or shape of moles'],
      ['unusual bleeding', 'Unexpected bleeding from any body part'],
      ['persistent indigestion', 'Long-lasting digestive discomfort'],
      ['changes in bowel habits', 'Alterations in normal bowel movement patterns'],
      ['palpitations', 'Feeling of irregular or rapid heartbeat'],
      ['sweating profusely', 'Excessive perspiration without obvious cause'],
      ['jaw pain', 'Pain or discomfort in the jaw area'],
      ['arm pain', 'Pain radiating to arms, especially left arm'],
      ['back pain', 'Pain in the upper, middle, or lower back'],
      ['neck stiffness', 'Difficulty moving the neck'],
      ['confusion', 'Difficulty thinking clearly or concentrating'],
      ['memory problems', 'Difficulty remembering recent events'],
      ['vision changes', 'Blurred vision or other visual disturbances'],
      ['hearing loss', 'Reduced ability to hear sounds'],
      ['skin rash', 'Red, inflamed, or irritated skin'],
      ['joint swelling', 'Inflammation and enlargement of joints'],
      ['muscle weakness', 'Reduced strength in muscles'],
      ['numbness', 'Loss of sensation in body parts'],
      ['tingling', 'Pins and needles sensation'],
      ['difficulty urinating', 'Problems with urination'],
      ['frequent urination', 'Need to urinate more often than usual'],
      ['abdominal pain', 'Pain in the area between chest and groin'],
      ['bloating', 'Feeling of fullness or swelling in the abdomen'],
      ['heartburn', 'Burning sensation in chest or throat'],
      ['constipation', 'Difficulty having bowel movements'],
      ['diarrhea', 'Loose, watery stools']
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
    
    // Expanded Conditions data with COVID-19, Cancer, and other serious conditions
    const conditionsData = [
      ['Common Cold', 'A viral infectious disease of the upper respiratory tract that primarily affects the nose.', 'Rest and stay hydrated, Use over-the-counter cold medications, Use a humidifier to add moisture to the air, Gargle with salt water to soothe a sore throat', 'If symptoms last more than 10 days or are severe'],
      ['Influenza (Flu)', 'A contagious respiratory illness caused by influenza viruses that infect the nose, throat, and lungs.', 'Rest and stay hydrated, Take over-the-counter pain relievers, Stay home to avoid spreading the illness', 'If you have difficulty breathing, persistent high fever, or are in a high-risk group'],
      ['COVID-19', 'A contagious disease caused by the SARS-CoV-2 coronavirus that can cause mild to severe respiratory illness.', 'Isolate yourself, Rest and stay hydrated, Monitor oxygen levels if available, Take over-the-counter fever reducers if needed', 'Immediately if you have trouble breathing, persistent chest pain, confusion, or bluish lips/face. HIGH RISK condition - seek emergency care for severe symptoms'],
      ['Migraine', 'A neurological condition characterized by intense, debilitating headaches often accompanied by other symptoms.', 'Rest in a quiet, dark room, Apply cold or warm compresses to your head or neck, Practice relaxation techniques, Stay hydrated', 'If you have severe headaches that don\'t respond to over-the-counter treatments'],
      ['Gastroenteritis', 'An intestinal infection marked by diarrhea, abdominal cramps, nausea, vomiting, and sometimes fever.', 'Stay hydrated with clear fluids, Eat bland, easy-to-digest foods, Get plenty of rest, Avoid dairy products, caffeine, and fatty foods', 'If you have severe dehydration, bloody stools, or symptoms last more than a few days'],
      ['Heart Attack', 'A serious medical emergency where blood flow to the heart muscle is blocked, potentially causing permanent damage.', 'Call 911 immediately, Chew aspirin if not allergic, Stay calm and rest while waiting for help, Avoid driving yourself to hospital', 'EMERGENCY - Call 911 immediately. HIGH RISK condition requiring immediate medical intervention. Recommended doctor: Cardiologist. Nearby hospitals with cardiac units should be contacted.'],
      ['Stroke', 'A medical emergency occurring when blood supply to part of the brain is interrupted or reduced.', 'Call 911 immediately, Note time symptoms started, Do not give food/water, Keep person calm and lying down', 'EMERGENCY - Call 911 immediately. HIGH RISK condition. Use F.A.S.T. test: Face drooping, Arm weakness, Speech difficulty, Time to call emergency. Recommended doctor: Neurologist.'],
      ['Lung Cancer', 'Cancer that begins in the lungs, often associated with smoking but can occur in non-smokers.', 'Follow oncologist treatment plan, Quit smoking immediately, Eat nutritious foods, Stay as active as possible, Manage pain and symptoms', 'Immediate medical attention for breathing difficulties. HIGH RISK condition. Recommended doctor: Oncologist, Pulmonologist. Regular monitoring required.'],
      ['Breast Cancer', 'Cancer that forms in the cells of the breasts, affecting both men and women but more common in women.', 'Follow oncology treatment plan, Maintain healthy diet, Stay physically active as tolerated, Join support groups', 'Any new breast lumps or changes. HIGH RISK condition. Recommended doctor: Oncologist, Surgical oncologist. Early detection crucial.'],
      ['Colorectal Cancer', 'Cancer that starts in the colon or rectum, often developing from precancerous polyps.', 'Follow medical treatment plan, Maintain a healthy diet high in fruits, vegetables, and whole grains, Stay physically active, Manage stress', 'Seek immediate care for severe abdominal pain, rectal bleeding, or changes in bowel habits. MODERATE to HIGH RISK. Recommended doctor: Gastroenterologist, Oncologist.'],
      ['Diabetes Type 2', 'A chronic condition where the body becomes resistant to insulin or doesn\'t produce enough insulin.', 'Monitor blood sugar regularly, Follow prescribed diet, Take medications as directed, Exercise regularly, Maintain healthy weight', 'For blood sugar over 250 mg/dL, symptoms of ketoacidosis, or severe hypoglycemia. MODERATE RISK with HIGH complications if untreated. Recommended doctor: Endocrinologist.'],
      ['Hypertension', 'High blood pressure that can lead to serious complications if left untreated.', 'Take prescribed medications, Reduce sodium intake, Exercise regularly, Maintain healthy weight, Limit alcohol, Manage stress', 'Blood pressure over 180/110, severe headaches, or chest pain. MODERATE RISK but can lead to HIGH RISK complications. Recommended doctor: Cardiologist, Primary care physician.'],
      ['Pneumonia', 'An infection that inflames air sacs in one or both lungs, which may fill with fluid.', 'Rest and stay hydrated, Take prescribed antibiotics if bacterial, Use humidifier, Take fever reducers as needed', 'Difficulty breathing, chest pain, high fever over 101.3F, or worsening symptoms. MODERATE to HIGH RISK especially in elderly. Recommended doctor: Pulmonologist.'],
      ['Asthma', 'A condition in which airways narrow and swell and may produce extra mucus, making breathing difficult.', 'Use rescue inhaler as prescribed, Avoid triggers, Take controller medications daily, Monitor peak flow if recommended', 'Severe difficulty breathing, rescue inhaler not helping, or bluish lips/fingernails. MODERATE RISK with potential HIGH RISK attacks. Recommended doctor: Pulmonologist, Allergist.'],
      ['Appendicitis', 'Inflammation of the appendix, a small pouch attached to the large intestine.', 'Seek immediate medical attention - do not eat, drink, or take pain medications until evaluated', 'EMERGENCY - Severe abdominal pain starting around navel and moving to lower right abdomen. HIGH RISK condition requiring surgery. Recommended doctor: General surgeon.']
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
    
    // Medicines data
    const medicinesData = [
      ['Paracetamol', 'Pain reliever and fever reducer', '500mg every 4-6 hours as needed (max 4g/day)', 'Nausea, rash (rare)', 'Avoid exceeding max daily dose, caution in liver disease', 'Alcohol may increase risk of liver damage'],
      ['Ibuprofen', 'Nonsteroidal anti-inflammatory drug (NSAID) for pain/fever', '200-400mg every 6-8 hours with food', 'Stomach upset, dizziness', 'Avoid in ulcers/renal disease; take with food', 'Anticoagulants increase bleeding risk'],
      ['Antihistamine', 'Relieves allergy symptoms like runny nose and sneezing', 'As per label (e.g., cetirizine 10mg once daily)', 'Drowsiness (varies by drug)', 'Avoid driving if drowsy', 'Alcohol increases sedation'],
      ['Oral Rehydration Salts', 'Replaces fluids and electrolytes in dehydration', 'As directed; frequent small amounts', 'Rare', 'Use clean water; seek care if severe dehydration', 'None'],
      ['Ondansetron', 'Helps relieve nausea and vomiting', '4-8mg every 8-12 hours as needed', 'Headache, constipation', 'Use under medical advice if severe', 'Caution with QT-prolonging drugs'],
      ['Loperamide', 'Anti-diarrheal medication that slows gut movement', 'Initially 4mg, then 2mg after each loose stool (max 8mg/day)', 'Constipation, abdominal pain', 'Avoid in bloody diarrhea or bacterial enterocolitis', 'Interacts with certain antibiotics and antifungals'],
      ['Aspirin', 'Blood thinner for heart attack prevention', '81-325mg daily as advised; 325mg chewed during heart attack', 'Stomach irritation, bleeding', 'Avoid if allergic to NSAIDs or have bleeding disorders', 'Interacts with blood thinners and NSAIDs'],
      ['Nitroglycerin', 'Relaxes blood vessels to treat angina', '0.3-0.6mg under tongue at first sign of attack', 'Headache, dizziness, flushing', 'Use caution with anemia or glaucoma', 'Severe drop in blood pressure with ED medications'],
      ['FOLFOX', 'Chemotherapy regimen for colorectal cancer', 'IV administration every 2 weeks based on body surface area', 'Nausea, low blood counts, neuropathy', 'Requires regular blood tests and hydration', 'Interacts with blood thinners and live vaccines']
    ];
    
    // Function to insert medicines one by one
    async function insertMedicines() {
      for (const [name, description, dosage, sideEffects, precautions, interactions] of medicinesData) {
        const sql = `INSERT OR IGNORE INTO medicines (name, description, dosage, side_effects, precautions, interactions) VALUES (?, ?, ?, ?, ?, ?)`;
        await dbAsync.run(sql, [name, description, dosage, sideEffects, precautions, interactions]);
      }
      console.log('Medicines inserted successfully');
    }
    
    // Condition medicines data
    const conditionMedicinesData = [
      [1, 1], // Paracetamol for Common Cold
      [2, 2], // Ibuprofen for Flu
      [3, 1], // Antihistamine for Common Cold
      [4, 4], // ORS for Gastroenteritis
      [5, 4], // Ondansetron for Gastroenteritis
      [4, 5], // ORS for Diarrhea
      [6, 5], // Loperamide for Diarrhea
      [7, 6], // Aspirin for Heart Attack
      [8, 6], // Nitroglycerin for Heart Attack
      [9, 7]  // FOLFOX for Colorectal Cancer
    ];
    
    // Function to insert condition medicines one by one
    async function insertConditionMedicines() {
      for (const [medicineId, conditionId] of conditionMedicinesData) {
        const sql = `INSERT OR IGNORE INTO condition_medicines (medicine_id, condition_id) VALUES (?, ?)`;
        await dbAsync.run(sql, [medicineId, conditionId]);
      }
      console.log('Condition medicines inserted successfully');
    }

    // Foods data (subset)
    const foodsData = [
      ['Apple', 'Fruit', 52, 0.3, 14, 0.2, 1],
      ['Banana', 'Fruit', 89, 1.1, 23, 0.3, 1],
      ['Chicken Breast (grilled, skinless)', 'Protein', 165, 31, 0, 3.6, 0],
      ['Rice (cooked)', 'Grain', 130, 2.7, 28, 0.3, 1],
      ['Paneer (cottage cheese)', 'Dairy', 265, 18.3, 1.2, 20.8, 1],
      ['Tofu (firm)', 'Protein', 144, 15.7, 2.3, 8.7, 1],
      ['Egg (boiled)', 'Protein', 155, 13, 1.1, 11, 0]
    ];

    async function insertFoods() {
      for (const [name, category, cal100, p100, c100, f100, isVeg] of foodsData) {
        const sql = `INSERT OR IGNORE INTO foods (name, category, calories_per_100g, protein_g_per_100g, carbs_g_per_100g, fat_g_per_100g, is_veg) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        await dbAsync.run(sql, [name, category, cal100, p100, c100, f100, isVeg]);
      }
      console.log('Foods inserted successfully');
    }

    // Recipes data (subset)
    const recipesData = [
      ['Veggie Bowl', 'A hearty mixed veggie bowl with quinoa and chickpeas.', 1, 480, 20, 60, 16,
        JSON.stringify([
          { name: 'Quinoa', amount: '100g' },
          { name: 'Chickpeas', amount: '80g' },
          { name: 'Mixed Vegetables', amount: '150g' }
        ]),
        JSON.stringify([
          'Cook quinoa as per instructions',
          'Saute veggies lightly',
          'Combine with chickpeas and season'
        ]),
        JSON.stringify(['vegan','high-fiber'])
      ],
      ['Grilled Chicken Salad', 'Lean grilled chicken with fresh greens and olive oil dressing.', 0, 420, 35, 10, 24,
        JSON.stringify([
          { name: 'Chicken Breast', amount: '150g' },
          { name: 'Lettuce', amount: '100g' },
          { name: 'Olive Oil', amount: '1 tbsp' }
        ]),
        JSON.stringify([
          'Grill chicken until cooked through',
          'Toss greens with dressing',
          'Slice chicken and serve on top'
        ]),
        JSON.stringify(['low-carb','high-protein'])
      ]
    ];

    async function insertRecipes() {
      for (const [name, description, isVeg, calories, protein_g, carbs_g, fat_g, ingredients, steps, tags] of recipesData) {
        const sql = `INSERT OR IGNORE INTO recipes (name, description, is_veg, calories, protein_g, carbs_g, fat_g, ingredients, steps, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        await dbAsync.run(sql, [name, description, isVeg, calories, protein_g, carbs_g, fat_g, ingredients, steps, tags]);
      }
      console.log('Recipes inserted successfully');
    }

    // Workouts data (subset)
    const workoutsData = [
      ['Bodyweight Circuit', 'Strength', 'beginner', null, null, 'Squats, push-ups, lunges, planks'],
      ['HIIT Cardio', 'Cardio', 'intermediate', null, null, 'Intervals of high intensity with short rests'],
      ['Full Body Strength', 'Strength', 'advanced', null, null, 'Compound lifts and accessory work']
    ];

    async function insertWorkouts() {
      for (const [name, category, level, image_url, video_url, description] of workoutsData) {
        const sql = `INSERT OR IGNORE INTO workouts (name, category, level, image_url, video_url, description) VALUES (?, ?, ?, ?, ?, ?)`;
        await dbAsync.run(sql, [name, category, level, image_url, video_url, description]);
      }
      console.log('Workouts inserted successfully');
    }
    
    // Execute all insert functions in sequence
    try {
      await insertHealthTips();
      await insertBodyParts();
      await insertSymptoms();
      await insertBodyPartSymptoms();
      await insertConditions();
      await insertConditionSymptoms();
      await insertMedicines();
      await insertConditionMedicines();
      await insertDietPlans();
      await insertWorkoutPlans();
      await insertFoods();
      await insertRecipes();
      await insertWorkouts();
      
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