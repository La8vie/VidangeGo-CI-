import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/authRoutes.js';
import missionRoutes from './routes/missionRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import locationRoutes from './routes/locationRoutes.js';

dotenv.config();

if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET est requis.');
    process.exit(1);
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
app.use('/api/auth', authRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/locations', locationRoutes);

// Routes de test
app.get('/', (req, res) => {
    res.json({ message: 'Bienvenue sur l\'API VidangeGo CI 🚀' });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'UP', timestamp: new Date() });
});

// WebSocket: gestion des salles par mission
io.on('connection', (socket) => {
    console.log('WebSocket connecté:', socket.id);

    socket.on('join_mission', (missionId) => {
        socket.join(`mission_${missionId}`);
        console.log(`Socket ${socket.id} a rejoint la mission ${missionId}`);
    });

    socket.on('leave_mission', (missionId) => {
        socket.leave(`mission_${missionId}`);
        console.log(`Socket ${socket.id} a quitté la mission ${missionId}`);
    });

    socket.on('disconnect', () => {
        console.log('WebSocket déconnecté:', socket.id);
    });
});

// Lancement du serveur (seulement en local)
if (process.env.NODE_ENV !== 'production') {
    server.listen(PORT, () => {
        console.log(`✅ Serveur VidangeGo démarré sur http://localhost:${PORT}`);
    });
}

export default app;
export { prisma };
