import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Car, ChevronRight, Droplets, Zap } from 'lucide-react';
import './BookingPage.css';

const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
const communes = ['Cocody', 'Marcory', 'Plateau', 'Yopougon', 'Treichville', 'Abobo', 'Adjamé', 'Port-Bouët', 'Koumassi', 'Riviera'];

export default function BookingPage() {
    const [step, setStep] = useState(1);
    const [booking, setBooking] = useState({
        service: '',
        vehicle: '',
        commune: '',
        address: '',
        date: '',
        time: '',
    });
    const navigate = useNavigate();

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
        else navigate('/payment');
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
                    {['Service', 'Localisation', 'Créneau'].map((label, i) => (
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
                    {/* Step 1: Service */}
                    {step === 1 && (
                        <div className="booking-step">
                            <h2>Choisissez votre service</h2>
                            <div className="service-options">
                                <div
                                    className={`card service-option ${booking.service === 'standard' ? 'selected' : ''}`}
                                    onClick={() => setBooking({ ...booking, service: 'standard' })}
                                >
                                    <Droplets size={28} color="var(--orange-500)" />
                                    <h3>Standard</h3>
                                    <p>Huile minérale + filtre neuf</p>
                                    <div className="service-option-price">5 000 FCFA</div>
                                </div>
                                <div
                                    className={`card service-option ${booking.service === 'premium' ? 'selected' : ''}`}
                                    onClick={() => setBooking({ ...booking, service: 'premium' })}
                                >
                                    <div className="service-option-badge">Populaire</div>
                                    <Zap size={28} color="var(--orange-500)" />
                                    <h3>Premium</h3>
                                    <p>Huile synthétique + filtre premium + nettoyage</p>
                                    <div className="service-option-price">6 500 FCFA</div>
                                </div>
                            </div>

                            <div className="input-group" style={{ marginTop: 'var(--space-xl)' }}>
                                <label>Véhicule</label>
                                <select className="select" value={booking.vehicle} onChange={e => setBooking({ ...booking, vehicle: e.target.value })}>
                                    <option value="">Sélectionnez un véhicule</option>
                                    <option value="toyota">Toyota Corolla 2019 — AB 1234 CI</option>
                                    <option value="hyundai">Hyundai Tucson 2021 — CD 5678 CI</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Location */}
                    {step === 2 && (
                        <div className="booking-step">
                            <h2>Où êtes-vous ?</h2>
                            <div className="map-placeholder">
                                <MapPin size={48} color="var(--orange-500)" />
                                <p>Carte interactive (Google Maps / Mapbox)</p>
                                <span className="text-gray">La géolocalisation sera activée en production</span>
                            </div>
                            <div className="input-group">
                                <label>Commune</label>
                                <select className="select" value={booking.commune} onChange={e => setBooking({ ...booking, commune: e.target.value })}>
                                    <option value="">Sélectionnez…</option>
                                    {communes.map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Adresse précise</label>
                                <input className="input" placeholder="Ex: Résidence les Palmiers, Bât. A, Cocody" value={booking.address} onChange={e => setBooking({ ...booking, address: e.target.value })} />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Time Slot */}
                    {step === 3 && (
                        <div className="booking-step">
                            <h2>Choisissez votre créneau</h2>
                            <div className="input-group">
                                <label>Date</label>
                                <input type="date" className="input" value={booking.date} onChange={e => setBooking({ ...booking, date: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--gray-600)', marginBottom: '8px', display: 'block' }}>Heure</label>
                                <div className="time-slots">
                                    {timeSlots.map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            className={`time-slot ${booking.time === t ? 'active' : ''}`}
                                            onClick={() => setBooking({ ...booking, time: t })}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="booking-summary card">
                                <h3>Récapitulatif</h3>
                                <div className="summary-row">
                                    <span>Service</span>
                                    <strong>{booking.service === 'premium' ? 'Premium' : 'Standard'}</strong>
                                </div>
                                <div className="summary-row">
                                    <span>Lieu</span>
                                    <strong>{booking.commune || '—'}, {booking.address || '—'}</strong>
                                </div>
                                <div className="summary-row">
                                    <span>Date & Heure</span>
                                    <strong>{booking.date || '—'} à {booking.time || '—'}</strong>
                                </div>
                                <div className="summary-row summary-total">
                                    <span>Total</span>
                                    <strong>{booking.service === 'premium' ? '6 500' : '5 000'} FCFA</strong>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="booking-actions">
                        {step > 1 && <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>Retour</button>}
                        <button className="btn btn-primary" onClick={handleNext}>
                            {step === 3 ? 'Procéder au paiement' : 'Continuer'} <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
