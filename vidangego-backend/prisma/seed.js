import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Début du seeding...');

    // Nettoyage de l'inventaire existant pour le test
    // await prisma.inventoryItem.deleteMany();

    const items = [
        { name: 'Total Quartz 9000 5W40', category: 'Huile Synthétique', stock: 50, unit: 'Litre', price: 8500 },
        { name: 'Shell Helix Ultra 5W40', category: 'Huile Synthétique', stock: 40, unit: 'Litre', price: 9000 },
        { name: 'Petro Ivoire Gold 5W40', category: 'Huile Synthétique', stock: 30, unit: 'Litre', price: 7500 },
        { name: 'Total Quartz 7000 10W40', category: 'Huile Semi-Synthétique', stock: 60, unit: 'Litre', price: 6500 },
        { name: 'Shell Helix HX7 10W40', category: 'Huile Semi-Synthétique', stock: 45, unit: 'Litre', price: 6800 },
    ];

    for (const item of items) {
        await prisma.inventoryItem.upsert({
            where: { id: `seed-${item.name.replace(/\s+/g, '-').toLowerCase()}` }, // ID factice pour l'upsert
            update: {},
            create: {
                id: `seed-${item.name.replace(/\s+/g, '-').toLowerCase()}`,
                ...item
            }
        });
    }

    console.log('✅ Seeding terminé avec succès !');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
