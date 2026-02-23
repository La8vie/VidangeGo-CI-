import { useState } from 'react';
import { Car, Plus, X, Edit, Trash2 } from 'lucide-react';
import './VehiclesPage.css';

const initialVehicles = [
    { id: 1, brand: 'Toyota', model: 'Corolla', year: '2019', plate: 'AB 1234 CI', color: '#3B82F6' },
    { id: 2, brand: 'Hyundai', model: 'Tucson', year: '2021', plate: 'CD 5678 CI', color: '#10B981' },
];

const carBrands = ['Toyota', 'Hyundai', 'Kia', 'Nissan', 'Peugeot', 'Renault', 'Mercedes', 'BMW', 'Honda', 'Suzuki'];

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState(initialVehicles);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ brand: '', model: '', year: '', plate: '' });

    const handleAdd = (e) => {
        e.preventDefault();
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
        setVehicles([...vehicles, { ...form, id: Date.now(), color: colors[Math.floor(Math.random() * colors.length)] }]);
        setForm({ brand: '', model: '', year: '', plate: '' });
        setShowModal(false);
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
                            <div className="vehicle-card-header" style={{ background: `${v.color}15` }}>
                                <Car size={40} color={v.color} />
                            </div>
                            <div className="vehicle-card-body">
                                <h3>{v.brand} {v.model}</h3>
                                <span className="text-gray">{v.year}</span>
                                <div className="vehicle-plate">{v.plate}</div>
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
                                    <select className="select" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} required>
                                        <option value="">Sélectionner…</option>
                                        {carBrands.map(b => <option key={b}>{b}</option>)}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Modèle</label>
                                    <input className="input" placeholder="Ex: Corolla" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} required />
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
