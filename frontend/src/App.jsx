import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import SymptomChecker from './pages/SymptomChecker';
import WellnessLogger from './pages/WellnessLogger';
import HealthTips from './pages/HealthTips';
import Dashboard from './pages/Dashboard';
import DietAndFitness from './pages/DietAndFitness';
const DietFitnessDashboardLazy = React.lazy(() => import('./pages/DietFitnessDashboard'));
import DeStressZone from './pages/DeStressZone';
import HealthConditions from './pages/HealthConditions';
import NearbyHospitals from './pages/NearbyHospitals';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import UserProfile from './pages/UserProfile';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/leaflet.css';

// Component to handle scroll to top on route change
const ScrollToTop = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
};

// Sends anonymous users to /login and authenticated users to /dashboard
const RootRedirector = () => {
  const { currentUser, isTokenValid, authReady } = useAuth();
  if (!authReady) return <div />;
  if (!currentUser || !isTokenValid()) return <Navigate to="/login" replace />;
  return <Navigate to="/dashboard" replace />;
};

function App() {
  const location = useLocation();
  const authRoutes = ['/login', '/register'];
  const hideChrome = authRoutes.includes(location.pathname);
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <ScrollToTop />
        {!hideChrome && <Navbar />}
        <ToastContainer 
          position="top-center" 
          autoClose={3000} 
          hideProgressBar={false} 
          newestOnTop={true} 
          closeOnClick={true} 
          rtl={false} 
          pauseOnFocusLoss={true} 
          draggable={true} 
          pauseOnHover={true} 
          theme="colored" 
        />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Root route gates users to login or dashboard */}
            <Route path="/" element={<RootRedirector />} />
            {/* Protected routes */}
            <Route path="/home" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
            <Route path="/symptom-checker" element={
              <ProtectedRoute>
                <SymptomChecker />
              </ProtectedRoute>
            } />
            <Route path="/wellness-logger" element={
              <ProtectedRoute>
                <WellnessLogger />
              </ProtectedRoute>
            } />
            <Route path="/health-tips" element={
              <ProtectedRoute>
                <HealthTips />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/diet-fitness" element={
              <ProtectedRoute>
                <DietAndFitness />
              </ProtectedRoute>
            } />
            <Route path="/diet-fitness/dashboard" element={
              <ProtectedRoute>
                <React.Suspense fallback={<div>Loading...</div>}>
                  <DietFitnessDashboardLazy />
                </React.Suspense>
              </ProtectedRoute>
            } />
            <Route path="/de-stress" element={
              <ProtectedRoute>
                <DeStressZone />
              </ProtectedRoute>
            } />
            <Route path="/health-conditions" element={
              <ProtectedRoute>
                <HealthConditions />
              </ProtectedRoute>
            } />
            <Route path="/nearby-hospitals" element={
              <ProtectedRoute>
                <NearbyHospitals />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />
            {/* Fallback to login for any unknown path */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
        {!hideChrome && <Footer />}
      </div>
    </AuthProvider>
  );
}

export default App;