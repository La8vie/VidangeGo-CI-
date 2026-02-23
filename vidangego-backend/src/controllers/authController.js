import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../server.js';

const JWT_SECRET = process.env.JWT_SECRET || 'vidangego_secret';

export const register = async (req, res) => {
    try {
        const { email, password, name, phone } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                phone,
                role: 'CLIENT'
            }
        });

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l\'inscription' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Mot de passe incorrect' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la connexion' });
    }
};
