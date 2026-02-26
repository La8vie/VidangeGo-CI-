import express from 'express';
import { getInventory, updateInventoryItem, createInventoryItem } from '../controllers/inventoryController.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';
import { validate, inventoryCreateSchema, inventoryUpdateSchema } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, getInventory);
router.post('/', verifyAdmin, validate(inventoryCreateSchema), createInventoryItem);
router.patch('/:id', verifyAdmin, validate(inventoryUpdateSchema), updateInventoryItem);

export default router;
