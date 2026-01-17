import React, { useMemo, useState } from 'react';
import { FiSearch, FiAlertTriangle, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';

const BODY_PARTS = [
  'Head',
  'Stomach / Abdomen',
  'Chest',
  'Back',
  'Hand',
  'Leg',
  'Neck',
  'Ear',
  'Eye',
  'Throat',
  'Shoulder',
  'Arm',
  'Hip',
  'Skin',
];

const PAIN_LOCATIONS = {
Head: ['Forehead', 'Back of Head', 'Around Eyes', 'Top of Head', 'Jaw', 'Scalp'],
  'Stomach / Abdomen': [
    'Upper Stomach',
    'Lower Stomach',
    'Left Side',
    'Right Side',
    'Belly Button Area',
    'Lower Right (Appendix area)',
    'Upper Left (Spleen area)'
  ],
  Chest: ['Left Side', 'Right Side', 'Center', 'Ribs', 'Under Breastbone'],
  Back: ['Upper Back', 'Lower Back', 'Middle Back', 'Side of Back'],
  Hand: ['Fingers', 'Palm', 'Wrist', 'Back of Hand', 'Thumb Joint'],
  Leg: ['Thigh', 'Knee', 'Calf', 'Ankle', 'Foot', 'Heel', 'Toes'],
  Neck: ['Front', 'Back', 'Left Side', 'Right Side', 'Base of Neck'],
  Ear: ['Outer Ear', 'Inner Ear', 'Behind Ear', 'Ear Canal'],
  Eye: ['Left Eye', 'Right Eye', 'Both Eyes', 'Eyelids'],
  Throat: ['Upper Throat', 'Lower Throat', 'Tonsil Area', 'Voice Box (Larynx)'],
  Shoulder: ['Left Shoulder', 'Right Shoulder', 'Shoulder Blade'],
  Arm: ['Upper Arm', 'Elbow', 'Forearm'],
  Hip: ['Left Hip', 'Right Hip'],
  Skin: ['Face', 'Arms', 'Legs', 'Chest', 'Back'],
};

const SYMPTOMS_BY_LOCATION = {
  'Head': {
    Forehead: ['Headache', 'Pressure feeling', 'Sensitivity to light', 'Nausea', 'Dizziness', 'Blurred vision', 'Tingling sensation'],
    'Back of Head': ['Dull ache', 'Neck stiffness', 'Worse with activity', 'Scalp tenderness', 'Radiates to neck'],
    'Around Eyes': ['Facial pain', 'Nasal congestion', 'Runny nose', 'Headache', 'Fever', 'Pressure around eyes'],
    'Top of Head': ['Bilateral pressure', 'Stress-related', 'Worse late day', 'Band-like tightness'],
    Jaw: ['Clicking jaw', 'Pain while chewing', 'Jaw stiffness', 'Earache'],
    Scalp: ['Tenderness', 'Itching', 'Burning sensation', 'Flakiness'],
  },
  'Stomach / Abdomen': {
    'Upper Stomach': ['Burning pain', 'Bloating', 'Nausea', 'Worse after eating', 'Acid taste'],
    'Lower Stomach': ['Cramping', 'Bloating', 'Diarrhea', 'Constipation', 'Sharp pain', 'Blood in stool', 'Loss of appetite'],
    'Left Side': ['Sharp pain', 'Dull ache', 'Tenderness', 'Bloating'],
    'Right Side': ['Sharp pain', 'Dull ache', 'Tenderness', 'Nausea'],
    'Belly Button Area': ['Cramping', 'Nausea', 'Bloating', 'Moves to right side'],
    'Lower Right (Appendix area)': ['Sharp pain', 'Tenderness', 'Fever', 'Nausea'],
    'Upper Left (Spleen area)': ['Dull ache', 'Tenderness', 'Worse with deep breath'],
    'Right Upper Quadrant': ['Dull ache', 'Nausea', 'Worse after fatty meals'],
    'Left Upper Quadrant': ['Dull ache', 'Tenderness'],
    'Right Lower Quadrant': ['Sharp pain', 'Tenderness', 'Fever'],
    'Left Lower Quadrant': ['Cramping', 'Bloating', 'Fever'],
    'Around Navel': ['Cramping', 'Nausea', 'Bloating'],
  },
  'Chest': {
    'Left Side': ['Chest pain', 'Shortness of breath', 'Tightness', 'Palpitations', 'Sweating', 'Nausea'],
    'Right Side': ['Sharp pain', 'Worse on deep breath', 'Coughing', 'Tenderness'],
    Center: ['Chest pain', 'Shortness of breath', 'Tightness', 'Palpitations', 'Coughing', 'Burning sensation'],
    Ribs: ['Localized pain', 'Tender to touch', 'Worse with movement', 'Bruising'],
    'Under Breastbone': ['Burning sensation', 'Acid taste', 'Pain after meals', 'Worse when lying down'],
  },
  'Back': {
    'Upper Back': ['Stiffness', 'Muscle spasm', 'Dull ache', 'Worse with posture', 'Radiating pain'],
    'Lower Back': ['Dull ache', 'Sharp stabbing pain', 'Stiffness', 'Radiating pain to legs', 'Muscle weakness', 'Numbness'],
    'Middle Back': ['Dull ache', 'Stiffness', 'Worse with bending', 'Muscle spasm'],
    'Side of Back': ['Sharp pain', 'Worse on twisting', 'Tenderness'],
  },
  'Hand': {
    Fingers: ['Swelling', 'Stiffness', 'Tingling', 'Numbness', 'Redness'],
    Palm: ['Tingling', 'Numbness', 'Weak grip', 'Burning'],
    Wrist: ['Dull ache', 'Swelling', 'Stiffness', 'Worse with use', 'Clicking'],
    'Back of Hand': ['Swelling', 'Bruising', 'Pain with movement'],
    'Thumb Joint': ['Pain with gripping', 'Swelling', 'Stiffness', 'Clicking'],
  },
  'Leg': {
    Thigh: ['Muscle soreness', 'Bruising', 'Tightness', 'Sharp pain'],
    Knee: ['Swelling', 'Stiffness', 'Pain when walking', 'Clicking sound', 'Redness', 'Difficulty bending'],
    Calf: ['Cramp', 'Tenderness', 'Tightness', 'Swelling'],
    Ankle: ['Swelling', 'Instability', 'Pain on weight bearing', 'Bruising'],
    Foot: ['Heel pain', 'Arch pain', 'Swelling', 'Redness'],
    Heel: ['Heel pain', 'Worse in morning', 'Tenderness'],
    Toes: ['Redness', 'Swelling', 'Pain', 'Numbness'],
  },
  'Neck': {
    Front: ['Sore throat', 'Swelling', 'Pain while swallowing', 'Tender lymph nodes'],
    Back: ['Stiffness', 'Dull ache', 'Headache', 'Muscle spasm', 'Fever'],
    'Left Side': ['Sharp pain', 'Stiffness', 'Tenderness'],
    'Right Side': ['Sharp pain', 'Stiffness', 'Tenderness'],
    'Base of Neck': ['Stiffness', 'Radiating pain to shoulder', 'Numbness/tingling'],
  },
  'Ear': {
    'Outer Ear': ['Pain', 'Redness', 'Swelling', 'Itching'],
    'Inner Ear': ['Earache', 'Fullness', 'Hearing loss', 'Dizziness', 'Ringing'],
    'Behind Ear': ['Swelling', 'Tenderness', 'Pain', 'Fever'],
    'Ear Canal': ['Itching', 'Discharge', 'Pain on pulling ear', 'Swelling', 'Wax buildup'],
  },
  'Eye': {
    'Left Eye': ['Redness', 'Pain', 'Light sensitivity', 'Blurred vision', 'Watering'],
    'Right Eye': ['Redness', 'Pain', 'Light sensitivity', 'Blurred vision', 'Watering'],
    'Both Eyes': ['Redness', 'Itching', 'Watering', 'Pain', 'Light sensitivity', 'Blurred vision', 'Double vision'],
    Eyelids: ['Redness', 'Swelling', 'Crusting', 'Itching'],
  },
  'Throat': {
    'Upper Throat': ['Sore throat', 'Dryness', 'Itching', 'Cough'],
    'Lower Throat': ['Hoarseness', 'Pain while swallowing', 'Cough', 'Throat clearing'],
    'Tonsil Area': ['Pain while swallowing', 'Redness', 'White patches', 'Swelling', 'Sore throat', 'Fever', 'Fatigue'],
    'Voice Box (Larynx)': ['Hoarseness', 'Voice loss', 'Throat pain', 'Cough'],
  },
  'Shoulder': {
    'Left Shoulder': ['Pain with movement', 'Stiffness', 'Radiates to arm', 'Weakness'],
    'Right Shoulder': ['Pain with movement', 'Stiffness', 'Radiates to arm', 'Weakness'],
    'Shoulder Blade': ['Dull ache', 'Sharp pain', 'Worse with deep breath'],
  },
  'Arm': {
    'Upper Arm': ['Muscle pain', 'Weakness', 'Bruising'],
    Elbow: ['Pain on outer side', 'Pain on inner side', 'Stiffness', 'Weak grip'],
    Forearm: ['Dull ache', 'Tingling', 'Worse with repetitive use'],
  },
  'Hip': {
    'Left Hip': ['Groin pain', 'Stiffness', 'Pain with walking', 'Clicking'],
    'Right Hip': ['Groin pain', 'Stiffness', 'Pain with walking', 'Clicking'],
  },
  'Skin': {
    Face: ['Rash', 'Redness', 'Itching', 'Swelling', 'Blisters', 'Dryness', 'Peeling'],
    Arms: ['Rash', 'Redness', 'Itching', 'Swelling', 'Blisters', 'Dryness', 'Peeling'],
    Legs: ['Rash', 'Redness', 'Itching', 'Swelling', 'Blisters', 'Dryness', 'Peeling'],
    Chest: ['Rash', 'Redness', 'Itching', 'Swelling', 'Blisters', 'Dryness', 'Peeling'],
    Back: ['Rash', 'Redness', 'Itching', 'Swelling', 'Blisters', 'Dryness', 'Peeling'],
  },
};

const CONDITION_DETAILS = {
  // Headaches / ENT
  Migraine: {
    medicines: ['Paracetamol/acetaminophen', 'Ibuprofen (if suitable)', 'Talk to a doctor about triptans if needed'],
    remedies: ['Rest in a dark, quiet room', 'Hydration', 'Manage triggers (sleep, stress)'],
  },
  Sinusitis: {
    medicines: ['Paracetamol/acetaminophen', 'Saline nasal spray', 'Short-term decongestants (as directed)'],
    remedies: ['Steam inhalation', 'Warm compress over sinuses', 'Hydration'],
  },
  'Tension Headache': {
    medicines: ['Paracetamol/acetaminophen', 'Ibuprofen (if suitable)'],
    remedies: ['Stress reduction', 'Neck/shoulder stretching', 'Regular sleep'],
  },
  'Cervicogenic Headache': {
    medicines: ['Paracetamol/acetaminophen', 'Ibuprofen (if suitable)'],
    remedies: ['Ergonomics', 'Physical therapy', 'Heat to neck muscles'],
  },
  'Non-specific Headache': {
    medicines: ['Paracetamol/acetaminophen'],
    remedies: ['Hydration', 'Adequate sleep', 'Limit screen time'],
  },
  'TMJ Disorder (possible)': {
    medicines: ['Paracetamol/acetaminophen', 'Ibuprofen (if suitable)'],
    remedies: ['Soft diet', 'Warm compress', 'Jaw relaxation exercises'],
  },

  // Chest / Cardiac / GI
  Angina: {
    medicines: ['Seek medical advice urgently; avoid exertion'],
    remedies: ['Rest; emergency evaluation if severe'],
  },
  'Heart Attack (possible)': {
    medicines: ['Emergency care required (call emergency services)'],
    remedies: ['Do not delay — urgent medical attention'],
  },
  'Anxiety Attack': {
    medicines: ['Short-term as advised by clinician'],
    remedies: ['Breathing exercises', 'Grounding techniques', 'Reassurance'],
  },
  'Acid Reflux (GERD)': {
    medicines: ['Antacids', 'Acid reducers (as directed)'],
    remedies: ['Avoid late meals', 'Reduce trigger foods', 'Elevate head of bed'],
  },

  // Abdomen / GI
  Gastritis: {
    medicines: ['Antacids', 'Acid reducers (as directed)'],
    remedies: ['Avoid spicy/acidic foods', 'Smaller meals', 'Avoid NSAIDs if possible'],
  },
  'Indigestion (Dyspepsia)': {
    medicines: ['Antacids', 'Acid reducers (as directed)'],
    remedies: ['Eat smaller meals', 'Limit caffeine/alcohol'],
  },
  Gastroenteritis: {
    medicines: ['Oral rehydration salts', 'Paracetamol for fever'],
    remedies: ['Hydration', 'Light diet (BRAT)'],
  },
  'Irritable Bowel Syndrome': {
    medicines: ['Antispasmodics (ask a doctor)', 'OTC options for diarrhea/constipation as directed'],
    remedies: ['Fiber management', 'Stress reduction', 'Dietary adjustments'],
  },
  'Food Poisoning': {
    medicines: ['Oral rehydration salts'],
    remedies: ['Hydration', 'Rest', 'Light diet'],
  },
  Appendicitis: {
    medicines: ['Pain control only under medical supervision'],
    remedies: ['Urgent medical evaluation'],
  },

  // Musculoskeletal / Neuro
  'Muscle Strain': {
    medicines: ['Paracetamol/acetaminophen', 'Ibuprofen (if suitable)'],
    remedies: ['Rest', 'Ice/heat as appropriate', 'Gentle stretching'],
  },
  Sciatica: {
    medicines: ['Paracetamol/acetaminophen', 'Ibuprofen (if suitable)'],
    remedies: ['Gentle mobility', 'Avoid heavy lifting initially', 'Heat to lower back'],
  },
  'Herniated Disc (possible)': {
    medicines: ['Paracetamol/acetaminophen', 'Ibuprofen (if suitable)'],
    remedies: ['Activity modification', 'Physiotherapy guidance'],
  },
  'Carpal Tunnel Syndrome (possible)': {
    medicines: ['Paracetamol/acetaminophen', 'Topical NSAIDs'],
    remedies: ['Wrist splint', 'Activity breaks'],
  },
  'Ankle Sprain': {
    medicines: ['Paracetamol/acetaminophen', 'Ibuprofen (if suitable)'],
    remedies: ['RICE: Rest, Ice, Compression, Elevation'],
  },
  'Knee Osteoarthritis (possible)': {
    medicines: ['Paracetamol/acetaminophen', 'Topical NSAIDs'],
    remedies: ['Weight management', 'Quadriceps strengthening'],
  },
  'Meniscus Injury (possible)': {
    medicines: ['Paracetamol/acetaminophen'],
    remedies: ['Relative rest', 'Physiotherapy assessment'],
  },

  // Skin / Eye / Ear / Throat
  'Allergic Reaction (skin)': {
    medicines: ['Antihistamines (as directed)'],
    remedies: ['Avoid trigger', 'Cool compress', 'Gentle moisturizers'],
  },
  Eczema: {
    medicines: ['Moisturizers', 'Topical hydrocortisone (as directed)'],
    remedies: ['Avoid irritants', 'Gentle skin care'],
  },
  'Fungal Infection (skin)': {
    medicines: ['Topical antifungal (as directed)'],
    remedies: ['Keep area dry', 'Loose clothing'],
  },
  Conjunctivitis: {
    medicines: ['Lubricating eye drops', 'Antibiotic drops if bacterial (doctor advice)'],
    remedies: ['Avoid touching eyes', 'Warm compress'],
  },
  'Allergic Conjunctivitis': {
    medicines: ['Antihistamine eye drops', 'Oral antihistamines (as directed)'],
    remedies: ['Avoid allergens', 'Cool compress'],
  },
  'Dry Eye': {
    medicines: ['Lubricating eye drops'],
    remedies: ['Blink breaks', 'Humidify environment'],
  },
  Tonsillitis: {
    medicines: ['Paracetamol/acetaminophen'],
    remedies: ['Warm salt water gargles', 'Hydration', 'Rest'],
  },
  Pharyngitis: {
    medicines: ['Paracetamol/acetaminophen'],
    remedies: ['Warm fluids', 'Lozenges'],
  },
  Laryngitis: {
    medicines: ['Paracetamol/acetaminophen'],
    remedies: ['Voice rest', 'Humidified air'],
  },
  'Cervical Radiculopathy (possible)': {
    medicines: ['Paracetamol/acetaminophen', 'Ibuprofen (if suitable)'],
    remedies: ['Posture optimization', 'Physiotherapy'],
  },
  'Otitis Externa (Swimmer\'s Ear)': {
    medicines: ['Topical antibiotic/acidifying ear drops (doctor advice)'],
    remedies: ['Keep ear dry', 'Avoid inserting objects into ear'],
  },
  // Added condition details per requested mappings
  'Cluster Headache': {
    medicines: ['Paracetamol/acetaminophen', 'Ibuprofen (if suitable)'],
    remedies: ['Dark, quiet rest', 'Avoid alcohol during clusters'],
  },
  'Eye Strain': {
    medicines: ['Artificial tears'],
    remedies: ['20-20-20 rule', 'Screen breaks', 'Proper lighting'],
  },
  'Trigeminal Neuralgia': {
    medicines: ['Paracetamol/acetaminophen'],
    remedies: ['Warm compress', 'Medical evaluation for prescription therapy'],
  },
  'Heart Attack (Myocardial Infarction)': {
    medicines: ['Emergency care required (call emergency services)'],
    remedies: ['Do not delay — urgent medical attention'],
  },
  'Anxiety/Panic Attack': {
    medicines: ['Short-term as advised by clinician'],
    remedies: ['Breathing exercises', 'Grounding techniques', 'Reassurance'],
  },
  'Gastroesophageal Reflux (GERD)': {
    medicines: ['Antacids', 'Omeprazole (as directed)'],
    remedies: ['Avoid trigger foods', 'Smaller meals', 'Elevate head of bed'],
  },
  Costochondritis: {
    medicines: ['Paracetamol/acetaminophen', 'Ibuprofen (if suitable)'],
    remedies: ['Rest', 'Warm compress'],
  },
  Pneumonia: {
    medicines: ['Paracetamol/acetaminophen'],
    remedies: ['Hydration', 'Medical evaluation if severe or with high fever'],
  },
  'Pulmonary Embolism': {
    medicines: ['Emergency care required'],
    remedies: ['Urgent medical attention'],
  },
  'Irritable Bowel Syndrome (IBS)': {
    medicines: ['Antispasmodics (doctor advice)', 'Loperamide for diarrhea (as directed)'],
    remedies: ['Fiber management', 'Stress reduction', 'Low-FODMAP with clinician'],
  },
  'Peptic Ulcer': {
    medicines: ['Antacids', 'Acid reducers (as directed)'],
    remedies: ['Avoid NSAIDs', 'Avoid spicy/acidic foods'],
  },
  Pancreatitis: {
    medicines: ['Pain control under medical supervision'],
    remedies: ['Urgent medical assessment'],
  },
  'Lactose Intolerance': {
    medicines: ['Lactase enzyme (as advised)'],
    remedies: ['Avoid lactose or use lactose-free options'],
  },
  Gallstones: {
    medicines: ['Pain relief as directed'],
    remedies: ['Low-fat diet', 'Medical review if recurrent'],
  },
  'Herniated Disc': {
    medicines: ['Paracetamol/acetaminophen', 'Ibuprofen (if suitable)'],
    remedies: ['Physiotherapy', 'Activity modification'],
  },
  'Kidney Stones': {
    medicines: ['Paracetamol/acetaminophen'],
    remedies: ['Hydration', 'Medical evaluation for severe pain'],
  },
  Arthritis: {
    medicines: ['Paracetamol/acetaminophen', 'Topical NSAIDs'],
    remedies: ['Gentle exercise', 'Weight management'],
  },
  'Spinal Stenosis': {
    medicines: ['Paracetamol/acetaminophen'],
    remedies: ['Physiotherapy', 'Activity pacing'],
  },
  'Osteoporosis-related fracture': {
    medicines: ['Paracetamol/acetaminophen'],
    remedies: ['Urgent medical evaluation'],
  },
  Tendonitis: {
    medicines: ['Paracetamol/acetaminophen', 'Ibuprofen (if suitable)'],
    remedies: ['Rest', 'Ice', 'Activity modification'],
  },
  'Ligament Injury (ACL/MCL tear)': {
    medicines: ['Paracetamol/acetaminophen'],
    remedies: ['RICE: Rest, Ice, Compression, Elevation'],
  },
  'Deep Vein Thrombosis (DVT)': {
    medicines: ['Emergency care (anticoagulation requires doctor)'],
    remedies: ['Urgent medical attention'],
  },
  'Varicose Veins': {
    medicines: ['Paracetamol/acetaminophen (as needed)'],
    remedies: ['Leg elevation', 'Compression socks', 'Light walking'],
  },
  'Cervical Spondylosis': {
    medicines: ['Paracetamol/acetaminophen', 'Ibuprofen (if suitable)'],
    remedies: ['Posture optimization', 'Physiotherapy'],
  },
  Whiplash: {
    medicines: ['Paracetamol/acetaminophen'],
    remedies: ['Gentle mobility', 'Ice/heat as appropriate'],
  },
  "Otitis Media (Middle Ear Infection)": {
    medicines: ['Paracetamol/acetaminophen'],
    remedies: ['Medical evaluation if severe or high fever'],
  },
  'Earwax Blockage': {
    medicines: ['Wax softeners (as directed)'],
    remedies: ['Do not insert objects into ear', 'Irrigation by clinician if needed'],
  },
  'Eustachian Tube Dysfunction': {
    medicines: ['Decongestants (short-term, as directed)'],
    remedies: ['Swallowing/yawning maneuvers'],
  },
  'Ruptured Eardrum': {
    medicines: ['Medical care required'],
    remedies: ['Keep ear dry', 'Avoid inserting objects into ear'],
  },
  'Conjunctivitis (Pink Eye)': {
    medicines: ['Artificial tears', 'Antibiotic eye drops if bacterial (doctor advice)'],
    remedies: ['Avoid touching eyes', 'Warm compress'],
  },
  'Dry Eye Syndrome': {
    medicines: ['Artificial tears'],
    remedies: ['Blink breaks', 'Humidify environment'],
  },
  'Corneal Ulcer': {
    medicines: ['Urgent ophthalmology care'],
    remedies: ['Avoid contact lenses', 'Do not self-medicate'],
  },
  Glaucoma: {
    medicines: ['Urgent ophthalmology care'],
    remedies: ['Do not delay'],
  },
  Stye: {
    medicines: ['Lubricating drops'],
    remedies: ['Warm compress', 'Avoid squeezing'],
  },
  'Strep Throat': {
    medicines: ['Paracetamol/acetaminophen', 'Lozenges'],
    remedies: ['Warm salt water gargles', 'Hydration', 'Medical review for antibiotics'],
  },
  'Viral Pharyngitis': {
    medicines: ['Paracetamol/acetaminophen', 'Lozenges', 'Decongestants (as directed)'],
    remedies: ['Warm fluids', 'Rest'],
  },
  'Acid Reflux (LPR)': {
    medicines: ['Antacids', 'Omeprazole (as directed)'],
    remedies: ['Avoid late meals', 'Limit caffeine/spicy foods'],
  },
  Mononucleosis: {
    medicines: ['Paracetamol/acetaminophen'],
    remedies: ['Rest', 'Hydration'],
  },
'Allergic Reaction (Hives)': {
    medicines: ['Antihistamine tablets (as directed)'],
    remedies: ['Avoid trigger', 'Cool compress'],
  },
  'Lymph Node Swelling': {
    medicines: ['Paracetamol/acetaminophen'],
    remedies: ['Rest', 'Hydration', 'Medical review if persistent or with fever'],
  },
  Psoriasis: {
    medicines: ['Moisturizers', 'Hydrocortisone cream (as directed)'],
    remedies: ['Gentle skincare', 'Avoid harsh soaps'],
  },
  'Ringworm (Fungal Infection)': {
    medicines: ['Clotrimazole (antifungal) cream (as directed)'],
    remedies: ['Keep area dry', 'Loose clothing'],
  },
  Shingles: {
    medicines: ['Paracetamol/acetaminophen'],
    remedies: ['Medical advice for antivirals', 'Keep rash clean/dry'],
  },
  Cellulitis: {
    medicines: ['Paracetamol/acetaminophen'],
    remedies: ['Medical assessment (antibiotics may be required)'],
  },
  Acne: {
    medicines: ['Benzoyl peroxide (OTC)', 'Salicylic acid (OTC)'],
    remedies: ['Gentle cleansing', 'Avoid picking'],
  },
  Dermatitis: {
    medicines: ['Hydrocortisone cream (as directed)'],
    remedies: ['Avoid irritants', 'Moisturize'],
  },
  Gout: {
    medicines: ['Paracetamol/acetaminophen (avoid NSAIDs if contraindicated)'],
    remedies: ['Rest joint', 'Hydration', 'Limit purine-rich foods'],
  },
};

// Friendly condition names for everyone + short descriptions and urgency tags
const FRIENDLY_CONDITIONS = {
  // Headaches / Face / Jaw
  'Migraine': { name: 'Migraine', description: 'Throbbing head pain, often with nausea or light sensitivity.' },
  'Sinusitis': { name: 'Sinus infection (sinusitis)', description: 'Facial pressure with blocked/runny nose, worse when bending.' },
  'Tension Headache': { name: 'Tension headache', description: 'Band-like pressure, often linked to stress or posture.' },
  'Cluster Headache': { name: 'Cluster headache', description: 'Severe, one-sided attacks around the eye.', urgency: 'urgent' },
  'Eye Strain': { name: 'Eye strain', description: 'Tired or sore eyes after screens or reading.' },
  'Temporomandibular Joint Disorder (TMJ)': { name: 'Jaw joint problem (TMJ)', description: 'Jaw pain or clicking, worse with chewing.' },
  'Trigeminal Neuralgia': { name: 'Face nerve pain (trigeminal neuralgia)', description: 'Sudden, sharp facial pain.', urgency: 'urgent' },
  'Cervicogenic Headache': { name: 'Neck-related headache', description: 'Headache coming from the neck muscles/joints.' },
  'Non-specific Headache': { name: 'Headache (nonspecific)', description: 'Common headache without a specific pattern.' },

  // Chest / Heart / Lungs
  'Angina': { name: 'Reduced blood flow to the heart (angina)', description: 'Chest pressure with activity, improves with rest.', urgency: 'urgent' },
  'Heart Attack (Myocardial Infarction)': { name: 'Possible heart attack (emergency)', description: 'Chest pain with breathlessness, sweating or nausea.', urgency: 'emergency' },
  'Anxiety/Panic Attack': { name: 'Anxiety or panic attack', description: 'Chest tightness with fast breathing, fear, or tingling.' },
  'Gastroesophageal Reflux (GERD)': { name: 'Acid reflux (heartburn)', description: 'Burning chest pain, sour taste; worse after meals or lying down.' },
  'Costochondritis': { name: 'Chest wall inflammation', description: 'Tender rib area, worse with movement or touch.' },
  'Pneumonia': { name: 'Lung infection (pneumonia)', description: 'Cough, fever, and chest discomfort.', urgency: 'urgent' },
  'Pulmonary Embolism': { name: 'Blood clot in the lung (emergency)', description: 'Sudden chest pain and breathlessness, worse on deep breath.', urgency: 'emergency' },

  // Stomach / Abdomen
  'Gastroenteritis': { name: 'Stomach flu (gastroenteritis)', description: 'Diarrhea, nausea, cramps—usually viral and short-lived.' },
  'Irritable Bowel Syndrome (IBS)': { name: 'Irritable bowel (IBS)', description: 'Cramping, bloating, and bowel habit changes.' },
  'Food Poisoning': { name: 'Food poisoning', description: 'Sudden vomiting/diarrhea after suspect food.' },
  'Gastritis': { name: 'Stomach lining irritation (gastritis)', description: 'Burning upper belly pain, nausea, worse after meals.' },
  'Appendicitis': { name: 'Appendix inflammation (appendicitis)', description: 'Right lower belly pain with fever—needs urgent care.', urgency: 'urgent' },
  'Gallstones': { name: 'Gallstones', description: 'Right upper belly pain after fatty meals.' },
  'Peptic Ulcer': { name: 'Stomach ulcer', description: 'Burning stomach pain, sometimes at night or on empty stomach.' },
  'Pancreatitis': { name: 'Pancreas inflammation', description: 'Severe upper belly pain with nausea—seek medical care.', urgency: 'urgent' },
  'Lactose Intolerance': { name: 'Lactose intolerance (milk sensitivity)', description: 'Bloating/diarrhea after dairy.' },
  'Indigestion (Dyspepsia)': { name: 'Indigestion (dyspepsia)', description: 'Upper belly discomfort or fullness after eating.' },

  // Back / Spine
  'Sciatica': { name: 'Nerve pain down the leg (sciatica)', description: 'Back pain shooting down the leg.' },
  'Herniated Disc': { name: 'Slipped disc (herniated disc)', description: 'Back pain with leg symptoms or numbness.' },
  'Spinal Stenosis': { name: 'Spinal narrowing (stenosis)', description: 'Back/leg pain worse with standing/walking.' },
  'Muscle Strain': { name: 'Muscle strain', description: 'Sore, tight muscles after activity or strain.' },
  'Kidney Stones': { name: 'Kidney stones', description: 'Severe side/back pain that can come in waves.', urgency: 'urgent' },
  'Arthritis': { name: 'Arthritis', description: 'Joint stiffness and ache, worse after rest.' },
  'Osteoporosis-related fracture': { name: 'Fragility fracture (osteoporosis)', description: 'Sudden back pain after minor strain.', urgency: 'urgent' },

  // Legs / Joints / Veins
  'Arthritis (knee)': { name: 'Knee arthritis', description: 'Knee stiffness, swelling, and pain on movement.' },
  'Meniscus Injury (possible)': { name: 'Knee cartilage tear (meniscus)', description: 'Knee pain with clicking or locking.' },
  'Ligament Injury (ACL/MCL tear)': { name: 'Knee ligament injury (ACL/MCL)', description: 'Knee instability after a twist or impact.' },
  'Sprain/Strain': { name: 'Sprain/strain', description: 'Stretched or torn soft tissues from twisting or overuse.' },
  'Tendonitis': { name: 'Tendon inflammation (tendonitis)', description: 'Localized pain worse with use.' },
  'Deep Vein Thrombosis (DVT)': { name: 'Deep vein blood clot (DVT)', description: 'Calf swelling and tenderness—seek urgent care.', urgency: 'urgent' },
  'Varicose Veins': { name: 'Varicose veins', description: 'Bulging leg veins with ache or heaviness.' },
  'Gout': { name: 'Gout', description: 'Sudden red, hot, painful joint (often big toe).' },

  // Neck
  'Cervical Radiculopathy (possible)': { name: 'Pinched nerve in neck', description: 'Neck pain with arm/hand tingling or weakness.' },
  'Cervical Spondylosis': { name: 'Neck arthritis', description: 'Chronic neck stiffness and ache.' },
  'Whiplash': { name: 'Whiplash (neck strain)', description: 'Neck pain after sudden movement.' },
  'Meningitis (possible)': { name: 'Possible meningitis', description: 'Stiff neck with fever—seek urgent care.', urgency: 'urgent' },
  'Lymph Node Swelling': { name: 'Swollen neck glands', description: 'Tender lumps under jaw/neck, often with infection.' },

  // Ear
  "Otitis Media (Middle Ear Infection)": { name: 'Middle ear infection', description: 'Earache with fever or hearing changes.' },
  'Otitis Externa (Swimmer’s Ear)': { name: 'Swimmer’s ear (outer ear infection)', description: 'Ear pain with tenderness of the ear canal.' },
  'Earwax Blockage': { name: 'Earwax blockage', description: 'Fullness, reduced hearing; never insert objects.' },
  'Tinnitus': { name: 'Ringing in the ears (tinnitus)', description: 'Persistent ringing, buzzing, or hissing.' },
  'Eustachian Tube Dysfunction': { name: 'Blocked ear tube', description: 'Fullness and muffled hearing with colds/allergies.' },
  'Ruptured Eardrum': { name: 'Torn eardrum', description: 'Ear pain with discharge or hearing loss—see a doctor.', urgency: 'urgent' },

  // Eye
  'Conjunctivitis (Pink Eye)': { name: 'Pink eye (conjunctivitis)', description: 'Red, sticky eyes—often contagious.' },
  'Dry Eye Syndrome': { name: 'Dry eyes', description: 'Grittiness or burning in the eyes.' },
  'Corneal Ulcer': { name: 'Corneal sore (emergency)', description: 'Severe pain/blurred vision—urgent eye care.', urgency: 'emergency' },
  'Glaucoma': { name: 'High eye pressure (glaucoma)', description: 'Eye pain, halos, blurred vision—urgent if severe.', urgency: 'urgent' },
  'Stye': { name: 'Eyelid stye', description: 'Tender red bump on the eyelid.' },
  'Allergic Conjunctivitis': { name: 'Eye allergy', description: 'Red, itchy, watery eyes with allergies.' },

  // Throat
  'Tonsillitis': { name: 'Tonsil infection (tonsillitis)', description: 'Sore throat with swollen tonsils.' },
  'Strep Throat': { name: 'Strep throat', description: 'Fever and painful swallowing—may need antibiotics.' },
  'Viral Pharyngitis': { name: 'Viral sore throat', description: 'Sore throat with cold-like symptoms.' },
  'Laryngitis': { name: 'Voice box inflammation (laryngitis)', description: 'Hoarse or lost voice.' },
  'Acid Reflux (LPR)': { name: 'Silent reflux (LPR)', description: 'Throat clearing and hoarseness from reflux.' },
  'Mononucleosis': { name: 'Mono (glandular fever)', description: 'Extreme fatigue with sore throat and glands.' },

  // Skin
  'Allergic Reaction (Hives)': { name: 'Hives (allergic reaction)', description: 'Itchy, raised welts on the skin.' },
  'Eczema': { name: 'Eczema (atopic dermatitis)', description: 'Dry, itchy skin patches.' },
  'Psoriasis': { name: 'Psoriasis', description: 'Thick, scaly patches on skin.' },
  'Ringworm (Fungal Infection)': { name: 'Ringworm (fungal)', description: 'Ring-shaped rash—contagious but treatable.' },
  'Shingles': { name: 'Shingles', description: 'Painful, blistering rash—see a clinician.' },
  'Cellulitis': { name: 'Skin infection (cellulitis)', description: 'Red, warm, swollen skin—may need antibiotics.', urgency: 'urgent' },
  'Acne': { name: 'Acne', description: 'Whiteheads, blackheads, or inflamed spots.' },
  'Dermatitis': { name: 'Skin irritation (dermatitis)', description: 'Red, itchy, or flaky patches from irritation.' },
};

function inferConditions(bodyPart, location, symptoms) {
  if (!bodyPart || !location || symptoms.size === 0) return [];
  const has = (s) => symptoms.has(s);

  // Head
  if (bodyPart === 'Head') {
    if (location === 'Forehead') {
      if (has('Nausea') && (has('Sensitivity to light') || has('Headache'))) return ['Migraine', 'Sinusitis', 'Tension Headache', 'Cluster Headache'];
      if (has('Pressure feeling') && has('Headache')) return ['Sinusitis', 'Tension Headache'];
      if (has('Blurred vision')) return ['Eye Strain', 'Migraine'];
      if (has('Tingling sensation')) return ['Trigeminal Neuralgia', 'Tension Headache'];
      return ['Non-specific Headache'];
    }
    if (location === 'Around Eyes') {
      if ((has('Facial pain') && has('Nasal congestion')) || has('Runny nose')) return ['Sinusitis', 'Tension Headache'];
      return ['Non-specific Headache'];
    }
    if (location === 'Jaw') {
      if (has('Pain while chewing') || has('Clicking jaw')) return ['Temporomandibular Joint Disorder (TMJ)'];
      if (has('Tingling sensation')) return ['Trigeminal Neuralgia'];
    }
    if (location === 'Back of Head') {
      if (has('Neck stiffness') || has('Worse with activity')) return ['Cervicogenic Headache', 'Tension Headache'];
      return ['Tension Headache'];
    }
  }

  // Chest examples
  if (bodyPart === 'Chest') {
    if (location === 'Center') {
      if (has('Chest pain') && has('Shortness of breath')) return ['Angina', 'Heart Attack (Myocardial Infarction)', 'Anxiety/Panic Attack', 'Gastroesophageal Reflux (GERD)'];
      if (has('Burning sensation')) return ['Gastroesophageal Reflux (GERD)'];
      return ['Anxiety/Panic Attack', 'Costochondritis'];
    }
    if (location === 'Left Side' && has('Chest pain') && has('Shortness of breath')) return ['Angina', 'Heart Attack (Myocardial Infarction)'];
    if (location === 'Under Breastbone' && has('Burning sensation')) return ['Gastroesophageal Reflux (GERD)'];
    if (location === 'Ribs' && has('Tender to touch')) return ['Costochondritis'];
    if ((location === 'Left Side' || location === 'Right Side' || location === 'Center') && has('Coughing')) return ['Pneumonia'];
    if ((location === 'Left Side' || location === 'Right Side') && has('Shortness of breath') && has('Worse on deep breath')) return ['Pulmonary Embolism'];
  }

  // Abdomen / Stomach
  if (bodyPart === 'Stomach / Abdomen') {
    if (location === 'Lower Stomach') {
      if (has('Diarrhea')) return ['Gastroenteritis', 'Irritable Bowel Syndrome (IBS)', 'Food Poisoning', 'Lactose Intolerance'];
      if (has('Constipation')) return ['Irritable Bowel Syndrome (IBS)'];
      return ['Indigestion (Dyspepsia)'];
    }
    if (location === 'Upper Stomach') {
      if (has('Burning pain') || has('Acid taste') || has('Worse after eating')) return ['Gastritis', 'Peptic Ulcer', 'Gastroesophageal Reflux (GERD)'];
      if (has('Nausea')) return ['Pancreatitis', 'Gastritis'];
      return ['Indigestion (Dyspepsia)'];
    }
    if (location === 'Lower Right (Appendix area)' && has('Sharp pain') && has('Fever') && has('Tenderness')) return ['Appendicitis'];
    if (location === 'Right Upper Quadrant' && has('Worse after fatty meals')) return ['Gallstones'];
  }

  // Back
  if (bodyPart === 'Back') {
    if (location === 'Lower Back') {
      if (has('Radiating pain to legs')) return ['Sciatica', 'Herniated Disc', 'Spinal Stenosis'];
      if (has('Sharp stabbing pain')) return ['Muscle Strain', 'Osteoporosis-related fracture'];
      if (has('Stiffness')) return ['Arthritis', 'Muscle Strain'];
      return ['Muscle Strain'];
    }
    if (location === 'Side of Back' && has('Sharp pain')) return ['Kidney Stones'];
  }

  // Skin
  if (bodyPart === 'Skin') {
    const itchyRash = has('Rash') && has('Itching');
    const redSwollen = has('Redness') && has('Swelling');
    const dryPeeling = has('Dryness') && has('Peeling');
    const blisters = has('Blisters');
    const faceArea = ['Face'].includes(location);
    if (itchyRash) return ['Allergic Reaction (Hives)', 'Dermatitis', 'Eczema'];
    if (dryPeeling) return ['Psoriasis', 'Dermatitis'];
    if (redSwollen) return ['Cellulitis'];
    if (blisters) return ['Shingles', 'Ringworm (Fungal Infection)'];
    if (faceArea && has('Redness')) return ['Acne'];
    return ['Eczema'];
  }

  // Eye
  if (bodyPart === 'Eye') {
    if (location === 'Both Eyes') {
      if (has('Redness') && has('Itching')) return ['Allergic Conjunctivitis', 'Conjunctivitis (Pink Eye)', 'Dry Eye Syndrome'];
      if (has('Pain') && has('Light sensitivity') && has('Blurred vision')) return ['Corneal Ulcer'];
      if (has('Blurred vision') || has('Double vision')) return ['Eye Strain'];
    }
    if ((location === 'Left Eye' || location === 'Right Eye') && has('Redness')) return ['Conjunctivitis (Pink Eye)', 'Dry Eye Syndrome'];
    if ((location === 'Left Eye' || location === 'Right Eye') && has('Pain') && has('Blurred vision')) return ['Glaucoma'];
    if (location === 'Eyelids' && (has('Crusting') || has('Swelling'))) return ['Stye'];
  }

  // Throat
  if (bodyPart === 'Throat') {
    if (location === 'Tonsil Area' && has('White patches') && has('Fever')) return ['Strep Throat', 'Tonsillitis'];
    if (location === 'Tonsil Area' && has('Swelling') && has('Fatigue')) return ['Mononucleosis'];
    if (location === 'Upper Throat' && has('Sore throat')) return ['Viral Pharyngitis'];
    if (location === 'Voice Box (Larynx)' && has('Hoarseness')) return ['Laryngitis', 'Acid Reflux (LPR)'];
  }

  // Neck
  if (bodyPart === 'Neck') {
    if (location === 'Base of Neck' && has('Numbness/tingling')) return ['Cervical Radiculopathy (possible)', 'Herniated Disc'];
    if (location === 'Front' && (has('Tender lymph nodes') || has('Swelling'))) return ['Lymph Node Swelling'];
    if ((location === 'Front' || location === 'Back') && has('Stiffness') && has('Fever')) return ['Meningitis (possible)'];
    if (has('Stiffness')) return ['Muscle Strain', 'Cervical Spondylosis', 'Whiplash'];
  }

  // Hand
  if (bodyPart === 'Hand' && location === 'Wrist' && (has('Tingling') || has('Numbness'))) return ['Carpal Tunnel Syndrome (possible)'];

  // Ear
  if (bodyPart === 'Ear') {
    if (location === 'Inner Ear' && has('Earache') && has('Fever')) return ['Otitis Media (Middle Ear Infection)'];
    if (location === 'Outer Ear' && (has('Pain') || has('Swelling'))) return ['Otitis Externa (Swimmer’s Ear)'];
    if (location === 'Ear Canal' && has('Wax buildup')) return ['Earwax Blockage'];
    if (location === 'Inner Ear' && has('Ringing')) return ['Tinnitus'];
    if (location === 'Inner Ear' && has('Fullness') && has('Hearing loss')) return ['Eustachian Tube Dysfunction'];
    if (location === 'Ear Canal' && has('Discharge') && has('Pain on pulling ear')) return ['Ruptured Eardrum'];
  }

  // Leg / Knee / Ankle
  if (bodyPart === 'Leg') {
    if (location === 'Knee' && (has('Swelling') || has('Stiffness')) && has('Clicking sound')) return ['Arthritis', 'Meniscus Injury (possible)', 'Ligament Injury (ACL/MCL tear)'];
    if (location === 'Calf' && has('Swelling') && has('Tenderness')) return ['Deep Vein Thrombosis (DVT)', 'Varicose Veins'];
    if (location === 'Ankle' && (has('Instability') || has('Swelling'))) return ['Sprain/Strain', 'Tendonitis'];
    if (location === 'Toes' && has('Redness') && has('Swelling') && has('Pain')) return ['Gout'];
  }

  // Fallbacks
  if (has('Dull ache') || has('Stiffness')) return ['Muscle Strain'];
  return ['Muscle Strain'];
}

export default function SymptomChecker() {
  const [bodyPart, setBodyPart] = useState('');
  const [location, setLocation] = useState('');
  const [symptoms, setSymptoms] = useState(new Set());
  const [possibleConditions, setPossibleConditions] = useState([]);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [symptomQuery, setSymptomQuery] = useState('');

const locations = useMemo(() => (bodyPart ? PAIN_LOCATIONS[bodyPart] : []), [bodyPart]);
const symptomList = useMemo(() => (bodyPart && location ? (SYMPTOMS_BY_LOCATION[bodyPart]?.[location] || []) : []), [bodyPart, location]);
  const filteredSymptomList = useMemo(() => {
    const q = symptomQuery.trim().toLowerCase();
    if (!q) return symptomList;
    return symptomList.filter(s => s.toLowerCase().includes(q));
  }, [symptomQuery, symptomList]);
  const displayConditions = useMemo(() => (
    possibleConditions.map((c) => {
      const meta = FRIENDLY_CONDITIONS[c] || {};
      return {
        key: c,
        name: meta.name || c,
        description: meta.description || 'Common, non-specific possibility.',
        urgency: meta.urgency || 'info',
      };
    })
  ), [possibleConditions]);

  const toggleSymptom = (s) => {
    setSymptoms(prev => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s); else next.add(s);
      return next;
    });
  };

  const canCheck = bodyPart && location && symptoms.size > 0;

  const onCheck = () => {
    const conds = inferConditions(bodyPart, location, symptoms);
    setPossibleConditions(conds);
    setSelectedCondition(null);
  };

  const resetAll = () => {
    setBodyPart('');
    setLocation('');
    setSymptoms(new Set());
    setPossibleConditions([]);
    setSelectedCondition(null);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Symptom Checker</h1>

      {/* Step 1 */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Step 1: Select Body Part</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Body Part</label>
            <select
              className="input"
              value={bodyPart}
              onChange={(e) => {
                setBodyPart(e.target.value);
                setLocation('');
                setSymptoms(new Set());
                setPossibleConditions([]);
                setSelectedCondition(null);
              }}
            >
              <option value="">Select...</option>
              {BODY_PARTS.map(bp => (
                <option key={bp} value={bp}>{bp}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Pain Location</label>
            <select
              className="input disabled:bg-gray-100"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setSymptoms(new Set());
                setPossibleConditions([]);
                setSelectedCondition(null);
              }}
              disabled={!bodyPart}
            >
              <option value="">{bodyPart ? 'Select location...' : 'Select body part first'}</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>
        <button type="button" onClick={resetAll} className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 mt-4">Reset</button>
      </div>

      {/* Step 2 */}
      {location && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Step 2: Select Symptoms</h2>

          {/* Search + selected chips */}
          <div className="mb-4 flex items-center gap-2">
            <div className="relative w-full">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={symptomQuery}
                onChange={(e) => setSymptomQuery(e.target.value)}
                placeholder="Search symptoms..."
                className="w-full rounded-md border pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {symptomQuery && (
              <button onClick={() => setSymptomQuery('')} className="inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <FiRefreshCw /> Clear
              </button>
            )}
          </div>

          {symptoms.size > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {Array.from(symptoms).map((s) => (
                <button key={s} onClick={() => toggleSymptom(s)} className="rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-700 hover:bg-indigo-100">
                  {s} ×
                </button>
              ))}
            </div>
          )}

          {filteredSymptomList.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filteredSymptomList.map(s => (
                <label key={s} className="flex cursor-pointer items-center gap-3 rounded-md border p-3 hover:bg-gray-50">
                  <input type="checkbox" className="h-4 w-4" checked={symptoms.has(s)} onChange={() => toggleSymptom(s)} />
                  <span className="text-sm text-gray-800">{s}</span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No matching symptoms.</p>
          )}

          <div className="mt-4 flex items-center gap-2">
            <button type="button" onClick={onCheck} disabled={!canCheck} className={`btn ${canCheck ? 'btn-primary' : 'bg-gray-400 text-white cursor-not-allowed'}`}>
              Check Symptoms
            </button>
            {symptoms.size > 0 && (
              <button type="button" onClick={() => setSymptoms(new Set())} className="inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <FiRefreshCw /> Clear selected
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 3 */}
      {possibleConditions.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Step 3: Possible Conditions</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {displayConditions.map((cond) => (
              <button
                key={cond.key}
                type="button"
                onClick={() => setSelectedCondition(cond.key)}
                className={`text-left rounded-lg border p-4 shadow-sm transition hover:shadow-md ${selectedCondition === cond.key ? 'ring-2 ring-indigo-500' : ''}`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{cond.name}</h3>
                  {cond.urgency === 'emergency' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                      <FiAlertTriangle /> Emergency
                    </span>
                  ) : cond.urgency === 'urgent' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                      <FiAlertTriangle /> Urgent
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      <FiCheckCircle /> Common
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{cond.description}</p>
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-500">These results are informational and not a diagnosis.</p>
        </div>
      )}

      {/* Step 4 */}
      {selectedCondition && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Step 4: Medicines & Tips</h2>
          <h3 className="mb-2 text-base font-semibold">{selectedCondition}</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-md border p-3">
              <h4 className="mb-2 text-sm font-semibold text-gray-800">Suggested Medicines</h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                {(CONDITION_DETAILS[selectedCondition]?.medicines || ['OTC options as directed']).map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-md border p-3">
              <h4 className="mb-2 text-sm font-semibold text-gray-800">Home Remedies</h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                {(CONDITION_DETAILS[selectedCondition]?.remedies || ['Rest', 'Hydration']).map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-md border p-3">
              <h4 className="mb-2 text-sm font-semibold text-gray-800">Warning</h4>
              <p className="text-sm text-red-700">Consult a doctor if symptoms persist, worsen, or are severe.</p>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-600">
            ⚠️ Note: Prescription medicines should only be taken under doctor guidance.
          </div>
        </div>
      )}
    </div>
  );
}
