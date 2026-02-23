/**
 * Calcule le prix de la prestation en fonction de la commune.
 * @param {string} commune 
 * @returns {number} Prix en FCFA
 */
export const calculatePrice = (commune) => {
    const specialZones = ['Grand Bassam', 'Koumassi', 'Port-Bouët', 'Marcory'];
    const normalizedCommune = commune.trim();

    // Recherche insensible à la casse et partielle
    const isSpecial = specialZones.some(zone =>
        normalizedCommune.toLowerCase().includes(zone.toLowerCase())
    );

    return isSpecial ? 10000 : 5000;
};

/**
 * Propose une recommandation d'huile en fonction du kilométrage et de l'année.
 * @param {number} mileage 
 * @param {number} year 
 * @returns {Object} Recommandation
 */
export const getOilRecommendation = (mileage, year) => {
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;

    let recommendation = {
        type: 'Standard',
        brands: ['Total', 'Shell', 'Petro Ivoire'],
        description: 'Huile minérale adaptée aux véhicules classiques.'
    };

    if (mileage < 50000 || age < 5) {
        recommendation = {
            type: 'Premium (Synthétique)',
            brands: ['Total Quartz 9000', 'Shell Helix Ultra', 'Petro Ivoire Synth'],
            description: 'Protection maximale pour moteurs récents et faible kilométrage.'
        };
    } else if (mileage < 150000 || age < 12) {
        recommendation = {
            type: 'Standard+ (Semi-Synthétique)',
            brands: ['Total Quartz 7000', 'Shell Helix HX7', 'Petro Ivoire Semi-Synth'],
            description: 'Excellent équilibre performance/prix pour véhicules intermédiaires.'
        };
    }

    return recommendation;
};
