import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Car } from 'lucide-react';
import { authService } from '../services/api';
import './LoginPage.css';

export default function RegisterPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            setLoading(true);
            const payload = {
                name,
                email,
                password,
                ...(phone ? { phone } : {}),
            };
            const { token, user } = await authService.register(payload);
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            navigate('/dashboard');
        } catch (err) {
            setError(err?.message || "Erreur lors de l'inscription");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-left">
                <div className="login-left-content">
                    <Car size={48} color="white" />
                    <h2>Créer votre compte VidangeGo CI</h2>
                    <p>Inscrivez-vous pour réserver une vidange à domicile.</p>
                    <div className="login-features">
                        <div className="login-feature">✓ Service en 30 minutes</div>
                        <div className="login-feature">✓ Paiement Mobile Money</div>
                        <div className="login-feature">✓ Mécaniciens certifiés</div>
                        <div className="login-feature">✓ Garantie 30 jours</div>
                    </div>
                </div>
            </div>

            <div className="login-right">
                <form className="login-form" onSubmit={handleSubmit}>
                    <Link to="/" className="login-brand">
                        <Car size={24} color="var(--orange-500)" />
                        <span>VidangeGo <span className="brand-ci">CI</span></span>
                    </Link>

                    <h1>Inscription</h1>

                    {error && (
                        <p className="login-subtitle" style={{ color: 'var(--danger, #E53E3E)' }}>{error}</p>
                    )}

                    <div className="input-group" style={{ marginTop: '12px' }}>
                        <label>Nom</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Votre nom"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            autoFocus
                            required
                        />
                    </div>

                    <div className="input-group" style={{ marginTop: '12px' }}>
                        <label>Téléphone (optionnel)</label>
                        <input
                            type="tel"
                            className="input"
                            placeholder="Ex: 0102030405"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                        />
                    </div>

                    <div className="input-group" style={{ marginTop: '12px' }}>
                        <label>Email</label>
                        <input
                            type="email"
                            className="input"
                            placeholder="ex: nom@email.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group" style={{ marginTop: '12px' }}>
                        <label>Mot de passe</label>
                        <input
                            type="password"
                            className="input"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }} disabled={loading}>
                        {loading ? 'Inscription…' : <>Créer mon compte <ArrowRight size={18} /></>}
                    </button>

                    <p className="login-subtitle" style={{ marginTop: '12px' }}>
                        Déjà un compte ? <Link to="/login" className="text-orange" style={{ fontWeight: 600 }}>Se connecter</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
