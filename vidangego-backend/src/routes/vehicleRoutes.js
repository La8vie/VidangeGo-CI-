import express from 'express';
import { addVehicle, getVehiclesByOwner } from '../controllers/vehicleController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { validate, vehicleCreateSchema } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/', verifyToken, validate(vehicleCreateSchema), addVehicle);
router.get('/owner/:ownerId', verifyToken, getVehiclesByOwner);

export default router;
