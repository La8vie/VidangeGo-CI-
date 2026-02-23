import { prisma } from '../server.js';
import { calculatePrice, getOilRecommendation } from '../utils/businessLogic.js';

export const createMission = async (req, res) => {
    try {
        const { clientId, vehicleId, serviceType, date, time, commune, address } = req.body;

        // Récupérer les infos du véhicule pour la recommandation (et vérification)
        const vehicle = await prisma.vehicle.findUnique({
            where: { id: vehicleId }
        });

        if (!vehicle) {
            return res.status(404).json({ error: 'Véhicule non trouvé' });
        }

        // Calcul du prix basé sur la commune
        const totalPrice = calculatePrice(commune);

        const mission = await prisma.mission.create({
            data: {
                clientId,
                vehicleId,
                serviceType,
                date: new Date(date),
                time,
                commune,
                address,
                totalPrice,
                status: 'PENDING'
            },
            include: {
                vehicle: true,
                client: true
            }
        });

        res.status(201).json(mission);
    } catch (error) {
        console.error('Erreur creation mission:', error);
        res.status(500).json({ error: 'Erreur lors de la création de la mission' });
    }
};

export const getMissions = async (req, res) => {
    try {
        const missions = await prisma.mission.findMany({
            include: {
                client: true,
                vehicle: true,
                mechanic: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(missions);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des missions' });
    }
};

export const getOilSuggestion = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const vehicle = await prisma.vehicle.findUnique({
            where: { id: vehicleId }
        });

        if (!vehicle) {
            return res.status(404).json({ error: 'Véhicule non trouvé' });
        }

        const suggestion = getOilRecommendation(vehicle.mileage, vehicle.year);
        res.json(suggestion);
    } catch (error) {
        res.status(500).json({ error: 'Erreur suggestion huile' });
    }
};

export const getStats = async (req, res) => {
    try {
        const missions = await prisma.mission.findMany();
        const clients = await prisma.user.findMany({ where: { role: 'CLIENT' } });
        const inventory = await prisma.inventoryItem.findMany();

        const completedMissions = missions.filter(m => m.status === 'COMPLETED');
        const totalRevenue = completedMissions.reduce((acc, m) => acc + m.totalPrice, 0);
        const lowStockItems = inventory.filter(i => i.quantity < 10);

        // Données pour le graphique (7 derniers jours simplifiés)
        const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        const chartData = days.map((day, index) => {
            const dayMissions = missions.filter(m => new Date(m.date).getDay() === index);
            return {
                name: day,
                missions: dayMissions.length,
                revenue: dayMissions.reduce((acc, m) => acc + (m.status === 'COMPLETED' ? m.totalPrice : 0), 0)
            };
        });

        res.json({
            completedMissions: completedMissions.length,
            totalRevenue,
            newClients: clients.length,
            inventoryAlerts: lowStockItems.length,
            chartData
        });
    } catch (error) {
        console.error('Erreur stats:', error);
        res.status(500).json({ error: 'Erreur lors du calcul des statistiques' });
    }
};
