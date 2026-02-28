# VidangeGo CI - Guide de Déploiement

## 🚀 Déploiement Rapide avec Docker

### Prérequis
- Docker et Docker Compose installés
- Git

### Étapes de déploiement

1. **Cloner le projet**
```bash
git clone https://github.com/La8vie/VidangeGo-CI-.git
cd VidangeGo-CI-
```

2. **Lancer le déploiement**
```bash
# Sur Linux/macOS
chmod +x deploy.sh
./deploy.sh

# Sur Windows
bash deploy.sh
```

3. **Accéder aux applications**
- 🌐 Client: http://localhost
- ⚙️ Admin: http://localhost:8080
- 🔌 API: http://localhost:5000

### Comptes par défaut
- **Admin**: admin@vidangego.ci / admin123

## 📋 Architecture

### Services Docker
- **db**: MySQL 8.0 (port 3306)
- **backend**: API Node.js (port 5000)
- **client**: Application client Vite (port 80)
- **admin**: Interface admin Vite (port 8080)

### Volumes
- `mysql_data`: Persistance des données MySQL

## 🔧 Configuration

### Variables d'environnement
Les variables sont configurées dans `docker-compose.yml`:
- `DATABASE_URL`: Connexion à la base MySQL
- `JWT_SECRET`: Clé secrète pour les tokens
- `NODE_ENV`: Mode production

### Base de données
- Automatiquement créée et initialisée
- Migrations Prisma appliquées au démarrage
- Données de seed incluses

## 🛠️ Commandes Utiles

```bash
# Voir les logs
docker-compose logs -f

# Redémarrer un service
docker-compose restart backend

# Arrêter tout
docker-compose down

# Accéder à la base de données
docker-compose exec db mysql -u vidangego_user -p vidangego

# Mettre à jour l'application
git pull
docker-compose up --build -d
```

## 🔍 Monitoring

### Health Checks
- Backend: `/api/health`
- Client: Nginx status
- Admin: Nginx status

### Logs
- Application: `docker-compose logs backend`
- Database: `docker-compose logs db`
- Client/Admin: `docker-compose logs client`

## 🌐 Fonctionnalités Déployées

### Client
- Auto-complétion marques/modèles marché CI
- Exclusion véhicules électriques (champ motorisation)
- Suivi GPS temps réel (WebSocket)
- Réservation de missions
- Paiement en ligne

### Admin
- Tableau de bord avec statistiques
- Gestion des missions
- Suivi GPS des mécaniciens
- Gestion des stocks
- Utilisateurs et véhicules

### Backend
- API RESTful
- WebSocket pour GPS
- Authentification JWT
- Base MySQL avec Prisma
- Validation des données

## 🔒 Sécurité

- Headers de sécurité Nginx
- CORS configuré
- Tokens JWT
- Mots de passe hashés
- Isolation réseau Docker

## 📈 Performance

- Gzip compression
- Cache static assets
- Build optimisé
- Health checks
- Restart automatique

## 🐛 Dépannage

### Problèmes courants
1. **Port déjà utilisé**: Modifier les ports dans `docker-compose.yml`
2. **Base de données inaccessible**: Vérifier le conteneur `db`
3. **Backend ne démarre pas**: Vérifier les logs et les variables d'environnement

### Support
- Créer une issue sur GitHub
- Consulter les logs Docker
- Vérifier la configuration réseau
