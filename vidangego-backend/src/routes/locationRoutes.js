import { Router } from 'express';
import { createLocation, getLocationsByMission } from '../controllers/locationController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
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

router.post('/', verifyToken, validate(locationCreateSchema), createLocation);
router.get('/mission/:missionId', verifyToken, getLocationsByMission);

export default router;
