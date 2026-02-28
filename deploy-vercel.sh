#!/bin/bash

# VidangeGo CI - Vercel Deployment Script
# Ce script déploie les 3 applications sur Vercel

set -e

echo "🚀 Déploiement Vercel de VidangeGo CI..."

# Vérifier Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI n'est pas installée. Installation..."
    npm install -g vercel
fi

# Variables d'environnement
echo "⚙️ Configuration des variables d'environnement..."

# Demander les variables si non définies
if [ -z "$DATABASE_URL" ]; then
    echo "📝 Veuillez entrer votre DATABASE_URL (MySQL):"
    read -s DATABASE_URL
fi

if [ -z "$JWT_SECRET" ]; then
    echo "📝 Veuillez entrer votre JWT_SECRET:"
    read -s JWT_SECRET
fi

# Déployer le client
echo "🌐 Déploiement du client..."
cd vidangego-client
vercel --prod --name vidangego-client
CLIENT_URL=$(vercel ls | grep vidangego-client | awk '{print $2}')
echo "✅ Client déployé: $CLIENT_URL"

# Déployer l'admin
echo "⚙️ Déploiement de l'admin..."
cd ../vidangego-admin
vercel --prod --name vidangego-admin
ADMIN_URL=$(vercel ls | grep vidangego-admin | awk '{print $2}')
echo "✅ Admin déployé: $ADMIN_URL"

# Déployer le backend
echo "🔌 Déploiement du backend..."
cd ../vidangego-backend

# Préparer le build Vercel
mkdir -p api
cp src/vercel-server.js api/index.js

# Configurer les variables d'environnement
vercel env add NODE_ENV production
vercel env add PORT 5000
vercel env add JWT_SECRET "$JWT_SECRET"
vercel env add DATABASE_URL "$DATABASE_URL"

# Déployer
vercel --prod --name vidangego-api
API_URL=$(vercel ls | grep vidangego-api | awk '{print $2}')
echo "✅ API déployée: $API_URL"

# Mettre à jour les URLs dans les clients
echo "🔄 Mise à jour des URLs des clients..."

cd ../vidangego-client
vercel env add VITE_API_URL "$API_URL"
vercel --prod

cd ../vidangego-admin  
vercel env add VITE_API_URL "$API_URL"
vercel --prod

# Nettoyer
cd ../vidangego-backend
rm -rf api

echo ""
echo "🎉 Déploiement Vercel terminé !"
echo ""
echo "📋 URLs de production:"
echo "  🌐 Client: $CLIENT_URL"
echo "  ⚙️  Admin:  $ADMIN_URL"
echo "  🔌 API:    $API_URL"
echo ""
echo "🔧 Prochaines étapes:"
echo "  1. Configurer votre base de données MySQL"
echo "  2. Exécuter les migrations Prisma"
echo "  3. Peupler la base de données (seed)"
echo "  4. Tester les applications"
echo ""
echo "📊 Monitoring: https://vercel.com/dashboard"
echo "📝 Documentation: VERCEL_DEPLOYMENT.md"
