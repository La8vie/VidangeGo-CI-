import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Car, User, ArrowLeft } from 'lucide-react';
import './Navbar.css';

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
        <nav className="navbar">
            <div className="container navbar-inner">
                <Link to="/" className="navbar-brand">
                    <Car size={28} strokeWidth={2.5} />
                    <span>VidangeGo</span>
                    <span className="brand-ci">CI</span>
                </Link>

                <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                    {isLoggedIn && (
                        <button type="button" className="btn btn-ghost btn-sm back-btn" onClick={handleBack}>
                            <ArrowLeft size={18} />
                            Retour
                        </button>
                    )}
                    {!isLoggedIn ? (
                        <>
                            <a href="#services">Services</a>
                            <a href="#how-it-works">Comment ça marche</a>
                            <a href="#pricing">Tarifs</a>
                            <Link to="/register" className="btn btn-secondary btn-sm">Inscription</Link>
                            <Link to="/login" className="btn btn-primary btn-sm">Connexion</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Tableau de bord</Link>
                            <Link to="/vehicles" className={location.pathname === '/vehicles' ? 'active' : ''}>Mes Véhicules</Link>
                            <Link to="/booking" className={location.pathname === '/booking' ? 'active' : ''}>Réserver</Link>
                            <Link to="/tracking" className={location.pathname === '/tracking' ? 'active' : ''}>Suivi</Link>
                            <div className="navbar-avatar">
                                <User size={18} />
                            </div>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={handleLogout}>Déconnexion</button>
                        </>
                    )}
                </div>

                <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
        </nav>
    );
}
