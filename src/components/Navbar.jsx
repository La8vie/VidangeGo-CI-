import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Car, User, ArrowLeft, Home, Car as CarIcon, Calendar, MapPin, LogOut, Settings, List } from 'lucide-react';
import NotificationsSystem from './NotificationsSystem';
import './Navbar.css';
import './NavbarModern.css';

export default function Navbar({ isLoggedIn = false }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('lastBooking');
        navigate('/login');
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <nav className="navbar-modern">
            <div className="container navbar-inner-modern">
                <Link to="/" className="navbar-brand-modern">
                    <div className="brand-icon-wrapper">
                        <Car size={32} strokeWidth={2.5} className="brand-icon" />
                    </div>
                    <div className="brand-text">
                        <span className="brand-name">VidangeGo</span>
                        <span className="brand-ci">CI</span>
                    </div>
                </Link>

                <div className={`navbar-links-modern ${menuOpen ? 'open' : ''}`}>
                    {isLoggedIn && (
                        <button type="button" className="nav-btn-modern back-btn-modern" onClick={handleBack}>
                            <ArrowLeft size={18} />
                            <span>Retour</span>
                        </button>
                    )}
                    {!isLoggedIn ? (
                        <div className="nav-landing">
                            <a href="#services" className="nav-link-modern">Services</a>
                            <a href="#how-it-works" className="nav-link-modern">Comment ça marche</a>
                            <a href="#pricing" className="nav-link-modern">Tarifs</a>
                            <div className="nav-actions">
                                <Link to="/login" className="nav-btn-modern primary-modern">
                                    Connexion
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="nav-dashboard">
                            <div className="nav-menu-items">
                                <Link 
                                    to="/dashboard" 
                                    className={`nav-item-modern ${location.pathname === '/dashboard' ? 'active' : ''}`}
                                >
                                    <Home size={18} />
                                    <span>Tableau de bord</span>
                                </Link>
                                <Link 
                                    to="/vehicles" 
                                    className={`nav-item-modern ${location.pathname === '/vehicles' ? 'active' : ''}`}
                                >
                                    <CarIcon size={18} />
                                    <span>Mes Véhicules</span>
                                </Link>
                                <Link 
                                    to="/brands" 
                                    className={`nav-item-modern ${location.pathname === '/brands' ? 'active' : ''}`}
                                >
                                    <List size={18} />
                                    <span>Marques & Modèles</span>
                                </Link>
                                <Link 
                                    to="/booking" 
                                    className={`nav-item-modern ${location.pathname === '/booking' ? 'active' : ''}`}
                                >
                                    <Calendar size={18} />
                                    <span>Réserver</span>
                                </Link>
                                <Link 
                                    to="/tracking" 
                                    className={`nav-item-modern ${location.pathname === '/tracking' ? 'active' : ''}`}
                                >
                                    <MapPin size={18} />
                                    <span>Suivi</span>
                                </Link>
                            </div>
                            <div className="nav-user-section">
                                <NotificationsSystem />
                                <div className="user-avatar-modern">
                                    <User size={20} />
                                </div>
                                <div className="user-dropdown">
                                    <button className="dropdown-trigger">
                                        <Settings size={16} />
                                    </button>
                                    <div className="dropdown-menu">
                                        <Link to="/settings" className="dropdown-item">
                                            <Settings size={16} />
                                            <span>Paramètres</span>
                                        </Link>
                                        <button type="button" className="dropdown-item logout-item" onClick={handleLogout}>
                                            <LogOut size={16} />
                                            <span>Déconnexion</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <button className="navbar-toggle-modern" onClick={() => setMenuOpen(!menuOpen)}>
                    <div className="toggle-icon">
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </div>
                </button>
            </div>
        </nav>
    );
}
