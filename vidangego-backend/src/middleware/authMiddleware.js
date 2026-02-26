import jwt from 'jsonwebtoken';

const getJwtSecret = () => {
    if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
        throw new Error('FATAL ERROR: JWT_SECRET is not defined in production.');
    }
    return process.env.JWT_SECRET || 'vidangego_secret';
};

export const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        try {
            const decoded = jwt.verify(bearerToken, getJwtSecret());
            req.user = decoded;
            next();
        } catch (err) {
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
