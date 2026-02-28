import { z } from 'zod';

export const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (err) {
        return res.status(400).json({ error: 'Données invalides', details: err.errors });
    }
};

const stringOrNumber = z.union([z.string(), z.number()]).transform((val) => Number(val)).refine((val) => !isNaN(val), { message: 'Doit être un nombre valide' });

export const authRegisterSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(2),
        phone: z.string().optional(),
    }),
});

export const authLoginSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string(),
    }),
});

export const missionCreateSchema = z.object({
    body: z.object({
        vehicleId: z.string().uuid(),
        serviceType: z.enum(['STANDARD', 'PREMIUM']),
        date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Date invalide' }),
        time: z.string(),
        commune: z.string(),
        address: z.string(),
        oilBrand: z.string().optional(),
    }),
});

export const vehicleCreateSchema = z.object({
    body: z.object({
        brand: z.string().min(1),
        model: z.string().min(1),
        year: stringOrNumber,
        mileage: stringOrNumber,
        licensePlate: z.string().min(1),
    }),
});

export const inventoryCreateSchema = z.object({
    body: z.object({
        name: z.string().min(1),
        category: z.string().min(1),
        stock: stringOrNumber,
        unit: z.string().min(1),
        price: stringOrNumber,
    }),
});

export const inventoryUpdateSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
    body: z.object({
        stock: stringOrNumber.optional(),
        status: z.enum(['OPTIMAL', 'LOW', 'CRITICAL']).optional(),
    }),
});
