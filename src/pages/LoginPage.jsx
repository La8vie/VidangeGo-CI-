import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Car, Lock, Mail, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { authService } from '../services/api';
import adminSecurityService from '../services/admin-security-service';
import './LoginPage.css';

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            console.log('Tentative de connexion avec:', { email, password });
            
            // Vérifier si ce sont les credentials admin par défaut
            const isDefaultAdmin = adminSecurityService.checkDefaultCredentials(email, password);
            
            if (isDefaultAdmin) {
                // Journaliser la tentative de connexion avec credentials par défaut
                adminSecurityService.logLoginAttempt(email, false, 'Credentials admin par défaut utilisés');
                
                // Marquer que c'est la première connexion
                adminSecurityService.markFirstLogin();
                
                console.log('Connexion admin par défaut détectée - Redirection vers changement de mot de passe');
            }
            
            const { token, user } = await authService.login({ email, password });
            
            console.log('Connexion réussie:', { token: token.substring(0, 20) + '...', user });
            
            // Sauvegarder dans localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            // Journaliser la connexion réussie
            adminSecurityService.logLoginAttempt(email, true);
            
            // Redirection selon le rôle de l'utilisateur
            if (user.role === 'ADMIN') {
                if (isDefaultAdmin) {
                    // Rediriger vers la page de changement de mot de passe
                    setTimeout(() => {
                        navigate('/admin/change-password');
                    }, 100);
                } else {
                    // Rediriger l'administrateur vers le tableau de bord admin
                    setTimeout(() => {
                        navigate('/admin');
                    }, 100);
                }
            } else {
                // Redirection avec délai pour éviter la page blanche
                setTimeout(() => {
                    navigate('/dashboard', { replace: true });
                }, 100);
            }
            
        } catch (err) {
            console.error('Erreur de connexion:', err);
            // Journaliser la tentative échouée
            adminSecurityService.logLoginAttempt(email, false, err?.message);
            setError(err?.message || 'Erreur lors de la connexion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-left">
                <div className="login-left-content">
                    <div className="login-logo-container">
                        <img src="/assets/vidangego-logo.svg" alt="VidangeGo CI Logo" className="login-logo" />
                    </div>
                    <h2>Bienvenue sur VidangeGo CI</h2>
                    <p>La vidange à domicile, simplifiée et professionnelle.</p>
                    <div className="login-features">
                        <div className="login-feature">
                            <div className="feature-icon">🚗</div>
                            <div>
                                <strong>Service rapide</strong>
                                <span>Vidange en 30 minutes</span>
                            </div>
                        </div>
                        <div className="login-feature">
                            <div className="feature-icon">💳</div>
                            <div>
                                <strong>Paiement facile</strong>
                                <span>Mobile Money disponible</span>
                            </div>
                        </div>
                        <div className="login-feature">
                            <div className="feature-icon">🔧</div>
                            <div>
                                <strong>Experts certifiés</strong>
                                <span>Mécaniciens professionnels</span>
                            </div>
                        </div>
                        <div className="login-feature">
                            <div className="feature-icon">🛡️</div>
                            <div>
                                <strong>Garantie totale</strong>
                                <span>30 jours de garantie</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="login-right">
                <div className="login-form-container">
                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="login-header">
                            <Link to="/" className="login-brand">
                                <img src="/assets/vidangego-logo.svg" alt="VidangeGo CI" className="brand-logo" />
                                <span>VidangeGo <span className="brand-ci">CI</span></span>
                            </Link>
                            <button type="button" className="btn btn-ghost btn-sm back-btn" onClick={handleBack}>
                                <ArrowLeft size={16} />
                                Retour
                            </button>
                        </div>

                        <div className="login-title-section">
                            <h1>Connexion</h1>
                            <p className="login-subtitle">Accédez à votre espace personnel</p>
                        </div>

                        {error && (
                            <div className="error-message">
                                <span>⚠️ {error}</span>
                            </div>
                        )}

                        {/* Avertissement de sécurité pour credentials admin par défaut */}
                        {email === 'admin@vidangego.ci' && password === 'admin123' && (
                            <div className="security-warning">
                                <AlertTriangle size={20} />
                                <div>
                                    <strong>Attention sécurité:</strong> Vous utilisez les identifiants par défaut. 
                                    Vous devrez changer votre mot de passe après la connexion.
                                </div>
                            </div>
                        )}

                        <div className="form-fields">
                            <div className="input-group">
                                <label htmlFor="email">Email professionnel</label>
                                <input
                                    id="email"
                                    type="email"
                                    className="input"
                                    placeholder="exemple@email.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    autoFocus
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="password">Mot de passe</label>
                                <div className="password-input-container">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        className="input"
                                        placeholder="•••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="login-actions">
                            <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
                                {loading ? (
                                    <span className="loading-spinner">Connexion en cours...</span>
                                ) : (
                                    <>
                                        Se connecter
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                            
                            <div className="password-options">
                                <label className="checkbox-container">
                                    <input type="checkbox" />
                                    <span className="checkmark"></span>
                                    Se souvenir de moi
                                </label>
                                
                                <Link to="/forgot-password" className="forgot-password-link">
                                    Mot de passe oublié ?
                                </Link>
                            </div>
                        </div>

                        <div className="login-footer">
                            <p className="login-subtitle">
                                Nouveau sur VidangeGo ? <Link to="/register">Créer un compte</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
