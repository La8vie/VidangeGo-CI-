// Page d'inscription publique pour VidangeGo CI
// Permet aux utilisateurs de créer leur propre compte

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Check, X, Shield, Car, MapPin, Clock, Phone, Mail, User, Lock } from 'lucide-react';
import { authService } from '../services/api';
import publicAuthService from '../services/publicAuthService';
import sentryService from '../services/sentryService';
import './PublicRegisterPage.css';

export default function PublicRegisterPage() {
    const [step, setStep] = useState(1); // 1: Info personnelles, 2: Vérification, 3: Succès
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // État du formulaire
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        company: '',
        address: '',
        vehicleType: '',
        acceptTerms: false,
        newsletter: false
    });

    // État de validation
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        message: '',
        color: 'red'
    });

    // État de vérification
    const [verificationCode, setVerificationCode] = useState('');
    const [emailVerified, setEmailVerified] = useState(false);

    const navigate = useNavigate();

    // Types de véhicules disponibles
    const vehicleTypes = [
        { id: 'particulier', name: 'Véhicule Particulier', icon: 'car' },
        { id: 'utilitaire', name: 'Véhicule Utilitaire', icon: 'truck' },
        { id: 'moto', name: 'Moto', icon: 'motorcycle' },
        { id: 'camion', name: 'Camion/Poids Lourd', icon: 'truck' },
        { id: 'engin', name: 'Engin de chantier', icon: 'tractor' }
    ];

    // Validation du mot de passe
    const validatePassword = (password) => {
        let score = 0;
        let message = '';
        let color = 'red';

        if (password.length >= 8) score++;
        if (password.match(/[a-z]/)) score++;
        if (password.match(/[A-Z]/)) score++;
        if (password.match(/[0-9]/)) score++;
        if (password.match(/[^a-zA-Z0-9]/)) score++;

        if (score <= 2) {
            message = 'Mot de passe faible';
            color = 'red';
        } else if (score <= 3) {
            message = 'Mot de passe moyen';
            color = 'orange';
        } else if (score <= 4) {
            message = 'Mot de passe fort';
            color = 'yellow';
        } else {
            message = 'Mot de passe très fort';
            color = 'green';
        }

        setPasswordStrength({ score, message, color });
        return score;
    };

    // Gérer les changements du formulaire
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (name === 'password') {
            validatePassword(value);
        }
    };

    // Valider le formulaire
    const validateForm = () => {
        const errors = [];

        if (!formData.firstName.trim()) errors.push('Le prénom est requis');
        if (!formData.lastName.trim()) errors.push('Le nom est requis');
        if (!formData.email.trim()) errors.push('L\'email est requis');
        if (!formData.phone.trim()) errors.push('Le téléphone est requis');
        if (!formData.password) errors.push('Le mot de passe est requis');
        if (!formData.confirmPassword) errors.push('La confirmation du mot de passe est requise');
        if (!formData.vehicleType) errors.push('Le type de véhicule est requis');
        if (!formData.acceptTerms) errors.push('Vous devez accepter les conditions d\'utilisation');

        if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            errors.push('Format d\'email invalide');
        }

        if (formData.phone && !formData.phone.match(/^[\+]?[0-9\s\-\(\)]+$/)) {
            errors.push('Format de téléphone invalide');
        }

        if (formData.password !== formData.confirmPassword) {
            errors.push('Les mots de passe ne correspondent pas');
        }

        if (passwordStrength.score < 3) {
            errors.push('Le mot de passe est trop faible');
        }

        return errors;
    };

    // Envoyer le code de vérification
    const sendVerificationCode = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await publicAuthService.sendVerificationCode(formData.email);

            setSuccess('Code de vérification envoyé par email');
            return true;
        } catch (error) {
            setError('Erreur lors de l\'envoi du code de vérification');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Vérifier le code
    const verifyCode = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await publicAuthService.verifyCode(formData.email, verificationCode);

            if (response.verified) {
                setEmailVerified(true);
                setSuccess('Email vérifié avec succès');
                return true;
            } else {
                setError('Code de vérification invalide');
                return false;
            }
        } catch (error) {
            setError('Erreur lors de la vérification du code');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Soumettre l'inscription
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const errors = validateForm();
        if (errors.length > 0) {
            setError(errors.join(', '));
            return;
        }

        if (!emailVerified) {
            setError('Veuillez vérifier votre email avant de continuer');
            return;
        }

        try {
            setLoading(true);

            const payload = {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim().toLowerCase(),
                phone: formData.phone.trim(),
                password: formData.password,
                company: formData.company.trim(),
                address: formData.address.trim(),
                vehicleType: formData.vehicleType,
                acceptTerms: formData.acceptTerms,
                newsletter: formData.newsletter,
                emailVerified: emailVerified,
                registrationSource: 'public'
            };

            console.log('=== DÉBUT INSCRIPTION PUBLIQUE ===');
            console.log('Données utilisateur:', payload);

            const response = await publicAuthService.register(payload);

            if (!response || !response.token || !response.user) {
                throw new Error('Réponse invalide du serveur');
            }

            // Sauvegarder dans localStorage
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));

            sentryService.addBreadcrumb('Public registration successful', 'auth', 'info', {
                email: formData.email,
                vehicleType: formData.vehicleType
            });

            setStep(3); // Succès

        } catch (err) {
            console.error('=== ERREUR INSCRIPTION PUBLIQUE ===');
            console.error('Message:', err.message);

            // Nettoyer localStorage en cas d'erreur
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            setError(err?.message || "Erreur lors de l'inscription");

            sentryService.captureError(err, {
                context: 'public_registration',
                email: formData.email
            });
        } finally {
            setLoading(false);
        }
    };

    // Passer à l'étape suivante
    const nextStep = async () => {
        if (step === 1) {
            const errors = validateForm();
            if (errors.length > 0) {
                setError(errors.join(', '));
                return;
            }
            
            // Envoyer le code de vérification
            const codeSent = await sendVerificationCode();
            if (codeSent) {
                setStep(2);
            }
        }
    };

    // Revenir à l'étape précédente
    const prevStep = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    // Rendu de l'étape 1: Informations personnelles
    const renderStep1 = () => (
        <div className="public-register-page">
            <div className="register-left">
                <div className="register-left-content">
                    <div className="register-logo-container">
                        <img src="/assets/vidangego-logo.svg" alt="VidangeGo CI Logo" className="register-logo" />
                    </div>
                    <h2>Rejoignez VidangeGo CI</h2>
                    <p>Créez votre compte et profitez de nos services de vidange à domicile</p>
                    
                    <div className="register-features">
                        <div className="register-feature">
                            <div className="feature-icon">
                                <Car size={24} />
                            </div>
                            <div>
                                <strong>Service à domicile</strong>
                                <span>Nous venons chez vous</span>
                            </div>
                        </div>
                        <div className="register-feature">
                            <div className="feature-icon">
                                <Clock size={24} />
                            </div>
                            <div>
                                <strong>Rapidité</strong>
                                <span>Intervention sous 24h</span>
                            </div>
                        </div>
                        <div className="register-feature">
                            <div className="feature-icon">
                                <Shield size={24} />
                            </div>
                            <div>
                                <strong>Garantie</strong>
                                <span>Travail professionnel garanti</span>
                            </div>
                        </div>
                        <div className="register-feature">
                            <div className="feature-icon">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <strong>Suivi GPS</strong>
                                <span>Localisation en temps réel</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="register-right">
                <div className="register-form-container">
                    <form className="register-form" onSubmit={handleSubmit}>
                        <div className="register-header">
                            <Link to="/" className="register-brand">
                                <img src="/assets/vidangego-logo.svg" alt="VidangeGo CI" className="brand-logo" />
                                <span>VidangeGo <span className="brand-ci">CI</span></span>
                            </Link>
                            <div className="register-progress">
                                <div className="progress-step active">1</div>
                                <div className="progress-line"></div>
                                <div className="progress-step">2</div>
                                <div className="progress-line"></div>
                                <div className="progress-step">3</div>
                            </div>
                        </div>

                        <div className="register-title-section">
                            <h1>Créer votre compte</h1>
                            <p className="register-subtitle">Informations personnelles</p>
                        </div>

                        {error && (
                            <div className="error-message">
                                <X size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="success-message">
                                <Check size={16} />
                                <span>{success}</span>
                            </div>
                        )}

                        <div className="form-fields">
                            <div className="form-row">
                                <div className="input-group">
                                    <label htmlFor="firstName">
                                        <User size={16} />
                                        Prénom *
                                    </label>
                                    <input
                                        id="firstName"
                                        type="text"
                                        className="input"
                                        placeholder="Votre prénom"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        name="firstName"
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="lastName">
                                        <User size={16} />
                                        Nom *
                                    </label>
                                    <input
                                        id="lastName"
                                        type="text"
                                        className="input"
                                        placeholder="Votre nom"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        name="lastName"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label htmlFor="email">
                                    <Mail size={16} />
                                    Email professionnel *
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    className="input"
                                    placeholder="exemple@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    name="email"
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="phone">
                                    <Phone size={16} />
                                    Téléphone *
                                </label>
                                <input
                                    id="phone"
                                    type="tel"
                                    className="input"
                                    placeholder="+225 00 00 00 00"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    name="phone"
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="company">
                                    <Car size={16} />
                                    Entreprise (optionnel)
                                </label>
                                <input
                                    id="company"
                                    type="text"
                                    className="input"
                                    placeholder="Nom de votre entreprise"
                                    value={formData.company}
                                    onChange={handleChange}
                                    name="company"
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="address">
                                    <MapPin size={16} />
                                    Adresse *
                                </label>
                                <input
                                    id="address"
                                    type="text"
                                    className="input"
                                    placeholder="Votre adresse complète"
                                    value={formData.address}
                                    onChange={handleChange}
                                    name="address"
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label>Type de véhicule *</label>
                                <div className="vehicle-types">
                                    {vehicleTypes.map(type => (
                                        <label key={type.id} className="vehicle-type">
                                            <input
                                                type="radio"
                                                name="vehicleType"
                                                value={type.id}
                                                checked={formData.vehicleType === type.id}
                                                onChange={handleChange}
                                                required
                                            />
                                            <div className="vehicle-type-content">
                                                <span className="vehicle-icon">{type.icon}</span>
                                                <span className="vehicle-name">{type.name}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="input-group">
                                    <label htmlFor="password">
                                        <Lock size={16} />
                                        Mot de passe *
                                    </label>
                                    <div className="password-input-container">
                                        <input
                                            id="password"
                                            type="password"
                                            className="input"
                                            placeholder="Mot de passe sécurisé"
                                            value={formData.password}
                                            onChange={handleChange}
                                            name="password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => {
                                                const input = document.getElementById('password');
                                                input.type = input.type === 'password' ? 'text' : 'password';
                                            }}
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </div>
                                    {formData.password && (
                                        <div className="password-strength">
                                            <div className="strength-bar">
                                                <div 
                                                    className={`strength-fill ${passwordStrength.color}`}
                                                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className={`strength-text ${passwordStrength.color}`}>
                                                {passwordStrength.message}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="input-group">
                                    <label htmlFor="confirmPassword">
                                        <Lock size={16} />
                                        Confirmer le mot de passe *
                                    </label>
                                    <div className="password-input-container">
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            className="input"
                                            placeholder="Confirmer le mot de passe"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            name="confirmPassword"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => {
                                                const input = document.getElementById('confirmPassword');
                                                input.type = input.type === 'password' ? 'text' : 'password';
                                            }}
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="acceptTerms"
                                        checked={formData.acceptTerms}
                                        onChange={handleChange}
                                        required
                                    />
                                    <span className="checkbox-text">
                                        J'accepte les <Link to="/terms" target="_blank">conditions d'utilisation</Link> et la <Link to="/privacy" target="_blank">politique de confidentialité</Link> *
                                    </span>
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="newsletter"
                                        checked={formData.newsletter}
                                        onChange={handleChange}
                                    />
                                    <span className="checkbox-text">
                                        Je souhaite recevoir les newsletters et offres promotionnelles
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="register-actions">
                            <button type="button" className="btn btn-outline" onClick={prevStep}>
                                Annuler
                            </button>
                            <button type="button" className="btn btn-primary" onClick={nextStep} disabled={loading}>
                                {loading ? (
                                    <span className="loading-spinner">Envoi en cours...</span>
                                ) : (
                                    <>
                                        Continuer
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="register-footer">
                            <p className="register-subtitle">
                                Déjà un compte ? <Link to="/login">Se connecter</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );

    // Rendu de l'étape 2: Vérification email
    const renderStep2 = () => (
        <div className="public-register-page">
            <div className="register-left">
                <div className="register-left-content">
                    <div className="register-logo-container">
                        <img src="/assets/vidangego-logo.svg" alt="VidangeGo CI Logo" className="register-logo" />
                    </div>
                    <h2>Vérifiez votre email</h2>
                    <p>Nous avons envoyé un code de vérification à votre adresse email</p>
                </div>
            </div>

            <div className="register-right">
                <div className="register-form-container">
                    <form className="register-form" onSubmit={handleSubmit}>
                        <div className="register-header">
                            <Link to="/" className="register-brand">
                                <img src="/assets/vidangego-logo.svg" alt="VidangeGo CI" className="brand-logo" />
                                <span>VidangeGo <span className="brand-ci">CI</span></span>
                            </Link>
                            <div className="register-progress">
                                <div className="progress-step completed">1</div>
                                <div className="progress-line active"></div>
                                <div className="progress-step active">2</div>
                                <div className="progress-line"></div>
                                <div className="progress-step">3</div>
                            </div>
                        </div>

                        <div className="register-title-section">
                            <h1>Vérification email</h1>
                            <p className="register-subtitle">
                                Entrez le code à 6 chiffres envoyé à {formData.email}
                            </p>
                        </div>

                        {error && (
                            <div className="error-message">
                                <X size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="success-message">
                                <Check size={16} />
                                <span>{success}</span>
                            </div>
                        )}

                        <div className="verification-section">
                            <div className="input-group">
                                <label htmlFor="verificationCode">Code de vérification</label>
                                <input
                                    id="verificationCode"
                                    type="text"
                                    className="input verification-input"
                                    placeholder="000000"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    maxLength={6}
                                    autoFocus
                                />
                            </div>

                            <div className="verification-actions">
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={sendVerificationCode}
                                    disabled={loading}
                                >
                                    Renvoyer le code
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={verifyCode}
                                    disabled={loading || verificationCode.length !== 6}
                                >
                                    {loading ? (
                                        <span className="loading-spinner">Vérification...</span>
                                    ) : (
                                        <>
                                            Vérifier
                                            <Check size={18} />
                                        </>
                                    )}
                                </button>
                            </div>

                            {emailVerified && (
                                <div className="verified-success">
                                    <Check size={24} />
                                    <span>Email vérifié avec succès !</span>
                                </div>
                            )}
                        </div>

                        <div className="register-actions">
                            <button type="button" className="btn btn-outline" onClick={prevStep}>
                                Retour
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading || !emailVerified}
                            >
                                {loading ? (
                                    <span className="loading-spinner">Création du compte...</span>
                                ) : (
                                    <>
                                        Créer mon compte
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );

    // Rendu de l'étape 3: Succès
    const renderStep3 = () => (
        <div className="public-register-page">
            <div className="register-success">
                <div className="success-container">
                    <div className="success-icon">
                        <Check size={48} />
                    </div>
                    <h1>Inscription réussie !</h1>
                    <p>Félicitations ! Votre compte VidangeGo CI a été créé avec succès.</p>
                    
                    <div className="success-info">
                        <div className="info-item">
                            <Mail size={20} />
                            <span>{formData.email}</span>
                        </div>
                        <div className="info-item">
                            <Phone size={20} />
                            <span>{formData.phone}</span>
                        </div>
                        <div className="info-item">
                            <Car size={20} />
                            <span>{vehicleTypes.find(v => v.id === formData.vehicleType)?.name}</span>
                        </div>
                    </div>

                    <div className="success-actions">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="btn btn-primary btn-lg"
                        >
                            Accéder à mon tableau de bord
                            <ArrowRight size={20} />
                        </button>
                    </div>

                    <div className="success-next-steps">
                        <h3>Prochaines étapes</h3>
                        <ul>
                            <li>Complétez votre profil avec vos informations</li>
                            <li>Ajoutez vos véhicules pour un service rapide</li>
                            <li>Prenez rendez-vous pour votre première vidange</li>
                            <li>Profitez de notre suivi GPS en temps réel</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
        </>
    );
}
