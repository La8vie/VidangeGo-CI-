import { prisma } from '../server.js';

export const createLocation = async (req, res) => {
    try {
        const { missionId, lat, lng } = req.body;
        if (!req.user?.id) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        // Vérifier que la mission existe et que le user est le mécanicien assigné
        const mission = await prisma.mission.findUnique({ where: { id: missionId } });
        if (!mission || mission.mechanicId !== req.user.id) {
            return res.status(403).json({ error: 'Non autorisé' });
        }

        const location = await prisma.location.create({
            data: { missionId, lat: parseFloat(lat), lng: parseFloat(lng) }
        });

        // Émettre la position via WebSocket (si disponible)
        const io = req.app.get('io');
        if (io) {
            io.to(`mission_${missionId}`).emit('location_update', {
                missionId,
                lat: location.lat,
                lng: location.lng,
                timestamp: location.timestamp
            });
        }

        res.status(201).json(location);
    } catch (error) {
        console.error('Erreur createLocation:', error);
        res.status(500).json({ error: 'Erreur lors de l\'enregistrement de la position' });
    }
};

export const getLocationsByMission = async (req, res) => {
    try {
        const { missionId } = req.params;
        if (!req.user?.id) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        const mission = await prisma.mission.findUnique({ where: { id: missionId } });
        if (!mission) {
            return res.status(404).json({ error: 'Mission non trouvée' });
        }

        // Seul le client, le mécanicien assigné ou un admin peuvent voir les positions
        if (req.user.role !== 'ADMIN' && mission.clientId !== req.user.id && mission.mechanicId !== req.user.id) {
            return res.status(403).json({ error: 'Accès refusé' });
        }

        const locations = await prisma.location.findMany({
            where: { missionId },
            orderBy: { timestamp: 'desc' }
        });

        res.json(locations);
    } catch (error) {
        console.error('Erreur getLocationsByMission:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des positions' });
    }
};
