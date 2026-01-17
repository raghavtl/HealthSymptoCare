import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FeatureCard = ({ icon, title, description, link }) => {
  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="text-3xl mb-4 text-primary">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <Link to={link} className="btn btn-primary inline-block">
        Explore
      </Link>
    </div>
  );
};

const HomePage = () => {
  const { currentUser } = useAuth();
  const features = [
    {
      icon: '😊',
      title: 'Symptom Checker',
      description: 'Select your symptoms and get possible illness suggestions.',
      link: '/symptom-checker',
    },
    {
      icon: '📊',
      title: 'Daily Wellness Logger',
      description: 'Track water intake, mood, sleep hours, and energy levels.',
      link: '/wellness-logger',
    },
    {
      icon: '💬',
      title: 'AI Health Tips',
      description: 'Get personalized health tips based on your wellness data.',
      link: '/health-tips',
    },
    {
      icon: '📈',
      title: 'Health Analytics',
      description: 'View graphs for hydration, mood, sleep, and more.',
      link: '/dashboard',
    },
    {
      icon: '🥗',
      title: 'Diet & Fitness',
      description: 'Get suggestions for workouts and meals based on your health goals.',
      link: '/diet-fitness',
    },
    {
      icon: '🔥',
      title: 'De-stress Zone',
      description: 'Access breathing exercises, timers, and calming resources.',
      link: '/de-stress',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-purple-600 text-white py-20 rounded-lg mb-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Smart Health Buddy
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Your personal health companion for symptom checking and wellness tracking
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/symptom-checker" className="btn bg-white text-primary hover:bg-gray-100">
              Check Symptoms
            </Link>
            {currentUser ? (
              <Link to="/wellness-logger" className="btn bg-transparent border-2 border-white hover:bg-white/10">
                Log Wellness
              </Link>
            ) : (
              <Link to="/login" className="btn bg-transparent border-2 border-white hover:bg-white/10">
                Login to Track Health
              </Link>
            )}
          </div>
          {currentUser && (
            <div className="mt-4 text-white">
              <p>Welcome back, {currentUser.username}! Continue your health journey.</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="mb-12 bg-gray-50 py-12 rounded-lg">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Why Choose Smart Health Buddy?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="text-4xl mb-4 text-primary">🏥</div>
              <h3 className="text-xl font-semibold mb-2">Healthcare</h3>
              <p className="text-gray-600">Access reliable health information and symptom checking.</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4 text-primary">🤖</div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
              <p className="text-gray-600">Get personalized recommendations based on your data.</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4 text-primary">📱</div>
              <h3 className="text-xl font-semibold mb-2">Daily Wellness</h3>
              <p className="text-gray-600">Track and improve your daily health habits.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-secondary text-white py-12 rounded-lg text-center">
        <h2 className="text-3xl font-bold mb-4">Start Your Health Journey Today</h2>
        <p className="text-xl mb-6">Take control of your health with Smart Health Buddy</p>
        {currentUser ? (
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/dashboard" className="btn bg-white text-secondary hover:bg-gray-100">
              View Your Dashboard
            </Link>
            <Link to="/wellness-logger" className="btn bg-transparent border-2 border-white hover:bg-white/10">
              Log Today's Health
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="btn bg-white text-secondary hover:bg-gray-100">
              Create Account
            </Link>
            <Link to="/login" className="btn bg-transparent border-2 border-white hover:bg-white/10">
              Login
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;