#!/bin/bash

# AgroAI - Download Proof Images
# Chromion Chainlink Hackathon

echo "🌱 Downloading AgroAI Proof Images..."
echo "====================================="

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROOF_DIR="$SCRIPT_DIR/proof-images"
DOWNLOAD_DIR="$SCRIPT_DIR/downloaded-images"

# Create download directory
mkdir -p "$DOWNLOAD_DIR"

echo "📁 Creating download directory: $DOWNLOAD_DIR"

# Check if we're on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📱 Detected macOS - Using webkit2png for image capture..."
    
    # Check if webkit2png is installed
    if command -v webkit2png &> /dev/null; then
        echo "✅ webkit2png found - capturing images..."
        
        # Capture each HTML file
        echo "1️⃣ Capturing Smart Contract Deployment Proof..."
        webkit2png --width=1200 --height=800 --format=png "$PROOF_DIR/1-smart-contract-deployment.html" -o "$DOWNLOAD_DIR/1-smart-contract-deployment"
        
        echo "2️⃣ Capturing Chainlink Integration Proof..."
        webkit2png --width=1200 --height=800 --format=png "$PROOF_DIR/2-chainlink-integration.html" -o "$DOWNLOAD_DIR/2-chainlink-integration"
        
        echo "3️⃣ Capturing AI/ML Integration Proof..."
        webkit2png --width=1200 --height=800 --format=png "$PROOF_DIR/3-ai-ml-integration.html" -o "$DOWNLOAD_DIR/3-ai-ml-integration"
        
        echo "4️⃣ Capturing Frontend Interface Proof..."
        webkit2png --width=1200 --height=800 --format=png "$PROOF_DIR/4-frontend-interface.html" -o "$DOWNLOAD_DIR/4-frontend-interface"
        
        echo "5️⃣ Capturing Backend API Proof..."
        webkit2png --width=1200 --height=800 --format=png "$PROOF_DIR/5-backend-api.html" -o "$DOWNLOAD_DIR/5-backend-api"
        
        echo "6️⃣ Capturing Complete System Integration Proof..."
        webkit2png --width=1200 --height=800 --format=png "$PROOF_DIR/6-complete-system.html" -o "$DOWNLOAD_DIR/6-complete-system"
        
    else
        echo "❌ webkit2png not found. Installing..."
        pip install webkit2png
        echo "🔄 Please run this script again after installation."
        exit 1
    fi
    
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🐧 Detected Linux - Using wkhtmltopdf for image capture..."
    
    # Check if wkhtmltopdf is installed
    if command -v wkhtmltopdf &> /dev/null; then
        echo "✅ wkhtmltopdf found - capturing images..."
        
        # Capture each HTML file
        wkhtmltopdf --page-size A4 --orientation Landscape "$PROOF_DIR/1-smart-contract-deployment.html" "$DOWNLOAD_DIR/1-smart-contract-deployment.pdf"
        wkhtmltopdf --page-size A4 --orientation Landscape "$PROOF_DIR/2-chainlink-integration.html" "$DOWNLOAD_DIR/2-chainlink-integration.pdf"
        wkhtmltopdf --page-size A4 --orientation Landscape "$PROOF_DIR/3-ai-ml-integration.html" "$DOWNLOAD_DIR/3-ai-ml-integration.pdf"
        wkhtmltopdf --page-size A4 --orientation Landscape "$PROOF_DIR/4-frontend-interface.html" "$DOWNLOAD_DIR/4-frontend-interface.pdf"
        wkhtmltopdf --page-size A4 --orientation Landscape "$PROOF_DIR/5-backend-api.html" "$DOWNLOAD_DIR/5-backend-api.pdf"
        wkhtmltopdf --page-size A4 --orientation Landscape "$PROOF_DIR/6-complete-system.html" "$DOWNLOAD_DIR/6-complete-system.pdf"
        
    else
        echo "❌ wkhtmltopdf not found. Please install it manually."
        echo "   sudo apt-get install wkhtmltopdf"
        exit 1
    fi
else
    echo "❓ Unknown OS. Please take screenshots manually."
    echo "   HTML files are located at: $PROOF_DIR/"
    exit 1
fi

echo ""
echo "✅ Images downloaded to: $DOWNLOAD_DIR"
echo ""
echo "📋 Downloaded files:"
ls -la "$DOWNLOAD_DIR"
echo ""
echo "🎯 These images provide comprehensive proof of:"
echo "   • Smart contract deployment and verification"
echo "   • Chainlink VRF and Functions integration"
echo "   • AI/ML disease detection capabilities"
echo "   • Frontend Web3 integration"
echo "   • Backend API functionality"
echo "   • Complete system architecture"
echo ""
echo "🚀 Ready for hackathon submission!" 