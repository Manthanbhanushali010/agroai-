#!/bin/bash

# AgroAI - Proof Images Opener
# Chromion Chainlink Hackathon

echo "🌱 Opening AgroAI Proof Images for Screenshot..."
echo "================================================"

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROOF_DIR="$SCRIPT_DIR/proof-images"

# Check if we're on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📱 Detected macOS - Opening images in default browser..."
    
    # Open each HTML file in the default browser
    echo "1️⃣ Opening Smart Contract Deployment Proof..."
    open "$PROOF_DIR/1-smart-contract-deployment.html"
    sleep 2
    
    echo "2️⃣ Opening Chainlink Integration Proof..."
    open "$PROOF_DIR/2-chainlink-integration.html"
    sleep 2
    
    echo "3️⃣ Opening AI/ML Integration Proof..."
    open "$PROOF_DIR/3-ai-ml-integration.html"
    sleep 2
    
    echo "4️⃣ Opening Frontend Interface Proof..."
    open "$PROOF_DIR/4-frontend-interface.html"
    sleep 2
    
    echo "5️⃣ Opening Backend API Proof..."
    open "$PROOF_DIR/5-backend-api.html"
    sleep 2
    
    echo "6️⃣ Opening Complete System Integration Proof..."
    open "$PROOF_DIR/6-complete-system.html"
    
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🐧 Detected Linux - Opening images in default browser..."
    
    # Try different browser commands
    if command -v xdg-open &> /dev/null; then
        xdg-open "$PROOF_DIR/1-smart-contract-deployment.html"
        sleep 2
        xdg-open "$PROOF_DIR/2-chainlink-integration.html"
        sleep 2
        xdg-open "$PROOF_DIR/3-ai-ml-integration.html"
        sleep 2
        xdg-open "$PROOF_DIR/4-frontend-interface.html"
        sleep 2
        xdg-open "$PROOF_DIR/5-backend-api.html"
        sleep 2
        xdg-open "$PROOF_DIR/6-complete-system.html"
    elif command -v google-chrome &> /dev/null; then
        google-chrome "$PROOF_DIR/1-smart-contract-deployment.html" &
        sleep 2
        google-chrome "$PROOF_DIR/2-chainlink-integration.html" &
        sleep 2
        google-chrome "$PROOF_DIR/3-ai-ml-integration.html" &
        sleep 2
        google-chrome "$PROOF_DIR/4-frontend-interface.html" &
        sleep 2
        google-chrome "$PROOF_DIR/5-backend-api.html" &
        sleep 2
        google-chrome "$PROOF_DIR/6-complete-system.html" &
    else
        echo "❌ No suitable browser found. Please open the HTML files manually:"
        echo "   $PROOF_DIR/"
    fi
else
    echo "❓ Unknown OS. Please open the HTML files manually:"
    echo "   $PROOF_DIR/"
fi

echo ""
echo "✅ All proof images opened!"
echo ""
echo "📸 Screenshot Instructions:"
echo "1. Take screenshots of each opened page"
echo "2. Save them as:"
echo "   - 1-smart-contract-deployment.png"
echo "   - 2-chainlink-integration.png"
echo "   - 3-ai-ml-integration.png"
echo "   - 4-frontend-interface.png"
echo "   - 5-backend-api.png"
echo "   - 6-complete-system.png"
echo ""
echo "🎯 These images will serve as proof of your AgroAI project's:"
echo "   • Smart contract deployment on Ethereum"
echo "   • Chainlink VRF and Functions integration"
echo "   • AI/ML disease detection capabilities"
echo "   • Frontend Web3 integration"
echo "   • Backend API functionality"
echo "   • Complete system architecture"
echo ""
echo "🚀 Ready for hackathon submission!" 