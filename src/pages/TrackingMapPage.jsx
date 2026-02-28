import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { io } from 'socket.io-client';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './TrackingMapPage.css';

// Fix pour les icônes Leaflet avec Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function TrackingMapPage({ missionId }) {
    const [locations, setLocations] = useState([]);
    const [latestLocation, setLatestLocation] = useState(null);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!missionId) return;

        // Charger l'historique des positions
        const fetchLocations = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL}/api/locations/mission/${missionId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setLocations(data);
                    if (data.length > 0) setLatestLocation(data[0]);
                }
            } catch (err) {
                console.error('Erreur chargement positions:', err);
            }
        };
        fetchLocations();

        // WebSocket temps réel
        const newSocket = io(API_URL);
        setSocket(newSocket);
        newSocket.emit('join_mission', missionId);
        newSocket.on('location_update', (location) => {
            setLatestLocation(location);
            setLocations(prev => [location, ...prev]);
        });

        return () => {
            newSocket.emit('leave_mission', missionId);
            newSocket.disconnect();
        };
    }, [missionId]);

    const defaultCenter = latestLocation ? [latestLocation.lat, latestLocation.lng] : [5.3600, -4.0083]; // Abidjan par défaut

    return (
        <div className="tracking-map-page">
            <div className="map-header">
                <h2>Suivi GPS en temps réel</h2>
                <p>Mission {missionId}</p>
            </div>
            <div className="map-container">
                <MapContainer center={defaultCenter} zoom={13} style={{ height: '400px', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {latestLocation && (
                        <Marker position={[latestLocation.lat, latestLocation.lng]}>
                            <Popup>
                                Dernière position: {new Date(latestLocation.timestamp).toLocaleString()}
                            </Popup>
                        </Marker>
                    )}
                    {locations.slice(1).map((loc, idx) => (
                        <Marker key={idx} position={[loc.lat, loc.lng]} />
                    ))}
                </MapContainer>
            </div>
            <div className="location-info">
                {latestLocation ? (
                    <p>
                        <strong>Dernière mise à jour:</strong>{' '}
                        {new Date(latestLocation.timestamp).toLocaleString()}
                    </p>
                ) : (
                    <p>Aucune position reçue pour le moment.</p>
                )}
            </div>
        </div>
    );
}
