import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/authRoutes.js';
import missionRoutes from './routes/missionRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

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

// Routes de test
app.get('/', (req, res) => {
    res.json({ message: 'Bienvenue sur l\'API VidangeGo CI 🚀' });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'UP', timestamp: new Date() });
});

// Lancement du serveur
app.listen(PORT, () => {
    console.log(`✅ Serveur VidangeGo démarré sur http://localhost:${PORT}`);
});

export { app, prisma };
