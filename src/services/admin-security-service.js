// Service de sécurité pour l'administration VidangeGo CI
// Force le changement du mot de passe admin par défaut

class AdminSecurityService {
  constructor() {
    this.defaultCredentials = {
      email: 'admin@vidangego.ci',
      password: 'admin123'
    };
    this.isFirstLogin = false;
    this.passwordChangeRequired = false;
  }

  // Vérifier si l'utilisateur utilise les credentials par défaut
  checkDefaultCredentials(email, password) {
    return email === this.defaultCredentials.email && 
           password === this.defaultCredentials.password;
  }

  // Marquer que c'est la première connexion avec les credentials par défaut
  markFirstLogin() {
    this.isFirstLogin = true;
    this.passwordChangeRequired = true;
    
    // Sauvegarder dans sessionStorage pour la durée de la session
    sessionStorage.setItem('admin_first_login', 'true');
    sessionStorage.setItem('password_change_required', 'true');
  }

  // Vérifier si le changement de mot de passe est requis
  isPasswordChangeRequired() {
    return sessionStorage.getItem('password_change_required') === 'true' || 
           this.passwordChangeRequired;
  }

  // Forcer le changement de mot de passe
  async forcePasswordChange(newPassword, currentPassword) {
    try {
      // Validation du nouveau mot de passe
      const validation = this.validatePassword(newPassword);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Vérifier que le nouveau mot de passe n'est pas le mot de passe par défaut
      if (newPassword === this.defaultCredentials.password) {
        throw new Error('Le nouveau mot de passe ne peut pas être le mot de passe par défaut');
      }

      // Appeler l'API pour changer le mot de passe
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors du changement de mot de passe');
      }

      // Nettoyer les flags de première connexion
      this.clearFirstLoginFlags();
      
      // Afficher un message de succès
      this.showSuccessMessage('Mot de passe changé avec succès');
      
      return true;

    } catch (error) {
      console.error('Erreur changement de mot de passe:', error);
      throw error;
    }
  }

  // Valider la force du mot de passe
  validatePassword(password) {
    const errors = [];
    
    // Longueur minimale
    if (password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }
    
    // Au moins une majuscule
    if (!/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une majuscule');
    }
    
    // Au moins une minuscule
    if (!/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une minuscule');
    }
    
    // Au moins un chiffre
    if (!/\d/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }
    
    // Au moins un caractère spécial
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial');
    }
    
    // Ne pas contenir le mot "admin"
    if (password.toLowerCase().includes('admin')) {
      errors.push('Le mot de passe ne doit pas contenir le mot "admin"');
    }
    
    // Ne pas être trop simple
    const commonPasswords = ['password', '12345678', 'qwerty', 'azerty'];
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Le mot de passe est trop simple');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Afficher les exigences du mot de passe
  getPasswordRequirements() {
    return {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      forbiddenWords: ['admin', 'password', 'vidangego'],
      commonPasswords: ['password', '12345678', 'qwerty', 'azerty']
    };
  }

  // Nettoyer les flags de première connexion
  clearFirstLoginFlags() {
    this.isFirstLogin = false;
    this.passwordChangeRequired = false;
    sessionStorage.removeItem('admin_first_login');
    sessionStorage.removeItem('password_change_required');
  }

  // Afficher un message de succès
  showSuccessMessage(message) {
    // Créer une notification de succès
    const notification = document.createElement('div');
    notification.className = 'admin-security-notification success';
    notification.innerHTML = `
      <div class="notification-content">
        <h4> Sécurité renforcée</h4>
        <p>${message}</p>
        <button onclick="this.parentElement.parentElement.remove()">OK</button>
      </div>
    `;
    
    // Ajouter les styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #d4edda;
      border: 1px solid #c3e6cb;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-suppression après 5 secondes
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  // Afficher un message d'avertissement de sécurité
  showSecurityWarning() {
    const warning = document.createElement('div');
    warning.className = 'admin-security-warning';
    warning.innerHTML = `
      <div class="warning-content">
        <h4> Sécurité critique</h4>
        <p>Vous utilisez les identifiants par défaut. Pour des raisons de sécurité, vous devez changer votre mot de passe immédiatement.</p>
        <div class="warning-actions">
          <button onclick="this.closest('.admin-security-warning').remove(); adminSecurityService.redirectToPasswordChange()">Changer maintenant</button>
          <button onclick="this.closest('.admin-security-warning').remove()" style="background: #6c757d;">Plus tard</button>
        </div>
      </div>
    `;
    
    // Ajouter les styles
    warning.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #f8d7da;
      border-bottom: 3px solid #dc3545;
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10001;
    `;
    
    document.body.appendChild(warning);
    
    // Auto-suppression après 30 secondes
    setTimeout(() => {
      if (warning.parentElement) {
        warning.remove();
      }
    }, 30000);
  }

  // Rediriger vers la page de changement de mot de passe
  redirectToPasswordChange() {
    window.location.href = '/admin/change-password';
  }

  // Vérifier la sécurité au chargement
  checkSecurityOnLoad() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Si c'est un admin et que le changement est requis
    if (user.role === 'ADMIN' && this.isPasswordChangeRequired()) {
      // Afficher l'avertissement
      this.showSecurityWarning();
      
      // Si on n'est pas déjà sur la page de changement de mot de passe
      if (!window.location.pathname.includes('/change-password')) {
        // Rediriger après 3 secondes
        setTimeout(() => {
          this.redirectToPasswordChange();
        }, 3000);
      }
    }
  }

  // Générer un mot de passe sécurisé
  generateSecurePassword(length = 12) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    
    // S'assurer d'avoir au moins un de chaque type requis
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*()_+-=[]{}|;:,.<>?'[Math.floor(Math.random() * 24)];
    
    // Compléter avec des caractères aléatoires
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Mélanger le mot de passe
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  // Journaliser les tentatives de connexion
  logLoginAttempt(email, success, reason = '') {
    const logEntry = {
      timestamp: new Date().toISOString(),
      email,
      success,
      reason,
      userAgent: navigator.userAgent,
      ip: 'client-side' // En production, l'IP serait récupérée côté serveur
    };
    
    // Envoyer au serveur pour journalisation
    fetch('/api/admin/log-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(logEntry)
    }).catch(error => {
      console.error('Erreur journalisation login:', error);
    });
  }

  // Vérifier si l'admin est connecté avec des credentials sécurisés
  async verifyAdminSecurity() {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!token || user.role !== 'ADMIN') {
        return { secure: false, reason: 'Non admin ou non connecté' };
      }
      
      // Vérifier auprès du serveur si le mot de passe a été changé
      const response = await fetch('/api/admin/security-status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          secure: data.passwordChanged,
          reason: data.passwordChanged ? 'Mot de passe sécurisé' : 'Mot de passe par défaut',
          requiresChange: !data.passwordChanged
        };
      }
      
      return { secure: false, reason: 'Erreur de vérification' };
      
    } catch (error) {
      console.error('Erreur vérification sécurité admin:', error);
      return { secure: false, reason: 'Erreur de connexion' };
    }
  }
}

// Export du service
export const adminSecurityService = new AdminSecurityService();
export default adminSecurityService;
