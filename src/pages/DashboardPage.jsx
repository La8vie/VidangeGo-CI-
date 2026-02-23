import { Link } from 'react-router-dom';
import { Car, Calendar, Award, MapPin, ChevronRight, Droplets, Clock, Wrench } from 'lucide-react';
import './DashboardPage.css';

const mockVehicles = [
    { id: 1, brand: 'Toyota', model: 'Corolla 2019', plate: 'AB 1234 CI', lastService: '15 Jan 2026', nextService: '15 Avr 2026', status: 'ok' },
    { id: 2, brand: 'Hyundai', model: 'Tucson 2021', plate: 'CD 5678 CI', lastService: '20 Déc 2025', nextService: '20 Mar 2026', status: 'soon' },
];

const mockHistory = [
    { id: 1, date: '15 Jan 2026', vehicle: 'Toyota Corolla', type: 'Premium', mechanic: 'Kouadio Jean', amount: '6 500 FCFA', status: 'completed' },
    { id: 2, date: '20 Déc 2025', vehicle: 'Hyundai Tucson', type: 'Standard', mechanic: 'Traoré Ali', amount: '5 000 FCFA', status: 'completed' },
    { id: 3, date: '10 Nov 2025', vehicle: 'Toyota Corolla', type: 'Standard', mechanic: 'Kouamé Paul', amount: '5 000 FCFA', status: 'completed' },
];

export default function DashboardPage() {
    return (
        <div className="dashboard-page section">
            <div className="container">
                <div className="dashboard-header animate-fade-up">
                    <div>
                        <h1>Bonjour, Amani 👋</h1>
                        <p className="text-gray">Bienvenue sur votre espace VidangeGo CI</p>
                    </div>
                    <Link to="/booking" className="btn btn-primary">
                        Nouvelle réservation <ChevronRight size={18} />
                    </Link>
                </div>

                {/* Stats */}
                <div className="stats-grid animate-fade-up stagger-1">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'var(--orange-50)', color: 'var(--orange-500)' }}><Car size={22} /></div>
                        <div className="stat-info">
                            <span className="stat-value">2</span>
                            <span className="stat-label">Véhicules</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}><Droplets size={22} /></div>
                        <div className="stat-info">
                            <span className="stat-value">5</span>
                            <span className="stat-label">Vidanges effectuées</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}><Award size={22} /></div>
                        <div className="stat-info">
                            <span className="stat-value">250</span>
                            <span className="stat-label">Points fidélité</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}><Clock size={22} /></div>
                        <div className="stat-info">
                            <span className="stat-value">28 j</span>
                            <span className="stat-label">Prochaine vidange</span>
                        </div>
                    </div>
                </div>

                {/* Vehicles */}
                <div className="dashboard-section animate-fade-up stagger-2">
                    <div className="section-title">
                        <h2>Mes véhicules</h2>
                        <Link to="/vehicles" className="text-orange" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Voir tout</Link>
                    </div>
                    <div className="vehicles-list">
                        {mockVehicles.map(v => (
                            <div key={v.id} className="card vehicle-card-dash">
                                <div className="vehicle-dash-left">
                                    <div className="vehicle-icon-dash"><Car size={24} /></div>
                                    <div>
                                        <strong>{v.brand} {v.model}</strong>
                                        <span className="text-gray">{v.plate}</span>
                                    </div>
                                </div>
                                <div className="vehicle-dash-right">
                                    <div>
                                        <span className="text-gray" style={{ fontSize: '0.8rem' }}>Prochaine vidange</span>
                                        <span className={`badge ${v.status === 'ok' ? 'badge-green' : 'badge-yellow'}`}>
                                            {v.nextService}
                                        </span>
                                    </div>
                                    <Link to="/booking" className="btn btn-primary btn-sm">Réserver</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* History */}
                <div className="dashboard-section animate-fade-up stagger-3">
                    <div className="section-title">
                        <h2>Historique</h2>
                    </div>
                    <div className="history-table-wrapper">
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Véhicule</th>
                                    <th>Type</th>
                                    <th>Mécanicien</th>
                                    <th>Montant</th>
                                    <th>Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockHistory.map(h => (
                                    <tr key={h.id}>
                                        <td>{h.date}</td>
                                        <td><strong>{h.vehicle}</strong></td>
                                        <td><span className={`badge ${h.type === 'Premium' ? 'badge-orange' : 'badge-blue'}`}>{h.type}</span></td>
                                        <td>{h.mechanic}</td>
                                        <td><strong>{h.amount}</strong></td>
                                        <td><span className="badge badge-green">Terminée</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
