# 🚀 AgroAI Cursor IDE Setup Guide

> **Complete setup guide for developing AgroAI in Cursor IDE with full blockchain integration**

## 📋 Prerequisites

Before opening this project in Cursor IDE, ensure you have:

### Required Software
- ✅ **Node.js 16+** - [Download](https://nodejs.org/)
- ✅ **Python 3.8+** - [Download](https://python.org/)
- ✅ **Git** - [Download](https://git-scm.com/)
- ✅ **MetaMask** - [Install Extension](https://metamask.io/)

### Required Accounts
- ✅ **Infura Account** - [Sign up](https://infura.io/) for Ethereum & IPFS
- ✅ **OpenWeatherMap** - [Get API Key](https://openweathermap.org/api)
- ✅ **Chainlink Functions** - [Create Subscription](https://functions.chain.link/)
- ✅ **Etherscan** - [Get API Key](https://etherscan.io/apis)

## 🎯 Quick Setup (5 Minutes)

### 1. Open in Cursor IDE

```bash
# Clone the repository
git clone https://github.com/agroai/blockchain-platform.git
cd agroai-blockchain-platform

# Open in Cursor IDE
cursor .
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r backend/requirements.txt
```

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your values
# Use Cursor's built-in editor
```

**Required Environment Variables:**
```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
CHAINLINK_SUBSCRIPTION_ID=your_subscription_id
IPFS_PROJECT_ID=your_infura_ipfs_project_id
WEATHER_API_KEY=your_openweather_api_key
```

### 4. Deploy Contracts

```bash
# Compile smart contracts
npm run compile

# Deploy to Sepolia testnet
npm run deploy

# Verify deployment
npm run test-deployment
```

### 5. Start Development

```bash
# Terminal 1: Start backend
cd backend && python app.py

# Terminal 2: Start frontend
cd frontend && python -m http.server 8000

# Terminal 3: Watch for contract changes
npm run compile:watch
```

## 🔧 Cursor IDE Configuration

### Recommended Extensions

Install these extensions in Cursor IDE for optimal development:

```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.flake8",
    "ms-python.black-formatter",
    "nomicfoundation.hardhat-solidity",
    "JuanBlanco.solidity",
    "ms-vscode.vscode-json",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-toolsai.jupyter",
    "ms-vscode.hexeditor",
    "redhat.vscode-yaml"
  ]
}
```

### Workspace Settings

Create `.vscode/settings.json`:

```json
{
  "python.defaultInterpreterPath": "./venv/bin/python",
  "python.linting.enabled": true,
  "python.linting.flake8Enabled": true,
  "python.formatting.provider": "black",
  "solidity.compileUsingRemoteVersion": "v0.8.19+commit.7dd6d404",
  "solidity.defaultCompiler": "remote",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  },
  "files.associations": {
    "*.sol": "solidity"
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  }
}
```

### Launch Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: Flask Backend",
      "type": "python",
      "request": "launch",
      "program": "${workspaceFolder}/backend/app.py",
      "console": "integratedTerminal",
      "env": {
        "FLASK_ENV": "development",
        "FLASK_DEBUG": "1"
      }
    },
    {
      "name": "Hardhat: Deploy Contracts",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/hardhat",
      "args": ["run", "scripts/deploy.js", "--network", "sepolia"],
      "console": "integratedTerminal"
    },
    {
      "name": "Hardhat: Run Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/hardhat",
      "args": ["test"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Tasks Configuration

Create `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Compile Contracts",
      "type": "shell",
      "command": "npm",
      "args": ["run", "compile"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    },
    {
      "label": "Deploy Contracts",
      "type": "shell",
      "command": "npm",
      "args": ["run", "deploy"],
      "group": "build",
      "dependsOn": "Compile Contracts"
    },
    {
      "label": "Start Backend",
      "type": "shell",
      "command": "python",
      "args": ["backend/app.py"],
      "group": "build",
      "isBackground": true
    },
    {
      "label": "Start Frontend",
      "type": "shell",
      "command": "python",
      "args": ["-m", "http.server", "8000"],
      "options": {
        "cwd": "${workspaceFolder}/frontend"
      },
      "group": "build",
      "isBackground": true
    }
  ]
}
```

## 🎨 AI Assistant Configuration

### Cursor AI Prompts

Use these prompts with Cursor's AI assistant:

#### Smart Contract Development
```
You are a Solidity expert working on AgroAI, a blockchain agricultural platform. 
Focus on:
- Gas optimization
- Security best practices
- Chainlink integration
- OpenZeppelin standards
- Agricultural use cases
```

#### Python Backend Development
```
You are a Python/Flask expert working on AgroAI backend.
Focus on:
- Web3 integration
- IPFS file handling
- AI/ML model integration
- RESTful API design
- Blockchain transaction handling
```

#### Frontend Development
```
You are a JavaScript/Web3 expert working on AgroAI frontend.
Focus on:
- MetaMask integration
- Web3.js/Ethers.js
- Responsive design
- User experience
- Blockchain interaction patterns
```

### Custom AI Rules

Create `.cursor-rules`:

```
# AgroAI Development Rules

## Code Style
- Use TypeScript for new JavaScript files
- Follow PEP 8 for Python code
- Use Prettier for formatting
- Add comprehensive comments for complex logic

## Blockchain Development
- Always check for reentrancy vulnerabilities
- Use OpenZeppelin contracts when possible
- Add proper error handling for Web3 calls
- Test all contract interactions thoroughly

## Security
- Never commit private keys or secrets
- Validate all user inputs
- Use rate limiting for API endpoints
- Implement proper access controls

## Testing
- Write tests for all smart contract functions
- Test blockchain integration thoroughly
- Mock external API calls in tests
- Aim for >90% code coverage

## Documentation
- Document all public functions
- Include usage examples
- Keep README updated
- Add inline comments for complex logic
```

## 📁 Project Structure Overview

```
agroai-blockchain-platform/
├── 📁 contracts/              # Smart contracts
│   ├── 📄 AgroAIToken.sol    # ERC-20 token with rewards
│   └── 📄 AgroAICore.sol     # Main contract with Chainlink
├── 📁 scripts/               # Deployment & utility scripts
├── 📁 chainlink-functions/   # Chainlink Functions code
├── 📁 backend/               # Flask backend
│   ├── 📁 blockchain/        # Web3 integration
│   ├── 📁 routes/           # API endpoints
│   ├── 📁 models/           # AI/ML models
│   └── 📁 utils/            # Utility functions
├── 📁 frontend/              # Web interface
│   ├── 📁 static/           # CSS, JS, images
│   └── 📁 templates/        # HTML templates
├── 📁 config/               # Configuration files
├── 📁 tests/                # Test suites
├── 📁 docs/                 # Documentation
├── 📄 package.json          # Node.js dependencies
├── 📄 hardhat.config.js     # Hardhat configuration
├── 📄 .env.example          # Environment variables template
└── 📄 README.md             # Project documentation
```

## 🔍 Development Workflow

### 1. Smart Contract Development

```bash
# Edit contracts in contracts/
# Compile and test
npm run compile
npm run test

# Deploy to testnet
npm run deploy

# Verify on Etherscan
npm run verify
```

### 2. Backend Development

```bash
# Edit Python files in backend/
# Start development server
cd backend && python app.py

# Run tests
pytest tests/ -v

# Format code
black . && isort .
```

### 3. Frontend Development

```bash
# Edit files in frontend/
# Start development server
cd frontend && python -m http.server 8000

# Test Web3 integration
# Open browser console for debugging
```

### 4. Chainlink Functions

```bash
# Edit functions in chainlink-functions/
# Deploy via Chainlink Functions UI
# Test with sample data
```

## 🧪 Testing Guide

### Smart Contract Tests

```bash
# Run all tests
npm run test

# Run specific test file
npx hardhat test tests/AgroAIToken.test.js

# Run with gas reporting
npm run gas-report

# Run with coverage
npm run coverage
```

### Backend Tests

```bash
# Run Python tests
cd backend && pytest tests/ -v

# Run with coverage
pytest tests/ --cov=. --cov-report=html

# Test specific module
pytest tests/test_blockchain.py -v
```

### Integration Tests

```bash
# Test complete user flow
npm run test-deployment

# Test Web3 integration
python backend/tests/test_web3_integration.py

# Test AI model integration
python backend/tests/test_ai_model.py
```

## 🐛 Debugging

### Smart Contract Debugging

```javascript
// Use console.log in Hardhat tests
console.log("Token balance:", await token.balanceOf(user.address));

// Use Hardhat network forking
npx hardhat node --fork https://sepolia.infura.io/v3/YOUR_KEY

// Debug transactions
npx hardhat run scripts/debug.js --network localhost
```

### Backend Debugging

```python
# Use Python debugger
import pdb; pdb.set_trace()

# Use logging
import logging
logging.basicConfig(level=logging.DEBUG)

# Debug Web3 calls
web3.middleware_onion.add(web3.middleware.latest_block_based_cache_middleware)
```

### Frontend Debugging

```javascript
// Use browser console
console.log("Web3 provider:", window.ethereum);

// Debug MetaMask connection
window.ethereum.on('accountsChanged', console.log);

// Debug contract calls
const result = await contract.methods.getUserStats(address).call();
console.log("User stats:", result);
```

## 🚀 Deployment

### Local Development

```bash
# Start local Hardhat network
npx hardhat node

# Deploy to local network
npm run deploy:local

# Start backend and frontend
npm run dev
```

### Testnet Deployment

```bash
# Deploy to Sepolia
npm run deploy

# Update frontend config
# Test complete flow
npm run test-deployment
```

### Production Deployment

```bash
# Set production environment
export NODE_ENV=production

# Deploy with production settings
npm run deploy:production

# Start production servers
npm run start:production
```

## 📊 Monitoring & Analytics

### Contract Monitoring

```bash
# Monitor contract events
npx hardhat run scripts/monitor-events.js --network sepolia

# Check contract state
npx hardhat run scripts/check-state.js --network sepolia

# Gas usage analysis
npm run gas-report
```

### Backend Monitoring

```python
# Health check endpoint
curl http://localhost:5000/health

# Blockchain status
curl http://localhost:5000/api/blockchain-status

# User statistics
curl http://localhost:5000/api/user-stats/0x123...
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Contract Deployment Fails
```bash
# Check network configuration
npx hardhat run scripts/check-network.js

# Verify account balance
npx hardhat run scripts/check-balance.js

# Check gas price
npx hardhat run scripts/check-gas.js
```

#### 2. Web3 Connection Issues
```python
# Test Web3 connection
python backend/scripts/test_web3.py

# Check RPC endpoint
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  $SEPOLIA_RPC_URL
```

#### 3. IPFS Upload Fails
```python
# Test IPFS connection
python backend/scripts/test_ipfs.py

# Check Infura IPFS credentials
curl -u "$IPFS_PROJECT_ID:$IPFS_PROJECT_SECRET" \
  "https://ipfs.infura.io:5001/api/v0/version"
```

### Error Solutions

| Error | Solution |
|-------|----------|
| `insufficient funds` | Add testnet ETH to deployer account |
| `nonce too low` | Reset MetaMask account or wait |
| `contract not deployed` | Run deployment script first |
| `IPFS timeout` | Check network connection and credentials |
| `Chainlink subscription` | Fund subscription with LINK tokens |

## 📚 Additional Resources

### Documentation
- 📖 [Hardhat Docs](https://hardhat.org/docs)
- 📖 [Chainlink Docs](https://docs.chain.link/)
- 📖 [OpenZeppelin Docs](https://docs.openzeppelin.com/)
- 📖 [Web3.py Docs](https://web3py.readthedocs.io/)

### Tutorials
- 🎥 [Chainlink Functions Tutorial](https://www.youtube.com/watch?v=...)
- 🎥 [Hardhat Development](https://www.youtube.com/watch?v=...)
- 🎥 [Web3 Frontend Integration](https://www.youtube.com/watch?v=...)

### Community
- 💬 [Chainlink Discord](https://discord.gg/chainlink)
- 💬 [Hardhat Discord](https://discord.gg/hardhat)
- 💬 [AgroAI Community](https://discord.gg/agroai)

## ✅ Checklist

Before starting development, ensure:

- [ ] All prerequisites installed
- [ ] Environment variables configured
- [ ] Contracts compiled successfully
- [ ] Tests passing
- [ ] Backend server running
- [ ] Frontend accessible
- [ ] MetaMask connected to Sepolia
- [ ] Test tokens available

## 🎯 Next Steps

1. **Explore the codebase** - Start with `README.md` and `contracts/`
2. **Run the tests** - Understand how everything works
3. **Deploy locally** - Test the complete flow
4. **Make changes** - Start with small modifications
5. **Deploy to testnet** - Test with real blockchain
6. **Submit to hackathon** - Show off your work!

---

**Happy coding! 🚀**

*Built with ❤️ for the Chainlink Hackathon 2024*

