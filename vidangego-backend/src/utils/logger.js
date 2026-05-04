// Service de logging pour VidangeGo CI
// Utilise Winston pour une gestion centralisée des logs

import winston from 'winston';

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.prettyPrint()
);

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: {
        service: 'vidangego-backend',
        version: '1.0.0'
    },
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(),
                winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
                    return `${timestamp} [${service}] ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
                })
            )
        }),
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error'
        }),
        new winston.transports.File({
            filename: 'logs/combined.log'
        })
    ]
});

// Créer le répertoire logs s'il n'existe pas
import { mkdirSync } from 'fs';
try {
    mkdirSync('logs', { recursive: true });
} catch (error) {
    // Le répertoire existe déjà
}

export { logger };
