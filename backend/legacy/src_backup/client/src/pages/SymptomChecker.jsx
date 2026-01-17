import React, { useState, useEffect } from 'react';
import { symptomsApi, medicinesApi } from '../services/api';

const SymptomChecker = () => {
  const [bodyParts, setBodyParts] = useState([
    'Head', 'Eyes', 'Ears', 'Nose', 'Mouth', 'Throat',
    'Chest', 'Back', 'Abdomen', 'Arms', 'Legs', 'Skin', 'General'
  ]);
  
  const [symptoms, setSymptoms] = useState({});
  const [selectedBodyPart, setSelectedBodyPart] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [possibleConditions, setPossibleConditions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [loadingMedicines, setLoadingMedicines] = useState(false);

  // Fetch body parts from API
  useEffect(() => {
    const fetchBodyParts = async () => {
      try {
        const response = await symptomsApi.getBodyParts();
        setBodyParts(response.data.map(part => part.name));
      } catch (error) {
        console.error('Error fetching body parts:', error);
        // Keep default body parts if API fails
      }
    };
    
    fetchBodyParts();
  }, []);
  
  // Fetch symptoms for selected body part
  useEffect(() => {
    const fetchSymptomsByBodyPart = async () => {
      if (!selectedBodyPart) return;
      
      try {
        const response = await symptomsApi.getByBodyPart(selectedBodyPart);
        
        // Transform the data to match our component's expected format
        const symptomsByBodyPart = {};
        symptomsByBodyPart[selectedBodyPart] = response.data.map(symptom => ({
          id: symptom.id,
          name: symptom.name
        }));
        
        setSymptoms(prev => ({
          ...prev,
          ...symptomsByBodyPart
        }));
      } catch (error) {
        console.error(`Error fetching symptoms for ${selectedBodyPart}:`, error);
        // If API fails, keep any existing symptoms for this body part
      }
    };
    
    if (selectedBodyPart) {
      fetchSymptomsByBodyPart();
    }
  }, [selectedBodyPart]);

  const handleBodyPartSelect = (bodyPart) => {
    setSelectedBodyPart(bodyPart);
  };

  const handleSymptomToggle = (symptom) => {
    setSelectedSymptoms(prev => {
      // Check if this symptom is already selected by comparing IDs
      const isSelected = prev.some(s => s.id === symptom.id);
      
      if (isSelected) {
        // Remove the symptom if it's already selected
        return prev.filter(s => s.id !== symptom.id);
      } else {
        // Add the symptom if it's not already selected
        return [...prev, symptom];
      }
    });
  };

  const checkSymptoms = async () => {
    if (selectedSymptoms.length === 0) {
      setError('Please select at least one symptom');
      return;
    }
    
    setLoading(true);
    setError('');
    setSelectedCondition(null);
    setMedicines([]);
    
    try {
      // Extract the symptom IDs from the selected symptoms
      const symptomIds = selectedSymptoms.map(symptom => symptom.id);
      
      // Call the API to check possible conditions based on symptoms
      const response = await symptomsApi.checkSymptoms(symptomIds);
      
      // Extract the results from the response
      const conditions = response.data.results || [];
      
      // If no conditions returned, provide a generic response
      if (conditions.length === 0) {
        setPossibleConditions([{
          id: null,
          name: 'Unspecified Condition',
          probability: 'Low',
          description: 'Based on the symptoms provided, a specific condition could not be determined. Please consult a healthcare professional for proper diagnosis.'
        }]);
      } else {
        // Map the API response to the format expected by the component
        const formattedConditions = conditions.map(condition => ({
          id: condition.id,
          name: condition.name,
          probability: condition.match_percentage > 0.7 ? 'High' : 
                      condition.match_percentage > 0.4 ? 'Medium' : 'Low',
          description: condition.description
        }));
        setPossibleConditions(formattedConditions);
      }
    } catch (err) {
      console.error('Error checking symptoms:', err);
      setError('An error occurred while checking symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetChecker = () => {
    setSelectedBodyPart('');
    setSelectedSymptoms([]);
    setPossibleConditions([]);
    setSelectedCondition(null);
    setMedicines([]);
    setError('');
  };
  
  const getMedicineRecommendations = async (conditionId) => {
    if (!conditionId) return;
    
    setLoadingMedicines(true);
    
    try {
      const response = await medicinesApi.getByCondition(conditionId);
      setMedicines(response.data);
      
      // Find and set the selected condition
      const condition = possibleConditions.find(c => c.id === conditionId);
      setSelectedCondition(condition);
    } catch (err) {
      console.error('Error fetching medicine recommendations:', err);
      setError('An error occurred while fetching medicine recommendations. Please try again.');
    } finally {
      setLoadingMedicines(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Symptom Checker</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Medicine Recommendations */}
      {selectedCondition && (
        <div className="mt-8 border-t pt-6">
          <h2 className="text-2xl font-bold mb-4">Medicine Recommendations for {selectedCondition.name}</h2>
          
          {loadingMedicines ? (
            <p className="text-gray-500">Loading medicine recommendations...</p>
          ) : medicines.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {medicines.map((medicine) => (
                <div key={medicine.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary">
                  <h3 className="text-xl font-semibold mb-2">{medicine.name}</h3>
                  <p className="text-gray-700 mb-3">{medicine.description}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900">Dosage</h4>
                      <p className="text-sm text-gray-600">{medicine.dosage}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900">Side Effects</h4>
                      <p className="text-sm text-gray-600">{medicine.side_effects}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900">Precautions</h4>
                      <p className="text-sm text-gray-600">{medicine.precautions}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900">Interactions</h4>
                      <p className="text-sm text-gray-600">{medicine.interactions}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No medicine recommendations available for this condition.</p>
          )}
          
          <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 text-sm text-gray-700">
            <p className="font-bold">Important Note:</p>
            <p>These medicine recommendations are for informational purposes only. Always consult with a healthcare professional before taking any medication. The dosage, precautions, and other details may vary based on individual health conditions.</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Body Part Selection */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Step 1: Select Body Part</h2>
          <div className="space-y-2">
            {bodyParts.map((part) => (
              <button
                key={part}
                onClick={() => handleBodyPartSelect(part)}
                className={`block w-full text-left px-4 py-2 rounded ${selectedBodyPart === part ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                {part}
              </button>
            ))}
          </div>
        </div>
        
        {/* Symptom Selection */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Step 2: Select Symptoms</h2>
          {selectedBodyPart ? (
            <div className="space-y-2">
              {symptoms[selectedBodyPart]?.map((symptom) => (
                <label key={symptom.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={selectedSymptoms.some(s => s.id === symptom.id)}
                    onChange={() => handleSymptomToggle(symptom)}
                    className="h-5 w-5 text-primary"
                  />
                  <span>{symptom.name}</span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Please select a body part first</p>
          )}
          
          <div className="mt-4 flex space-x-2">
            <button
              onClick={checkSymptoms}
              disabled={selectedSymptoms.length === 0 || loading}
              className="btn btn-primary disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Check Symptoms'}
            </button>
            <button
              onClick={resetChecker}
              className="btn bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Reset
            </button>
          </div>
        </div>
        
        {/* Results */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Step 3: Possible Conditions</h2>
          {possibleConditions.length > 0 ? (
            <div className="space-y-4">
              {possibleConditions.map((condition, index) => (
                <div key={index} className="border-l-4 border-primary pl-4 py-2">
                  <h3 className="font-semibold text-lg">{condition.name}</h3>
                  <div className="flex items-center mb-1">
                    <span className="text-sm mr-2">Probability:</span>
                    <span className={`text-sm font-medium px-2 py-1 rounded ${condition.probability === 'High' ? 'bg-red-100 text-red-800' : condition.probability === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                      {condition.probability}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{condition.description}</p>
                  {condition.id && (
                    <button 
                      onClick={() => getMedicineRecommendations(condition.id)}
                      className="mt-2 text-sm text-primary hover:text-primary-dark underline"
                    >
                      View medicine recommendations
                    </button>
                  )}
                </div>
              ))}
              <div className="mt-4 text-sm text-gray-500">
                <p className="font-semibold">Disclaimer:</p>
                <p>This symptom checker provides general information only and should not be used for diagnosis or treatment. Always consult with a qualified healthcare provider.</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">
              {loading ? 'Analyzing symptoms...' : 'Select symptoms and click "Check Symptoms" to see possible conditions'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SymptomChecker;