import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BookingPage from './pages/BookingPage';
import VehiclesPage from './pages/VehiclesPage';
import PaymentPage from './pages/PaymentPage';
import TrackingPage from './pages/TrackingPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<><Navbar /><LandingPage /></>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<><Navbar isLoggedIn /><DashboardPage /></>} />
          <Route path="/vehicles" element={<><Navbar isLoggedIn /><VehiclesPage /></>} />
          <Route path="/booking" element={<><Navbar isLoggedIn /><BookingPage /></>} />
          <Route path="/payment" element={<><Navbar isLoggedIn /><PaymentPage /></>} />
          <Route path="/tracking" element={<><Navbar isLoggedIn /><TrackingPage /></>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
