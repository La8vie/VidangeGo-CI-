#!/bin/bash

# VidangeGo CI Deployment Script
# This script builds and deploys the entire application stack

set -e

echo "🚀 Starting VidangeGo CI deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p logs
mkdir -p backups

# Stop existing containers if they exist
echo "🛑 Stopping existing containers..."
docker-compose down || true

# Build and start the services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for the database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 30

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose exec backend npx prisma migrate deploy || echo "⚠️ Migration failed - might already exist"

# Seed the database
echo "🌱 Seeding the database..."
docker-compose exec backend npm run prisma:seed || echo "⚠️ Seeding failed - might already exist"

# Check if all services are running
echo "🔍 Checking service health..."
sleep 10

# Check backend health
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
fi

# Check client
if curl -f http://localhost > /dev/null 2>&1; then
    echo "✅ Client is running"
else
    echo "❌ Client health check failed"
fi

# Check admin
if curl -f http://localhost:8080 > /dev/null 2>&1; then
    echo "✅ Admin is running"
else
    echo "❌ Admin health check failed"
fi

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "📋 Service URLs:"
echo "  🌐 Client:     http://localhost"
echo "  ⚙️  Admin:      http://localhost:8080"
echo "  🔌 Backend:    http://localhost:5000"
echo "  🗄️  Database:   localhost:3306"
echo ""
echo "🔧 Useful commands:"
echo "  View logs:     docker-compose logs -f"
echo "  Stop all:      docker-compose down"
echo "  Restart:       docker-compose restart"
echo "  Access DB:      docker-compose exec db mysql -u vidangego_user -p vidangego"
echo ""
echo "📝 Default admin credentials:"
echo "  Email:         admin@vidangego.ci"
echo "  Password:      admin123"
