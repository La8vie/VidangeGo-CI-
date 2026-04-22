// Service Sentry pour le suivi d'erreurs
// Capture automatique des exceptions avec contexte utilisateur

import * as Sentry from '@sentry/react';

class SentryService {
  constructor() {
    this.isInitialized = false;
    this.dsn = process.env.REACT_APP_SENTRY_DSN || process.env.SENTRY_DSN;
    this.environment = process.env.NODE_ENV || 'production';
  }

  // Initialiser Sentry
  initialize() {
    try {
      if (!this.dsn) {
        console.warn('Sentry DSN not configured, error tracking disabled');
        return false;
      }

      Sentry.init({
        dsn: this.dsn,
        environment: this.environment,
        integrations: [
          new Sentry.BrowserTracing({
            tracePropagationTargets: [/^https:\/\/vidangego-.*\.vercel\.app/],
          }),
          new Sentry.Replay({
            sessionSampleRate: 0.1,
            errorSampleRate: 1.0,
          }),
        ],
        tracesSampleRate: 0.1,
        replaysSessionSampleRate: 0.1,
        beforeSend: this.beforeSend.bind(this),
        beforeBreadcrumb: this.beforeBreadcrumb.bind(this),
        ignoreErrors: [
          // Ignorer les erreurs non critiques
          'Non-Error promise rejection captured',
          'ResizeObserver loop limit exceeded',
          'Network request failed',
        ],
        denyUrls: [
          // Ignorer les erreurs des services tiers
          /google-analytics\.com/,
          /googletagmanager\.com/,
          /facebook\.net/,
          /doubleclick\.net/,
        ],
        debug: this.environment === 'development',
      });

      this.isInitialized = true;
      console.log('✅ Sentry initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize Sentry:', error);
      return false;
    }
  }

  // Filtrer les erreurs avant envoi
  beforeSend(event, hint) {
    // Ajouter du contexte personnalisé
    event.contexts = {
      ...event.contexts,
      app: {
        name: 'VidangeGo CI Client',
        version: process.env.REACT_APP_VERSION || '1.0.0',
        build: process.env.REACT_APP_BUILD_NUMBER || 'unknown'
      },
      device: {
        type: this.getDeviceType(),
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      network: {
        type: this.getNetworkType(),
        online: navigator.onLine,
        connection: navigator.connection ? {
          effectiveType: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink,
          rtt: navigator.connection.rtt
        } : null
      }
    };

    // Filtrer les erreurs sensibles
    if (this.isSensitiveError(event.exception)) {
      console.warn('Sensitive error filtered from Sentry:', event.exception);
      return null;
    }

    // Anonymiser les URLs sensibles
    if (event.request && event.request.url) {
      event.request.url = this.sanitizeUrl(event.request.url);
    }

    return event;
  }

  // Filtrer les breadcrumbs
  beforeBreadcrumb(breadcrumb, hint) {
    // Ignorer les breadcrumbs non pertinents
    if (this.shouldIgnoreBreadcrumb(breadcrumb)) {
      return null;
    }

    // Anonymiser les données sensibles
    if (breadcrumb.data && breadcrumb.data.url) {
      breadcrumb.data.url = this.sanitizeUrl(breadcrumb.data.url);
    }

    return breadcrumb;
  }

  // Déterminer le type d'appareil
  getDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/mobile|android|iphone|ipad|phone/i.test(userAgent)) {
      return 'mobile';
    } else if (/tablet|ipad/i.test(userAgent)) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  // Déterminer le type de réseau
  getNetworkType() {
    if (!navigator.connection) {
      return 'unknown';
    }

    const connection = navigator.connection;
    
    if (connection.effectiveType) {
      return connection.effectiveType;
    }
    
    return 'unknown';
  }

  // Vérifier si c'est une erreur sensible
  isSensitiveError(exception) {
    if (!exception || !exception.values) {
      return false;
    }

    const errorString = JSON.stringify(exception.values);
    const sensitivePatterns = [
      /password/i,
      /token/i,
      /secret/i,
      /key/i,
      /auth/i,
      /credit.*card/i,
      /ssn/i,
      /social.*security/i
    ];

    return sensitivePatterns.some(pattern => pattern.test(errorString));
  }

  // Anonymiser les URLs
  sanitizeUrl(url) {
    try {
      const urlObj = new URL(url);
      
      // Anonymiser les paramètres sensibles
      const sensitiveParams = ['token', 'password', 'secret', 'key', 'auth'];
      
      sensitiveParams.forEach(param => {
        if (urlObj.searchParams.has(param)) {
          urlObj.searchParams.set(param, '[REDACTED]');
        }
      });

      return urlObj.toString();
    } catch (error) {
      // Si l'URL est invalide, retourner une version tronquée
      return url.length > 100 ? url.substring(0, 100) + '...' : url;
    }
  }

  // Vérifier si ignorer un breadcrumb
  shouldIgnoreBreadcrumb(breadcrumb) {
    const ignorePatterns = [
      // Ignorer les requêtes analytics
      { type: 'fetch', url: /google-analytics/ },
      { type: 'fetch', url: /googletagmanager/ },
      { type: 'fetch', url: /facebook\.net/ },
      { type: 'fetch', url: /doubleclick\.net/ },
      // Ignorer les requêtes de santé
      { type: 'fetch', url: /\/api\/health/ },
      { type: 'fetch', url: /\/api\/ping/ },
      // Ignorer les requêtes de polling fréquentes
      { type: 'fetch', url: /\/api\/missions\/.*\/updates/ },
    ];

    return ignorePatterns.some(pattern => 
      pattern.type === breadcrumb.type && 
      pattern.url.test(breadcrumb.data?.url || '')
    );
  }

  // Capturer une erreur manuellement
  captureError(error, context = {}) {
    if (!this.isInitialized) {
      console.error('Sentry not initialized, falling back to console:', error);
      return;
    }

    try {
      Sentry.withScope(scope => {
        // Ajouter le contexte utilisateur
        const user = this.getCurrentUser();
        if (user) {
          scope.setUser({
            id: user.id,
            email: user.email,
            role: user.role
          });
        }

        // Ajouter le contexte personnalisé
        scope.setContext('custom', {
          ...context,
          page: window.location.pathname,
          timestamp: new Date().toISOString(),
          sessionId: this.getSessionId()
        });

        // Capturer l'erreur
        if (error instanceof Error) {
          Sentry.captureException(error);
        } else {
          Sentry.captureMessage(error, 'error');
        }
      });
    } catch (sentryError) {
      console.error('Failed to send error to Sentry:', sentryError);
      console.error('Original error:', error);
    }
  }

  // Capturer une exception
  captureException(exception, context = {}) {
    if (!this.isInitialized) {
      console.error('Sentry not initialized, falling back to console:', exception);
      return;
    }

    try {
      Sentry.withScope(scope => {
        const user = this.getCurrentUser();
        if (user) {
          scope.setUser({
            id: user.id,
            email: user.email,
            role: user.role
          });
        }

        scope.setContext('custom', {
          ...context,
          page: window.location.pathname,
          timestamp: new Date().toISOString(),
          sessionId: this.getSessionId()
        });

        Sentry.captureException(exception);
      });
    } catch (sentryError) {
      console.error('Failed to send exception to Sentry:', sentryError);
      console.error('Original exception:', exception);
    }
  }

  // Capturer un message
  captureMessage(message, level = 'info', context = {}) {
    if (!this.isInitialized) {
      console.log(`Sentry not initialized, falling back to console [${level}]:`, message);
      return;
    }

    try {
      Sentry.withScope(scope => {
        const user = this.getCurrentUser();
        if (user) {
          scope.setUser({
            id: user.id,
            email: user.email,
            role: user.role
          });
        }

        scope.setContext('custom', {
          ...context,
          page: window.location.pathname,
          timestamp: new Date().toISOString(),
          sessionId: this.getSessionId()
        });

        Sentry.captureMessage(message, level);
      });
    } catch (sentryError) {
      console.error('Failed to send message to Sentry:', sentryError);
      console.error('Original message:', message);
    }
  }

  // Ajouter un breadcrumb manuel
  addBreadcrumb(message, category = 'custom', level = 'info', data = {}) {
    if (!this.isInitialized) {
      return;
    }

    try {
      Sentry.addBreadcrumb({
        message,
        category,
        level,
        data: {
          ...data,
          timestamp: new Date().toISOString(),
          page: window.location.pathname
        }
      });
    } catch (error) {
      console.error('Failed to add breadcrumb to Sentry:', error);
    }
  }

  // Définir l'utilisateur courant
  setUser(user) {
    if (!this.isInitialized) {
      return;
    }

    try {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.username || user.email
      });
    } catch (error) {
      console.error('Failed to set user in Sentry:', error);
    }
  }

  // Effacer l'utilisateur
  clearUser() {
    if (!this.isInitialized) {
      return;
    }

    try {
      Sentry.setUser(null);
    } catch (error) {
      console.error('Failed to clear user in Sentry:', error);
    }
  }

  // Obtenir l'utilisateur courant
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  }

  // Générer un ID de session
  getSessionId() {
    let sessionId = sessionStorage.getItem('sentry_session_id');
    
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('sentry_session_id', sessionId);
    }
    
    return sessionId;
  }

  // Capturer les erreurs de performance
  capturePerformanceMetric(name, value, unit = 'ms') {
    if (!this.isInitialized) {
      return;
    }

    try {
      Sentry.addBreadcrumb({
        message: `Performance: ${name}`,
        category: 'performance',
        level: 'info',
        data: {
          metric: name,
          value,
          unit,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to capture performance metric:', error);
    }
  }

  // Capturer les erreurs de réseau
  captureNetworkError(url, method, status, error) {
    if (!this.isInitialized) {
      return;
    }

    try {
      Sentry.withScope(scope => {
        scope.setContext('network', {
          url: this.sanitizeUrl(url),
          method,
          status,
          error: error.message,
          timestamp: new Date().toISOString()
        });

        Sentry.captureException(error);
      });
    } catch (sentryError) {
      console.error('Failed to capture network error:', sentryError);
    }
  }

  // Obtenir le statut d'initialisation
  isReady() {
    return this.isInitialized;
  }

  // Obtenir des informations de débogage
  getDebugInfo() {
    return {
      initialized: this.isInitialized,
      environment: this.environment,
      dsn: this.dsn ? '***configured***' : 'not configured',
      userAgent: navigator.userAgent,
      url: window.location.href
    };
  }
}

// Export singleton
const sentryService = new SentryService();

export default sentryService;
