import { useState, useEffect } from 'react';
import { MapPin, Send } from 'lucide-react';
import { io } from 'socket.io-client';
import './MechanicTrackingPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function MechanicTrackingPage() {
    const [missionId, setMissionId] = useState('');
    const [lat, setLat] = useState('');
    const [lng, setLng] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io(API_URL);
        setSocket(newSocket);
        return () => newSocket.disconnect();
    }, []);

    const handleSendLocation = async (e) => {
        e.preventDefault();
        if (!missionId || !lat || !lng) {
            setMessage('Veuillez remplir tous les champs');
            return;
        }
        setLoading(true);
        setMessage('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/locations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ missionId, lat: parseFloat(lat), lng: parseFloat(lng) })
            });
            if (!res.ok) throw new Error('Erreur envoi position');
            setMessage('Position envoyée avec succès');
        } catch (err) {
            setMessage(err.message || 'Erreur lors de l\'envoi');
        } finally {
            setLoading(false);
        }
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setMessage('Géolocalisation non supportée');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLat(pos.coords.latitude.toFixed(6));
                setLng(pos.coords.longitude.toFixed(6));
            },
            () => setMessage('Impossible d\'obtenir la position')
        );
    };

    return (
        <div className="mechanic-tracking-page">
            <div className="container">
                <h2>Envoyer ma position GPS</h2>
                <form onSubmit={handleSendLocation} className="tracking-form">
                    <div className="input-group">
                        <label>ID Mission</label>
                        <input
                            className="input"
                            placeholder="VG-xxxx"
                            value={missionId}
                            onChange={e => setMissionId(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-row">
                        <div className="input-group">
                            <label>Latitude</label>
                            <input
                                className="input"
                                placeholder="5.3600"
                                value={lat}
                                onChange={e => setLat(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Longitude</label>
                            <input
                                className="input"
                                placeholder="-4.0083"
                                value={lng}
                                onChange={e => setLng(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <button type="button" className="btn btn-secondary" onClick={getCurrentLocation}>
                        <MapPin size={18} /> Utiliser ma position actuelle
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Envoi...' : <><Send size={18} /> Envoyer la position</>}
                    </button>
                    {message && <p className="message">{message}</p>}
                </form>
            </div>
        </div>
    );
}
