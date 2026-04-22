// Service d'authentification publique pour VidangeGo CI
// Gère l'inscription et la connexion des utilisateurs publics

import api from './api';
import sentryService from './sentryService';

class PublicAuthService {
    // Envoyer un code de vérification par email
    async sendVerificationCode(email) {
        try {
            const response = await api.post('/api/public-auth/send-verification-code', {
                email: email.trim().toLowerCase()
            });

            sentryService.addBreadcrumb('Verification code sent', 'auth', 'info', {
                email: email
            });

            return response.data;
        } catch (error) {
            console.error('Error sending verification code:', error);
            
            sentryService.captureError(error, {
                context: 'send_verification_code',
                email: email
            });

            throw error;
        }
    }

    // Vérifier un code de vérification
    async verifyCode(email, code) {
        try {
            const response = await api.post('/api/public-auth/verify-code', {
                email: email.trim().toLowerCase(),
                code: code.toString().trim()
            });

            sentryService.addBreadcrumb('Code verified', 'auth', 'info', {
                email: email
            });

            return response.data;
        } catch (error) {
            console.error('Error verifying code:', error);
            
            sentryService.captureError(error, {
                context: 'verify_code',
                email: email
            });

            throw error;
        }
    }

    // Inscription publique
    async register(userData) {
        try {
            const payload = {
                firstName: userData.firstName?.trim(),
                lastName: userData.lastName?.trim(),
                email: userData.email?.trim().toLowerCase(),
                phone: userData.phone?.trim(),
                password: userData.password,
                company: userData.company?.trim() || null,
                address: userData.address?.trim(),
                vehicleType: userData.vehicleType,
                acceptTerms: userData.acceptTerms || false,
                newsletter: userData.newsletter || false,
                registrationSource: userData.registrationSource || 'public'
            };

            console.log('=== PUBLIC REGISTRATION ===');
            console.log('Payload:', { ...payload, password: '***' });

            const response = await api.post('/api/public-auth/register', payload);

            sentryService.addBreadcrumb('Public registration successful', 'auth', 'info', {
                email: userData.email,
                vehicleType: userData.vehicleType
            });

            return response.data;
        } catch (error) {
            console.error('Error in public registration:', error);
            
            sentryService.captureError(error, {
                context: 'public_registration',
                email: userData.email
            });

            throw error;
        }
    }

    // Connexion publique
    async login(email, password) {
        try {
            const response = await api.post('/api/public-auth/login', {
                email: email.trim().toLowerCase(),
                password
            });

            sentryService.addBreadcrumb('Public login successful', 'auth', 'info', {
                email: email
            });

            return response.data;
        } catch (error) {
            console.error('Error in public login:', error);
            
            sentryService.captureError(error, {
                context: 'public_login',
                email: email
            });

            throw error;
        }
    }

    // Déconnexion
    logout() {
        try {
            // Supprimer les données du localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            sentryService.addBreadcrumb('Public logout', 'auth', 'info');

            return true;
        } catch (error) {
            console.error('Error during logout:', error);
            return false;
        }
    }

    // Vérifier si l'utilisateur est connecté
    isAuthenticated() {
        try {
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');

            if (!token || !user) {
                return false;
            }

            // Vérifier si le token est valide (format JWT)
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) {
                this.logout();
                return false;
            }

            // Vérifier si le token n'est pas expiré
            try {
                const payload = JSON.parse(atob(tokenParts[1]));
                const now = Math.floor(Date.now() / 1000);
                
                if (payload.exp && payload.exp < now) {
                    this.logout();
                    return false;
                }

                return true;
            } catch (tokenError) {
                this.logout();
                return false;
            }
        } catch (error) {
            console.error('Error checking authentication:', error);
            return false;
        }
    }

    // Obtenir l'utilisateur connecté
    getCurrentUser() {
        try {
            if (!this.isAuthenticated()) {
                return null;
            }

            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    // Obtenir le token JWT
    getToken() {
        return localStorage.getItem('token');
    }

    // Rafraîchir le token (si implémenté côté backend)
    async refreshToken() {
        try {
            const response = await api.post('/api/public-auth/refresh-token');
            
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                
                sentryService.addBreadcrumb('Token refreshed', 'auth', 'info');
                
                return response.data.token;
            }
            
            return null;
        } catch (error) {
            console.error('Error refreshing token:', error);
            this.logout();
            return null;
        }
    }

    // Demander la réinitialisation du mot de passe
    async requestPasswordReset(email) {
        try {
            const response = await api.post('/api/public-auth/request-password-reset', {
                email: email.trim().toLowerCase()
            });

            sentryService.addBreadcrumb('Password reset requested', 'auth', 'info', {
                email: email
            });

            return response.data;
        } catch (error) {
            console.error('Error requesting password reset:', error);
            
            sentryService.captureError(error, {
                context: 'request_password_reset',
                email: email
            });

            throw error;
        }
    }

    // Réinitialiser le mot de passe
    async resetPassword(token, newPassword) {
        try {
            const response = await api.post('/api/public-auth/reset-password', {
                token,
                password: newPassword
            });

            sentryService.addBreadcrumb('Password reset completed', 'auth', 'info');

            return response.data;
        } catch (error) {
            console.error('Error resetting password:', error);
            
            sentryService.captureError(error, {
                context: 'reset_password'
            });

            throw error;
        }
    }

    // Mettre à jour le profil
    async updateProfile(profileData) {
        try {
            const response = await api.put('/api/public-auth/profile', profileData);

            // Mettre à jour le localStorage
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            sentryService.addBreadcrumb('Profile updated', 'auth', 'info');

            return response.data;
        } catch (error) {
            console.error('Error updating profile:', error);
            
            sentryService.captureError(error, {
                context: 'update_profile'
            });

            throw error;
        }
    }

    // Changer le mot de passe
    async changePassword(currentPassword, newPassword) {
        try {
            const response = await api.post('/api/public-auth/change-password', {
                currentPassword,
                newPassword
            });

            sentryService.addBreadcrumb('Password changed', 'auth', 'info');

            return response.data;
        } catch (error) {
            console.error('Error changing password:', error);
            
            sentryService.captureError(error, {
                context: 'change_password'
            });

            throw error;
        }
    }

    // Vérifier la force du mot de passe
    validatePasswordStrength(password) {
        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            numbers: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        const score = Object.values(checks).filter(Boolean).length;
        
        let strength = 'weak';
        if (score >= 4) strength = 'strong';
        else if (score >= 3) strength = 'medium';
        else if (score >= 2) strength = 'fair';

        return {
            score,
            strength,
            checks,
            suggestions: this.getPasswordSuggestions(checks)
        };
    }

    // Obtenir des suggestions pour améliorer le mot de passe
    getPasswordSuggestions(checks) {
        const suggestions = [];
        
        if (!checks.length) suggestions.push('Au moins 8 caractères');
        if (!checks.lowercase) suggestions.push('Ajoutez des lettres minuscules');
        if (!checks.uppercase) suggestions.push('Ajoutez des lettres majuscules');
        if (!checks.numbers) suggestions.push('Ajoutez des chiffres');
        if (!checks.special) suggestions.push('Ajoutez des caractères spéciaux (!@#$%^&*)');
        
        return suggestions;
    }

    // Valider le format d'email
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim().toLowerCase());
    }

    // Valider le format de téléphone
    validatePhone(phone) {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
        return phoneRegex.test(phone.trim()) && phone.trim().length >= 10;
    }

    // Obtenir les statistiques de l'utilisateur
    async getUserStats() {
        try {
            const response = await api.get('/api/public-auth/stats');
            return response.data;
        } catch (error) {
            console.error('Error getting user stats:', error);
            return null;
        }
    }

    // Supprimer le compte utilisateur
    async deleteAccount(password) {
        try {
            const response = await api.delete('/api/public-auth/account', {
                data: { password }
            });

            sentryService.addBreadcrumb('Account deleted', 'auth', 'warning');

            // Nettoyer le localStorage
            this.logout();

            return response.data;
        } catch (error) {
            console.error('Error deleting account:', error);
            
            sentryService.captureError(error, {
                context: 'delete_account'
            });

            throw error;
        }
    }
}

// Exporter une instance unique
const publicAuthService = new PublicAuthService();

export default publicAuthService;
