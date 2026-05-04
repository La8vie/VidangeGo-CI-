// Middleware de rate limiting pour VidangeGo CI
// Protection contre les abus et les attaques par force brute

import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger.js';

// Configuration de base pour les rate limiters
const createRateLimiter = (options = {}) => {
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes par défaut
        max: 100, // 100 requêtes par fenêtre par défaut
        message: {
            error: 'Trop de requêtes, veuillez réessayer plus tard',
            code: 'RATE_LIMIT_EXCEEDED'
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            logger.warn('Rate limit exceeded', {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                path: req.path,
                method: req.method
            });
            
            res.status(429).json({
                error: 'Trop de requêtes, veuillez réessayer plus tard',
                code: 'RATE_LIMIT_EXCEEDED',
                retryAfter: Math.ceil(options.windowMs / 1000) || 900
            });
        },
        ...options
    });

    return limiter;
};

// Rate limiter pour les routes d'authentification
export const auth = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 tentatives par fenêtre
    message: {
        error: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes',
        code: 'AUTH_RATE_LIMIT_EXCEEDED'
    },
    skipSuccessfulRequests: true // Ne pas compter les requêtes réussies
});

// Rate limiter pour les routes sensibles (TOTP, email verification)
export const sensitive = createRateLimiter({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 3, // 3 tentatives par fenêtre
    message: {
        error: 'Trop de tentatives, veuillez réessayer dans 10 minutes',
        code: 'SENSITIVE_RATE_LIMIT_EXCEEDED'
    }
});

// Rate limiter pour les routes publiques (inscription, etc.)
export const publicApi = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 10, // 10 requêtes par heure
    message: {
        error: 'Limite de requêtes publiques dépassée, veuillez réessayer plus tard',
        code: 'PUBLIC_RATE_LIMIT_EXCEEDED'
    }
});

// Rate limiter pour les routes API générales
export const api = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 requêtes par fenêtre
    message: {
        error: 'Limite d\'API dépassée, veuillez réessayer plus tard',
        code: 'API_RATE_LIMIT_EXCEEDED'
    }
});

// Rate limiteur très strict pour les routes critiques
export const critical = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 1, // 1 requête par heure
    message: {
        error: 'Cette action est très limitée, veuillez réessayer plus tard',
        code: 'CRITICAL_RATE_LIMIT_EXCEEDED'
    }
});

// Middleware pour ajouter des informations de rate limiting dans les logs
const rateLimitLogger = (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
        if (res.statusCode === 429) {
            logger.warn('Rate limit triggered', {
                ip: req.ip,
                path: req.path,
                method: req.method,
                statusCode: res.statusCode,
                userAgent: req.get('User-Agent')
            });
        }
        originalSend.call(this, data);
    };
    
    next();
};

export { rateLimitLogger };
