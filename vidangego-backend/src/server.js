import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

if (!process.env.JWT_SECRET) {
    console.warn('JWT_SECRET non trouvé, utilisation d\'une valeur par défaut pour le test.');
    process.env.JWT_SECRET = 'vidangego_secret_key_2026';
}

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Rendre io accessible aux contrôleurs
app.set('io', io);

// Middlewares
app.use(cors());
app.use(express.json());

// Logger simple
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes d'API
app.use('/api/auth', (req, res) => {
    res.json({ message: 'Auth routes - VidangeGo CI Backend' });
});

app.use('/api/public-auth', (req, res) => {
    res.json({ message: 'Public auth routes - VidangeGo CI Backend' });
});

app.use('/api/missions', (req, res) => {
    res.json({ message: 'Missions routes - VidangeGo CI Backend' });
});

app.use('/api/vehicles', (req, res) => {
    res.json({ message: 'Vehicles routes - VidangeGo CI Backend' });
});

// Routes de test
app.get('/', (req, res) => {
    res.json({ message: 'Bienvenue sur l\'API VidangeGo CI' });
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
    });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something broke!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// Route 404
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`
    });
});

// Démarrage du serveur
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`API Health: http://localhost:${PORT}/api/health`);
});

// Gestion de l'arrêt gracieux
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await prisma.$disconnect();
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await prisma.$disconnect();
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

export default app;
