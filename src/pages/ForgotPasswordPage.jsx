import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Mail } from 'lucide-react';
import { authService } from '../services/api';
import './LoginPage.css';

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [email, setEmail] = useState('');

    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        
        try {
            setLoading(true);
            // TODO: Implémenter l'API de réinitialisation de mot de passe
            // await authService.forgotPassword({ email });
            
            // Simulation pour le moment
            await new Promise(resolve => setTimeout(resolve, 2000));
            setSuccess(true);
        } catch (err) {
            setError(err?.message || 'Erreur lors de l\'envoi de l\'email de réinitialisation');
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
                    <h2>Réinitialiser votre mot de passe</h2>
                    <p>Recevez un lien sécurisé pour réinitialiser votre mot de passe.</p>
                    <div className="login-features">
                        <div className="login-feature">
                            <div className="feature-icon">🔒</div>
                            <div>
                                <strong>Sécurité garantie</strong>
                                <span>Lien chiffré et sécurisé</span>
                            </div>
                        </div>
                        <div className="login-feature">
                            <div className="feature-icon">⚡</div>
                            <div>
                                <strong>Email instantané</strong>
                                <span>Réception immédiate</span>
                            </div>
                        </div>
                        <div className="login-feature">
                            <div className="feature-icon">⏰</div>
                            <div>
                                <strong>Lien valable 24h</strong>
                                <span>Temps limité pour la sécurité</span>
                            </div>
                        </div>
                        <div className="login-feature">
                            <div className="feature-icon">🎧</div>
                            <div>
                                <strong>Support 24/7</strong>
                                <span>Aide disponible en permanence</span>
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
                            <h1>Mot de passe oublié</h1>
                            <p className="login-subtitle">Entrez votre email pour recevoir un lien de réinitialisation</p>
                        </div>

                        {success && (
                            <div className="success-message">
                                <Mail size={20} style={{ marginRight: '12px', flexShrink: 0 }} />
                                <div>
                                    <strong>Email envoyé avec succès !</strong>
                                    <span>Vérifiez votre boîte de réception et cliquez sur le lien de réinitialisation.</span>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="error-message">
                                <span>⚠️ {error}</span>
                            </div>
                        )}

                        {!success && (
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
                            </div>
                        )}

                        <div className="login-actions">
                            {!success && (
                                <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
                                    {loading ? (
                                        <span className="loading-spinner">Envoi en cours...</span>
                                    ) : (
                                        <>
                                            Envoyer le lien
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            )}

                            {success && (
                                <button 
                                    type="button" 
                                    className="btn btn-secondary btn-lg btn-full"
                                    onClick={() => navigate('/login')}
                                >
                                    Retour à la connexion
                                </button>
                            )}
                        </div>

                        <div className="login-footer">
                            <p className="login-subtitle">
                                <Link to="/login" className="text-orange">
                                    <ArrowLeft size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                    Retour à la connexion
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
