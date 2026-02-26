import express from 'express';
import { createMission, getMissions, getOilSuggestion, getStats } from '../controllers/missionController.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';
import { validate, missionCreateSchema } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/', verifyToken, validate(missionCreateSchema), createMission);
router.get('/', verifyToken, getMissions);
router.get('/stats', verifyAdmin, getStats);
router.get('/suggestion/:vehicleId', verifyToken, getOilSuggestion);

export default router;
