import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const NearbyHospitals = () => {
  const [location, setLocation] = useState({ lat: 12.9716, lng: 77.5946 });
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [showEmergencyOnly, setShowEmergencyOnly] = useState(false);

  const { currentUser } = useAuth();

  // City-specific hospital data
  const cityHospitals = {
    'tumkur': [
      {
        id: 1,
        name: 'Tumkur District Hospital',
        address: 'Hospital Road, Tumkur, Karnataka 572101',
        phone: '+91 816-227-1234',
        rating: 4.2,
        emergency: true,
        open_now: true,
        user_ratings_total: 85,
        specialties: ['General Medicine', 'Surgery', 'Emergency Care'],
        lat: 13.3417,
        lng: 77.1017
      },
      {
        id: 2,
        name: 'Sri Siddhartha Medical College Hospital',
        address: 'NH-4, Agalakote, Tumkur, Karnataka 572107',
        phone: '+91 816-227-5678',
        rating: 4.5,
        emergency: true,
        open_now: true,
        user_ratings_total: 120,
        specialties: ['Cardiology', 'Neurology', 'Orthopedics'],
        lat: 13.3450,
        lng: 77.1050
      },
      {
        id: 3,
        name: 'Tumkur City Medical Center',
        address: 'Main Market Road, Tumkur, Karnataka 572101',
        phone: '+91 816-227-9012',
        rating: 3.8,
        emergency: false,
        open_now: true,
        user_ratings_total: 65,
        specialties: ['Family Medicine', 'Dermatology', 'Pediatrics'],
        lat: 13.3380,
        lng: 77.0980
      },
      {
        id: 4,
        name: 'Tumkur Emergency Care Hospital',
        address: 'Railway Station Road, Tumkur, Karnataka 572101',
        phone: '+91 816-227-3456',
        rating: 4.7,
        emergency: true,
        open_now: true,
        user_ratings_total: 95,
        specialties: ['Emergency Medicine', 'Trauma Care', 'Critical Care'],
        lat: 13.3430,
        lng: 77.1030
      },
      {
        id: 5,
        name: 'Tumkur Community Health Center',
        address: 'Gubbi Road, Tumkur, Karnataka 572101',
        phone: '+91 816-227-7890',
        rating: 4.0,
        emergency: false,
        open_now: false,
        user_ratings_total: 75,
        specialties: ['Community Health', 'Preventive Care', 'Maternal Health'],
        lat: 13.3400,
        lng: 77.1000
      },
      {
        id: 6,
        name: 'Tumkur Multi-Specialty Hospital',
        address: 'B.H. Road, Tumkur, Karnataka 572101',
        phone: '+91 816-227-2345',
        rating: 4.3,
        emergency: true,
        open_now: true,
        user_ratings_total: 110,
        specialties: ['Cardiology', 'Orthopedics', 'General Surgery'],
        lat: 13.3420,
        lng: 77.1020
      },
      {
        id: 7,
        name: 'Tumkur Women & Children Hospital',
        address: 'Siddaganga Road, Tumkur, Karnataka 572101',
        phone: '+91 816-227-6789',
        rating: 4.1,
        emergency: false,
        open_now: true,
        user_ratings_total: 90,
        specialties: ['Gynecology', 'Pediatrics', 'Obstetrics'],
        lat: 13.3390,
        lng: 77.0990
      },
      {
        id: 8,
        name: 'Tumkur Orthopedic Center',
        address: 'Kunigal Road, Tumkur, Karnataka 572101',
        phone: '+91 816-227-4567',
        rating: 4.4,
        emergency: false,
        open_now: true,
        user_ratings_total: 85,
        specialties: ['Orthopedics', 'Sports Medicine', 'Rehabilitation'],
        lat: 13.3440,
        lng: 77.1040
      },
      {
        id: 9,
        name: 'Tumkur Eye Care Hospital',
        address: 'Mysore Road, Tumkur, Karnataka 572101',
        phone: '+91 816-227-8901',
        rating: 4.6,
        emergency: false,
        open_now: true,
        user_ratings_total: 70,
        specialties: ['Ophthalmology', 'Eye Surgery', 'Retina Care'],
        lat: 13.3370,
        lng: 77.0970
      },
      {
        id: 10,
        name: 'Tumkur Dental Care Center',
        address: 'Market Street, Tumkur, Karnataka 572101',
        phone: '+91 816-227-0123',
        rating: 3.9,
        emergency: false,
        open_now: true,
        user_ratings_total: 55,
        specialties: ['Dentistry', 'Oral Surgery', 'Orthodontics'],
        lat: 13.3410,
        lng: 77.1010
      },
      {
        id: 11,
        name: 'Tumkur Heart Institute',
        address: 'Bypass Road, Tumkur, Karnataka 572101',
        phone: '+91 816-227-3456',
        rating: 4.8,
        emergency: true,
        open_now: true,
        user_ratings_total: 130,
        specialties: ['Cardiology', 'Cardiac Surgery', 'Interventional Cardiology'],
        lat: 13.3460,
        lng: 77.1060
      },
      {
        id: 12,
        name: 'Tumkur Cancer Care Center',
        address: 'Industrial Area, Tumkur, Karnataka 572101',
        phone: '+91 816-227-7890',
        rating: 4.5,
        emergency: true,
        open_now: true,
        user_ratings_total: 95,
        specialties: ['Oncology', 'Radiation Therapy', 'Medical Oncology'],
        lat: 13.3435,
        lng: 77.1035
      }
    ],
    'bangalore': [
      {
        id: 1,
        name: 'Apollo Hospitals',
        address: '154, Bannerghatta Road, Bangalore, Karnataka 560076',
        phone: '+91 80-2630-4050',
        rating: 4.6,
        emergency: true,
        open_now: true,
        user_ratings_total: 450,
        specialties: ['Cardiology', 'Neurology', 'Oncology'],
        lat: 12.9716,
        lng: 77.5946
      },
      {
        id: 2,
        name: 'Fortis Hospital',
        address: '154, Bannerghatta Road, Bangalore, Karnataka 560076',
        phone: '+91 80-2630-4050',
        rating: 4.4,
        emergency: true,
        open_now: true,
        user_ratings_total: 380,
        specialties: ['Orthopedics', 'Urology', 'ENT'],
        lat: 12.9750,
        lng: 77.5980
      },
      {
        id: 3,
        name: 'Manipal Hospital',
        address: '98, HAL Airport Road, Bangalore, Karnataka 560017',
        phone: '+91 80-2502-4444',
        rating: 4.8,
        emergency: true,
        open_now: true,
        user_ratings_total: 520,
        specialties: ['Cardiology', 'Neurology', 'Emergency Medicine'],
        lat: 12.9680,
        lng: 77.5900
      },
      {
        id: 4,
        name: 'Narayana Health',
        address: '258/A, Bommasandra Industrial Area, Bangalore, Karnataka 560099',
        phone: '+91 80-2222-7777',
        rating: 4.5,
        emergency: true,
        open_now: true,
        user_ratings_total: 400,
        specialties: ['Cardiology', 'Neurology', 'Transplant'],
        lat: 12.9740,
        lng: 77.5960
      },
      {
        id: 5,
        name: 'Sparsh Hospital',
        address: '29/P1, 29th Cross, 11th Main, Banashankari 2nd Stage, Bangalore',
        phone: '+91 80-2670-1000',
        rating: 4.3,
        emergency: false,
        open_now: true,
        user_ratings_total: 280,
        specialties: ['Orthopedics', 'Sports Medicine', 'Rehabilitation'],
        lat: 12.9690,
        lng: 77.5920
      },
      {
        id: 6,
        name: 'Columbia Asia Hospital',
        address: 'Sarjapur Road, Bangalore, Karnataka 560034',
        phone: '+91 80-3989-8989',
        rating: 4.2,
        emergency: true,
        open_now: true,
        user_ratings_total: 320,
        specialties: ['Multi-Specialty', 'Emergency Care', 'General Medicine'],
        lat: 12.9730,
        lng: 77.5950
      },
      {
        id: 7,
        name: 'KIMS Hospital',
        address: 'Banashankari, Bangalore, Karnataka 560070',
        phone: '+91 80-2660-1000',
        rating: 4.1,
        emergency: true,
        open_now: true,
        user_ratings_total: 290,
        specialties: ['General Medicine', 'Surgery', 'Emergency Care'],
        lat: 12.9700,
        lng: 77.5930
      },
      {
        id: 8,
        name: 'BGS Global Hospital',
        address: 'Kengeri, Bangalore, Karnataka 560060',
        phone: '+91 80-2849-1000',
        rating: 4.4,
        emergency: true,
        open_now: true,
        user_ratings_total: 350,
        specialties: ['Multi-Specialty', 'Transplant', 'Emergency Care'],
        lat: 12.9760,
        lng: 77.5990
      },
      {
        id: 9,
        name: 'Sakra World Hospital',
        address: 'Devarabeesanahalli, Bangalore, Karnataka 560103',
        phone: '+91 80-4960-4960',
        rating: 4.7,
        emergency: true,
        open_now: true,
        user_ratings_total: 480,
        specialties: ['Multi-Specialty', 'Neurosurgery', 'Cardiology'],
        lat: 12.9670,
        lng: 77.5890
      },
      {
        id: 10,
        name: 'Kauvery Hospital',
        address: 'Electronic City, Bangalore, Karnataka 560100',
        phone: '+91 80-2849-1000',
        rating: 4.0,
        emergency: true,
        open_now: true,
        user_ratings_total: 220,
        specialties: ['General Medicine', 'Surgery', 'Emergency Care'],
        lat: 12.9720,
        lng: 77.5940
      },
      {
        id: 11,
        name: 'Rainbow Children Hospital',
        address: 'Marathahalli, Bangalore, Karnataka 560037',
        phone: '+91 80-2849-1000',
        rating: 4.3,
        emergency: false,
        open_now: true,
        user_ratings_total: 180,
        specialties: ['Pediatrics', 'Neonatology', 'Child Care'],
        lat: 12.9685,
        lng: 77.5905
      },
      {
        id: 12,
        name: 'Narayana Nethralaya',
        address: 'Rajajinagar, Bangalore, Karnataka 560010',
        phone: '+91 80-2849-1000',
        rating: 4.6,
        emergency: false,
        open_now: true,
        user_ratings_total: 310,
        specialties: ['Ophthalmology', 'Eye Surgery', 'Retina Care'],
        lat: 12.9745,
        lng: 77.5965
      },
      {
        id: 13,
        name: 'Dental Solutions',
        address: 'Indiranagar, Bangalore, Karnataka 560038',
        phone: '+91 80-2849-1000',
        rating: 4.2,
        emergency: false,
        open_now: true,
        user_ratings_total: 150,
        specialties: ['Dentistry', 'Oral Surgery', 'Orthodontics'],
        lat: 12.9715,
        lng: 77.5945
      },
      {
        id: 14,
        name: 'Bangalore Medical College',
        address: 'KR Road, Bangalore, Karnataka 560002',
        phone: '+91 80-2849-1000',
        rating: 4.0,
        emergency: true,
        open_now: true,
        user_ratings_total: 420,
        specialties: ['Teaching Hospital', 'All Specialties', 'Research'],
        lat: 12.9695,
        lng: 77.5925
      },
      {
        id: 15,
        name: 'Victoria Hospital',
        address: 'Fort Road, Bangalore, Karnataka 560002',
        phone: '+91 80-2849-1000',
        rating: 3.8,
        emergency: true,
        open_now: true,
        user_ratings_total: 380,
        specialties: ['General Medicine', 'Surgery', 'Emergency Care'],
        lat: 12.9735,
        lng: 77.5955
      }
    ],
    'mysore': [
      {
        id: 1,
        name: 'KR Hospital (Krishnarajendra Hospital)',
        address: 'Irwin Road, Mysore, Karnataka 570001',
        phone: '+91 821-242-5461',
        rating: 4.1,
        emergency: true,
        open_now: true,
        user_ratings_total: 280,
        specialties: ['General Medicine', 'Surgery', 'Emergency Care'],
        lat: 12.3052,
        lng: 76.6551
      },
      {
        id: 2,
        name: 'Columbia Asia Hospital',
        address: 'Kuvempunagar, Mysore, Karnataka 570023',
        phone: '+91 821-710-0100',
        rating: 4.5,
        emergency: true,
        open_now: true,
        user_ratings_total: 420,
        specialties: ['Multi-Specialty', 'Cardiology', 'Emergency Care'],
        lat: 12.2958,
        lng: 76.6394
      },
      {
        id: 3,
        name: 'Apollo BGS Hospitals',
        address: 'Adichunchanagiri Road, Mysore, Karnataka 570023',
        phone: '+91 821-256-6789',
        rating: 4.4,
        emergency: true,
        open_now: true,
        user_ratings_total: 380,
        specialties: ['Cardiology', 'Neurology', 'Orthopedics'],
        lat: 12.2920,
        lng: 76.6350
      },
      {
        id: 4,
        name: 'Vikram Hospital',
        address: 'No. 11/1, Curzon Park Road, Mysore, Karnataka 570001',
        phone: '+91 821-425-3311',
        rating: 4.0,
        emergency: false,
        open_now: true,
        user_ratings_total: 220,
        specialties: ['General Medicine', 'Surgery', 'Pediatrics'],
        lat: 12.3080,
        lng: 76.6580
      },
      {
        id: 5,
        name: 'Bharani Hospital',
        address: 'JLB Road, Mysore, Karnataka 570004',
        phone: '+91 821-242-2775',
        rating: 3.9,
        emergency: true,
        open_now: true,
        user_ratings_total: 180,
        specialties: ['Emergency Medicine', 'General Surgery', 'ICU'],
        lat: 12.3100,
        lng: 76.6600
      }
    ],
    'mangalore': [
      {
        id: 1,
        name: 'Kasturba Medical College Hospital',
        address: 'Attavar, Mangalore, Karnataka 575001',
        phone: '+91 824-242-3030',
        rating: 4.6,
        emergency: true,
        open_now: true,
        user_ratings_total: 650,
        specialties: ['All Specialties', 'Teaching Hospital', 'Research'],
        lat: 12.9141,
        lng: 74.8560
      },
      {
        id: 2,
        name: 'AJ Hospital',
        address: 'Kuntikan, Mangalore, Karnataka 575004',
        phone: '+91 824-422-5533',
        rating: 4.4,
        emergency: true,
        open_now: true,
        user_ratings_total: 480,
        specialties: ['Multi-Specialty', 'Cardiology', 'Emergency Care'],
        lat: 12.9200,
        lng: 74.8620
      },
      {
        id: 3,
        name: 'Yenepoya Medical College Hospital',
        address: 'University Road, Deralakatte, Mangalore, Karnataka 575018',
        phone: '+91 824-220-4668',
        rating: 4.3,
        emergency: true,
        open_now: true,
        user_ratings_total: 390,
        specialties: ['Teaching Hospital', 'Multi-Specialty', 'Research'],
        lat: 12.9180,
        lng: 74.8650
      },
      {
        id: 4,
        name: 'Highland Hospital',
        address: 'Padil, Mangalore, Karnataka 575007',
        phone: '+91 824-222-1100',
        rating: 4.2,
        emergency: false,
        open_now: true,
        user_ratings_total: 290,
        specialties: ['General Medicine', 'Surgery', 'Orthopedics'],
        lat: 12.9080,
        lng: 74.8480
      },
      {
        id: 5,
        name: 'Indiana Hospital',
        address: 'Kadri Hills, Mangalore, Karnataka 575002',
        phone: '+91 824-242-9999',
        rating: 4.1,
        emergency: true,
        open_now: true,
        user_ratings_total: 320,
        specialties: ['Multi-Specialty', 'Emergency Care', 'ICU'],
        lat: 12.9160,
        lng: 74.8540
      }
    ],
    'hubli': [
      {
        id: 1,
        name: 'KIMS Hospital',
        address: 'PB Road, Hubli, Karnataka 580020',
        phone: '+91 836-237-3737',
        rating: 4.3,
        emergency: true,
        open_now: true,
        user_ratings_total: 420,
        specialties: ['Multi-Specialty', 'Cardiology', 'Emergency Care'],
        lat: 15.3647,
        lng: 75.1240
      },
      {
        id: 2,
        name: 'SDM College of Medical Sciences Hospital',
        address: 'Sattur, Dharwad, Karnataka 580009',
        phone: '+91 836-246-2792',
        rating: 4.2,
        emergency: true,
        open_now: true,
        user_ratings_total: 380,
        specialties: ['Teaching Hospital', 'All Specialties', 'Research'],
        lat: 15.3700,
        lng: 75.1300
      },
      {
        id: 3,
        name: 'Niramaya Hospital',
        address: '5th Cross, Vidyanagar, Hubli, Karnataka 580031',
        phone: '+91 836-235-8888',
        rating: 4.0,
        emergency: false,
        open_now: true,
        user_ratings_total: 250,
        specialties: ['General Medicine', 'Surgery', 'Pediatrics'],
        lat: 15.3620,
        lng: 75.1180
      },
      {
        id: 4,
        name: 'Rao Hospital',
        address: 'Club Road, Hubli, Karnataka 580029',
        phone: '+91 836-236-7890',
        rating: 3.8,
        emergency: true,
        open_now: true,
        user_ratings_total: 190,
        specialties: ['Emergency Medicine', 'General Surgery', 'ICU'],
        lat: 15.3680,
        lng: 75.1260
      },
      {
        id: 5,
        name: 'Apex Hospital',
        address: 'Gokul Road, Hubli, Karnataka 580030',
        phone: '+91 836-238-1234',
        rating: 4.1,
        emergency: true,
        open_now: true,
        user_ratings_total: 310,
        specialties: ['Multi-Specialty', 'Cardiology', 'Neurology'],
        lat: 15.3590,
        lng: 75.1120
      }
    ],
    'belgaum': [
      {
        id: 1,
        name: 'KLE Hospital',
        address: 'Nehru Nagar, Belgaum, Karnataka 590010',
        phone: '+91 831-247-2777',
        rating: 4.4,
        emergency: true,
        open_now: true,
        user_ratings_total: 520,
        specialties: ['Multi-Specialty', 'Teaching Hospital', 'Research'],
        lat: 15.8497,
        lng: 74.4977
      },
      {
        id: 2,
        name: 'District Hospital Belgaum',
        address: 'Tilakwadi, Belgaum, Karnataka 590006',
        phone: '+91 831-243-1234',
        rating: 3.9,
        emergency: true,
        open_now: true,
        user_ratings_total: 280,
        specialties: ['General Medicine', 'Surgery', 'Emergency Care'],
        lat: 15.8550,
        lng: 74.5050
      },
      {
        id: 3,
        name: 'Prabhakar Kore Hospital',
        address: 'Nehru Nagar, Belgaum, Karnataka 590010',
        phone: '+91 831-247-2500',
        rating: 4.2,
        emergency: true,
        open_now: true,
        user_ratings_total: 390,
        specialties: ['Multi-Specialty', 'Cardiology', 'Emergency Care'],
        lat: 15.8480,
        lng: 74.4960
      },
      {
        id: 4,
        name: 'Vivekanand Hospital',
        address: 'Shahapur, Belgaum, Karnataka 590003',
        phone: '+91 831-242-5678',
        rating: 4.0,
        emergency: false,
        open_now: true,
        user_ratings_total: 220,
        specialties: ['General Medicine', 'Surgery', 'Pediatrics'],
        lat: 15.8520,
        lng: 74.5020
      },
      {
        id: 5,
        name: 'Shri B.M. Patil Hospital',
        address: 'Vijayapur Road, Belgaum, Karnataka 590018',
        phone: '+91 831-244-3333',
        rating: 4.3,
        emergency: true,
        open_now: true,
        user_ratings_total: 450,
        specialties: ['Teaching Hospital', 'All Specialties', 'Research'],
        lat: 15.8450,
        lng: 74.4900
      }
    ],
    'davangere': [
      {
        id: 1,
        name: 'SS Hospital',
        address: 'MCC A Block, Davangere, Karnataka 577004',
        phone: '+91 819-224-5555',
        rating: 4.2,
        emergency: true,
        open_now: true,
        user_ratings_total: 380,
        specialties: ['Multi-Specialty', 'Cardiology', 'Emergency Care'],
        lat: 14.4644,
        lng: 75.9218
      },
      {
        id: 2,
        name: 'District Hospital Davangere',
        address: 'Hospital Road, Davangere, Karnataka 577002',
        phone: '+91 819-222-1234',
        rating: 3.8,
        emergency: true,
        open_now: true,
        user_ratings_total: 250,
        specialties: ['General Medicine', 'Surgery', 'Emergency Care'],
        lat: 14.4700,
        lng: 75.9300
      },
      {
        id: 3,
        name: 'Chigateri Hospital',
        address: 'Bapuji Nagar, Davangere, Karnataka 577003',
        phone: '+91 819-223-4567',
        rating: 4.0,
        emergency: false,
        open_now: true,
        user_ratings_total: 190,
        specialties: ['General Medicine', 'Surgery', 'Pediatrics'],
        lat: 14.4680,
        lng: 75.9280
      },
      {
        id: 4,
        name: 'Bapuji Hospital',
        address: 'JC Extension, Davangere, Karnataka 577002',
        phone: '+91 819-224-7890',
        rating: 4.1,
        emergency: true,
        open_now: true,
        user_ratings_total: 320,
        specialties: ['Multi-Specialty', 'Emergency Care', 'ICU'],
        lat: 14.4620,
        lng: 75.9180
      },
      {
        id: 5,
        name: 'Shridevi Hospital',
        address: '8th Main Road, Davangere, Karnataka 577001',
        phone: '+91 819-225-1111',
        rating: 3.9,
        emergency: false,
        open_now: true,
        user_ratings_total: 160,
        specialties: ['General Medicine', 'Gynecology', 'Pediatrics'],
        lat: 14.4590,
        lng: 75.9150
      }
    ],
    'mumbai': [
      {
        id: 1,
        name: 'Kokilaben Dhirubhai Ambani Hospital',
        address: 'Rao Saheb Achutrao Patwardhan Marg, Four Bungalows, Mumbai, Maharashtra 400053',
        phone: '+91 22-3099-9999',
        rating: 4.7,
        emergency: true,
        open_now: true,
        user_ratings_total: 600,
        specialties: ['Cardiology', 'Neurology', 'Oncology'],
        lat: 19.0760,
        lng: 72.8777
      },
      {
        id: 2,
        name: 'Lilavati Hospital',
        address: 'A-791, Bandra Reclamation, Bandra West, Mumbai, Maharashtra 400050',
        phone: '+91 22-2675-1000',
        rating: 4.5,
        emergency: true,
        open_now: true,
        user_ratings_total: 480,
        specialties: ['Orthopedics', 'Urology', 'ENT'],
        lat: 19.0780,
        lng: 72.8790
      },
      {
        id: 3,
        name: 'Tata Memorial Hospital',
        address: 'Dr. E Borges Road, Parel, Mumbai, Maharashtra 400012',
        phone: '+91 22-2417-7000',
        rating: 4.8,
        emergency: true,
        open_now: true,
        user_ratings_total: 750,
        specialties: ['Oncology', 'Radiation Therapy', 'Surgical Oncology'],
        lat: 19.0740,
        lng: 72.8750
      },
      {
        id: 4,
        name: 'Breach Candy Hospital',
        address: '60, Bhulabhai Desai Road, Mumbai, Maharashtra 400026',
        phone: '+91 22-2367-2888',
        rating: 4.4,
        emergency: true,
        open_now: true,
        user_ratings_total: 320,
        specialties: ['General Medicine', 'Surgery', 'Emergency Care'],
        lat: 19.0800,
        lng: 72.8810
      },
      {
        id: 5,
        name: 'Bombay Hospital',
        address: '12, New Marine Lines, Mumbai, Maharashtra 400020',
        phone: '+91 22-2206-7676',
        rating: 4.2,
        emergency: false,
        open_now: true,
        user_ratings_total: 280,
        specialties: ['General Medicine', 'Surgery', 'Pediatrics'],
        lat: 19.0720,
        lng: 72.8730
      },
      {
        id: 6,
        name: 'Jaslok Hospital',
        address: '15, Dr. G. Deshmukh Marg, Mumbai, Maharashtra 400026',
        phone: '+91 22-6657-3333',
        rating: 4.6,
        emergency: true,
        open_now: true,
        user_ratings_total: 520,
        specialties: ['Multi-Specialty', 'Cardiology', 'Neurology'],
        lat: 19.0790,
        lng: 72.8800
      },
      {
        id: 7,
        name: 'Saifee Hospital',
        address: '15/17, Maharshi Karve Road, Mumbai, Maharashtra 400004',
        phone: '+91 22-6757-0111',
        rating: 4.3,
        emergency: true,
        open_now: true,
        user_ratings_total: 380,
        specialties: ['General Medicine', 'Surgery', 'Emergency Care'],
        lat: 19.0810,
        lng: 72.8820
      },
      {
        id: 8,
        name: 'Hinduja Hospital',
        address: 'Veer Savarkar Marg, Mahim, Mumbai, Maharashtra 400016',
        phone: '+91 22-2444-9191',
        rating: 4.7,
        emergency: true,
        open_now: true,
        user_ratings_total: 580,
        specialties: ['Multi-Specialty', 'Transplant', 'Emergency Care'],
        lat: 19.0750,
        lng: 72.8760
      },
      {
        id: 9,
        name: 'Nanavati Hospital',
        address: 'S.V. Road, Vile Parle West, Mumbai, Maharashtra 400056',
        phone: '+91 22-2626-7500',
        rating: 4.5,
        emergency: true,
        open_now: true,
        user_ratings_total: 450,
        specialties: ['Multi-Specialty', 'Cardiology', 'Neurology'],
        lat: 19.0770,
        lng: 72.8780
      },
      {
        id: 10,
        name: 'Wockhardt Hospital',
        address: 'Mira Road, Mumbai, Maharashtra 401107',
        phone: '+91 22-6178-4444',
        rating: 4.1,
        emergency: true,
        open_now: true,
        user_ratings_total: 290,
        specialties: ['General Medicine', 'Surgery', 'Emergency Care'],
        lat: 19.0730,
        lng: 72.8740
      },
      {
        id: 11,
        name: 'SevenHills Hospital',
        address: 'Marol Maroshi Road, Andheri East, Mumbai, Maharashtra 400059',
        phone: '+91 22-6767-6767',
        rating: 4.4,
        emergency: true,
        open_now: true,
        user_ratings_total: 360,
        specialties: ['Multi-Specialty', 'Emergency Care', 'General Medicine'],
        lat: 19.0765,
        lng: 72.8775
      },
      {
        id: 12,
        name: 'Fortis Hospital',
        address: 'Mulund Goregaon Link Road, Mulund West, Mumbai, Maharashtra 400080',
        phone: '+91 22-4111-4111',
        rating: 4.3,
        emergency: true,
        open_now: true,
        user_ratings_total: 340,
        specialties: ['Multi-Specialty', 'Emergency Care', 'General Medicine'],
        lat: 19.0745,
        lng: 72.8755
      }
    ],
    'delhi': [
      {
        id: 1,
        name: 'AIIMS Delhi',
        address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi, Delhi 110029',
        phone: '+91 11-2658-8500',
        rating: 4.9,
        emergency: true,
        open_now: true,
        user_ratings_total: 1200,
        specialties: ['All Specialties', 'Research', 'Teaching Hospital'],
        lat: 28.7041,
        lng: 77.1025
      },
      {
        id: 2,
        name: 'Safdarjung Hospital',
        address: 'Ansari Nagar West, New Delhi, Delhi 110021',
        phone: '+91 11-2670-7444',
        rating: 4.3,
        emergency: true,
        open_now: true,
        user_ratings_total: 850,
        specialties: ['General Medicine', 'Surgery', 'Emergency Care'],
        lat: 28.7080,
        lng: 77.1060
      },
      {
        id: 3,
        name: 'Max Super Speciality Hospital',
        address: '1, 2, Press Enclave Road, Saket, New Delhi, Delhi 110017',
        phone: '+91 11-4055-4055',
        rating: 4.6,
        emergency: true,
        open_now: true,
        user_ratings_total: 520,
        specialties: ['Cardiology', 'Neurology', 'Oncology'],
        lat: 28.7000,
        lng: 77.0980
      },
      {
        id: 4,
        name: 'Fortis Escorts Heart Institute',
        address: 'Okhla Road, New Delhi, Delhi 110025',
        phone: '+91 11-4713-5555',
        rating: 4.7,
        emergency: true,
        open_now: true,
        user_ratings_total: 680,
        specialties: ['Cardiology', 'Cardiac Surgery', 'Interventional Cardiology'],
        lat: 28.7060,
        lng: 77.1040
      },
      {
        id: 5,
        name: 'Indraprastha Apollo Hospital',
        address: 'Sarita Vihar, Delhi Mathura Road, New Delhi, Delhi 110076',
        phone: '+91 11-7179-1090',
        rating: 4.5,
        emergency: true,
        open_now: true,
        user_ratings_total: 450,
        specialties: ['Multi-Specialty', 'Transplant', 'Emergency Care'],
        lat: 28.7020,
        lng: 77.1000
      },
      {
        id: 6,
        name: 'BLK Super Speciality Hospital',
        address: 'Pusa Road, New Delhi, Delhi 110005',
        phone: '+91 11-3040-3040',
        rating: 4.4,
        emergency: true,
        open_now: true,
        user_ratings_total: 480,
        specialties: ['Multi-Specialty', 'Emergency Care', 'General Medicine'],
        lat: 28.7050,
        lng: 77.1030
      },
      {
        id: 7,
        name: 'Sir Ganga Ram Hospital',
        address: 'Old Rajinder Nagar, New Delhi, Delhi 110060',
        phone: '+91 11-2575-0000',
        rating: 4.6,
        emergency: true,
        open_now: true,
        user_ratings_total: 620,
        specialties: ['Multi-Specialty', 'Emergency Care', 'General Medicine'],
        lat: 28.7070,
        lng: 77.1050
      },
      {
        id: 8,
        name: 'Dharamshila Narayana Superspeciality Hospital',
        address: 'Dharamshila Marg, Vasundhara Enclave, Delhi 110096',
        phone: '+91 11-7179-1090',
        rating: 4.3,
        emergency: true,
        open_now: true,
        user_ratings_total: 380,
        specialties: ['Oncology', 'Multi-Specialty', 'Emergency Care'],
        lat: 28.7030,
        lng: 77.1010
      },
      {
        id: 9,
        name: 'Rajiv Gandhi Cancer Institute',
        address: 'Sector 5, Rohini, Delhi 110085',
        phone: '+91 11-4702-2222',
        rating: 4.5,
        emergency: true,
        open_now: true,
        user_ratings_total: 420,
        specialties: ['Oncology', 'Radiation Therapy', 'Medical Oncology'],
        lat: 28.7045,
        lng: 77.1025
      },
      {
        id: 10,
        name: 'Delhi Heart & Lung Institute',
        address: '3, MM II, Panchkuian Road, New Delhi, Delhi 110001',
        phone: '+91 11-2336-2336',
        rating: 4.7,
        emergency: true,
        open_now: true,
        user_ratings_total: 550,
        specialties: ['Cardiology', 'Cardiac Surgery', 'Pulmonology'],
        lat: 28.7065,
        lng: 77.1045
      },
      {
        id: 11,
        name: 'Delhi State Cancer Institute',
        address: 'Dilshad Garden, Delhi 110095',
        phone: '+91 11-2258-2258',
        rating: 4.2,
        emergency: true,
        open_now: true,
        user_ratings_total: 320,
        specialties: ['Oncology', 'Cancer Care', 'Radiation Therapy'],
        lat: 28.7015,
        lng: 77.0995
      },
      {
        id: 12,
        name: 'Delhi Eye Centre',
        address: 'Rajouri Garden, New Delhi, Delhi 110027',
        phone: '+91 11-2549-2549',
        rating: 4.4,
        emergency: false,
        open_now: true,
        user_ratings_total: 280,
        specialties: ['Ophthalmology', 'Eye Surgery', 'Retina Care'],
        lat: 28.7085,
        lng: 77.1065
      },
      {
        id: 13,
        name: 'Delhi Dental Centre',
        address: 'Greater Kailash, New Delhi, Delhi 110048',
        phone: '+91 11-2923-2923',
        rating: 4.1,
        emergency: false,
        open_now: true,
        user_ratings_total: 190,
        specialties: ['Dentistry', 'Oral Surgery', 'Orthodontics'],
        lat: 28.7025,
        lng: 77.1005
      },
      {
        id: 14,
        name: 'Delhi Orthopedic Centre',
        address: 'Punjabi Bagh, New Delhi, Delhi 110026',
        phone: '+91 11-2525-2525',
        rating: 4.3,
        emergency: false,
        open_now: true,
        user_ratings_total: 240,
        specialties: ['Orthopedics', 'Sports Medicine', 'Rehabilitation'],
        lat: 28.7055,
        lng: 77.1035
      },
      {
        id: 15,
        name: 'Delhi Child Care Hospital',
        address: 'Dwarka, New Delhi, Delhi 110075',
        phone: '+91 11-2808-2808',
        rating: 4.5,
        emergency: true,
        open_now: true,
        user_ratings_total: 360,
        specialties: ['Pediatrics', 'Neonatology', 'Child Care'],
        lat: 28.7040,
        lng: 77.1020
      }
    ]
  };

  const cityCoordinates = {
    'tumkur': { lat: 13.3417, lng: 77.1017, name: 'Tumkur, Karnataka' },
    'bangalore': { lat: 12.9716, lng: 77.5946, name: 'Bangalore, Karnataka' },
    'mysore': { lat: 12.2958, lng: 76.6394, name: 'Mysore, Karnataka' },
    'mangalore': { lat: 12.9141, lng: 74.8560, name: 'Mangalore, Karnataka' },
    'hubli': { lat: 15.3647, lng: 75.1240, name: 'Hubli, Karnataka' },
    'belgaum': { lat: 15.8497, lng: 74.4977, name: 'Belgaum, Karnataka' },
    'davangere': { lat: 14.4644, lng: 75.9218, name: 'Davangere, Karnataka' },
    'mumbai': { lat: 19.0760, lng: 72.8777, name: 'Mumbai, Maharashtra' },
    'delhi': { lat: 28.7041, lng: 77.1025, name: 'Delhi, India' }
  };

  // Profile integration helpers
  const extrasKey = (userId) => `userProfileExtras:${userId}`;

  function resolveCityFromText(text) {
    if (!text) return null;
    const lower = String(text).toLowerCase();
    for (const city of Object.keys(cityCoordinates)) {
      if (lower.includes(city)) return city;
    }
    return null;
  }

  function applyCity(city) {
    const coords = cityCoordinates[city];
    if (!coords) return false;
    setLocation({ lat: coords.lat, lng: coords.lng });
    const list = getHospitalsForCity(city);
    const withDistances = addDistancesToHospitals(list, coords.lat, coords.lng);
    setHospitals(withDistances);
    setError(`Found ${withDistances.length} hospitals near ${coords.name}`);
    return true;
  }

  // Calculate distance
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  };

  // Generate map URL with hospital markers - improved implementation
  const generateMapUrl = (center, hospitals) => {
    // Create a more reliable OpenStreetMap embed with proper bounding box
    const bbox = {
      minLng: Math.min(center.lng, ...hospitals.map(h => h.lng)) - 0.02,
      minLat: Math.min(center.lat, ...hospitals.map(h => h.lat)) - 0.02,
      maxLng: Math.max(center.lng, ...hospitals.map(h => h.lng)) + 0.02,
      maxLat: Math.max(center.lat, ...hospitals.map(h => h.lat)) + 0.02
    };
    
    // Use OpenStreetMap embed with custom markers
    let url = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.minLng},${bbox.minLat},${bbox.maxLng},${bbox.maxLat}&layer=mapnik`;
    
    // Add center marker (user location)
    url += `&marker=${center.lat},${center.lng}`;
    
    // Add hospital markers (limit to first 10 for performance)
    hospitals.slice(0, 10).forEach(hospital => {
      url += `&marker=${hospital.lat},${hospital.lng}`;
    });
    
    return url;
  };

  // Get hospitals for city
  const getHospitalsForCity = (cityName) => {
    const cityLower = cityName.toLowerCase();
    return cityHospitals[cityLower] || cityHospitals['bangalore'];
  };

  // Add distances to hospitals
  const addDistancesToHospitals = (hospitals, userLat, userLng) => {
    return hospitals.map(hospital => ({
      ...hospital,
      distance: calculateDistance(userLat, userLng, hospital.lat, hospital.lng)
    }));
  };

  // Get user location
  const getUserLocation = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!navigator.geolocation) {
        throw new Error('Geolocation not supported');
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const userLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
      setLocation(userLocation);
      
      let nearestCity = 'bangalore';
      let minDistance = Infinity;
      
      for (const [city, coords] of Object.entries(cityCoordinates)) {
        const distance = calculateDistance(userLocation.lat, userLocation.lng, coords.lat, coords.lng);
        const distanceNum = parseFloat(distance.replace('km', '').replace('m', ''));
        if (distanceNum < minDistance) {
          minDistance = distanceNum;
          nearestCity = city;
        }
      }
      
      const cityHospitals = getHospitalsForCity(nearestCity);
      const hospitalsWithDistances = addDistancesToHospitals(cityHospitals, userLocation.lat, userLocation.lng);
      setHospitals(hospitalsWithDistances);
      
      setError(`Found ${hospitalsWithDistances.length} hospitals near ${cityCoordinates[nearestCity].name}`);
      
    } catch (err) {
      console.error('Error getting location:', err);
      setError('Unable to get location. Please search for a city.');
      const cityHospitals = getHospitalsForCity('bangalore');
      const hospitalsWithDistances = addDistancesToHospitals(cityHospitals, location.lat, location.lng);
      setHospitals(hospitalsWithDistances);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchAddress.trim()) return;

    try {
      setLoading(true);
      setError('');
      
      const addressLower = searchAddress.toLowerCase().trim();
      let foundLocation = null;
      let foundCity = null;
      
      for (const [city, coords] of Object.entries(cityCoordinates)) {
        if (addressLower.includes(city)) {
          foundLocation = coords;
          foundCity = city;
          break;
        }
      }

      if (foundLocation) {
        setLocation({ lat: foundLocation.lat, lng: foundLocation.lng });
        const cityHospitals = getHospitalsForCity(foundCity);
        const hospitalsWithDistances = addDistancesToHospitals(cityHospitals, foundLocation.lat, foundLocation.lng);
        setHospitals(hospitalsWithDistances);
        setError(`Found ${hospitalsWithDistances.length} hospitals near ${foundLocation.name}`);
      } else {
        setLocation({ lat: 12.9716, lng: 77.5946 });
        const cityHospitals = getHospitalsForCity('bangalore');
        const hospitalsWithDistances = addDistancesToHospitals(cityHospitals, 12.9716, 77.5946);
        setHospitals(hospitalsWithDistances);
        setError('Location not found. Showing Bangalore hospitals.');
      }
    } catch (err) {
      setError('Unable to find location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initialize
  useEffect(() => {
    const cityHospitals = getHospitalsForCity('bangalore');
    const hospitalsWithDistances = addDistancesToHospitals(cityHospitals, location.lat, location.lng);
    setHospitals(hospitalsWithDistances);
  }, []);

  // If user has a saved profile location, initialize from it
  useEffect(() => {
    if (!currentUser) return;
    try {
      const raw = localStorage.getItem(extrasKey(currentUser.id));
      if (raw) {
        const extras = JSON.parse(raw);
        const city = resolveCityFromText(extras?.location);
        if (city) applyCity(city);
      }
    } catch (e) {
      console.warn('NearbyHospitals: failed to read profile extras', e);
    }
  }, [currentUser]);

  // Listen for profile location updates via custom event
  useEffect(() => {
    const onLocationUpdated = (e) => {
      const detail = e.detail || {};
      if (!detail.location) return;
      if (currentUser && detail.userId && detail.userId !== currentUser.id) return; // ignore other users' events
      const city = resolveCityFromText(detail.location);
      if (city) applyCity(city);
    };
    window.addEventListener('profile:location-updated', onLocationUpdated);
    return () => window.removeEventListener('profile:location-updated', onLocationUpdated);
  }, [currentUser]);

  const filteredHospitals = showEmergencyOnly ? hospitals.filter(h => h.emergency) : hospitals;
  const mapUrl = generateMapUrl(location, filteredHospitals);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <h1 className="text-3xl font-bold mb-2">🏥 Nearby Hospitals</h1>
          <p className="text-blue-100">Find medical facilities near your location</p>
        </div>

        {/* Search Controls */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 flex-grow">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search for a city (e.g., tumkur, bangalore, mysore, mangalore, hubli, belgaum, davangere, mumbai, delhi)"
                  className="input pl-10 w-full"
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary px-6 py-2 flex items-center gap-2" disabled={loading}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {loading ? 'Searching...' : 'Search'}
              </button>
            </form>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={getUserLocation} className="btn-secondary px-4 py-2 flex items-center gap-2" disabled={loading}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Use My Location
              </button>
              <button onClick={() => setShowEmergencyOnly(!showEmergencyOnly)} 
                className={`px-4 py-2 rounded-lg border-2 flex items-center gap-2 transition-colors ${
                  showEmergencyOnly ? 'bg-red-50 border-red-300 text-red-700' : 'bg-white border-gray-300 text-gray-700 hover:border-red-300'
                }`}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Emergency Only
              </button>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mx-6 mt-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        
        {/* Map and Hospitals */}
        <div className="grid lg:grid-cols-3 gap-6 p-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                  </svg>
                  Interactive Map
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </p>
              </div>
              <div className="p-4">
                <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                  <iframe 
                    src={mapUrl} 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight="0" 
                    marginWidth="0" 
                    title="OpenStreetMap Hospital Locations" 
                    style={{ border: 'none', minHeight: '384px' }}
                    loading="lazy"
                    allowFullScreen
                  />
                </div>
                
                {/* Alternative Map Link */}
                <div className="mt-2 text-center">
                  <a 
                    href={`https://www.openstreetmap.org/?mlat=${location.lat}&mlon=${location.lng}&zoom=14`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Open in full map view →
                  </a>
                </div>
                
                {/* Map Legend */}
                <div className="mt-4 flex justify-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="text-red-500 text-lg">🏥</span>
                    <span>Hospitals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500 text-lg">📍</span>
                    <span>Your Location</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 text-lg">🚨</span>
                    <span>Emergency Services</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hospitals List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Hospitals ({filteredHospitals.length})
                </h2>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                {filteredHospitals.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                    </svg>
                    <p className="text-gray-500 mb-2">No hospitals found</p>
                    <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredHospitals.sort((a, b) => {
                      // Sort by distance, then by emergency availability, then by rating
                      const distanceA = parseFloat(a.distance.replace('km', '').replace('m', '')) / (a.distance.includes('m') ? 1000 : 1);
                      const distanceB = parseFloat(b.distance.replace('km', '').replace('m', '')) / (b.distance.includes('m') ? 1000 : 1);
                      if (distanceA !== distanceB) return distanceA - distanceB;
                      if (a.emergency !== b.emergency) return b.emergency - a.emergency;
                      return b.rating - a.rating;
                    }).map((hospital) => (
                      <div key={hospital.id} className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedHospital(hospital)}>
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                              <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <a
  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    hospital.name + ', ' + hospital.address
  )}`}
  target="_blank"
  rel="noopener noreferrer"
  className="font-medium text-blue-600 hover:underline truncate"
>
  {hospital.name}
</a>

                              {hospital.emergency && (
                                <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full flex items-center gap-1">
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                  </svg>
                                  Emergency
                                </span>
                              )}
                              {hospital.open_now && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">Open</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-1 truncate">{hospital.address}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <svg key={i} className={`h-3 w-3 ${i < Math.floor(hospital.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                                <span className="ml-1 text-xs">{hospital.rating}</span>
                              </div>
                              <span className="text-gray-300">•</span>
                              <span className="text-xs">📍 {hospital.distance}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Hospital Details */}
        {selectedHospital && (
          <div className="mx-6 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
            <div className="flex justify-between items-start">
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-blue-900">{selectedHospital.name}</h3>
                    <p className="text-blue-700">{selectedHospital.address}</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-blue-700 mb-2">📞 {selectedHospital.phone}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm font-medium">{selectedHospital.rating}</span>
                        <span className="text-xs text-gray-500">({selectedHospital.user_ratings_total} reviews)</span>
                      </div>
                      <span className="text-sm text-gray-600">📍 {selectedHospital.distance}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Specialties:</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedHospital.specialties.map((specialty, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(selectedHospital.address)}`} target="_blank" rel="noopener noreferrer" className="btn-secondary px-4 py-2 flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                    </svg>
                    Get Directions
                  </a>
                  <a href={`tel:${selectedHospital.phone}`} className="btn-primary px-4 py-2 flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Call Now
                  </a>
                </div>
              </div>
              <button onClick={() => setSelectedHospital(null)} className="text-gray-500 hover:text-gray-700 ml-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbyHospitals;
