#!/bin/bash

# Dentalization Backend Setup Script
echo "🚀 Setting up Dentalization Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL."
    exit 1
fi

# Navigate to backend directory
cd backend-api

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  Please edit the .env file with your actual database URL and secrets"
    echo "   Database URL format: postgresql://username:password@localhost:5432/dentalization_db"
else
    echo "✅ .env file already exists"
fi

# Check if database URL is set
if grep -q "postgresql://username:password@localhost:5432/dentalization_db" .env; then
    echo "⚠️  Please update the DATABASE_URL in .env with your actual database credentials"
fi

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npm run db:generate

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p uploads/photos
mkdir -p uploads/documents
mkdir -p uploads/profiles

# Display next steps
echo ""
echo "✅ Backend setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update the DATABASE_URL in .env with your PostgreSQL credentials"
echo "2. Create the database: createdb dentalization_db"
echo "3. Run database migrations: npm run db:migrate"
echo "4. Seed the database: npm run db:seed"
echo "5. Start the development server: npm run dev"
echo "6. Open Prisma Studio: npm run db:studio"
echo ""
echo "🔗 Useful commands:"
echo "   npm run dev          - Start development server"
echo "   npm run db:studio    - Open Prisma Studio (database GUI)"
echo "   npm run db:migrate   - Run database migrations"
echo "   npm run db:seed      - Seed database with sample data"
echo "   npm test             - Run tests"
echo ""
echo "🌐 API will be available at: http://localhost:3001"
echo "📊 Health check: http://localhost:3001/health"
