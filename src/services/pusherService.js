// Service Pusher client pour WebSocket natif
// Remplacement du polling par WebSocket temps réel

import Pusher from '@pusher/pusher-websocket-react';
import sentryService from './sentryService';

class PusherClientService {
  constructor() {
    this.pusher = null;
    this.isInitialized = false;
    this.channels = new Map(); // Cache des channels abonnés
    this.eventListeners = new Map(); // Cache des event listeners
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 1000;
  }

  // Initialiser Pusher
  initialize() {
    try {
      const pusherKey = process.env.REACT_APP_PUSHER_KEY || process.env.VITE_PUSHER_KEY;
      
      if (!pusherKey) {
        console.warn('Pusher key not configured, WebSocket disabled');
        return false;
      }

      this.pusher = new Pusher(pusherKey, {
        cluster: process.env.REACT_APP_PUSHER_CLUSTER || process.env.VITE_PUSHER_CLUSTER || 'eu',
        forceTLS: true,
        enabledTransports: ['ws', 'wss', 'xhr_streaming', 'xhr_polling'],
        disableStats: process.env.NODE_ENV === 'development',
        authEndpoint: '/api/websocket/auth',
        auth: {
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }
        }
      });

      // Configurer les événements de connexion
      this.setupConnectionEvents();
      
      this.isInitialized = true;
      console.log('✅ Pusher client initialized');
      
      // Logger l'initialisation
      sentryService.addBreadcrumb('Pusher client initialized', 'websocket', 'info');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Pusher client:', error);
      sentryService.captureError(error, { context: 'pusher_initialization' });
      return false;
    }
  }

  // Configurer les événements de connexion
  setupConnectionEvents() {
    if (!this.pusher) return;

    // Connexion établie
    this.pusher.connection.bind('connected', (data) => {
      console.log('🔗 Pusher connected:', data);
      this.reconnectAttempts = 0;
      
      sentryService.addBreadcrumb('Pusher connected', 'websocket', 'info', {
        socketId: data.socket_id,
        activityTimeout: data.activity_timeout
      });
      
      // Notifier les composants de la connexion
      this.notifyConnectionStatus('connected', data);
    });

    // Connexion perdue
    this.pusher.connection.bind('disconnected', (data) => {
      console.log('❌ Pusher disconnected:', data);
      
      sentryService.addBreadcrumb('Pusher disconnected', 'websocket', 'warning', {
        code: data.code,
        reason: data.reason
      });
      
      // Notifier les composants de la déconnexion
      this.notifyConnectionStatus('disconnected', data);
      
      // Tenter de se reconnecter
      this.attemptReconnect();
    });

    // Erreur de connexion
    this.pusher.connection.bind('error', (error) => {
      console.error('❌ Pusher connection error:', error);
      
      sentryService.captureError(error, {
        context: 'pusher_connection',
        code: error.code,
        type: error.type
      });
      
      // Notifier les composants de l'erreur
      this.notifyConnectionStatus('error', error);
      
      // Tenter de se reconnecter
      this.attemptReconnect();
    });

    // Échec d'authentification
    this.pusher.connection.bind('unavailable', () => {
      console.warn('⚠️ Pusher unavailable');
      
      sentryService.addBreadcrumb('Pusher unavailable', 'websocket', 'warning');
      
      this.notifyConnectionStatus('unavailable');
    });
  }

  // Tenter de se reconnecter
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      
      sentryService.captureMessage('Pusher max reconnection attempts reached', 'error');
      
      this.notifyConnectionStatus('failed');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
    
    console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
    
    sentryService.addBreadcrumb('Pusher reconnection attempt', 'websocket', 'info', {
      attempt: this.reconnectAttempts,
      delay
    });
    
    setTimeout(() => {
      if (this.pusher) {
        this.pusher.connect();
      }
    }, delay);
  }

  // S'abonner à un channel
  subscribe(channelName, eventCallbacks = {}) {
    if (!this.isInitialized) {
      console.warn('Pusher not initialized, cannot subscribe to channel:', channelName);
      return null;
    }

    try {
      // Vérifier si déjà abonné
      if (this.channels.has(channelName)) {
        console.log(`📡 Already subscribed to channel: ${channelName}`);
        return this.channels.get(channelName);
      }

      const channel = this.pusher.subscribe(channelName);
      
      // Configurer les événements du channel
      this.setupChannelEvents(channelName, channel, eventCallbacks);
      
      // Stocker le channel
      this.channels.set(channelName, {
        channel,
        callbacks: eventCallbacks,
        subscribedAt: new Date(),
        lastActivity: new Date()
      });

      console.log(`📡 Subscribed to channel: ${channelName}`);
      
      sentryService.addBreadcrumb('Subscribed to Pusher channel', 'websocket', 'info', {
        channelName
      });
      
      return channel;
    } catch (error) {
      console.error(`❌ Failed to subscribe to channel ${channelName}:`, error);
      
      sentryService.captureError(error, {
        context: 'pusher_subscription',
        channelName
      });
      
      return null;
    }
  }

  // Configurer les événements d'un channel
  setupChannelEvents(channelName, channel, callbacks) {
    // Événement d'abonnement confirmé
    channel.bind('pusher:subscription_succeeded', (data) => {
      console.log(`✅ Subscription confirmed for channel: ${channelName}`);
      
      if (callbacks.onSubscriptionSuccess) {
        callbacks.onSubscriptionSuccess(data);
      }
      
      sentryService.addBreadcrumb('Pusher subscription confirmed', 'websocket', 'info', {
        channelName
      });
    });

    // Échec d'abonnement
    channel.bind('pusher:subscription_error', (error) => {
      console.error(`❌ Subscription error for channel ${channelName}:`, error);
      
      if (callbacks.onSubscriptionError) {
        callbacks.onSubscriptionError(error);
      }
      
      sentryService.captureError(error, {
        context: 'pusher_subscription_error',
        channelName
      });
    });

    // Mises à jour GPS
    channel.bind('gps_update', (data) => {
      console.log(`📍 GPS update received for ${channelName}:`, data);
      
      if (callbacks.onGPSUpdate) {
        callbacks.onGPSUpdate(data);
      }
      
      this.updateChannelActivity(channelName);
    });

    // Mises à jour de statut de mission
    channel.bind('mission_status', (data) => {
      console.log(`📊 Mission status update for ${channelName}:`, data);
      
      if (callbacks.onStatusUpdate) {
        callbacks.onStatusUpdate(data);
      }
      
      this.updateChannelActivity(channelName);
    });

    // Notifications d'urgence
    channel.bind('emergency', (data) => {
      console.warn(`🚨 Emergency notification for ${channelName}:`, data);
      
      if (callbacks.onEmergency) {
        callbacks.onEmergency(data);
      }
      
      this.updateChannelActivity(channelName);
      
      // Logger les urgences spécifiquement
      sentryService.captureMessage('Emergency notification received', 'warning', {
        channelName,
        emergencyType: data.type,
        priority: data.priority
      });
    });

    // Mises à jour de position
    channel.bind('position_update', (data) => {
      console.log(`📍 Position update for ${channelName}:`, data);
      
      if (callbacks.onPositionUpdate) {
        callbacks.onPositionUpdate(data);
      }
      
      this.updateChannelActivity(channelName);
    });

    // Messages de chat
    channel.bind('chat_message', (data) => {
      console.log(`💬 Chat message for ${channelName}:`, data);
      
      if (callbacks.onChatMessage) {
        callbacks.onChatMessage(data);
      }
      
      this.updateChannelActivity(channelName);
    });

    // Événements personnalisés
    Object.keys(callbacks).forEach(eventName => {
      if (!eventName.startsWith('on')) {
        channel.bind(eventName, (data) => {
          console.log(`📨 Custom event ${eventName} for ${channelName}:`, data);
          
          callbacks[eventName](data);
          this.updateChannelActivity(channelName);
        });
      }
    });
  }

  // Mettre à jour l'activité d'un channel
  updateChannelActivity(channelName) {
    const channelData = this.channels.get(channelName);
    if (channelData) {
      channelData.lastActivity = new Date();
    }
  }

  // Se désabonner d'un channel
  unsubscribe(channelName) {
    if (!this.isInitialized) {
      return false;
    }

    try {
      const channelData = this.channels.get(channelName);
      if (channelData) {
        this.pusher.unsubscribe(channelName);
        this.channels.delete(channelName);

        console.log(`📡 Unsubscribed from channel: ${channelName}`);
        
        sentryService.addBreadcrumb('Unsubscribed from Pusher channel', 'websocket', 'info', {
          channelName
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error(`❌ Failed to unsubscribe from channel ${channelName}:`, error);
      
      sentryService.captureError(error, {
        context: 'pusher_unsubscription',
        channelName
      });
      
      return false;
    }
  }

  // Envoyer un événement client (si autorisé)
  trigger(channelName, eventName, data) {
    if (!this.isInitialized) {
      console.warn('Pusher not initialized, cannot trigger event');
      return false;
    }

    try {
      // Les clients ne peuvent généralement pas envoyer d'événements directement
      // Utiliser l'API backend pour cela
      const response = fetch('/api/websocket/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          channel: channelName,
          event: eventName,
          data
        })
      });

      if (response.ok) {
        console.log(`📤 Event triggered to ${channelName}: ${eventName}`);
        return true;
      } else {
        console.error(`❌ Failed to trigger event: ${response.statusText}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Error triggering event ${eventName} to ${channelName}:`, error);
      
      sentryService.captureError(error, {
        context: 'pusher_trigger',
        channelName,
        eventName
      });
      
      return false;
    }
  }

  // S'abonner aux mises à jour GPS d'une mission
  subscribeToMissionGPS(missionId, callbacks) {
    const channelName = `mission-${missionId}`;
    return this.subscribe(channelName, {
      onGPSUpdate: callbacks.onGPSUpdate,
      onPositionUpdate: callbacks.onPositionUpdate,
      ...callbacks
    });
  }

  // S'abonner au statut d'une mission
  subscribeToMissionStatus(missionId, callbacks) {
    const channelName = `mission-${missionId}`;
    return this.subscribe(channelName, {
      onStatusUpdate: callbacks.onStatusUpdate,
      onEmergency: callbacks.onEmergency,
      ...callbacks
    });
  }

  // S'abonner au chat d'une mission
  subscribeToMissionChat(missionId, callbacks) {
    const channelName = `mission-${missionId}`;
    return this.subscribe(channelName, {
      onChatMessage: callbacks.onChatMessage,
      ...callbacks
    });
  }

  // S'abonner à toutes les mises à jour d'une mission
  subscribeToMission(missionId, callbacks) {
    const channelName = `mission-${missionId}`;
    return this.subscribe(channelName, callbacks);
  }

  // Se désabonner d'une mission
  unsubscribeFromMission(missionId) {
    const channelName = `mission-${missionId}`;
    return this.unsubscribe(channelName);
  }

  // Notifier le statut de connexion aux composants
  notifyConnectionStatus(status, data = null) {
    const event = new CustomEvent('pusher-connection-status', {
      detail: {
        status,
        data,
        timestamp: new Date().toISOString()
      }
    });
    
    window.dispatchEvent(event);
  }

  // Obtenir le token d'authentification
  getAuthToken() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No auth token found in localStorage');
      }
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // Obtenir le statut de connexion
  getConnectionState() {
    if (!this.pusher) {
      return 'not_initialized';
    }
    
    return this.pusher.connection.state;
  }

  // Obtenir les statistiques des channels
  getChannelStats() {
    const stats = {
      totalChannels: this.channels.size,
      activeChannels: 0,
      channels: []
    };

    const now = new Date();
    
    this.channels.forEach((data, name) => {
      const timeSinceLastActivity = (now - data.lastActivity) / 1000;
      const isActive = timeSinceLastActivity < 300; // 5 minutes
      
      if (isActive) {
        stats.activeChannels++;
      }
      
      stats.channels.push({
        name,
        subscribedAt: data.subscribedAt,
        lastActivity: data.lastActivity,
        isActive
      });
    });
    
    return stats;
  }

  // Nettoyer les channels inactifs
  cleanupInactiveChannels() {
    const now = new Date();
    const inactiveThreshold = 30 * 60 * 1000; // 30 minutes
    
    const channelsToCleanup = [];
    
    this.channels.forEach((data, name) => {
      const timeSinceLastActivity = now - data.lastActivity;
      
      if (timeSinceLastActivity > inactiveThreshold) {
        channelsToCleanup.push(name);
      }
    });
    
    channelsToCleanup.forEach(channelName => {
      this.unsubscribe(channelName);
      console.log(`🧹 Cleaned up inactive channel: ${channelName}`);
    });
    
    return channelsToCleanup.length;
  }

  // Obtenir l'état du service
  getStatus() {
    return {
      initialized: this.isInitialized,
      connectionState: this.getConnectionState(),
      channels: this.getChannelStats(),
      reconnectAttempts: this.reconnectAttempts,
      pusherConfig: {
        key: process.env.REACT_APP_PUSHER_KEY ? '***configured***' : 'not configured',
        cluster: process.env.REACT_APP_PUSHER_CLUSTER || 'eu',
        forceTLS: true
      }
    };
  }

  // Déconnecter proprement
  disconnect() {
    if (this.pusher) {
      try {
        // Se désabonner de tous les channels
        this.channels.forEach((data, name) => {
          this.unsubscribe(name);
        });
        
        // Déconnecter Pusher
        this.pusher.disconnect();
        
        console.log('✅ Pusher client disconnected');
        
        sentryService.addBreadcrumb('Pusher client disconnected', 'websocket', 'info');
      } catch (error) {
        console.error('❌ Error disconnecting Pusher:', error);
        
        sentryService.captureError(error, {
          context: 'pusher_disconnection'
        });
      }
    }
    
    this.isInitialized = false;
    this.channels.clear();
    this.eventListeners.clear();
  }
}

// Export singleton
const pusherClientService = new PusherClientService();

export default pusherClientService;
