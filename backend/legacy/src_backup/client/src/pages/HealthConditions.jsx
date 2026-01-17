import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HealthConditions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCondition, setSelectedCondition] = useState(null);
  
  // Mock data for health conditions
  const mockConditions = [
    {
      id: 1,
      name: 'Common Cold',
      description: 'A viral infectious disease of the upper respiratory tract that primarily affects the nose.',
      symptoms: ['Runny nose', 'Sore throat', 'Cough', 'Congestion', 'Mild fever', 'Sneezing'],
      treatment: 'Rest, fluids, over-the-counter medications for symptom relief',
      prevention: 'Frequent handwashing, avoiding close contact with sick individuals'
    },
    {
      id: 2,
      name: 'Influenza (Flu)',
      description: 'A contagious respiratory illness caused by influenza viruses that infect the nose, throat, and lungs.',
      symptoms: ['High fever', 'Body aches', 'Fatigue', 'Cough', 'Headache', 'Sore throat'],
      treatment: 'Antiviral medications, rest, fluids',
      prevention: 'Annual flu vaccination, good hygiene practices'
    },
    {
      id: 3,
      name: 'Hypertension',
      description: 'A chronic condition in which the blood pressure in the arteries is elevated.',
      symptoms: ['Usually asymptomatic', 'Headaches (in severe cases)', 'Shortness of breath', 'Nosebleeds'],
      treatment: 'Lifestyle changes, medications to lower blood pressure',
      prevention: 'Regular exercise, healthy diet low in sodium, limiting alcohol'
    },
    {
      id: 4,
      name: 'Type 2 Diabetes',
      description: 'A chronic condition that affects the way the body processes blood sugar (glucose).',
      symptoms: ['Increased thirst', 'Frequent urination', 'Increased hunger', 'Fatigue', 'Blurred vision'],
      treatment: 'Lifestyle changes, monitoring blood sugar, medications, insulin therapy if needed',
      prevention: 'Maintaining a healthy weight, regular physical activity, balanced diet'
    },
    {
      id: 5,
      name: 'Asthma',
      description: 'A condition in which airways narrow and swell and produce extra mucus, making breathing difficult.',
      symptoms: ['Shortness of breath', 'Chest tightness or pain', 'Wheezing', 'Trouble sleeping due to breathing problems'],
      treatment: 'Inhalers, medications to control symptoms and prevent attacks',
      prevention: 'Avoiding triggers, taking prescribed medications'
    },
    {
      id: 6,
      name: 'Migraine',
      description: 'A neurological condition characterized by intense, debilitating headaches often accompanied by other symptoms.',
      symptoms: ['Severe headache', 'Throbbing pain', 'Nausea', 'Sensitivity to light', 'Sensitivity to sound'],
      treatment: 'Pain relievers, preventive medications, lifestyle changes',
      prevention: 'Identifying and avoiding triggers, stress management'
    },
    {
      id: 7,
      name: 'Osteoarthritis',
      description: 'A degenerative joint disease that occurs when the protective cartilage that cushions the ends of bones wears down over time.',
      symptoms: ['Joint pain', 'Stiffness', 'Tenderness', 'Loss of flexibility', 'Grating sensation'],
      treatment: 'Physical therapy, medications, surgery in severe cases',
      prevention: 'Maintaining a healthy weight, regular exercise, protecting joints'
    },
    {
      id: 8,
      name: 'Depression',
      description: 'A mental health disorder characterized by persistently depressed mood or loss of interest in activities.',
      symptoms: ['Persistent sadness', 'Loss of interest', 'Changes in appetite', 'Sleep disturbances', 'Fatigue'],
      treatment: 'Psychotherapy, medications, lifestyle changes',
      prevention: 'Regular exercise, social connections, stress management'
    }
  ];
  
  useEffect(() => {
    // In a real app, this would fetch from an API like disease.sh
    // For now, we'll use our mock data
    setConditions(mockConditions);
  }, []);
  
  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Filter conditions based on search term
      const filteredConditions = mockConditions.filter(condition => 
        condition.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        condition.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        condition.symptoms.some(symptom => symptom.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      
      setConditions(filteredConditions);
      setLoading(false);
    } catch (err) {
      console.error('Error searching conditions:', err);
      setError('An error occurred while searching. Please try again.');
      setLoading(false);
    }
  };
  
  const resetSearch = () => {
    setSearchTerm('');
    setConditions(mockConditions);
    setSelectedCondition(null);
  };
  
  const viewConditionDetails = (condition) => {
    setSelectedCondition(condition);
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Health Conditions Search</h1>
      
      <div className="card mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search conditions, symptoms, or descriptions..."
            className="input flex-grow"
          />
          <button 
            type="submit" 
            className="btn-primary md:w-auto"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button 
            type="button" 
            onClick={resetSearch} 
            className="btn-secondary md:w-auto"
          >
            Reset
          </button>
        </form>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Conditions List */}
        <div className={`card ${selectedCondition ? 'hidden md:block' : ''}`}>
          <h2 className="text-xl font-semibold mb-4">Conditions</h2>
          {conditions.length === 0 ? (
            <p className="text-gray-500">No conditions found matching your search.</p>
          ) : (
            <ul className="divide-y">
              {conditions.map((condition) => (
                <li key={condition.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-primary">{condition.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{condition.description}</p>
                    </div>
                    <button
                      onClick={() => viewConditionDetails(condition)}
                      className="text-sm text-primary hover:text-primary-dark"
                    >
                      View Details
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Condition Details */}
        {selectedCondition ? (
          <div className="card">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">{selectedCondition.name}</h2>
              <button 
                onClick={() => setSelectedCondition(null)}
                className="md:hidden text-gray-500 hover:text-gray-700"
              >
                Back to List
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700">Description</h3>
                <p className="text-gray-600">{selectedCondition.description}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700">Symptoms</h3>
                <ul className="list-disc list-inside text-gray-600">
                  {selectedCondition.symptoms.map((symptom, index) => (
                    <li key={index}>{symptom}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700">Treatment</h3>
                <p className="text-gray-600">{selectedCondition.treatment}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700">Prevention</h3>
                <p className="text-gray-600">{selectedCondition.prevention}</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Disclaimer:</strong> This information is for educational purposes only and is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="card hidden md:block">
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <p className="mb-2">Select a condition to view details</p>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="card mt-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-xl font-semibold mb-4">About Health Conditions Search</h2>
        <p className="text-gray-700 mb-4">
          This feature allows you to search for information about common health conditions, their symptoms, treatments, and prevention methods. In a real application, this would connect to a medical API like disease.sh to provide up-to-date and accurate information.
        </p>
        <p className="text-gray-700">
          Remember that this tool is for informational purposes only and should not replace professional medical advice. Always consult with a healthcare provider for proper diagnosis and treatment.
        </p>
      </div>
    </div>
  );
};

export default HealthConditions;