// Service WebSocket pour VidangeGo CI - Solution compatible Vercel
// Utilise Pusher comme alternative car Vercel ne supporte pas WebSocket nativement

class WebSocketService {
  constructor() {
    this.pusher = null;
    this.channels = new Map();
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    
    // Configuration Pusher
    this.pusherConfig = {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER || 'eu',
      forceTLS: true
    };
  }

  // Initialisation du service WebSocket
  async initialize() {
    try {
      console.log('WebSocket: Initialisation avec Pusher...');
      
      // Vérifier si Pusher est disponible
      if (!window.Pusher) {
        console.warn('Pusher non chargé, utilisation du fallback polling');
        return this.initializeFallback();
      }

      // Initialiser Pusher
      this.pusher = new window.Pusher(
        import.meta.env.VITE_PUSHER_KEY || 'your-pusher-key-here',
        this.pusherConfig
      );

      this.pusher.connection.bind('connected', () => {
        console.log('WebSocket: Connecté via Pusher');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.notifyConnectionChange(true);
      });

      this.pusher.connection.bind('disconnected', () => {
        console.log('WebSocket: Déconnecté');
        this.isConnected = false;
        this.notifyConnectionChange(false);
        this.scheduleReconnect();
      });

      this.pusher.connection.bind('error', (error) => {
        console.error('WebSocket: Erreur de connexion', error);
        this.handleConnectionError(error);
      });

      console.log('WebSocket: Service initialisé avec Pusher');
      return true;

    } catch (error) {
      console.error('WebSocket: Erreur d\'initialisation', error);
      return this.initializeFallback();
    }
  }

  // Fallback avec polling pour Vercel
  async initializeFallback() {
    console.log('WebSocket: Initialisation du fallback polling pour Vercel');
    this.fallbackMode = true;
    this.pollingInterval = 5000; // 5 secondes
    this.pollingTimer = null;
    return true;
  }

  // Se connecter à un canal spécifique
  async connectToChannel(channelName, callbacks = {}) {
    try {
      if (this.fallbackMode) {
        return this.connectFallbackChannel(channelName, callbacks);
      }

      if (!this.pusher) {
        throw new Error('Pusher non initialisé');
      }

      // Se connecter au canal
      const channel = this.pusher.subscribe(channelName);
      
      // Configurer les callbacks
      if (callbacks.onLocationUpdate) {
        channel.bind('location-update', callbacks.onLocationUpdate);
      }
      
      if (callbacks.onStatusUpdate) {
        channel.bind('status-update', callbacks.onStatusUpdate);
      }
      
      if (callbacks.onMessage) {
        channel.bind('message', callbacks.onMessage);
      }

      if (callbacks.onSubscribed) {
        channel.bind('pusher:subscription_succeeded', callbacks.onSubscribed);
      }

      this.channels.set(channelName, {
        channel,
        callbacks
      });

      console.log(`WebSocket: Connecté au canal ${channelName}`);
      return channel;

    } catch (error) {
      console.error('WebSocket: Erreur de connexion au canal', error);
      return null;
    }
  }

  // Fallback pour les canaux
  connectFallbackChannel(channelName, callbacks) {
    console.log(`WebSocket: Fallback polling pour le canal ${channelName}`);
    
    const channelData = {
      name: channelName,
      callbacks,
      lastUpdate: null
    };

    this.channels.set(channelName, channelData);
    
    // Démarrer le polling
    this.startPolling(channelName);
    
    return channelData;
  }

  // Démarrer le polling pour un canal
  startPolling(channelName) {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
    }

    this.pollingTimer = setInterval(async () => {
      await this.pollChannelUpdates(channelName);
    }, this.pollingInterval);
  }

  // Polling des mises à jour
  async pollChannelUpdates(channelName) {
    try {
      const channelData = this.channels.get(channelName);
      if (!channelData) return;

      // Appeler l'API pour les mises à jour
      const response = await fetch(`/api/missions/${channelName}/updates`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const updates = await response.json();
        
        // Traiter les mises à jour
        if (updates.location && channelData.callbacks.onLocationUpdate) {
          channelData.callbacks.onLocationUpdate(updates.location);
        }
        
        if (updates.status && channelData.callbacks.onStatusUpdate) {
          channelData.callbacks.onStatusUpdate(updates.status);
        }
      }

    } catch (error) {
      console.error('WebSocket: Erreur de polling', error);
    }
  }

  // Envoyer un message
  async sendMessage(channelName, event, data) {
    try {
      if (this.fallbackMode) {
        return this.sendFallbackMessage(channelName, event, data);
      }

      const channelData = this.channels.get(channelName);
      if (!channelData || !channelData.channel) {
        throw new Error('Canal non trouvé');
      }

      // Envoyer via Pusher
      const response = await fetch('/api/websocket/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          channel: channelName,
          event,
          data
        })
      });

      if (!response.ok) {
        throw new Error('Erreur d\'envoi du message');
      }

      console.log(`WebSocket: Message envoyé sur ${channelName}`, event);
      return true;

    } catch (error) {
      console.error('WebSocket: Erreur d\'envoi du message', error);
      return false;
    }
  }

  // Fallback pour l'envoi de messages
  async sendFallbackMessage(channelName, event, data) {
    try {
      const response = await fetch(`/api/missions/${channelName}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          event,
          data,
          timestamp: new Date().toISOString()
        })
      });

      return response.ok;

    } catch (error) {
      console.error('WebSocket: Erreur d\'envoi fallback', error);
      return false;
    }
  }

  // Se déconnecter d'un canal
  disconnectFromChannel(channelName) {
    try {
      const channelData = this.channels.get(channelName);
      if (!channelData) return;

      if (this.fallbackMode) {
        // Arrêter le polling pour ce canal
        if (this.pollingTimer) {
          clearInterval(this.pollingTimer);
        }
      } else {
        // Se déconnecter de Pusher
        if (channelData.channel) {
          this.pusher.unsubscribe(channelName);
        }
      }

      this.channels.delete(channelName);
      console.log(`WebSocket: Déconnecté du canal ${channelName}`);

    } catch (error) {
      console.error('WebSocket: Erreur de déconnexion', error);
    }
  }

  // Se déconnecter complètement
  disconnect() {
    try {
      console.log('WebSocket: Déconnexion complète...');
      
      // Arrêter le polling
      if (this.pollingTimer) {
        clearInterval(this.pollingTimer);
        this.pollingTimer = null;
      }

      // Se déconnecter de tous les canaux
      this.channels.forEach((channelData, channelName) => {
        this.disconnectFromChannel(channelName);
      });

      // Déconnecter Pusher
      if (this.pusher) {
        this.pusher.disconnect();
        this.pusher = null;
      }

      this.isConnected = false;
      console.log('WebSocket: Déconnexion complète');

    } catch (error) {
      console.error('WebSocket: Erreur de déconnexion', error);
    }
  }

  // Gérer les erreurs de connexion
  handleConnectionError(error) {
    console.error('WebSocket: Erreur de connexion', error);
    
    // Tenter de se reconnecter
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect();
    } else {
      console.error('WebSocket: Nombre maximum de tentatives de reconnexion atteint');
      this.notifyConnectionError(error);
    }
  }

  // Programmer une reconnexion
  scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(async () => {
      console.log(`WebSocket: Tentative de reconnexion ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts}`);
      this.reconnectAttempts++;
      
      await this.initialize();
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  // Notifier les changements de connexion
  notifyConnectionChange(connected) {
    const event = new CustomEvent('websocketConnectionChange', {
      detail: { connected }
    });
    window.dispatchEvent(event);
  }

  // Notifier les erreurs de connexion
  notifyConnectionError(error) {
    const event = new CustomEvent('websocketConnectionError', {
      detail: { error }
    });
    window.dispatchEvent(event);
  }

  // Obtenir le statut de connexion
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      fallbackMode: this.fallbackMode,
      channels: Array.from(this.channels.keys()),
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Vérifier si le service est compatible avec l'hébergeur actuel
  static getServerCompatibility() {
    const hostname = window.location.hostname;
    
    if (hostname.includes('vercel.app')) {
      return {
        compatible: false,
        reason: 'Vercel ne supporte pas WebSocket nativement',
        solution: 'Pusher ou fallback polling',
        recommended: 'Pusher pour temps réel, polling pour compatibilité'
      };
    }
    
    if (hostname.includes('railway.app') || hostname.includes('render.com')) {
      return {
        compatible: true,
        reason: 'Support WebSocket natif',
        solution: 'WebSocket standard',
        recommended: 'WebSocket natif'
      };
    }
    
    return {
      compatible: true,
      reason: 'Hébergeur générique',
      solution: 'WebSocket avec fallback',
      recommended: 'WebSocket avec détection automatique'
    };
  }
}

// Export du service
export const websocketService = new WebSocketService();
export default websocketService;
