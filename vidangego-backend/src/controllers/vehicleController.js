import { prisma } from '../server.js';

export const addVehicle = async (req, res) => {
    try {
        const { brand, model, year, mileage, licensePlate, ownerId } = req.body;

        const vehicle = await prisma.vehicle.create({
            data: {
                brand,
                model,
                year: parseInt(year),
                mileage: parseInt(mileage),
                licensePlate,
                ownerId
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
        const vehicles = await prisma.vehicle.findMany({
            where: { ownerId }
        });
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des véhicules' });
    }
};
