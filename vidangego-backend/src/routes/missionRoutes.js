import express from 'express';
import { createMission, getMissions, getOilSuggestion, getStats } from '../controllers/missionController.js';

const router = express.Router();

router.post('/', createMission);
router.get('/', getMissions);
router.get('/stats', getStats);
router.get('/suggestion/:vehicleId', getOilSuggestion);

export default router;
