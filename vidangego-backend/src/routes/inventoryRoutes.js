import express from 'express';
import { getInventory, updateInventoryItem, createInventoryItem } from '../controllers/inventoryController.js';

const router = express.Router();

router.get('/', getInventory);
router.post('/', createInventoryItem);
router.patch('/:id', updateInventoryItem);

export default router;
