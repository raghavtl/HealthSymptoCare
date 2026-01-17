import React from 'react';

const HealthDisclaimer = () => (
  <div className="mt-10 p-4 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-900 text-sm leading-relaxed">
    <p className="font-semibold mb-1">Health Disclaimer</p>
    <p>
      The information, meal plans, workout suggestions, and notifications provided by this app are for educational and general wellness purposes only and are not a substitute for professional medical advice, diagnosis, or treatment. Always consult your physician or a qualified health provider with any questions you may have regarding a medical condition, diet, or exercise program. Stop any activity that causes pain or discomfort and seek medical attention if needed.
    </p>
    <p className="mt-2">
      Safe-use notes: Stay hydrated, warm up before exercising, and progress gradually. Individuals with existing medical conditions should obtain clearance from a healthcare professional before starting any new diet or fitness routine.
    </p>
  </div>
);

export default HealthDisclaimer;
