import { Router } from 'express';
import { createLocation, getLocationsByMission } from '../controllers/locationController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { z } from 'zod';

const router = Router();

const locationCreateSchema = z.object({
    body: z.object({
        missionId: z.string().uuid(),
        lat: z.number(),
        lng: z.number(),
    }),
});

router.post('/', authenticateToken, validate(locationCreateSchema), createLocation);
router.get('/mission/:missionId', authenticateToken, getLocationsByMission);

export default router;
