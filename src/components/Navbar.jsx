import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Car, User } from 'lucide-react';
import './Navbar.css';

export default function Navbar({ isLoggedIn = false }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

    return (
        <nav className="navbar">
            <div className="container navbar-inner">
                <Link to="/" className="navbar-brand">
                    <Car size={28} strokeWidth={2.5} />
                    <span>VidangeGo</span>
                    <span className="brand-ci">CI</span>
                </Link>

                <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                    {!isLoggedIn ? (
                        <>
                            <a href="#services">Services</a>
                            <a href="#how-it-works">Comment ça marche</a>
                            <a href="#pricing">Tarifs</a>
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
