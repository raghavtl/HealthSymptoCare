import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
<footer className="bg-white text-slate-700 py-10 border-t border-slate-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
<h3 className="text-xl font-semibold mb-4 text-slate-900">HealthSymptoCare</h3>
<p className="text-slate-600">
              Your personal health companion for symptom checking and wellness tracking.
            </p>
          </div>
          <div>
<h3 className="text-xl font-semibold mb-4 text-slate-900">Quick Links</h3>
            <ul className="space-y-2">
              <li>
<Link to="/" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Home
                </Link>
              </li>
              <li>
<Link to="/symptom-checker" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Symptom Checker
                </Link>
              </li>
              <li>
<Link to="/wellness-logger" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Wellness Logger
                </Link>
              </li>
              <li>
<Link to="/dashboard" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
          <div>
<h3 className="text-xl font-semibold mb-4 text-slate-900">Additional Features</h3>
            <ul className="space-y-2">
              <li>
<Link to="/nearby-hospitals" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Nearby Hospitals
                </Link>
              </li>
              <li>
<Link to="/de-stress" className="text-slate-600 hover:text-slate-900 transition-colors">
                  De-stress Zone
                </Link>
              </li>
            </ul>
          </div>
        </div>
<div className="border-t border-slate-200 mt-8 pt-6 text-center text-slate-600">
          <p>&copy; {new Date().getFullYear()} HealthSymptoCare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;