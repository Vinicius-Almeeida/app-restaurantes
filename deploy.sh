#!/bin/bash

# TabSync Backend Deployment Script for VPS
# This script handles the deployment of the backend to a VPS using Docker

set -e  # Exit on error

echo "🚀 TabSync Backend Deployment Script"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ Error: .env.production file not found${NC}"
    echo "Please create .env.production from .env.production.example"
    exit 1
fi

# Load environment variables
export $(cat .env.production | grep -v '^#' | xargs)

echo -e "${GREEN}✓ Environment variables loaded${NC}"

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Remove old images (optional - comment out if you want to keep them)
echo "🗑️  Removing old images..."
docker image prune -f

# Build new images
echo "🏗️  Building new Docker images..."
docker-compose build --no-cache

# Run database migrations
echo "📊 Running database migrations..."
docker-compose run --rm backend npx prisma migrate deploy

# Start all services
echo "▶️  Starting all services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check if backend is running
if docker-compose ps | grep -q "backend.*Up"; then
    echo -e "${GREEN}✅ Backend is running!${NC}"
else
    echo -e "${RED}❌ Backend failed to start${NC}"
    docker-compose logs backend
    exit 1
fi

# Show running containers
echo ""
echo "📦 Running containers:"
docker-compose ps

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo "Backend is now running at: http://localhost:4000"
echo ""
echo "Useful commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Stop services: docker-compose down"
echo "  - Restart services: docker-compose restart"
