#!/bin/bash

echo "======================================"
echo "Gridcoin Payment Gateway Setup Script"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"
echo ""

# Backend setup
echo "📦 Setting up backend..."
cd backend

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo "✅ Backend dependencies installed"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo ""
    echo "⚠️  No .env file found in backend/"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ .env created - please update with your Razorpay credentials"
fi

cd ..

# Frontend setup
echo ""
echo "📦 Setting up frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo "✅ Frontend dependencies installed"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo ""
    echo "⚠️  No .env file found in frontend/"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ .env created - please update with your Razorpay public key"
fi

cd ..

echo ""
echo "======================================"
echo "✅ Setup Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your Razorpay credentials"
echo "2. Update frontend/.env with your Razorpay public key"
echo "3. Start MongoDB: mongod"
echo "4. Start backend: cd backend && npm run dev"
echo "5. Start frontend: cd frontend && npm start"
echo ""
echo "For detailed instructions, see PAYMENT_INTEGRATION_GUIDE.md"
echo ""
