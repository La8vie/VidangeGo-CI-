# VidangeGo CI - Déploiement Vercel

## 🚀 Architecture Vercel

### Applications
- **Client**: https://vidangego-client.vercel.app
- **Admin**: https://vidangego-admin.vercel.app  
- **API**: https://vidangego-api.vercel.app

### Base de données
- MySQL externe (PlanetScale/Supabase/Aiven)
- Connexion via DATABASE_URL

## 📋 Prérequis

1. **Comptes Vercel**
   - 3 projets (client, admin, api)
   - Domaines personnalisés optionnels

2. **Base de données MySQL**
   - PlanetScale (recommandé)
   - Supabase
   - Aiven
   - Autre MySQL compatible

## 🔧 Configuration

### 1. Base de données
```bash
# Exemple PlanetScale
DATABASE_URL="mysql://xxxx:xxxx@xxxx.us-east-5.psdb.cloud/vidangego"

# Exemple Supabase  
DATABASE_URL="postgresql://xxxx:xxxx@xxxx.supabase.co/postgres"
```

### 2. Variables Vercel
Dans chaque projet Vercel:

**Backend (vidangego-api)**:
- `NODE_ENV`: production
- `PORT`: 5000
- `JWT_SECRET`: votre_clé_secrète_2026
- `DATABASE_URL`: url_de_votre_base_mysql

**Client (vidangego-client)**:
- `VITE_API_URL`: https://vidangego-api.vercel.app

**Admin (vidangego-admin)**:
- `VITE_API_URL`: https://vidangego-api.vercel.app

## 🚀 Déploiement

### 1. Préparer les dépôts
```bash
# Créer 3 dépôts séparés ou utiliser des branches
git clone https://github.com/La8vie/VidangeGo-CI-.git
cd VidangeGo-CI-

# Client
git subtree push --prefix vidangego-client origin client-branch

# Admin  
git subtree push --prefix vidangego-admin origin admin-branch

# Backend
git subtree push --prefix vidangego-backend origin api-branch
```

### 2. Déployer sur Vercel

#### Client
```bash
cd vidangego-client
vercel --prod
```

#### Admin
```bash
cd vidangego-admin
vercel --prod
```

#### Backend
```bash
cd vidangego-backend
# Mettre à jour vercel.json pour utiliser vercel-server.js
cp src/vercel-server.js src/api/index.js
vercel --prod
```

### 3. Configurer les domaines (optionnel)
Dans Vercel Dashboard:
- client.vidangego.ci → vidangego-client.vercel.app
- admin.vidangego.ci → vidangego-admin.vercel.app
- api.vidangego.ci → vidangego-api.vercel.app

## 🔌 WebSocket sur Vercel

Vercel ne supporte pas nativement WebSocket. Solutions:

### Option 1: Pusher (recommandé)
```javascript
// Installer
npm install @pusher/pusher-js

// Client
import Pusher from 'pusher/pusher-js';
const pusher = new Pusher('votre-clé', {
  cluster: 'eu'
});

// Backend
import Pusher from 'pusher';
const pusher = new Pusher({
  appId: 'votre-app-id',
  key: 'votre-clé',
  secret: 'votre-secret',
  cluster: 'eu'
});

// Émettre position
pusher.trigger(`mission_${missionId}`, 'location_update', {
  lat, lng, timestamp
});
```

### Option 2: Ably
```javascript
// Client
import * as Ably from 'ably';
const ably = new Ably.Realtime('votre-clé');

// Backend
import * as Ably from 'ably';
const rest = new Ably.Rest('votre-clé');
rest.channels.get(`mission_${missionId}`).publish('location_update', data);
```

## 📊 Monitoring Vercel

### Logs
- Vercel Dashboard → Functions → Logs
- Erreurs en temps réel
- Performance metrics

### Analytics
- Vercel Analytics
- Web Vitals
- Geolocalisation

## 🔄 CI/CD

### GitHub Integration
```bash
# Connecter dépôts à Vercel
vercel link
vercel --prod

# Auto-déploiement au push
git push origin main
```

### Workflow
1. Push vers GitHub
2. Vercel build automatique
3. Déploiement progressif
4. Tests automatisés

## 🐛 Dépannage Vercel

### Problèmes courants
1. **Timeout Fonctions**: Augmenter `maxDuration` dans vercel.json
2. **CORS**: Vérifier origines dans server.js
3. **BDD**: Vérifier DATABASE_URL
4. **WebSocket**: Utiliser Pusher/Ably

### Solutions
```javascript
// Timeout
"functions": {
  "src/server.js": {
    "maxDuration": 60
  }
}

// CORS
app.use(cors({
  origin: ['https://votredomaine.com'],
  credentials: true
}));
```

## 🎯 Recommandations

1. **PlanetScale** pour MySQL serverless
2. **Pusher** pour WebSocket
3. **Domaines personnalisés** pour branding
4. **Monitoring** Vercel Analytics
5. **Tests** avant déploiement

## 📞 Support

- Documentation Vercel: vercel.com/docs
- PlanetScale: planetscale.com/docs  
- Pusher: pusher.com/docs
- Issues GitHub: github.com/La8vie/VidangeGo-CI-/issues
