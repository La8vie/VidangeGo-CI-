const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}/api${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Une erreur est survenue');
    }

    return response.json();
};

export const authService = {
    login: (credentials) => apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    }),
    register: (userData) => apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
    }),
};

export const vehicleService = {
    addVehicle: (vehicleData) => apiFetch('/vehicles', {
        method: 'POST',
        body: JSON.stringify(vehicleData),
    }),
    getByOwner: (ownerId) => apiFetch(`/vehicles/owner/${ownerId}`),
};

export const missionService = {
    create: (missionData) => apiFetch('/missions', {
        method: 'POST',
        body: JSON.stringify(missionData),
    }),
    getAll: () => apiFetch('/missions'),
    getOilSuggestion: (vehicleId) => apiFetch(`/missions/suggestion/${vehicleId}`),
};

export const inventoryService = {
    getAll: () => apiFetch('/inventory'),
};
