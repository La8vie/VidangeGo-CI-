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
                if (!user?.id) {
                    console.log('Pas d utilisateur ID, redirection vers login');
                    return;
                }
                
                setLoading(true);
                const [v, m] = await Promise.all([
                    vehicleService.getByOwner(user.id).catch(() => []),
                    missionService.getAll().catch(() => []),
                ]);
                setVehicles(Array.isArray(v) ? v : []);
                setMissions(Array.isArray(m) ? m : []);
            } catch (err) {
                console.error('Erreur dashboard:', err);
                // Ne pas planter la page, utiliser des données vides
                setVehicles([]);
                setMissions([]);
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
                {loading ? (
                    <div className="dashboard-loading">
                        <div className="loading-spinner"></div>
                        <p>Chargement de votre tableau de bord...</p>
                    </div>
                ) : (
                    <>
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
                                <div className="stat-icon" style={{ background: 'var(--orange-50)', color: 'var(--orange-500)' }}>
                                    <Car size={22} />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-value">{vehicles.length}</span>
                                    <span className="stat-label">Véhicules</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon" style={{ background: 'var(--green-50)', color: 'var(--green-500)' }}>
                                    <Calendar size={22} />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-value">{completedCount}</span>
                                    <span className="stat-label">Vidanges</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon" style={{ background: 'var(--blue-50)', color: 'var(--blue-500)' }}>
                                    <Award size={22} />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-value">{points}</span>
                                    <span className="stat-label">Points</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon" style={{ background: 'var(--purple-50)', color: 'var(--purple-500)' }}>
                                    <MapPin size={22} />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-value">{activeMissions.length}</span>
                                    <span className="stat-label">En cours</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="quick-actions animate-fade-up stagger-2">
                            <Link to="/booking" className="action-card">
                                <div className="action-icon">
                                    <Clock size={24} color="var(--orange-500)" />
                                </div>
                                <div>
                                    <h3>Réserver une vidange</h3>
                                    <p>Service rapide à domicile</p>
                                </div>
                                <ChevronRight size={20} className="text-gray" />
                            </Link>

                            <Link to="/vehicles" className="action-card">
                                <div className="action-icon">
                                    <Car size={24} color="var(--blue-500)" />
                                </div>
                                <div>
                                    <h3>Ajouter un véhicule</h3>
                                    <p>Gérer votre parc automobile</p>
                                </div>
                                <ChevronRight size={20} className="text-gray" />
                            </Link>

                            <Link to="/tracking" className="action-card">
                                <div className="action-icon">
                                    <MapPin size={24} color="var(--green-500)" />
                                </div>
                                <div>
                                    <h3>Suivre une mission</h3>
                                    <p>Localisation en temps réel</p>
                                </div>
                                <ChevronRight size={20} className="text-gray" />
                            </Link>
                        </div>

                        {/* Active Missions GPS Tracking */}
                        {activeMissions.length > 0 && (
                            <div className="tracking-section animate-fade-up stagger-3">
                                <h2>Suivi GPS des missions en cours</h2>
                                {activeMissions.map(mission => (
                                    <div key={mission.id} className="tracking-card">
                                        <div className="tracking-info">
                                            <h3>Mission #{mission.id}</h3>
                                            <p>Mécanicien: {mission.mechanic?.name || 'En attente'}</p>
                                            <p>Statut: <span className="badge badge-yellow">{mission.status}</span></p>
                                        </div>
                                        <TrackingMapPage missionId={mission.id} />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Recent Missions */}
                        <div className="recent-missions animate-fade-up stagger-4">
                            <div className="section-header">
                                <h2>Missions récentes</h2>
                                <Link to="/missions" className="text-orange">Voir tout</Link>
                            </div>
                            <div className="mission-table-container">
                                <table className="mission-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Véhicule</th>
                                            <th>Type</th>
                                            <th>Mécanicien</th>
                                            <th>Prix</th>
                                            <th>Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {missions.slice(0, 5).map(m => (
                                            <tr key={m.id}>
                                                <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                                                <td>{m.vehicle?.brand} {m.vehicle?.model}</td>
                                                <td>
                                                    <span className="badge badge-blue">
                                                        {m.serviceType === 'OIL_CHANGE' ? 'Vidange' : 'Réparation'}
                                                    </span>
                                                </td>
                                                <td>{m.mechanic?.name || '—'}</td>
                                                <td><strong>{(m.totalPrice || 0).toLocaleString()} FCFA</strong></td>
                                                <td><span className={`badge ${m.status === 'COMPLETED' ? 'badge-green' : 'badge-yellow'}`}>{m.status || '—'}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
