# 🌱 AgroAI - Smart Agriculture Platform

A comprehensive blockchain-powered agriculture platform that combines AI/ML disease detection with decentralized technology for transparent, secure, and rewarding farming practices.

## 🚀 Features

### Core Functionality
- **AI-Powered Disease Detection**: Upload crop photos for instant disease identification
- **Blockchain Integration**: All predictions and data stored on Ethereum blockchain
- **Token Rewards System**: Earn AgroAI tokens for contributing data
- **IPFS Storage**: Decentralized file storage for images and metadata
- **Chainlink Integration**: Reliable data feeds and automation

### Technical Stack
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Flask (Python) with RESTful API
- **Blockchain**: Solidity smart contracts on Ethereum Sepolia
- **AI/ML**: PyTorch, OpenCV, scikit-learn
- **Decentralized Storage**: IPFS
- **Oracle Services**: Chainlink VRF & Functions

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Blockchain    │
│   (Port 3000)   │◄──►│   (Port 5001)   │◄──►│   (Sepolia)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   IPFS Storage  │    │   AI/ML Models  │    │   Chainlink     │
│   (Images)      │    │   (Disease)     │    │   (VRF/Func)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

- Python 3.11+
- Node.js 16+
- MetaMask wallet
- Sepolia testnet ETH
- Chainlink subscription IDs

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd AGROAI_ULTIMATE_MEGA_PACKAGE
```

### 2. Environment Setup
```bash
# Copy environment template
cp env.template .env

# Edit .env with your credentials
nano .env
```

Required environment variables:
```env
# Blockchain
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_private_key
WALLET_ADDRESS=your_wallet_address

# Chainlink
CHAINLINK_FUNCTIONS_SUBSCRIPTION_ID=your_functions_subscription_id
CHAINLINK_VRF_SUBSCRIPTION_ID=your_vrf_subscription_id
CHAINLINK_FUNCTIONS_ROUTER=0x6E2dc0F9DB014aE19888F539E59285D2EA235a9C
CHAINLINK_VRF_COORDINATOR=0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625

# APIs
ETHERSCAN_API_KEY=your_etherscan_api_key
WEATHER_API_KEY=your_weather_api_key
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# Flask
FLASK_SECRET_KEY=your_flask_secret_key
```

### 3. Install Dependencies

#### Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Frontend Dependencies
```bash
cd frontend
# No additional dependencies required (vanilla JS)
```

### 4. Deploy Smart Contracts
```bash
# Install Hardhat dependencies
npm install

# Compile contracts
npx hardhat compile

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia
```

### 5. Update Configuration
After deployment, update contract addresses in:
- `config/backend-config.json`
- `config/frontend-config.json`
- `config/contract-config.json`

### 6. Register with Chainlink
1. Add deployed contract as consumer in Chainlink VRF UI
2. Add deployed contract as consumer in Chainlink Functions UI
3. Fund your subscriptions

## 🚀 Running the Application

### Start Backend
```bash
cd backend
export FLASK_APP=../enhanced_backend_complete.py
flask run --host=0.0.0.0 --port=5001
```

### Start Frontend
```bash
cd frontend
python -m http.server 3000
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Health Check**: http://localhost:5001/api/health

## 📡 API Endpoints

### Core Endpoints
- `GET /api/health` - System health check
- `POST /api/predict` - AI disease prediction
- `POST /api/upload-photo-blockchain` - Upload with blockchain integration
- `GET /api/user-stats` - Get user statistics
- `POST /api/purchase` - Process purchases

### Response Format
```json
{
  "success": true,
  "data": {
    "crop_type": "tomato",
    "is_healthy": false,
    "disease": "early_blight",
    "confidence": 95.2
  },
  "blockchain": {
    "transaction_hash": "0x...",
    "ipfs_hash": "Qm..."
  },
  "rewards": {
    "tokens_earned": 25
  }
}
```

## 🔧 Smart Contracts

### AgroAICore.sol
Main contract handling:
- Photo uploads and predictions
- Token rewards distribution
- User statistics tracking
- Chainlink VRF integration

### AgroAIToken.sol
ERC20 token for:
- Rewarding users for contributions
- Governance participation
- Platform utility

## 🤖 AI/ML Models

The platform uses pre-trained models for:
- **Crop Classification**: Identify crop types
- **Disease Detection**: Detect common plant diseases
- **Health Assessment**: Determine plant health status

Models are loaded dynamically and can be updated without redeployment.

## 🔗 Chainlink Integration

### VRF (Verifiable Random Function)
- Generates random numbers for rewards
- Ensures fair token distribution
- Prevents manipulation

### Functions
- External data fetching
- Weather data integration
- Market price feeds

## 🎁 Tokenomics

### Reward Structure
- **Base Upload**: 5 tokens
- **Disease Detection**: 100 tokens (bonus)
- **High Confidence**: 1-10 tokens (bonus)
- **Healthy Plant**: 20 tokens (bonus)

### Token Utility
- Platform governance
- Premium features access
- Marketplace transactions
- Staking rewards

## 🧪 Testing

### Backend Testing
```bash
cd backend
python -m pytest tests/
```

### Smart Contract Testing
```bash
npx hardhat test
```

### End-to-End Testing
1. Start backend and frontend
2. Upload a crop photo
3. Verify prediction and blockchain transaction
4. Check token rewards

## 📊 Monitoring

### Health Checks
- Backend API status
- Blockchain connectivity
- IPFS availability
- AI model status

### Logs
- Application logs: `agroai.log`
- Blockchain transactions: Etherscan
- IPFS uploads: Pinata dashboard

## 🔒 Security

### Smart Contract Security
- OpenZeppelin contracts
- Reentrancy protection
- Access control
- Pausable functionality

### API Security
- Rate limiting
- Input validation
- CORS configuration
- Error handling

## 🚀 Deployment

### Production Checklist
- [ ] Update environment variables
- [ ] Deploy contracts to mainnet
- [ ] Configure production IPFS
- [ ] Set up monitoring
- [ ] Test all endpoints
- [ ] Update documentation

### Deployment Commands
```bash
# Deploy to mainnet
npx hardhat run scripts/deploy.js --network mainnet

# Update configurations
python scripts/update_configs.py

# Start production servers
./scripts/start_production.sh
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Chainlink for oracle services
- OpenZeppelin for smart contract libraries
- PyTorch for AI/ML capabilities
- IPFS for decentralized storage

## 📞 Support

- **Documentation**: [Wiki](link-to-wiki)
- **Issues**: [GitHub Issues](link-to-issues)
- **Discord**: [Community Server](link-to-discord)
- **Email**: support@agroai.io

---

**Built with ❤️ for the future of agriculture**

