import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import UserFeedback from './components/UserFeedback';
import Analytics from './components/Analytics';
import NotificationsSystem from './components/NotificationsSystem';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PublicRegisterPage from './pages/PublicRegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboard from './pages/AdminDashboard';
import BookingPage from './pages/BookingPage';
import VehiclesPage from './pages/VehiclesPage';
import VehicleBrandsPage from './pages/VehicleBrandsPage';
import PaymentPage from './pages/PaymentPage';
import TrackingPage from './pages/TrackingPage';
import MechanicTrackingPage from './pages/MechanicTrackingPage';
import SettingsPage from './pages/SettingsPage';
import './App.css';

function App() {
  // Nettoyer les données corrompues au démarrage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    // Vérifier si les données sont valides
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (!user.id || !user.email) {
          // Données utilisateur invalides, nettoyer
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch {
        // Données corrompues, nettoyer
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const Protected = ({ children }) => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    // Validation simple - si token existe, on autorise
    if (!token || !userStr) {
      return <Navigate to="/login" replace />;
    }
    
    return children;
  };

  const MechanicOnly = ({ children }) => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      return <Navigate to="/login" replace />;
    }
    
    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'MECHANIC') {
        return <Navigate to="/dashboard" replace />;
      }
    } catch {
      return <Navigate to="/login" replace />;
    }
    
    return children;
  };

  const AdminOnly = ({ children }) => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      return <Navigate to="/login" replace />;
    }
    
    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'ADMIN') {
        return <Navigate to="/dashboard" replace />;
      }
    } catch {
      return <Navigate to="/login" replace />;
    }
    
    return children;
  };

  return (
    <Router>
      <div className="app">
        <Analytics />
        <Routes>
          <Route path="/" element={<><Navbar isLoggedIn={Boolean(localStorage.getItem('token'))} /><LandingPage /><Footer /></>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/public-register" element={<PublicRegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/admin" element={<AdminOnly><AdminDashboard /></AdminOnly>} />
          <Route path="/dashboard" element={<Protected><><Navbar isLoggedIn={Boolean(localStorage.getItem('token'))} /><NotificationsSystem /><DashboardPage /><Footer /></></Protected>} />
          <Route path="/vehicles" element={<Protected><><Navbar isLoggedIn={Boolean(localStorage.getItem('token'))} /><NotificationsSystem /><VehiclesPage /><Footer /></></Protected>} />
          <Route path="/brands" element={<Protected><><Navbar isLoggedIn={Boolean(localStorage.getItem('token'))} /><NotificationsSystem /><VehicleBrandsPage /><Footer /></></Protected>} />
          <Route path="/booking" element={<Protected><><Navbar isLoggedIn={Boolean(localStorage.getItem('token'))} /><NotificationsSystem /><BookingPage /><Footer /></></Protected>} />
          <Route path="/payment" element={<Protected><><Navbar isLoggedIn={Boolean(localStorage.getItem('token'))} /><NotificationsSystem /><PaymentPage /><Footer /></></Protected>} />
          <Route path="/tracking" element={<Protected><><Navbar isLoggedIn={Boolean(localStorage.getItem('token'))} /><NotificationsSystem /><TrackingPage /><Footer /></></Protected>} />
          <Route path="/mechanic-tracking" element={<MechanicOnly><><Navbar isLoggedIn={Boolean(localStorage.getItem('token'))} /><NotificationsSystem /><MechanicTrackingPage /><Footer /></></MechanicOnly>} />
          <Route path="/settings" element={<Protected><><Navbar isLoggedIn={Boolean(localStorage.getItem('token'))} /><NotificationsSystem /><SettingsPage /><Footer /></></Protected>} />
        </Routes>
        <UserFeedback />
      </div>
    </Router>
  );
}

export default App;
