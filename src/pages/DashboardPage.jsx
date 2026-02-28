import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Calendar, Award, MapPin, ChevronRight, Droplets, Clock, Wrench } from 'lucide-react';
import { missionService, vehicleService } from '../services/api';
import TrackingMapPage from './TrackingMapPage';
import './DashboardPage.css';

export default function DashboardPage() {
    const [vehicles, setVehicles] = useState([]);
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('user') || 'null');
        } catch {
            return null;
        }
    }, []);

    useEffect(() => {
        const load = async () => {
            try {
                if (!user?.id) return;
                const [v, m] = await Promise.all([
                    vehicleService.getByOwner(user.id),
                    missionService.getAll(),
                ]);
                setVehicles(Array.isArray(v) ? v : []);
                setMissions(Array.isArray(m) ? m : []);
            } catch (err) {
                console.error('Erreur dashboard:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user?.id]);

    const completedCount = missions.filter(m => m.status === 'COMPLETED').length;
    const totalSpent = missions
        .filter(m => m.status === 'COMPLETED')
        .reduce((acc, m) => acc + (m.totalPrice || 0), 0);

    const points = Math.floor(totalSpent / 100);

    // Missions en cours pour suivi GPS
    const activeMissions = missions.filter(m => m.status === 'IN_PROGRESS' || m.status === 'ASSIGNED');

    return (
        <div className="dashboard-page section">
            <div className="container">
                <div className="dashboard-header animate-fade-up">
                    <div>
                        <h1>Bonjour, {user?.name || 'Utilisateur'} 👋</h1>
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
                            <span className="stat-value">{loading ? '…' : vehicles.length}</span>
                            <span className="stat-label">Véhicules</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}><Droplets size={22} /></div>
                        <div className="stat-info">
                            <span className="stat-value">{loading ? '…' : completedCount}</span>
                            <span className="stat-label">Vidanges effectuées</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}><Award size={22} /></div>
                        <div className="stat-info">
                            <span className="stat-value">{loading ? '…' : points}</span>
                            <span className="stat-label">Points fidélité</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}><Clock size={22} /></div>
                        <div className="stat-info">
                            <span className="stat-value">—</span>
                            <span className="stat-label">Prochaine vidange</span>
                        </div>
                    </div>
                </div>

                {/* Suivi GPS pour missions en cours */}
                {activeMissions.length > 0 && (
                    <div className="dashboard-section animate-fade-up stagger-2">
                        <div className="section-title">
                            <h2>Suivi GPS en temps réel</h2>
                        </div>
                        {activeMissions.map(m => (
                            <div key={m.id} className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <strong>Mission {m.id.slice(0, 8).toUpperCase()}</strong> — {m.status}
                                </div>
                                <TrackingMapPage missionId={m.id} />
                            </div>
                        ))}
                    </div>
                )}

                {/* Vehicles */}
                <div className="dashboard-section animate-fade-up stagger-2">
                    <div className="section-title">
                        <h2>Mes véhicules</h2>
                        <Link to="/vehicles" className="text-orange" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Voir tout</Link>
                    </div>
                    <div className="vehicles-list">
                        {(vehicles.length ? vehicles : []).slice(0, 3).map(v => (
                            <div key={v.id} className="card vehicle-card-dash">
                                <div className="vehicle-dash-left">
                                    <div className="vehicle-icon-dash"><Car size={24} /></div>
                                    <div>
                                        <strong>{v.brand} {v.model}</strong>
                                        <span className="text-gray">{v.licensePlate}</span>
                                    </div>
                                </div>
                                <div className="vehicle-dash-right">
                                    <div>
                                        <span className="text-gray" style={{ fontSize: '0.8rem' }}>Prochaine vidange</span>
                                        <span className="badge badge-blue">À définir</span>
                                    </div>
                                    <Link to="/booking" className="btn btn-primary btn-sm">Réserver</Link>
                                </div>
                            </div>
                        ))}

                        {!loading && vehicles.length === 0 && (
                            <div className="card" style={{ padding: '16px' }}>
                                <p className="text-gray" style={{ margin: 0 }}>Aucun véhicule. Ajoute-en un pour réserver.</p>
                                <div style={{ marginTop: '12px' }}>
                                    <Link to="/vehicles" className="btn btn-primary btn-sm">Ajouter un véhicule</Link>
                                </div>
                            </div>
                        )}
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
                                {missions.slice(0, 10).map(m => (
                                    <tr key={m.id}>
                                        <td>{m.date ? new Date(m.date).toLocaleDateString() : '—'}</td>
                                        <td><strong>{m.vehicle?.licensePlate || '—'}</strong></td>
                                        <td><span className={`badge ${m.serviceType === 'PREMIUM' ? 'badge-orange' : 'badge-blue'}`}>{m.serviceType || '—'}</span></td>
                                        <td>{m.mechanic?.name || '—'}</td>
                                        <td><strong>{(m.totalPrice || 0).toLocaleString()} FCFA</strong></td>
                                        <td><span className={`badge ${m.status === 'COMPLETED' ? 'badge-green' : 'badge-yellow'}`}>{m.status || '—'}</span></td>
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
