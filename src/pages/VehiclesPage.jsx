import { useEffect, useState } from 'react';
import { Car, Plus, X, Edit, Trash2 } from 'lucide-react';
import { vehicleService } from '../services/api';
import './VehiclesPage.css';

// Liste prioritaire des marques/modèles courants en Côte d'Ivoire
const ciMarketData = {
  'Toyota': ['Yaris', 'Corolla', 'Hilux', 'Land Cruiser', 'RAV4', 'Camry', 'Prius'],
  'Hyundai': ['i10', 'i20', 'Accent', 'Tucson', 'Santa Fe', 'Creta', 'Elantra'],
  'Kia': ['Picanto', 'Rio', 'Sportage', 'Sorento', 'Cerato', 'Seltos'],
  'Nissan': ['Almera', 'Qashqai', 'X-Trail', 'Micra', 'Sentra', 'Patrol'],
  'Peugeot': ['208', '301', '2008', '3008', '508', 'Partner', 'Rifter'],
  'Renault': ['Clio', 'Captur', 'Duster', 'Symbol', 'Kadjar', 'Lodgy', 'Dokker'],
  'Suzuki': ['Swift', 'Baleno', 'Jimny', 'Vitara', 'SX4', 'Alto'],
  'Dacia': ['Logan', 'Sandero', 'Duster', 'Lodgy'],
  'Mitsubishi': ['ASX', 'Outlander', 'L200', 'Space Star', 'Eclipse Cross'],
  'Ford': ['Fiesta', 'Focus', 'EcoSport', 'Ranger', 'Mustang', 'Kuga'],
  'Volkswagen': ['Polo', 'Golf', 'Tiguan', 'Passat', 'T-Cross', 'T-Roc'],
  'Mercedes': ['Classe A', 'Classe C', 'Classe E', 'GLA', 'GLC', 'GLC', 'Vito'],
  'BMW': ['Série 1', 'Série 3', 'Série 5', 'X1', 'X3', 'X5'],
  'Audi': ['A1', 'A3', 'A4', 'Q2', 'Q3', 'Q5', 'Q7'],
  'Honda': ['Jazz', 'Civic', 'HR-V', 'CR-V', 'Accord', 'Fit'],
  'Mazda': ['Mazda2', 'Mazda3', 'CX-3', 'CX-5', 'CX-30', 'BT-50'],
  'Chevrolet': ['Spark', 'Aveo', 'Cruze', 'Tracker', 'Captiva'],
  'Opel': ['Corsa', 'Astra', 'Crossland X', 'Grandland X', 'Mokka X'],
  'Fiat': ['500', 'Panda', 'Tipo', '500X', 'Doblo', 'Palio'],
  'SsangYong': ['Tivoli', 'Korando', 'Rexton', 'Musso'],
  'Chery': ['Tiggo', 'Arrizo', 'QQ', 'Jago'],
  'Geely': ['Emgrand', 'Coolray', 'Azkarra', 'Tugella'],
};

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ brand: '', model: '', year: '', mileage: '', plate: '', motorisation: '' });
    const [modelSuggestions, setModelSuggestions] = useState([]);
    const [modelsCache, setModelsCache] = useState({});
    const [allBrands, setAllBrands] = useState([]);
    const [ciBrands] = useState(Object.keys(ciMarketData));

    const user = (() => {
        try {
            return JSON.parse(localStorage.getItem('user') || 'null');
        } catch {
            return null;
        }
    })();

    useEffect(() => {
        const load = async () => {
            try {
                if (!user?.id) return;
                const data = await vehicleService.getByOwner(user.id);
                setVehicles(data);
            } catch (err) {
                console.error('Erreur chargement véhicules:', err);
            }
        };
        load();
    }, [user?.id]);

    // Charger toutes les marques VPIC au montage (fallback)
    useEffect(() => {
        const fetchAllBrands = async () => {
            try {
                const url = 'https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=json';
                const res = await fetch(url);
                if (!res.ok) throw new Error('Erreur récupération marques');
                const json = await res.json();
                const brands = Array.isArray(json?.Results)
                    ? json.Results.map(r => r?.Make_Name).filter(Boolean).sort()
                    : [];
                setAllBrands(brands);
            } catch (err) {
                console.error('Erreur récupération marques:', err);
                setAllBrands([]);
            }
        };
        fetchAllBrands();
    }, []);

    useEffect(() => {
        const brand = (form.brand || '').trim();
        if (brand.length < 2) {
            setModelSuggestions([]);
            return;
        }

        // Priorité : marché CI > VPIC
        if (ciMarketData[brand]) {
            setModelSuggestions(ciMarketData[brand]);
            return;
        }

        const normalized = brand.toLowerCase();
        if (modelsCache[normalized]) {
            setModelSuggestions(modelsCache[normalized]);
            return;
        }

        const timeoutId = setTimeout(() => {
            const fetchModels = async () => {
                try {
                    const url = `https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/${encodeURIComponent(brand)}?format=json`;
                    const res = await fetch(url);
                    if (!res.ok) throw new Error('Erreur récupération modèles');
                    const json = await res.json();
                    const models = Array.isArray(json?.Results)
                        ? Array.from(new Set(json.Results.map(r => r?.Model_Name).filter(Boolean))).sort()
                        : [];

                    setModelsCache((prev) => ({ ...prev, [normalized]: models }));
                    setModelSuggestions(models);
                } catch (err) {
                    console.error('Erreur récupération modèles:', err);
                    setModelSuggestions([]);
                }
            };
            fetchModels();
        }, 350);

        return () => clearTimeout(timeoutId);
    }, [form.brand, modelsCache]);

    const handleAdd = (e) => {
        e.preventDefault();
        const create = async () => {
            try {
                const vehicleData = {
                    brand: form.brand,
                    model: form.model,
                    year: form.year,
                    mileage: form.mileage,
                    licensePlate: form.plate,
                    motorisation: form.motorisation,
                };
                const created = await vehicleService.addVehicle(vehicleData);
                setVehicles((prev) => [created, ...prev]);
                setForm({ brand: '', model: '', year: '', mileage: '', plate: '', motorisation: '' });
                setShowModal(false);
            } catch (err) {
                alert(err?.message || 'Erreur lors de la création du véhicule');
            }
        };
        create();
    };

    const handleDelete = (id) => {
        setVehicles(vehicles.filter(v => v.id !== id));
    };

    return (
        <div className="vehicles-page section">
            <div className="container">
                <div className="page-header animate-fade-up">
                    <div>
                        <h1>Mes Véhicules</h1>
                        <p className="text-gray">Gérez les véhicules de votre garage</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> Ajouter un véhicule
                    </button>
                </div>

                <div className="vehicles-grid animate-fade-up stagger-1">
                    {vehicles.map(v => (
                        <div key={v.id} className="card vehicle-card">
                            <div className="vehicle-card-header" style={{ background: `#3B82F615` }}>
                                <Car size={40} color="#3B82F6" />
                            </div>
                            <div className="vehicle-card-body">
                                <h3>{v.brand} {v.model}</h3>
                                <span className="text-gray">{v.year}</span>
                                <div className="vehicle-plate">{v.licensePlate}</div>
                            </div>
                            <div className="vehicle-card-actions">
                                <button className="icon-btn"><Edit size={16} /></button>
                                <button className="icon-btn icon-btn-danger" onClick={() => handleDelete(v.id)}><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}

                    <div className="card vehicle-card vehicle-add-card" onClick={() => setShowModal(true)}>
                        <Plus size={32} color="var(--gray-400)" />
                        <span>Ajouter un véhicule</span>
                    </div>
                </div>

                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Ajouter un véhicule</h2>
                                <button className="icon-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleAdd}>
                                <div className="input-group">
                                    <label>Marque</label>
                                    <input
                                        className="input"
                                        list="brand-suggestions"
                                        placeholder="Ex: Toyota"
                                        value={form.brand}
                                        onChange={e => setForm({ ...form, brand: e.target.value })}
                                        required
                                    />
                                    <datalist id="brand-suggestions">
                                        {[...ciBrands, ...allBrands].map(b => <option key={b} value={b} />)}
                                    </datalist>
                                </div>
                                <div className="input-group">
                                    <label>Modèle</label>
                                    <input
                                        className="input"
                                        list="model-suggestions"
                                        placeholder="Ex: Corolla"
                                        value={form.model}
                                        onChange={e => setForm({ ...form, model: e.target.value })}
                                        required
                                    />
                                    <datalist id="model-suggestions">
                                        {modelSuggestions.slice(0, 100).map(m => <option key={m} value={m} />)}
                                    </datalist>
                                </div>
                                <div className="modal-row">
                                    <div className="input-group">
                                        <label>Année</label>
                                        <input className="input" placeholder="2024" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} required />
                                    </div>
                                    <div className="input-group">
                                        <label>Plaque</label>
                                        <input className="input" placeholder="XX 0000 CI" value={form.plate} onChange={e => setForm({ ...form, plate: e.target.value })} required />
                                    </div>
                                </div>
                                <div className="input-group" style={{ marginTop: '12px' }}>
                                    <label>Kilométrage</label>
                                    <input className="input" placeholder="45000" value={form.mileage} onChange={e => setForm({ ...form, mileage: e.target.value })} required />
                                </div>
                                <div className="input-group" style={{ marginTop: '12px' }}>
                                    <label>Motorisation</label>
                                    <select className="input" value={form.motorisation} onChange={e => setForm({ ...form, motorisation: e.target.value })} required>
                                        <option value="">Sélectionner...</option>
                                        <option value="Essence">Essence</option>
                                        <option value="Diesel">Diesel</option>
                                        <option value="Hybride">Hybride</option>
                                    </select>
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}>
                                    Enregistrer le véhicule
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
