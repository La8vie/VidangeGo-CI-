import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import routes
import authRoutes from './routes/authRoutes.js';
import missionRoutes from './routes/missionRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import locationRoutes from './routes/locationRoutes.js';

// Load environment
dotenv.config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET est requis.');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('FATAL ERROR: DATABASE_URL est requis.');
  process.exit(1);
}

// Create Express app
const app = express();
const server = createServer(app);
const io = new Server(server, { 
  cors: { 
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://vidangego-client.vercel.app', 'https://vidangego-admin.vercel.app']
      : '*',
    methods: ['GET', 'POST']
  } 
});
const prisma = new PrismaClient();

// Make io available to controllers
app.set('io', io);

// Middlewares
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://vidangego-client.vercel.app', 'https://vidangego-admin.vercel.app']
    : '*',
  credentials: true
}));
app.use(express.json());

// Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/locations', locationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date() });
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'VidangeGo CI API 🚀' });
});

// WebSocket handling
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

// Handle Vercel serverless
if (process.env.NODE_ENV === 'production') {
  module.exports = (req, res) => {
    app(req, res);
  };
} else {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`✅ Serveur VidangeGo démarré sur http://localhost:${PORT}`);
  });
}

export { prisma };
