import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Smart Health Buddy</h3>
            <p className="text-gray-300">
              Your personal health companion for symptom checking and wellness tracking.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/symptom-checker" className="text-gray-300 hover:text-white transition-colors">
                  Symptom Checker
                </Link>
              </li>
              <li>
                <Link to="/wellness-logger" className="text-gray-300 hover:text-white transition-colors">
                  Wellness Logger
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Additional Features</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/health-conditions" className="text-gray-300 hover:text-white transition-colors">
                  Health Conditions
                </Link>
              </li>
              <li>
                <Link to="/nearby-hospitals" className="text-gray-300 hover:text-white transition-colors">
                  Nearby Hospitals
                </Link>
              </li>
              <li>
                <Link to="/de-stress" className="text-gray-300 hover:text-white transition-colors">
                  De-stress Zone
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} Smart Health Buddy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;