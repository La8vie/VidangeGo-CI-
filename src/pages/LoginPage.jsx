import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, ArrowRight, Car } from 'lucide-react';
import './LoginPage.css';

export default function LoginPage() {
    const [step, setStep] = useState('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const navigate = useNavigate();

    const handleOtpChange = (value, index) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (step === 'phone' && phone.length >= 10) {
            setStep('otp');
        } else if (step === 'otp') {
            navigate('/dashboard');
        }
    };

    return (
        <div className="login-page">
            <div className="login-left">
                <div className="login-left-content">
                    <Car size={48} color="white" />
                    <h2>Bienvenue sur VidangeGo CI</h2>
                    <p>La vidange à domicile, simplifiée.</p>
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

                    {step === 'phone' ? (
                        <>
                            <h1>Connexion</h1>
                            <p className="login-subtitle">Entrez votre numéro de téléphone ivoirien</p>
                            <div className="phone-input-wrapper">
                                <div className="phone-prefix">
                                    <span>🇨🇮</span>
                                    <span>+225</span>
                                </div>
                                <input
                                    type="tel"
                                    className="input phone-input"
                                    placeholder="07 XX XX XX XX"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    maxLength={14}
                                    autoFocus
                                />
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={phone.length < 10}>
                                Recevoir le code <ArrowRight size={18} />
                            </button>
                        </>
                    ) : (
                        <>
                            <h1>Vérification</h1>
                            <p className="login-subtitle">
                                Code envoyé au <strong>+225 {phone}</strong>
                            </p>
                            <div className="otp-inputs">
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        id={`otp-${i}`}
                                        type="text"
                                        className="otp-input"
                                        maxLength={1}
                                        value={digit}
                                        onChange={e => handleOtpChange(e.target.value, i)}
                                        autoFocus={i === 0}
                                    />
                                ))}
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                                Valider <ArrowRight size={18} />
                            </button>
                            <button type="button" className="resend-btn" onClick={() => setStep('phone')}>
                                ← Changer de numéro
                            </button>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}
