// Routes TOTP (Two-Factor Authentication) pour VidangeGo CI
// Gestion de l'authentification à deux facteurs

import express from 'express';
import totpService from '../utils/totpService.js';
import { logger } from '../utils/logger.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Générer un secret TOTP pour un utilisateur
router.post('/generate-secret', rateLimiter.auth, async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                error: 'Email requis',
                code: 'EMAIL_REQUIRED'
            });
        }

        const secret = totpService.generateSecret(email);
        const qrCodeURL = totpService.getQRCodeURL(secret);

        logger.info('TOTP secret generated for user', {
            email,
            secretGenerated: true
        });

        res.json({
            success: true,
            secret: secret.base32,
            qrCodeURL,
            message: 'Secret TOTP généré avec succès'
        });

    } catch (error) {
        logger.error('Error generating TOTP secret', {
            error: error.message,
            email: req.body.email
        });

        res.status(500).json({
            error: 'Erreur lors de la génération du secret TOTP',
            code: 'SECRET_GENERATION_ERROR'
        });
    }
});

// Vérifier un token TOTP
router.post('/verify', rateLimiter.auth, async (req, res) => {
    try {
        const { token, secret } = req.body;

        if (!token || !secret) {
            return res.status(400).json({
                error: 'Token et secret requis',
                code: 'MISSING_CREDENTIALS'
            });
        }

        // Valider le format du token
        if (!totpService.validateTokenFormat(token)) {
            return res.status(400).json({
                error: 'Format de token invalide (6 chiffres requis)',
                code: 'INVALID_TOKEN_FORMAT'
            });
        }

        const verified = totpService.verifyToken(token, secret);
        const timeRemaining = totpService.getCurrentTokenTimeRemaining();

        logger.info('TOTP verification attempt', {
            verified,
            tokenLength: token.length,
            timeRemaining
        });

        res.json({
            success: true,
            verified,
            timeRemaining,
            message: verified ? 'Token valide' : 'Token invalide'
        });

    } catch (error) {
        logger.error('Error verifying TOTP token', {
            error: error.message
        });

        res.status(500).json({
            error: 'Erreur lors de la vérification du token',
            code: 'TOKEN_VERIFICATION_ERROR'
        });
    }
});

// Générer des codes de récupération
router.post('/backup-codes', rateLimiter.auth, async (req, res) => {
    try {
        const { count = 10 } = req.body;

        const backupCodes = totpService.generateBackupCodes(count);

        logger.info('Backup codes generated', {
            count,
            codesGenerated: true
        });

        res.json({
            success: true,
            backupCodes,
            message: `${count} codes de récupération générés`
        });

    } catch (error) {
        logger.error('Error generating backup codes', {
            error: error.message
        });

        res.status(500).json({
            error: 'Erreur lors de la génération des codes de récupération',
            code: 'BACKUP_CODES_ERROR'
        });
    }
});

// Vérifier un code de récupération
router.post('/verify-backup', rateLimiter.auth, async (req, res) => {
    try {
        const { token, backupCodes } = req.body;

        if (!token || !backupCodes) {
            return res.status(400).json({
                error: 'Token et codes de récupération requis',
                code: 'MISSING_BACKUP_DATA'
            });
        }

        const verified = totpService.verifyBackupToken(token, backupCodes);

        logger.info('Backup code verification', {
            verified,
            tokenLength: token.length
        });

        res.json({
            success: true,
            verified,
            message: verified ? 'Code de récupération valide' : 'Code de récupération invalide'
        });

    } catch (error) {
        logger.error('Error verifying backup code', {
            error: error.message
        });

        res.status(500).json({
            error: 'Erreur lors de la vérification du code de récupération',
            code: 'BACKUP_VERIFICATION_ERROR'
        });
    }
});

// Obtenir le temps restant pour le token actuel
router.get('/time-remaining', rateLimiter.auth, (req, res) => {
    try {
        const timeRemaining = totpService.getCurrentTokenTimeRemaining();

        res.json({
            success: true,
            timeRemaining,
            message: `Temps restant avant le prochain token: ${timeRemaining} secondes`
        });

    } catch (error) {
        logger.error('Error getting time remaining', {
            error: error.message
        });

        res.status(500).json({
            error: 'Erreur lors de l\'obtention du temps restant',
            code: 'TIME_REMAINING_ERROR'
        });
    }
});

// Obtenir les informations du service TOTP
router.get('/info', (req, res) => {
    try {
        const serviceInfo = totpService.getServiceInfo();

        res.json({
            success: true,
            service: serviceInfo
        });

    } catch (error) {
        logger.error('Error getting service info', {
            error: error.message
        });

        res.status(500).json({
            error: 'Erreur lors de l\'obtention des informations du service',
            code: 'SERVICE_INFO_ERROR'
        });
    }
});

// Générer un token de test (uniquement en développement)
router.post('/test-token', rateLimiter.auth, (req, res) => {
    try {
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({
                error: 'Endpoint de test non disponible en production',
                code: 'TEST_ENDPOINT_FORBIDDEN'
            });
        }

        const { secret } = req.body;

        if (!secret) {
            return res.status(400).json({
                error: 'Secret requis pour générer un token de test',
                code: 'SECRET_REQUIRED'
            });
        }

        const testToken = totpService.generateTestToken(secret);

        res.json({
            success: true,
            testToken,
            message: 'Token de test généré (développement uniquement)'
        });

    } catch (error) {
        logger.error('Error generating test token', {
            error: error.message
        });

        res.status(500).json({
            error: 'Erreur lors de la génération du token de test',
            code: 'TEST_TOKEN_ERROR'
        });
    }
});

export default router;
