#!/bin/bash

# Quick Setup Script for AgroAI
echo "🚀 Setting up AgroAI for deployment..."

# Make scripts executable
chmod +x deploy_complete.sh

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp env.template .env
    echo "✅ .env file created. Please edit it with your credentials."
    echo ""
    echo "Required values to fill in:"
    echo "  - SEPOLIA_RPC_URL: Your Sepolia RPC endpoint"
    echo "  - PRIVATE_KEY: Your wallet private key (without 0x)"
    echo "  - WALLET_ADDRESS: Your wallet address"
    echo "  - ETHERSCAN_API_KEY: Your Etherscan API key"
    echo "  - WEATHER_API_KEY: Your OpenWeatherMap API key"
    echo ""
    echo "Optional but recommended:"
    echo "  - CHAINLINK_SUBSCRIPTION_ID: For Chainlink Functions"
    echo "  - VRF_SUBSCRIPTION_ID: For Chainlink VRF"
    echo "  - IPFS_PROJECT_ID: For IPFS storage"
    echo ""
    echo "After filling in the values, run: ./deploy_complete.sh"
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "✅ Setup complete! Edit .env file and run ./deploy_complete.sh" 