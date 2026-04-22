// Page de configuration 2FA (TOTP)
// Interface pour configurer l'authentification à deux facteurs

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Check, X, Copy, Smartphone, QrCode, Key, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import sentryService from '../services/sentryService';

const TwoFactorSetupPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Setup, 2: Verify, 3: Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // État du setup 2FA
  const [totpSecret, setTotpSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [manualKey, setManualKey] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [backupCodesDownloaded, setBackupCodesDownloaded] = useState(false);
  
  // État de vérification
  const [totpToken, setTotpToken] = useState('');
  const [tokenInfo, setTokenInfo] = useState(null);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  
  // Timer pour le token actuel
  const [timeRemaining, setTimeRemaining] = useState(30);

  // Initialiser le setup 2FA
  useEffect(() => {
    initializeTwoFactorSetup();
  }, []);

  // Timer pour le token TOTP
  useEffect(() => {
    if (step === 2 && totpSecret) {
      const interval = setInterval(() => {
        const info = getTokenInfo(totpSecret);
        if (info) {
          setTokenInfo(info);
          setTimeRemaining(info.timeRemaining);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [step, totpSecret]);

  // Initialiser la configuration 2FA
  const initializeTwoFactorSetup = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.post('/api/auth/2fa/setup');
      
      if (response.data.success) {
        const { secret, qrCodeUrl, backupCodes } = response.data.data;
        
        setTotpSecret(secret);
        setQrCodeUrl(qrCodeUrl);
        setManualKey(secret);
        setBackupCodes(backupCodes);
        
        sentryService.addBreadcrumb('2FA setup initialized', 'auth', 'info', {
          step: 'setup_initialized'
        });
      } else {
        setError(response.data.message || 'Erreur lors de l\'initialisation 2FA');
      }
    } catch (error) {
      console.error('Error initializing 2FA setup:', error);
      setError('Erreur lors de l\'initialisation de l\'authentification à deux facteurs');
      
      sentryService.captureError(error, {
        context: '2fa_setup_initialization'
      });
    } finally {
      setLoading(false);
    }
  };

  // Obtenir les informations du token actuel
  const getTokenInfo = (secret) => {
    try {
      // Simuler la génération de token TOTP (côté client pour l'affichage)
      // En production, cette logique serait sur le backend
      const time = Math.floor(Date.now() / 1000);
      const counter = Math.floor(time / 30);
      const nextCounter = (counter + 1) * 30;
      const timeRemaining = nextCounter - time;
      
      return {
        timeRemaining,
        percentage: ((30 - timeRemaining) / 30) * 100
      };
    } catch (error) {
      console.error('Error getting token info:', error);
      return null;
    }
  };

  // Copier dans le presse-papiers
  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess(`${type} copié dans le presse-papiers`);
      setTimeout(() => setSuccess(''), 3000);
      
      sentryService.addBreadcrumb('Copied to clipboard', 'auth', 'info', {
        type
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      setError('Erreur lors de la copie dans le presse-papiers');
    }
  };

  // Télécharger les codes de secours
  const downloadBackupCodes = () => {
    try {
      const codesText = backupCodes.map((code, index) => 
        `Code ${index + 1}: ${code.code}`
      ).join('\n');

      const blob = new Blob([codesText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vidangego-backup-codes-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setBackupCodesDownloaded(true);
      setSuccess('Codes de secours téléchargés');
      setTimeout(() => setSuccess(''), 3000);
      
      sentryService.addBreadcrumb('Backup codes downloaded', 'auth', 'info', {
        codesCount: backupCodes.length
      });
    } catch (error) {
      console.error('Error downloading backup codes:', error);
      setError('Erreur lors du téléchargement des codes de secours');
    }
  };

  // Vérifier le token TOTP
  const verifyToken = async () => {
    if (!totpToken || totpToken.length !== 6) {
      setError('Veuillez entrer un code à 6 chiffres');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await api.post('/api/auth/2fa/verify', {
        totpToken: totpToken
      });
      
      if (response.data.success) {
        setStep(3);
        sentryService.addBreadcrumb('2FA verification successful', 'auth', 'info');
      } else {
        setVerificationAttempts(prev => prev + 1);
        setError(response.data.message || 'Code invalide');
        
        sentryService.addBreadcrumb('2FA verification failed', 'auth', 'warning', {
          attempt: verificationAttempts + 1
        });
      }
    } catch (error) {
      console.error('Error verifying 2FA token:', error);
      setError('Erreur lors de la vérification du code');
      
      sentryService.captureError(error, {
        context: '2fa_verification'
      });
    } finally {
      setLoading(false);
    }
  };

  // Passer à l'étape de vérification
  const proceedToVerification = () => {
    if (!backupCodesDownloaded) {
      setError('Veuillez d\'abord télécharger vos codes de secours');
      return;
    }
    setStep(2);
  };

  // Terminer la configuration 2FA
  const completeSetup = () => {
    navigate('/admin/dashboard', { 
      state: { 
        message: 'Authentification à deux facteurs configurée avec succès',
        type: 'success'
      }
    });
  };

  // Annuler la configuration
  const cancelSetup = () => {
    navigate('/admin/security');
  };

  // Rendu de l'étape 1: Setup
  const renderSetupStep = () => (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center mb-6">
          <Shield className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">
            Configuration de l'Authentification à Deux Facteurs
          </h1>
        </div>

        <div className="mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  Important : Sauvegardez vos codes de secours
                </h3>
                <p className="text-blue-800 text-sm">
                  Conservez ces codes dans un endroit sûr. Ils vous permettront d'accéder à votre compte 
                  si vous perdez l'accès à votre application d'authentification.
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <X className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <Check className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-800">{success}</span>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* QR Code */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <QrCode className="w-5 h-5 mr-2" />
              Scannez le QR Code
            </h2>
            <div className="bg-white border-2 border-gray-200 rounded-lg p-4 mb-4">
              {qrCodeUrl ? (
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code pour 2FA" 
                  className="w-full max-w-xs mx-auto"
                />
              ) : (
                <div className="w-full max-w-xs h-64 bg-gray-100 flex items-center justify-center">
                  <div className="text-gray-500 text-center">
                    <Smartphone className="w-8 h-8 mx-auto mb-2" />
                    <p>Chargement du QR code...</p>
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 text-center">
              Utilisez une application comme Google Authenticator, 
              Microsoft Authenticator ou Authy pour scanner ce code.
            </p>
          </div>

          {/* Configuration manuelle */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Key className="w-5 h-5 mr-2" />
              Configuration Manuelle
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clé secrète
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={manualKey}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-white font-mono text-sm"
                />
                <button
                  onClick={() => copyToClipboard(manualKey, 'Clé secrète')}
                  className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Si vous ne pouvez pas scanner le QR code, entrez manuellement 
              cette clé dans votre application d'authentification.
            </p>
          </div>
        </div>

        {/* Codes de secours */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Codes de Secours
          </h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-yellow-900">
                  Téléchargez vos codes de secours
                </h3>
                <p className="text-yellow-800 text-sm mt-1">
                  Chaque code ne peut être utilisé qu'une seule fois.
                </p>
              </div>
              <button
                onClick={downloadBackupCodes}
                disabled={backupCodesDownloaded}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  backupCodesDownloaded
                    ? 'bg-green-100 text-green-800 cursor-not-allowed'
                    : 'bg-yellow-600 text-white hover:bg-yellow-700'
                }`}
              >
                {backupCodesDownloaded ? 'Téléchargé ✓' : 'Télécharger'}
              </button>
            </div>
            
            {backupCodes.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4">
                {backupCodes.map((code, index) => (
                  <div 
                    key={code.id}
                    className="bg-white border border-yellow-300 rounded p-2 text-center font-mono text-sm"
                  >
                    <div className="text-xs text-gray-500 mb-1">Code {index + 1}</div>
                    <div className="font-bold">{code.code}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between mt-8">
          <button
            onClick={cancelSetup}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={proceedToVerification}
            disabled={!backupCodesDownloaded}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              backupCodesDownloaded
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continuer
          </button>
        </div>
      </div>
    </div>
  );

  // Rendu de l'étape 2: Vérification
  const renderVerificationStep = () => (
    <div className="max-w-lg mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Vérification 2FA
          </h1>
          <p className="text-gray-600">
            Entrez le code à 6 chiffres généré par votre application d'authentification
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <X className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Timer du token */}
        {tokenInfo && (
          <div className="mb-6">
            <div className="flex items-center justify-center mb-2">
              <div className="relative w-16 h-16">
                <svg className="transform -rotate-90 w-16 h-16">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="#e5e7eb"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="#3b82f6"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - tokenInfo.percentage / 100)}`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-semibold">{timeRemaining}</span>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-gray-600">
              Temps restant avant le prochain code
            </p>
          </div>
        )}

        {/* Input du token */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Code d'authentification
          </label>
          <input
            type="text"
            value={totpToken}
            onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            maxLength={6}
            autoFocus
          />
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <button
            onClick={() => setStep(1)}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Retour
          </button>
          <button
            onClick={verifyToken}
            disabled={loading || totpToken.length !== 6}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              loading || totpToken.length !== 6
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? 'Vérification...' : 'Vérifier'}
          </button>
        </div>

        {verificationAttempts > 0 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Tentatives de vérification: {verificationAttempts}/3
          </div>
        )}
      </div>
    </div>
  );

  // Rendu de l'étape 3: Succès
  const renderSuccessStep = () => (
    <div className="max-w-lg mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Authentification 2FA Configurée !
        </h1>
        
        <p className="text-gray-600 mb-6">
          Votre compte est maintenant protégé par l'authentification à deux facteurs. 
          Vous devrez entrer un code de votre application d'authentification 
          lors de vos prochaines connexions.
        </p>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-green-900 mb-2">
            ✅ Configuration terminée
          </h3>
          <ul className="text-green-800 text-sm space-y-1">
            <li>• L'authentification 2FA est maintenant active</li>
            <li>• Vos codes de secours ont été générés</li>
            <li>• Votre compte est sécurisé</li>
          </ul>
        </div>

        <button
          onClick={completeSetup}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Accéder au Tableau de Bord
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {step === 1 && renderSetupStep()}
      {step === 2 && renderVerificationStep()}
      {step === 3 && renderSuccessStep()}
    </div>
  );
};

export default TwoFactorSetupPage;
