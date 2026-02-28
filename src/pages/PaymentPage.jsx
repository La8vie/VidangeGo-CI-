import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, CheckCircle, Shield, ArrowRight } from 'lucide-react';
import './PaymentPage.css';

const paymentMethods = [
    { id: 'orange', name: 'Orange Money', color: '#FF6B00', icon: '🟠' },
    { id: 'mtn', name: 'MTN MoMo', color: '#FFCC00', icon: '🟡' },
    { id: 'wave', name: 'Wave', color: '#3B82F6', icon: '🔵' },
    { id: 'moov', name: 'Moov Money', color: '#10B981', icon: '🟢' },
];

export default function PaymentPage() {
    const [method, setMethod] = useState('');
    const [phone, setPhone] = useState('');
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const lastBooking = (() => {
        try {
            return JSON.parse(localStorage.getItem('lastBooking') || 'null');
        } catch {
            return null;
        }
    })();

    const amount = typeof lastBooking?.totalPrice === 'number' ? lastBooking.totalPrice : 0;
    const serviceLabel = lastBooking?.service ? (lastBooking.service === 'premium' ? 'Premium' : 'Standard') : '';
    const locationLabel = lastBooking?.commune ? `${lastBooking.commune}${lastBooking.address ? `, ${lastBooking.address}` : ''}` : '';
    const slotLabel = lastBooking?.date ? `${lastBooking.date}${lastBooking.time ? ` à ${lastBooking.time}` : ''}` : '';

    const handlePay = (e) => {
        e.preventDefault();
        setProcessing(true);
        setTimeout(() => {
            setProcessing(false);
            setSuccess(true);
        }, 2500);
    };

    if (success) {
        return (
            <div className="payment-page section">
                <div className="container">
                    <div className="payment-success animate-fade-up">
                        <div className="success-icon">
                            <CheckCircle size={64} color="var(--success)" />
                        </div>
                        <h1>Paiement confirmé !</h1>
                        <p>Votre vidange est programmée. Un mécanicien sera chez vous à l'heure prévue.</p>
                        <div className="card success-details">
                            <div className="summary-row"><span>Référence</span><strong>#VGO-2026-0842</strong></div>
                            <div className="summary-row"><span>Montant</span><strong>{amount.toLocaleString()} FCFA</strong></div>
                            <div className="summary-row"><span>Moyen de paiement</span><strong>{paymentMethods.find(m => m.id === method)?.name}</strong></div>
                        </div>
                        <p className="text-gray" style={{ fontSize: '0.88rem', margin: '16px 0' }}>
                            📲 Un SMS de confirmation a été envoyé sur votre téléphone.
                        </p>
                        <button className="btn btn-primary btn-lg" onClick={() => navigate('/tracking')}>
                            Suivre ma prestation <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-page section">
            <div className="container">
                <div className="page-header animate-fade-up">
                    <div>
                        <h1>Paiement</h1>
                        <p className="text-gray">Choisissez votre moyen de paiement Mobile Money</p>
                    </div>
                </div>

                <div className="payment-layout animate-fade-up stagger-1">
                    <form className="payment-form" onSubmit={handlePay}>
                        <h2>Mode de paiement</h2>
                        <div className="payment-methods">
                            {paymentMethods.map(pm => (
                                <div
                                    key={pm.id}
                                    className={`card payment-method ${method === pm.id ? 'selected' : ''}`}
                                    onClick={() => setMethod(pm.id)}
                                >
                                    <span className="payment-method-icon">{pm.icon}</span>
                                    <span className="payment-method-name">{pm.name}</span>
                                    <div className={`payment-radio ${method === pm.id ? 'active' : ''}`}></div>
                                </div>
                            ))}
                        </div>

                        {method && (
                            <div className="payment-phone animate-fade-in">
                                <div className="input-group">
                                    <label>Numéro {paymentMethods.find(m => m.id === method)?.name}</label>
                                    <input className="input" type="tel" placeholder="07 XX XX XX XX" value={phone} onChange={e => setPhone(e.target.value)} required />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            style={{ width: '100%', justifyContent: 'center' }}
                            disabled={!method || !phone || processing}
                        >
                            {processing ? (
                                <span className="processing-text">⏳ Traitement en cours…</span>
                            ) : (
                                <>Payer {amount.toLocaleString()} FCFA <ArrowRight size={18} /></>
                            )}
                        </button>

                        <div className="payment-security">
                            <Shield size={16} color="var(--success)" />
                            <span>Paiement sécurisé via CinetPay. Vos données sont chiffrées.</span>
                        </div>
                    </form>

                    <div className="payment-sidebar">
                        <div className="card">
                            <h3>Résumé de commande</h3>
                            <div className="summary-row"><span>Service</span><strong>{serviceLabel || '—'}</strong></div>
                            <div className="summary-row"><span>Lieu</span><strong>{locationLabel || '—'}</strong></div>
                            <div className="summary-row"><span>Créneau</span><strong>{slotLabel || '—'}</strong></div>
                            <div className="summary-row summary-total"><span>Total</span><strong>{amount.toLocaleString()} FCFA</strong></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
