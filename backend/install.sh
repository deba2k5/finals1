#!/bin/bash

echo "🚀 Setting up GeoGrow Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created. Please edit it with your API keys."
else
    echo "✅ .env file already exists"
fi

# Create uploads directory
if [ ! -d uploads ]; then
    echo "📁 Creating uploads directory..."
    mkdir uploads
    echo "✅ Uploads directory created"
else
    echo "✅ Uploads directory already exists"
fi

# Create logs directory
if [ ! -d logs ]; then
    echo "📁 Creating logs directory..."
    mkdir logs
    echo "✅ Logs directory created"
else
    echo "✅ Logs directory already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your API keys"
echo "2. Run 'npm run dev' to start development server"
echo "3. Run 'npm run build' to build for production"
echo ""
echo "API will be available at: http://localhost:3001"
echo "Health check: http://localhost:3001/health" 