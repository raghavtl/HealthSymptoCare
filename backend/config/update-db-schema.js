const { dbAsync } = require('./sqlite-db');

// SQL statements to create new tables
const createTablesSQL = `
  -- Medicines table
  CREATE TABLE IF NOT EXISTS medicines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    dosage TEXT,
    side_effects TEXT,
    precautions TEXT,
    interactions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Condition medicines relationship table
  CREATE TABLE IF NOT EXISTS condition_medicines (
    condition_id INTEGER NOT NULL,
    medicine_id INTEGER NOT NULL,
    PRIMARY KEY (condition_id, medicine_id),
    FOREIGN KEY (condition_id) REFERENCES conditions(id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
  );
`;

// Sample data for medicines
const medicinesData = [
  // Common Cold medicines
  ['Acetaminophen (Tylenol)', 'A pain reliever and fever reducer.', 'Adults and children 12 years and over: 2 tablets every 4-6 hours as needed. Do not exceed 6 tablets in 24 hours.', 'Rare side effects may include nausea, stomach pain, loss of appetite.', 'Do not use with other products containing acetaminophen. Alcohol may increase risk of liver damage.', 'May interact with warfarin and isoniazid.'],
  ['Pseudoephedrine (Sudafed)', 'A decongestant that relieves nasal congestion.', 'Adults and children 12 years and over: 1 tablet every 4-6 hours. Do not exceed 4 tablets in 24 hours.', 'May cause nervousness, dizziness, or sleeplessness.', 'Do not use if you have heart disease, high blood pressure, thyroid disease, or diabetes.', 'May interact with certain antidepressants and blood pressure medications.'],
  ['Dextromethorphan (Robitussin DM)', 'A cough suppressant.', 'Adults and children 12 years and over: 2 teaspoons every 4 hours. Do not exceed 12 teaspoons in 24 hours.', 'May cause drowsiness, dizziness, or stomach discomfort.', 'Do not use if you are taking MAO inhibitors.', 'May interact with certain antidepressants and sedatives.'],
  
  // Influenza (Flu) medicines
  ['Oseltamivir (Tamiflu)', 'An antiviral medication used to treat and prevent influenza.', 'For treatment: 75 mg twice daily for 5 days. For prevention: 75 mg once daily for 10 days.', 'May cause nausea, vomiting, headache, or diarrhea.', 'Start treatment within 48 hours of symptom onset for best results.', 'No significant drug interactions have been identified.'],
  ['Zanamivir (Relenza)', 'An inhaled antiviral medication for influenza.', 'For treatment: 2 inhalations twice daily for 5 days. For prevention: 2 inhalations once daily for 10 days.', 'May cause bronchospasm, especially in patients with asthma or COPD.', 'Not recommended for patients with underlying respiratory diseases.', 'No significant drug interactions have been identified.'],
  ['Ibuprofen (Advil, Motrin)', 'A nonsteroidal anti-inflammatory drug (NSAID) that reduces fever and inflammation.', 'Adults: 200-400 mg every 4-6 hours as needed. Do not exceed 1200 mg in 24 hours.', 'May cause stomach pain, heartburn, nausea, or dizziness.', 'Long-term use may increase risk of heart attack, stroke, or stomach bleeding.', 'May interact with aspirin, blood thinners, and certain blood pressure medications.'],
  
  // Migraine medicines
  ['Sumatriptan (Imitrex)', 'A selective serotonin receptor agonist used to treat migraine headaches.', 'Adults: 25-100 mg orally at onset of migraine. May repeat after 2 hours if needed. Do not exceed 200 mg in 24 hours.', 'May cause tingling, flushing, dizziness, or drowsiness.', 'Not recommended for patients with heart disease, uncontrolled high blood pressure, or certain types of migraines.', 'Do not use within 24 hours of other triptan medications or ergot-containing drugs.'],
  ['Rizatriptan (Maxalt)', 'A selective serotonin receptor agonist used to treat migraine headaches.', 'Adults: 5-10 mg orally at onset of migraine. May repeat after 2 hours if needed. Do not exceed 30 mg in 24 hours.', 'May cause dizziness, drowsiness, fatigue, or dry mouth.', 'Not recommended for patients with heart disease, uncontrolled high blood pressure, or certain types of migraines.', 'Do not use within 24 hours of other triptan medications or ergot-containing drugs.'],
  ['Topiramate (Topamax)', 'An anticonvulsant medication used for migraine prevention.', 'Adults: Starting dose of 25 mg daily, gradually increasing to 100 mg daily in divided doses.', 'May cause tingling in extremities, taste changes, weight loss, or cognitive effects.', 'May increase risk of kidney stones. Drink plenty of fluids.', 'May decrease effectiveness of hormonal contraceptives.'],
  
  // Gastroenteritis medicines
  ['Loperamide (Imodium)', 'An antidiarrheal medication.', 'Adults: 4 mg initially, followed by 2 mg after each loose stool. Do not exceed 8 mg in 24 hours.', 'May cause constipation, abdominal pain, dizziness, or dry mouth.', 'Do not use if you have bloody diarrhea or high fever.', 'May interact with certain antibiotics and antifungal medications.'],
  ['Bismuth subsalicylate (Pepto-Bismol)', 'An antidiarrheal medication that also relieves heartburn and indigestion.', 'Adults: 2 tablespoons or 2 tablets every 30-60 minutes as needed. Do not exceed 8 doses in 24 hours.', 'May cause temporary darkening of tongue and stool.', 'Do not use if you have an aspirin allergy, bleeding problems, or kidney disease.', 'May interact with aspirin, blood thinners, diabetes medications, and certain antibiotics.'],
  ['Ondansetron (Zofran)', 'An antiemetic used to prevent nausea and vomiting.', 'Adults: 4-8 mg orally every 8 hours as needed.', 'May cause headache, constipation, or dizziness.', 'May cause QT interval prolongation in some patients.', 'May interact with certain antidepressants, antibiotics, and heart medications.']
];

// Condition medicines relationship data
const conditionMedicinesData = [
  // Common Cold (ID: 1) medicines
  [1, 1], // Common Cold - Acetaminophen
  [1, 2], // Common Cold - Pseudoephedrine
  [1, 3], // Common Cold - Dextromethorphan
  
  // Influenza (ID: 2) medicines
  [2, 4], // Flu - Oseltamivir
  [2, 5], // Flu - Zanamivir
  [2, 6], // Flu - Ibuprofen
  [2, 1], // Flu - Acetaminophen (also used for flu)
  
  // Migraine (ID: 3) medicines
  [3, 7], // Migraine - Sumatriptan
  [3, 8], // Migraine - Rizatriptan
  [3, 9], // Migraine - Topiramate
  [3, 1], // Migraine - Acetaminophen (also used for migraines)
  
  // Gastroenteritis (ID: 4) medicines
  [4, 10], // Gastroenteritis - Loperamide
  [4, 11], // Gastroenteritis - Bismuth subsalicylate
  [4, 12]  // Gastroenteritis - Ondansetron
];

// Function to insert medicines one by one
async function insertMedicines() {
  for (const [name, description, dosage, sideEffects, precautions, interactions] of medicinesData) {
    const sql = `INSERT OR IGNORE INTO medicines (name, description, dosage, side_effects, precautions, interactions) VALUES (?, ?, ?, ?, ?, ?)`;
    await dbAsync.run(sql, [name, description, dosage, sideEffects, precautions, interactions]);
  }
  console.log('Medicines inserted successfully');
}

// Function to insert condition medicines relationships one by one
async function insertConditionMedicines() {
  for (const [conditionId, medicineId] of conditionMedicinesData) {
    const sql = `INSERT OR IGNORE INTO condition_medicines (condition_id, medicine_id) VALUES (?, ?)`;
    await dbAsync.run(sql, [conditionId, medicineId]);
  }
  console.log('Condition medicines relationships inserted successfully');
}

// Update the database schema and insert sample data
async function updateDatabaseSchema() {
  try {
    // Create new tables
    await dbAsync.exec(createTablesSQL);
    console.log('New tables created or already exist');
    
    // Insert sample data
    await insertMedicines();
    await insertConditionMedicines();
    
    console.log('Database schema update completed successfully');
  } catch (error) {
    console.error('Error updating database schema:', error.message);
    throw error;
  }
}

// Export the function
module.exports = { updateDatabaseSchema };

// If this script is run directly (not imported), update the database schema
if (require.main === module) {
  updateDatabaseSchema()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Database schema update failed:', error);
      process.exit(1);
    });
}