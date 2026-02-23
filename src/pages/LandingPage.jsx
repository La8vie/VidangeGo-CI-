import { Link } from 'react-router-dom';
import {
    MapPin, Clock, Shield, Star, ChevronRight, Wrench,
    Smartphone, CreditCard, CheckCircle, Droplets, Users, Zap
} from 'lucide-react';
import './LandingPage.css';

export default function LandingPage() {
    return (
        <div className="landing">
            {/* ====== HERO ====== */}
            <section className="hero">
                <div className="hero-bg-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                </div>
                <div className="container hero-content">
                    <div className="hero-text animate-fade-up">
                        <span className="badge badge-orange">🚗 N°1 en Côte d'Ivoire</span>
                        <h1>
                            Votre <span className="gradient-text">vidange moteur</span><br />
                            livrée à domicile
                        </h1>
                        <p className="hero-desc">
                            Plus besoin de se déplacer ! Nos mécaniciens certifiés viennent chez vous
                            ou au bureau. Service rapide, professionnel et à partir de seulement
                            <strong> 5 000 FCFA</strong>.
                        </p>
                        <div className="hero-actions">
                            <Link to="/booking" className="btn btn-primary btn-lg">
                                Réserver maintenant <ChevronRight size={18} />
                            </Link>
                            <a href="#how-it-works" className="btn btn-secondary btn-lg">
                                Comment ça marche ?
                            </a>
                        </div>
                        <div className="hero-trust">
                            <div className="trust-item">
                                <Star size={16} fill="#F59E0B" color="#F59E0B" />
                                <span><strong>4.9/5</strong> — 1 200+ avis</span>
                            </div>
                            <div className="trust-item">
                                <Shield size={16} />
                                <span>Garanti 30 jours</span>
                            </div>
                            <div className="trust-item">
                                <Clock size={16} />
                                <span>30 min chrono</span>
                            </div>
                        </div>
                    </div>
                    <div className="hero-visual animate-fade-up stagger-2">
                        <div className="hero-card-stack">
                            <div className="hero-card hc-1">
                                <Droplets size={24} color="var(--orange-500)" />
                                <div>
                                    <strong>Vidange Standard</strong>
                                    <span>5 000 FCFA</span>
                                </div>
                            </div>
                            <div className="hero-card hc-2">
                                <Wrench size={24} color="var(--orange-500)" />
                                <div>
                                    <strong>Vidange Premium</strong>
                                    <span>6 500 - 8 000 FCFA</span>
                                </div>
                            </div>
                            <div className="hero-card hc-3">
                                <CheckCircle size={24} color="var(--success)" />
                                <div>
                                    <strong>Mission terminée ✓</strong>
                                    <span>Cocody, 14h32</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ====== SERVICES ====== */}
            <section className="section" id="services">
                <div className="container">
                    <div className="section-header text-center animate-fade-up">
                        <span className="badge badge-orange">Nos Services</span>
                        <h2>Tout ce dont votre moteur a besoin</h2>
                        <p className="text-gray">Un service complet, transparent et garanti.</p>
                    </div>
                    <div className="services-grid">
                        {[
                            { icon: <Droplets size={28} />, title: 'Vidange Standard', desc: 'Huile minérale haute qualité + filtre à huile neuf. Idéal pour un usage quotidien.', price: '5 000 FCFA' },
                            { icon: <Zap size={28} />, title: 'Vidange Premium', desc: 'Huile synthétique premium + filtre premium + nettoyage moteur.', price: '6 500+ FCFA' },
                            { icon: <Users size={28} />, title: 'Flotte Entreprise', desc: 'Abonnement spécial pour les gestionnaires de flottes. Tarifs dégressifs.', price: 'Sur devis' },
                        ].map((s, i) => (
                            <div key={i} className={`card service-card animate-fade-up stagger-${i + 1}`}>
                                <div className="service-icon">{s.icon}</div>
                                <h3>{s.title}</h3>
                                <p>{s.desc}</p>
                                <div className="service-price">{s.price}</div>
                                <Link to="/booking" className="btn btn-primary btn-sm">Réserver</Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ====== HOW IT WORKS ====== */}
            <section className="section section-dark" id="how-it-works">
                <div className="container">
                    <div className="section-header text-center">
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>Simple & Rapide</span>
                        <h2 style={{ color: 'white' }}>Comment ça marche ?</h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)' }}>3 étapes pour une vidange sans stress</p>
                    </div>
                    <div className="steps-grid">
                        {[
                            { num: '01', icon: <Smartphone size={32} />, title: 'Réservez en ligne', desc: 'Choisissez votre service, votre adresse et votre créneau horaire préféré.' },
                            { num: '02', icon: <MapPin size={32} />, title: 'On vient chez vous', desc: 'Notre mécanicien certifié arrive à l\'heure avec tout le matériel nécessaire.' },
                            { num: '03', icon: <CheckCircle size={32} />, title: 'C\'est fait !', desc: 'Photos avant/après, rapport technique et paiement sécurisé via Mobile Money.' },
                        ].map((step, i) => (
                            <div key={i} className={`step-card card-glass animate-fade-up stagger-${i + 1}`}>
                                <div className="step-num">{step.num}</div>
                                <div className="step-icon">{step.icon}</div>
                                <h3>{step.title}</h3>
                                <p>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ====== PRICING ====== */}
            <section className="section" id="pricing">
                <div className="container">
                    <div className="section-header text-center animate-fade-up">
                        <span className="badge badge-orange">Tarifs transparents</span>
                        <h2>Pas de surprise, tout est clair</h2>
                    </div>
                    <div className="pricing-grid">
                        <div className="card pricing-card animate-fade-up stagger-1">
                            <h3>Standard</h3>
                            <div className="pricing-amount">5 000 <span>FCFA</span></div>
                            <ul>
                                <li><CheckCircle size={16} color="var(--success)" /> Huile minérale 4L</li>
                                <li><CheckCircle size={16} color="var(--success)" /> Filtre à huile neuf</li>
                                <li><CheckCircle size={16} color="var(--success)" /> Vérification 10 points</li>
                                <li><CheckCircle size={16} color="var(--success)" /> Photos avant/après</li>
                                <li><CheckCircle size={16} color="var(--success)" /> Rapport numérique</li>
                            </ul>
                            <Link to="/booking" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Choisir</Link>
                        </div>
                        <div className="card pricing-card pricing-featured animate-fade-up stagger-2">
                            <div className="pricing-popular">Le + populaire</div>
                            <h3>Premium</h3>
                            <div className="pricing-amount">6 500 <span>FCFA</span></div>
                            <ul>
                                <li><CheckCircle size={16} color="var(--success)" /> Huile synthétique 4L</li>
                                <li><CheckCircle size={16} color="var(--success)" /> Filtre premium</li>
                                <li><CheckCircle size={16} color="var(--success)" /> Nettoyage moteur</li>
                                <li><CheckCircle size={16} color="var(--success)" /> Vérification 20 points</li>
                                <li><CheckCircle size={16} color="var(--success)" /> Garantie 60 jours</li>
                                <li><CheckCircle size={16} color="var(--success)" /> Priorité planning</li>
                            </ul>
                            <Link to="/booking" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Choisir</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ====== CTA ====== */}
            <section className="section cta-section">
                <div className="container text-center">
                    <h2 className="animate-fade-up">Prêt à simplifier votre vidange ?</h2>
                    <p className="animate-fade-up stagger-1" style={{ color: 'var(--gray-500)', maxWidth: '500px', margin: '16px auto 32px' }}>
                        Rejoignez les milliers d'Ivoiriens qui font confiance à VidangeGo CI.
                    </p>
                    <Link to="/login" className="btn btn-primary btn-lg animate-fade-up stagger-2">
                        Commencer gratuitement <ChevronRight size={18} />
                    </Link>
                </div>
            </section>

            {/* ====== FOOTER ====== */}
            <footer className="footer">
                <div className="container footer-inner">
                    <div className="footer-brand">
                        <span className="navbar-brand" style={{ fontSize: '1.2rem' }}>
                            <Droplets size={22} color="var(--orange-500)" />
                            VidangeGo <span className="brand-ci">CI</span>
                        </span>
                        <p>Service de vidange à domicile<br />Abidjan, Côte d'Ivoire</p>
                    </div>
                    <div className="footer-links">
                        <div>
                            <h4>Services</h4>
                            <a href="#services">Vidange Standard</a>
                            <a href="#services">Vidange Premium</a>
                            <a href="#services">Flotte Entreprise</a>
                        </div>
                        <div>
                            <h4>Contact</h4>
                            <a href="tel:+2250700000000">+225 07 00 00 00 00</a>
                            <a href="mailto:contact@vidangego.ci">contact@vidangego.ci</a>
                            <a href="#">WhatsApp</a>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>© 2026 VidangeGo CI — Tous droits réservés</p>
                        <div className="footer-payments">
                            <span className="badge badge-orange">Orange Money</span>
                            <span className="badge badge-yellow">MTN MoMo</span>
                            <span className="badge badge-blue">Wave</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
