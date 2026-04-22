import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Check, X, AlertTriangle } from 'lucide-react';
import adminSecurityService from '../services/admin-security-service';
import './AdminChangePasswordPage.css';

export default function AdminChangePasswordPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [validation, setValidation] = useState({
    newPassword: { isValid: false, errors: [] }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur est admin et si le changement est requis
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (user.role !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }
    
    if (!adminSecurityService.isPasswordChangeRequired()) {
      navigate('/admin/dashboard');
      return;
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Valider le nouveau mot de passe en temps réel
    if (name === 'newPassword') {
      const validation = adminSecurityService.validatePassword(value);
      setValidation(prev => ({
        ...prev,
        newPassword: validation
      }));
    }

    // Effacer les erreurs
    if (error) setError('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const generateSecurePassword = () => {
    const securePassword = adminSecurityService.generateSecurePassword(16);
    setFormData(prev => ({
      ...prev,
      newPassword: securePassword,
      confirmPassword: securePassword
    }));
    
    const validation = adminSecurityService.validatePassword(securePassword);
    setValidation(prev => ({
      ...prev,
      newPassword: validation
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation des champs
      if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
        throw new Error('Tous les champs sont obligatoires');
      }

      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas');
      }

      if (!validation.newPassword.isValid) {
        throw new Error(validation.newPassword.errors.join(', '));
      }

      // Tenter de changer le mot de passe
      await adminSecurityService.forcePasswordChange(
        formData.newPassword,
        formData.currentPassword
      );

      setSuccess(true);
      
      // Rediriger après 2 secondes
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const requirements = adminSecurityService.getPasswordRequirements();

  if (success) {
    return (
      <div className="admin-change-password-page">
        <div className="success-container">
          <div className="success-icon">
            <Check size={64} color="#28a745" />
          </div>
          <h1>Mot de passe changé avec succès!</h1>
          <p>Votre compte est maintenant sécurisé. Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-change-password-page">
      <div className="change-password-container">
        <div className="security-header">
          <AlertTriangle size={48} color="#dc3545" />
          <h1>Sécurité Critique</h1>
          <p>Vous utilisez les identifiants par défaut. Pour des raisons de sécurité, vous devez changer votre mot de passe immédiatement.</p>
        </div>

        <form onSubmit={handleSubmit} className="change-password-form">
          <div className="form-group">
            <label htmlFor="currentPassword">
              <Lock size={20} />
              Mot de passe actuel
            </label>
            <div className="password-input-container">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                placeholder="Entrez votre mot de passe actuel"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => togglePasswordVisibility('current')}
              >
                {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">
              <Lock size={20} />
              Nouveau mot de passe
            </label>
            <div className="password-input-container">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Entrez votre nouveau mot de passe"
                required
                className={validation.newPassword.isValid ? 'valid' : 'invalid'}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => togglePasswordVisibility('new')}
              >
                {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            <button
              type="button"
              className="generate-password-btn"
              onClick={generateSecurePassword}
            >
              Générer un mot de passe sécurisé
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              <Lock size={20} />
              Confirmer le nouveau mot de passe
            </label>
            <div className="password-input-container">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirmez votre nouveau mot de passe"
                required
                className={formData.confirmPassword === formData.newPassword && formData.confirmPassword ? 'valid' : 'invalid'}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Exigences du mot de passe */}
          <div className="password-requirements">
            <h3>Exigences du mot de passe:</h3>
            <ul>
              <li className={formData.newPassword.length >= requirements.minLength ? 'valid' : 'invalid'}>
                {formData.newPassword.length >= requirements.minLength ? <Check size={16} /> : <X size={16} />}
                Au moins {requirements.minLength} caractères
              </li>
              <li className={/[A-Z]/.test(formData.newPassword) ? 'valid' : 'invalid'}>
                {/[A-Z]/.test(formData.newPassword) ? <Check size={16} /> : <X size={16} />}
                Au moins une majuscule
              </li>
              <li className={/[a-z]/.test(formData.newPassword) ? 'valid' : 'invalid'}>
                {/[a-z]/.test(formData.newPassword) ? <Check size={16} /> : <X size={16} />}
                Au moins une minuscule
              </li>
              <li className={/\d/.test(formData.newPassword) ? 'valid' : 'invalid'}>
                {/\d/.test(formData.newPassword) ? <Check size={16} /> : <X size={16} />}
                Au moins un chiffre
              </li>
              <li className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) ? 'valid' : 'invalid'}>
                {/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) ? <Check size={16} /> : <X size={16} />}
                Au moins un caractère spécial
              </li>
              <li className={!/admin|password|vidangego/i.test(formData.newPassword) ? 'valid' : 'invalid'}>
                {!/admin|password|vidangego/i.test(formData.newPassword) ? <Check size={16} /> : <X size={16} />}
                Ne pas contenir "admin", "password" ou "vidangego"
              </li>
            </ul>
          </div>

          {/* Erreurs de validation */}
          {validation.newPassword.errors.length > 0 && (
            <div className="validation-errors">
              <h4>Erreurs:</h4>
              <ul>
                {validation.newPassword.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <div className="error-message">
              <AlertTriangle size={20} />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="submit-btn"
            disabled={loading || !validation.newPassword.isValid || formData.newPassword !== formData.confirmPassword}
          >
            {loading ? 'Changement en cours...' : 'Changer le mot de passe'}
          </button>
        </form>

        <div className="security-info">
          <h3>Pourquoi ce changement est nécessaire?</h3>
          <ul>
            <li>Les identifiants par défaut sont publics dans la documentation</li>
            <li> Ils représentent un risque de sécurité critique</li>
            <li>Un mot de passe fort protège vos données et celles des utilisateurs</li>
            <li>Ce changement est obligatoire pour continuer à utiliser l'administration</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
