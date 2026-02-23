import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Car, ChevronRight, Droplets, Zap, Info } from 'lucide-react';
import { missionService, vehicleService } from '../services/api';
import './BookingPage.css';

const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
const communes = ['Cocody', 'Marcory', 'Plateau', 'Yopougon', 'Treichville', 'Abobo', 'Adjamé', 'Port-Bouët', 'Koumassi', 'Riviera', 'Grand Bassam'];

export default function BookingPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [oilSuggestion, setOilSuggestion] = useState(null);
    const [booking, setBooking] = useState({
        service: 'standard',
        vehicleId: '',
        commune: '',
        address: '',
        date: '',
        time: '',
        oilBrand: '',
    });
    const [vehicles, setVehicles] = useState([
        { id: 'v1', brand: 'Toyota', model: 'Corolla', year: 2019, mileage: 45000, licensePlate: 'AB 1234 CI' },
        { id: 'v2', brand: 'Hyundai', model: 'Tucson', year: 2021, mileage: 12000, licensePlate: 'CD 5678 CI' }
    ]);

    const navigate = useNavigate();

    // Calcul du prix dynamique basé sur la commune
    const calculatePrice = (commune) => {
        const specialZones = ['Grand Bassam', 'Koumassi', 'Port-Bouët', 'Marcory'];
        if (!commune) return 5000;
        const isSpecial = specialZones.some(zone =>
            commune.toLowerCase().includes(zone.toLowerCase())
        );
        return isSpecial ? 10000 : 5000;
    };

    const currentPrice = calculatePrice(booking.commune);

    useEffect(() => {
        const loadVehicles = async () => {
            try {
                // Pour la démo, on essaye de récupérer les véhicules du "user-id-demo"
                const data = await vehicleService.getByOwner('user-id-demo');
                if (data.length > 0) setVehicles(data);
            } catch (err) {
                console.error('Erreur chargement véhicules:', err);
                // Utilisation des véhicules par défaut si l'API n'est pas dispo
            }
        };
        loadVehicles();
    }, []);

    useEffect(() => {
        if (booking.vehicleId) {
            const vehicle = vehicles.find(v => v.id === booking.vehicleId || v.id === parseInt(booking.vehicleId));
            if (vehicle) {
                const fetchSuggestion = async () => {
                    try {
                        const suggestion = await missionService.getOilSuggestion(vehicle.id);
                        setOilSuggestion(suggestion);
                    } catch (err) {
                        console.error('Erreur suggestion huile:', err);
                        // Fallback local si l'API échoue
                        const age = new Date().getFullYear() - vehicle.year;
                        if (vehicle.mileage < 50000 || age < 5) {
                            setOilSuggestion({ type: 'Premium', brands: ['Total Quartz 9000', 'Shell Helix Ultra', 'Petro Ivoire Synth'] });
                        } else {
                            setOilSuggestion({ type: 'Standard+', brands: ['Total Quartz 7000', 'Shell Helix HX7', 'Petro Ivoire Semi-Synth'] });
                        }
                    }
                };
                fetchSuggestion();
            }
        }
    }, [booking.vehicleId, vehicles]);

    const handleNext = async () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            try {
                setLoading(true);
                const missionData = {
                    clientId: 'user-id-demo',
                    vehicleId: booking.vehicleId,
                    serviceType: booking.service.toUpperCase(),
                    date: booking.date,
                    time: booking.time,
                    commune: booking.commune,
                    address: booking.address,
                    oilBrand: booking.oilBrand
                };

                await missionService.create(missionData);
                navigate('/payment');
            } catch (err) {
                alert(err.message);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="booking-page section">
            <div className="container">
                <div className="page-header animate-fade-up">
                    <div>
                        <h1>Nouvelle Réservation</h1>
                        <p className="text-gray">Réservez votre vidange en quelques clics</p>
                    </div>
                </div>

                {/* Progress */}
                <div className="booking-progress animate-fade-up stagger-1">
                    {['Détails', 'Lieu', 'Confirmation'].map((label, i) => (
                        <div key={i} className={`progress-step ${step > i + 1 ? 'done' : ''} ${step === i + 1 ? 'active' : ''}`}>
                            <div className="progress-dot">{step > i + 1 ? '✓' : i + 1}</div>
                            <span>{label}</span>
                        </div>
                    ))}
                    <div className="progress-line">
                        <div className="progress-fill" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
                    </div>
                </div>

                <div className="booking-content animate-fade-up stagger-2">
                    {/* Step 1: Details */}
                    {step === 1 && (
                        <div className="booking-step">
                            <h2>Véhicule & Service</h2>

                            <div className="input-group">
                                <label>Votre Véhicule</label>
                                <select className="select" value={booking.vehicleId} onChange={e => setBooking({ ...booking, vehicleId: e.target.value })}>
                                    <option value="">Sélectionnez un véhicule</option>
                                    {vehicles.map(v => (
                                        <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.year}) — {v.licensePlate}</option>
                                    ))}
                                </select>
                            </div>

                            {booking.vehicleId && (
                                <div className="oil-suggestion-box animate-fade-in">
                                    <div className="oil-suggestion-header">
                                        <Info size={18} color="var(--blue-500)" />
                                        <span>Recommandation d'huile</span>
                                    </div>
                                    <p>Pour votre véhicule ({vehicles.find(v => v.id === booking.vehicleId).mileage} km), nous conseillons une huile : <strong>{oilSuggestion?.type}</strong></p>
                                    <div className="input-group" style={{ marginTop: '12px' }}>
                                        <label>Choisissez votre marque préférée</label>
                                        <select className="select" value={booking.oilBrand} onChange={e => setBooking({ ...booking, oilBrand: e.target.value })}>
                                            <option value="">Choisissez une marque...</option>
                                            {oilSuggestion?.brands.map(b => <option key={b} value={b}>{b}</option>)}
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div className="service-options" style={{ marginTop: 'var(--space-lg)' }}>
                                <div
                                    className={`card service-option ${booking.service === 'standard' ? 'selected' : ''}`}
                                    onClick={() => setBooking({ ...booking, service: 'standard' })}
                                >
                                    <Droplets size={28} color="var(--orange-500)" />
                                    <h3>Standard</h3>
                                    <p>Huile minérale + filtre</p>
                                    <div className="service-option-price">5 000 FCFA</div>
                                </div>
                                <div
                                    className={`card service-option ${booking.service === 'premium' ? 'selected' : ''}`}
                                    onClick={() => setBooking({ ...booking, service: 'premium' })}
                                >
                                    <div className="service-option-badge">Conseillé</div>
                                    <Zap size={28} color="var(--orange-500)" />
                                    <h3>Premium</h3>
                                    <p>Huile synthétique + pack complet</p>
                                    <div className="service-option-price">6 500 FCFA</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Location & Time */}
                    {step === 2 && (
                        <div className="booking-step">
                            <h2>Lieu & Date</h2>
                            <div className="grid-2">
                                <div className="input-group">
                                    <label>Commune</label>
                                    <select className="select" value={booking.commune} onChange={e => setBooking({ ...booking, commune: e.target.value })}>
                                        <option value="">Sélectionnez…</option>
                                        {communes.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                    {['Grand Bassam', 'Koumassi', 'Port-Bouët', 'Marcory'].includes(booking.commune) && (
                                        <span className="price-warning">Note: Tarif zone spéciale (10 000 FCFA)</span>
                                    )}
                                </div>
                                <div className="input-group">
                                    <label>Adresse précise</label>
                                    <input className="input" placeholder="Ex: Cité, Bâtiment, Porte..." value={booking.address} onChange={e => setBooking({ ...booking, address: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid-2" style={{ marginTop: '12px' }}>
                                <div className="input-group">
                                    <label>Date</label>
                                    <input type="date" className="input" value={booking.date} onChange={e => setBooking({ ...booking, date: e.target.value })} />
                                </div>
                                <div className="input-group">
                                    <label>Heure</label>
                                    <div className="time-slots-mini">
                                        {timeSlots.map(t => (
                                            <button
                                                key={t}
                                                type="button"
                                                className={`time-slot-btn ${booking.time === t ? 'active' : ''}`}
                                                onClick={() => setBooking({ ...booking, time: t })}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Summary */}
                    {step === 3 && (
                        <div className="booking-step">
                            <h2>Récapitulatif</h2>
                            <div className="booking-summary card">
                                <div className="summary-row">
                                    <span>Véhicule</span>
                                    <strong>{vehicles.find(v => v.id === booking.vehicleId)?.brand} {vehicles.find(v => v.id === booking.vehicleId)?.model}</strong>
                                </div>
                                <div className="summary-row">
                                    <span>Huile choisie</span>
                                    <strong>{booking.oilBrand || 'Non spécifiée'}</strong>
                                </div>
                                <div className="summary-row">
                                    <span>Lieu</span>
                                    <strong>{booking.commune}, {booking.address}</strong>
                                </div>
                                <div className="summary-row">
                                    <span>Date & Heure</span>
                                    <strong>{booking.date} à {booking.time}</strong>
                                </div>
                                <div className="summary-row summary-total">
                                    <span>Total à payer</span>
                                    <strong>{currentPrice.toLocaleString()} FCFA</strong>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="booking-actions">
                        {step > 1 && <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>Retour</button>}
                        <button
                            className="btn btn-primary"
                            onClick={handleNext}
                            disabled={loading || (step === 1 && !booking.vehicleId) || (step === 2 && (!booking.commune || !booking.address || !booking.date || !booking.time))}
                        >
                            {loading ? 'Traitement...' : step === 3 ? 'Confirmer & Payer' : 'Continuer'} <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
