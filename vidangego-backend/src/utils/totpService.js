// Service TOTP (Time-based One-Time Password) pour VidangeGo CI
// Utilise speakeasy pour générer et vérifier les codes 2FA

import speakeasy from 'speakeasy';
import { logger } from './logger.js';

class TOTPService {
    // Générer un secret TOTP pour un utilisateur
    generateSecret(userEmail) {
        const secret = speakeasy.generateSecret({
            name: `VidangeGo CI (${userEmail})`,
            issuer: 'VidangeGo CI',
            length: 32
        });

        logger.info('TOTP secret generated', {
            email: userEmail,
            secretBase32: secret.base32.substring(0, 8) + '***'
        });

        return secret;
    }

    // Générer l'URL QR code pour Google Authenticator
    getQRCodeURL(secret) {
        return speakeasy.otpauthURL({
            secret: secret.base32,
            label: secret.name,
            issuer: secret.issuer,
            encoding: 'base32'
        });
    }

    // Vérifier un token TOTP
    verifyToken(token, secret) {
        const verified = speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: token,
            window: 2, // Permet une fenêtre de temps de ±1 intervalle (2 au total)
            time: Math.floor(Date.now() / 1000)
        });

        logger.info('TOTP token verification', {
            verified,
            tokenLength: token?.length || 0,
            window: 2
        });

        return verified;
    }

    // Vérifier un token backup (codes de récupération)
    verifyBackupToken(token, backupCodes) {
        return backupCodes.includes(token);
    }

    // Générer des codes de récupération (backup codes)
    generateBackupCodes(count = 10) {
        const codes = [];
        for (let i = 0; i < count; i++) {
            codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
        }

        logger.info('Backup codes generated', {
            count,
            codesGenerated: codes.map(() => '****-****') // Masquer les vrais codes
        });

        return codes;
    }

    // Valider le format d'un token TOTP
    validateTokenFormat(token) {
        // Token TOTP doit être numérique et faire 6 chiffres
        const tokenPattern = /^\d{6}$/;
        return tokenPattern.test(token);
    }

    // Obtenir le temps restant pour le token actuel
    getCurrentTokenTimeRemaining() {
        const now = Math.floor(Date.now() / 1000);
        const timeRemaining = 30 - (now % 30); // Tokens TOTP changent toutes les 30 secondes
        return timeRemaining;
    }

    // Générer un token pour les tests (ne pas utiliser en production)
    generateTestToken(secret) {
        return speakeasy.totp({
            secret: secret,
            encoding: 'base32',
            time: Math.floor(Date.now() / 1000)
        });
    }

    // Middleware Express pour vérifier TOTP
    requireTOTP() {
        return (req, res, next) => {
            const { token, secret } = req.body;

            if (!token || !secret) {
                return res.status(400).json({
                    error: 'Token TOTP et secret requis',
                    code: 'MISSING_TOTP_CREDENTIALS'
                });
            }

            if (!this.validateTokenFormat(token)) {
                return res.status(400).json({
                    error: 'Format de token TOTP invalide',
                    code: 'INVALID_TOTP_FORMAT'
                });
            }

            if (!this.verifyToken(token, secret)) {
                return res.status(401).json({
                    error: 'Token TOTP invalide',
                    code: 'INVALID_TOTP_TOKEN'
                });
            }

            next();
        };
    }

    // Obtenir des informations sur le service TOTP
    getServiceInfo() {
        return {
            name: 'VidangeGo CI TOTP Service',
            version: '1.0.0',
            algorithm: 'sha1',
            digits: 6,
            period: 30, // secondes
            window: 2,   // fenêtre de temps
            supportedFeatures: [
                'TOTP generation',
                'TOTP verification',
                'Backup codes',
                'QR code generation',
                'Time-based tokens'
            ]
        };
    }
}

// Exporter une instance unique
const totpService = new TOTPService();

export default totpService;
