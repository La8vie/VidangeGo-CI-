import jwt from 'jsonwebtoken';

const getJwtSecret = () => {
    if (!process.env.JWT_SECRET) {
        throw new Error('FATAL ERROR: JWT_SECRET is not defined.');
    }
    return process.env.JWT_SECRET;
};

export const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];

        if (bearer.length !== 2 || bearer[0] !== 'Bearer' || !bearerToken) {
            return res.status(401).json({ error: 'Format de token invalide' });
        }

        try {
            const decoded = jwt.verify(bearerToken, getJwtSecret());
            req.user = decoded;
            next();
        } catch (err) {
            if (err?.message?.includes('JWT_SECRET')) {
                return res.status(500).json({ error: 'Configuration serveur invalide (JWT_SECRET manquant)' });
            }
            return res.status(401).json({ error: 'Token invalide ou expiré' });
        }
    } else {
        return res.status(403).json({ error: 'Accès refusé. Aucun token fourni.' });
    }
};

export const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user && req.user.role === 'ADMIN') {
            next();
        } else {
            return res.status(403).json({ error: 'Accès refusé. Rôle ADMIN requis.' });
        }
    });
};
