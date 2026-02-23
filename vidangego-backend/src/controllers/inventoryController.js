import { prisma } from '../server.js';

export const getInventory = async (req, res) => {
    try {
        const items = await prisma.inventoryItem.findMany();
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'inventaire' });
    }
};

export const updateInventoryItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { stock, status } = req.body;

        const item = await prisma.inventoryItem.update({
            where: { id },
            data: {
                stock: parseInt(stock),
                status
            }
        });

        res.json(item);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'article' });
    }
};

export const createInventoryItem = async (req, res) => {
    try {
        const { name, category, stock, unit, price } = req.body;
        const item = await prisma.inventoryItem.create({
            data: {
                name,
                category,
                stock: parseInt(stock),
                unit,
                price: parseFloat(price)
            }
        });
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ error: 'Erreur creation article' });
    }
};
