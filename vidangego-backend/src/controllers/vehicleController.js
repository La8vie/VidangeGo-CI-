import { prisma } from '../server.js';

export const addVehicle = async (req, res) => {
    try {
        const { brand, model, year, mileage, licensePlate } = req.body;

        if (!req.user?.id) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        const vehicle = await prisma.vehicle.create({
            data: {
                brand,
                model,
                year: parseInt(year),
                mileage: parseInt(mileage),
                licensePlate,
                ownerId: req.user.id
            }
        });

        res.status(201).json(vehicle);
    } catch (error) {
        console.error('Erreur add vehicle:', error);
        res.status(500).json({ error: 'Erreur lors de l\'ajout du véhicule' });
    }
};

export const getVehiclesByOwner = async (req, res) => {
    try {
        const { ownerId } = req.params;

        if (!req.user?.id) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        if (req.user.role !== 'ADMIN' && req.user.id !== ownerId) {
            return res.status(403).json({ error: 'Accès refusé' });
        }

        const vehicles = await prisma.vehicle.findMany({
            where: { ownerId }
        });
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des véhicules' });
    }
};
