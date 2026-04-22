import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import BookingPage from './pages/BookingPage';
import VehiclesPage from './pages/VehiclesPage';
import PaymentPage from './pages/PaymentPage';
import TrackingPage from './pages/TrackingPage';
import MechanicTrackingPage from './pages/MechanicTrackingPage';
import './App.css';

function App() {
  const Protected = ({ children }) => {
    const isLoggedIn = Boolean(localStorage.getItem('token'));
    if (!isLoggedIn) return <Navigate to="/login" replace />;
    return children;
  };

  const MechanicOnly = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/login" replace />;
    try {
      const user = JSON.parse(atob(token.split('.')[1]));
      if (user.role !== 'MECHANIC') return <Navigate to="/dashboard" replace />;
    } catch {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<><Navbar isLoggedIn={Boolean(localStorage.getItem('token'))} /><LandingPage /></>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/dashboard" element={<Protected><><Navbar isLoggedIn={Boolean(localStorage.getItem('token'))} /><DashboardPage /></></Protected>} />
          <Route path="/vehicles" element={<Protected><><Navbar isLoggedIn={Boolean(localStorage.getItem('token'))} /><VehiclesPage /></></Protected>} />
          <Route path="/booking" element={<Protected><><Navbar isLoggedIn={Boolean(localStorage.getItem('token'))} /><BookingPage /></></Protected>} />
          <Route path="/payment" element={<Protected><><Navbar isLoggedIn={Boolean(localStorage.getItem('token'))} /><PaymentPage /></></Protected>} />
          <Route path="/tracking" element={<Protected><><Navbar isLoggedIn={Boolean(localStorage.getItem('token'))} /><TrackingPage /></></Protected>} />
          <Route path="/mechanic-tracking" element={<MechanicOnly><><Navbar isLoggedIn={Boolean(localStorage.getItem('token'))} /><MechanicTrackingPage /></></MechanicOnly>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
