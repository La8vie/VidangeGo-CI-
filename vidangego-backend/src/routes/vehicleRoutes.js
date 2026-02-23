import express from 'express';
import { addVehicle, getVehiclesByOwner } from '../controllers/vehicleController.js';

const router = express.Router();

router.post('/', addVehicle);
router.get('/owner/:ownerId', getVehiclesByOwner);

export default router;
