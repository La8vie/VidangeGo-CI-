import { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, CheckCircle, Star, Camera } from 'lucide-react';
import './TrackingPage.css';

const trackingSteps = [
    { id: 1, label: 'Commande confirmée', time: '09:45', done: true },
    { id: 2, label: 'Mécanicien en route', time: '10:02', done: true },
    { id: 3, label: 'Arrivé sur place', time: '10:28', done: true },
    { id: 4, label: 'Vidange en cours…', time: '10:35', done: false, active: true },
    { id: 5, label: 'Vidange terminée', time: '', done: false },
];

export default function TrackingPage() {
    const [rating, setRating] = useState(0);

    return (
        <div className="tracking-page section">
            <div className="container">
                <div className="page-header animate-fade-up">
                    <div>
                        <h1>Suivi de Mission</h1>
                        <p className="text-gray">Commande #VGO-2026-0842</p>
                    </div>
                    <span className="badge badge-orange" style={{ fontSize: '0.9rem', padding: '6px 16px' }}>🔴 En cours</span>
                </div>

                <div className="tracking-layout animate-fade-up stagger-1">
                    {/* Main Content */}
                    <div className="tracking-main">
                        {/* Map Placeholder */}
                        <div className="card tracking-map">
                            <div className="map-placeholder" style={{ border: 'none', margin: 0, padding: '40px' }}>
                                <MapPin size={48} color="var(--orange-500)" />
                                <p>Suivi en temps réel</p>
                                <span className="text-gray">Le mécanicien est sur place – Cocody, Riviera 3</span>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="card tracking-timeline">
                            <h3>Progression</h3>
                            <div className="timeline">
                                {trackingSteps.map((s, i) => (
                                    <div key={s.id} className={`timeline-item ${s.done ? 'done' : ''} ${s.active ? 'active' : ''}`}>
                                        <div className="timeline-dot">
                                            {s.done ? <CheckCircle size={18} /> : s.active ? <Clock size={18} /> : <div className="dot-empty"></div>}
                                        </div>
                                        <div className="timeline-content">
                                            <strong>{s.label}</strong>
                                            {s.time && <span className="text-gray">{s.time}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Photos */}
                        <div className="card tracking-photos">
                            <h3>📸 Photos de la prestation</h3>
                            <div className="photos-grid">
                                <div className="photo-placeholder">
                                    <Camera size={24} color="var(--gray-400)" />
                                    <span>Avant</span>
                                </div>
                                <div className="photo-placeholder">
                                    <Camera size={24} color="var(--gray-400)" />
                                    <span>Après</span>
                                </div>
                            </div>
                            <p className="text-gray" style={{ fontSize: '0.82rem', marginTop: '12px' }}>
                                Les photos seront ajoutées par le mécanicien en fin de prestation.
                            </p>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="tracking-sidebar">
                        <div className="card mechanic-card">
                            <h3>Votre mécanicien</h3>
                            <div className="mechanic-info">
                                <div className="mechanic-avatar">KJ</div>
                                <div>
                                    <strong>Kouadio Jean</strong>
                                    <div className="mechanic-rating">
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />)}
                                        <span>4.9</span>
                                    </div>
                                </div>
                            </div>
                            <a href="tel:+2250700000000" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}>
                                <Phone size={16} /> Appeler
                            </a>
                        </div>

                        <div className="card">
                            <h3>Détails de la commande</h3>
                            <div className="summary-row"><span>Service</span><strong>Premium</strong></div>
                            <div className="summary-row"><span>Véhicule</span><strong>Toyota Corolla</strong></div>
                            <div className="summary-row"><span>Lieu</span><strong>Cocody, Riviera 3</strong></div>
                            <div className="summary-row"><span>Créneau</span><strong>25 Fév, 10:00</strong></div>
                            <div className="summary-row summary-total"><span>Montant</span><strong>6 500 FCFA</strong></div>
                        </div>

                        <div className="card rating-card">
                            <h3>Évaluer la prestation</h3>
                            <div className="rating-stars">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star
                                        key={i}
                                        size={32}
                                        fill={rating >= i ? '#F59E0B' : 'none'}
                                        color={rating >= i ? '#F59E0B' : 'var(--gray-300)'}
                                        onClick={() => setRating(i)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                ))}
                            </div>
                            <p className="text-gray" style={{ fontSize: '0.82rem' }}>Disponible après la prestation</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
