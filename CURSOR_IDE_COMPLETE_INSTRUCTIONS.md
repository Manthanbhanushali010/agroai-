# 🚀 Complete Cursor IDE Instructions & File Sequence

> **Step-by-step guide to build your winning AgroAI hackathon project in Cursor IDE**

## 📋 **INITIAL SETUP (5 minutes)**

### 1. Create New Project
```bash
# Create project directory
mkdir agroai-blockchain-platform
cd agroai-blockchain-platform

# Open in Cursor IDE
cursor .
```

### 2. Configure Cursor AI Assistant
**Paste this into Cursor's AI chat:**

```
You are an expert blockchain developer working on AgroAI, a revolutionary agricultural platform for the Chainlink Hackathon. This project combines:

- 95% accurate AI disease detection model (already working)
- Beautiful Flask backend and frontend (already implemented)
- Advanced Chainlink integration (5 sophisticated functions)
- Complete tokenomics with AGRO token rewards
- Production-ready smart contracts

Focus on:
- Solidity smart contracts with gas optimization
- Chainlink Functions integration (all 5 services)
- Web3 backend integration with Flask
- Frontend Web3 components
- Agricultural use cases and farmer adoption
- Security best practices
- Production-ready code quality

Target: Win $100,000+ in Chainlink Hackathon prizes by solving the $220B agricultural crisis for 500M+ farmers globally.
```

## 📁 **CHRONOLOGICAL FILE CREATION SEQUENCE**

### **PHASE 1: Project Foundation (Files 1-5)**

#### File 1: `package.json`
**Cursor Instruction:**
```
Create a comprehensive package.json for AgroAI blockchain platform with:
- Hardhat development framework
- All Chainlink dependencies (@chainlink/contracts)
- OpenZeppelin contracts for security
- Web3 libraries (ethers, web3)
- Development tools (testing, linting, gas reporting)
- Scripts for compile, deploy, test, verify
- Support for Sepolia testnet deployment
```

#### File 2: `hardhat.config.js`
**Cursor Instruction:**
```
Create production-ready Hardhat configuration with:
- Solidity 0.8.19 with optimization
- Sepolia testnet configuration
- Gas reporting and contract size checking
- Etherscan verification setup
- Multiple network support (localhost, sepolia, polygon)
- Proper timeout and gas settings
- Environment variable integration
```

#### File 3: `.env.example`
**Cursor Instruction:**
```
Create comprehensive environment variables template with:
- Blockchain configuration (PRIVATE_KEY, RPC URLs)
- Chainlink settings (subscription IDs, router addresses)
- IPFS configuration (Infura IPFS)
- External API keys (weather, market data)
- Flask backend settings
- Security and production variables
- Detailed comments explaining each variable
```

#### File 4: `README.md`
**Cursor Instruction:**
```
Create professional README for AgroAI blockchain platform including:
- Project overview and hackathon positioning
- Key features (AI detection + blockchain rewards)
- Quick start guide (5-minute setup)
- Architecture overview
- Installation instructions
- Deployment guide
- Testing instructions
- Prize track positioning ($50K Onchain Finance, $25K Functions, $25K Overall)
```

#### File 5: `.gitignore`
**Cursor Instruction:**
```
Create comprehensive .gitignore for blockchain project with:
- Node.js dependencies
- Hardhat artifacts and cache
- Environment files
- Python cache and virtual environments
- IDE files
- Build outputs
- Sensitive files (never commit private keys)
```

### **PHASE 2: Smart Contracts (Files 6-8)**

#### File 6: `contracts/AgroAIToken.sol`
**Cursor Instruction:**
```
Create production-ready ERC-20 token contract for AGRO token with:
- OpenZeppelin ERC20 base with extensions
- Minting capabilities for rewards (only by authorized contracts)
- Burning mechanism for purchases and deflationary pressure
- User tier system based on token holdings
- Staking functionality for premium benefits
- Access control for minting/burning
- Events for all major actions
- Gas-optimized storage patterns
- Comprehensive error messages
```

#### File 7: `contracts/AgroAICore.sol`
**Cursor Instruction:**
```
Create the main AgroAI contract integrating all 5 Chainlink services:

CHAINLINK FUNCTIONS:
- Photo verification with multi-source data
- Market intelligence with real-time pricing
- Treatment tracking with effectiveness monitoring
- Community alerts for disease outbreaks
- Insurance verification with satellite data

CHAINLINK DATA FEEDS:
- ETH/USD price feed for token value
- Weather data integration
- Commodity price feeds

CHAINLINK AUTOMATION:
- Automated health checks every 3 days
- Treatment reminder system
- Reward distribution automation

CHAINLINK VRF:
- Fair distribution of premium rewards
- Random selection for contests
- Unbiased resource allocation

CHAINLINK CCIP:
- Cross-chain token transfers
- Multi-chain marketplace support
- Global farmer network connectivity

Include comprehensive reward system, user management, purchase discounts, and community features.
```

#### File 8: `contracts/interfaces/IAgroAI.sol`
**Cursor Instruction:**
```
Create comprehensive interface for AgroAI contract with:
- All public function signatures
- Event definitions
- Struct definitions for user data, crops, treatments
- Error definitions
- Documentation for each function
- Integration points for frontend/backend
```

### **PHASE 3: Chainlink Functions (Files 9-13)**

#### File 9: `chainlink-functions/photo-verification.js`
**Cursor Instruction:**
```
Create sophisticated Chainlink Function for photo verification:
- Accept image IPFS hash and user address
- Call AI backend API for disease detection
- Fetch weather data from OpenWeatherMap API
- Correlate with satellite imagery data
- Implement fraud detection logic
- Calculate verification score (0-100)
- Determine token rewards based on confidence
- Return structured JSON with all verification data
- Include comprehensive error handling
- Add request validation and rate limiting
```

#### File 10: `chainlink-functions/market-intelligence.js`
**Cursor Instruction:**
```
Create market intelligence Chainlink Function:
- Fetch real-time commodity prices from multiple sources
- Get weather forecasts affecting crop prices
- Calculate market trends and predictions
- Determine optimal buying/selling recommendations
- Include currency conversion for global markets
- Return dynamic pricing for marketplace
- Add market volatility indicators
- Include supply/demand analysis
```

#### File 11: `chainlink-functions/treatment-tracking.js`
**Cursor Instruction:**
```
Create treatment effectiveness tracking function:
- Monitor crop recovery progress over time
- Analyze treatment effectiveness using AI
- Calculate bonus rewards for successful treatments
- Track farmer compliance with treatment plans
- Generate effectiveness reports
- Predict treatment outcomes
- Include comparative analysis with similar cases
```

#### File 12: `chainlink-functions/community-alerts.js`
**Cursor Instruction:**
```
Create community alert system function:
- Detect disease outbreak patterns
- Calculate alert severity and radius
- Identify affected farmer communities
- Generate viral notification content
- Track alert response rates
- Implement alert fatigue prevention
- Include geographic clustering analysis
```

#### File 13: `chainlink-functions/insurance-verification.js`
**Cursor Instruction:**
```
Create insurance claim verification function:
- Verify crop damage using satellite imagery
- Cross-reference with weather data
- Calculate damage assessment percentage
- Determine payout amounts automatically
- Implement fraud detection algorithms
- Generate claim reports
- Include appeals process handling
```

### **PHASE 4: Deployment Scripts (Files 14-16)**

#### File 14: `scripts/deploy.js`
**Cursor Instruction:**
```
Create comprehensive deployment script:
- Deploy AgroAIToken contract first
- Deploy AgroAICore contract with proper initialization
- Set up all Chainlink service configurations
- Configure contract permissions and roles
- Verify all deployments on Etherscan
- Save deployment addresses to config file
- Test basic functionality after deployment
- Generate deployment report
```

#### File 15: `scripts/setup-chainlink.js`
**Cursor Instruction:**
```
Create Chainlink services setup script:
- Register Chainlink Functions subscriptions
- Fund subscriptions with LINK tokens
- Configure VRF subscriptions
- Set up Automation jobs
- Configure Data Feed addresses
- Test all Chainlink integrations
- Generate setup verification report
```

#### File 16: `scripts/test-deployment.js`
**Cursor Instruction:**
```
Create deployment testing script:
- Test all contract functions
- Verify Chainlink integrations
- Test token minting and burning
- Verify user tier calculations
- Test purchase discount logic
- Validate community alert system
- Generate comprehensive test report
```

### **PHASE 5: Backend Integration (Files 17-22)**

#### File 17: `backend/requirements.txt`
**Cursor Instruction:**
```
Create comprehensive Python requirements file:
- Flask web framework and extensions
- Web3 libraries (web3.py, eth-account)
- IPFS integration (ipfshttpclient)
- AI/ML libraries (torch, tensorflow, opencv)
- Database libraries (SQLAlchemy, Redis)
- API libraries (requests, httpx)
- Security libraries (cryptography, JWT)
- Development tools (pytest, black, flake8)
- Production server (gunicorn)
```

#### File 18: `backend/blockchain/web3_service.py`
**Cursor Instruction:**
```
Create comprehensive Web3 service class:
- Initialize Web3 connection with fallback providers
- Load contract ABIs and addresses
- Implement all contract interaction methods
- Handle transaction signing and broadcasting
- Implement retry logic for failed transactions
- Add gas estimation and optimization
- Include event listening capabilities
- Add comprehensive error handling
- Implement caching for frequently accessed data
```

#### File 19: `backend/blockchain/ipfs_service.py`
**Cursor Instruction:**
```
Create IPFS service for decentralized storage:
- Upload images to IPFS via Infura
- Generate and return IPFS hashes
- Implement image compression and optimization
- Add metadata storage for images
- Include fallback storage options
- Implement image retrieval and caching
- Add content validation and security checks
```

#### File 20: `backend/routes/blockchain_routes.py`
**Cursor Instruction:**
```
Create Flask routes for blockchain integration:
- POST /api/upload-photo - Upload image and trigger verification
- GET /api/user-stats/{address} - Get user statistics and tier
- POST /api/purchase - Process token-based purchases
- GET /api/rewards/{address} - Get user reward history
- POST /api/claim-rewards - Claim pending rewards
- GET /api/community-alerts - Get active community alerts
- POST /api/treatment-tracking - Update treatment progress
- Include comprehensive input validation and error handling
```

#### File 21: `backend/routes/enhanced_detection.py`
**Cursor Instruction:**
```
Enhance existing detection route with blockchain integration:
- Integrate with existing AI model
- Add IPFS upload for images
- Trigger Chainlink Functions verification
- Calculate and mint token rewards
- Update user statistics and tier
- Trigger community alerts if needed
- Return comprehensive response with blockchain data
- Maintain backward compatibility with existing frontend
```

#### File 22: `backend/config/blockchain_config.py`
**Cursor Instruction:**
```
Create blockchain configuration management:
- Load contract addresses and ABIs
- Configure network settings (Sepolia, Polygon, etc.)
- Set up Chainlink service addresses
- Configure IPFS settings
- Include environment-specific configurations
- Add validation for all configuration values
```

### **PHASE 6: Frontend Integration (Files 23-27)**

#### File 23: `frontend/static/js/web3-integration.js`
**Cursor Instruction:**
```
Create comprehensive Web3 frontend integration:
- MetaMask connection and wallet management
- Contract interaction methods
- Token balance and transaction monitoring
- User tier display and benefits
- Purchase flow with token discounts
- Real-time reward notifications
- Community alert subscriptions
- Treatment tracking interface
- Error handling and user feedback
- Mobile-responsive design considerations
```

#### File 24: `frontend/static/js/token-rewards.js`
**Cursor Instruction:**
```
Create token rewards system for frontend:
- Real-time reward notifications
- Animated token earning effects
- Reward history display
- Tier progression indicators
- Staking interface for premium benefits
- Reward claiming functionality
- Beautiful UI animations for token transactions
```

#### File 25: `frontend/static/js/marketplace-integration.js`
**Cursor Instruction:**
```
Create marketplace integration with token economy:
- Dynamic pricing based on user tier
- Token discount calculations
- Multi-modal payment options (fiat + tokens)
- Cashback reward display
- Purchase confirmation with blockchain proof
- Treatment tracking integration
- Shopping cart with token optimization
```

#### File 26: `frontend/static/css/web3-styles.css`
**Cursor Instruction:**
```
Create beautiful CSS for Web3 components:
- Wallet connection button and modal
- Token balance display with animations
- Reward notification styles
- Tier badge designs
- Purchase flow styling
- Community alert banners
- Loading states for blockchain transactions
- Mobile-responsive Web3 components
```

#### File 27: `frontend/templates/enhanced_dashboard.html`
**Cursor Instruction:**
```
Create enhanced dashboard template with Web3 integration:
- User statistics with blockchain data
- Token balance and earning history
- Active treatments with progress tracking
- Community alerts and notifications
- Marketplace recommendations
- Tier benefits and progression
- Integration with existing beautiful UI
```

### **PHASE 7: Testing Suite (Files 28-32)**

#### File 28: `test/AgroAIToken.test.js`
**Cursor Instruction:**
```
Create comprehensive token contract tests:
- Test minting and burning functionality
- Verify tier system calculations
- Test staking and unstaking
- Validate access controls
- Test reward distribution logic
- Verify transfer restrictions if any
- Test edge cases and error conditions
- Include gas usage optimization tests
```

#### File 29: `test/AgroAICore.test.js`
**Cursor Instruction:**
```
Create comprehensive core contract tests:
- Test all Chainlink integrations
- Verify photo verification flow
- Test purchase discount calculations
- Validate community alert system
- Test treatment tracking functionality
- Verify insurance claim processing
- Test user management and tiers
- Include integration tests with token contract
```

#### File 30: `test/chainlink-functions.test.js`
**Cursor Instruction:**
```
Create Chainlink Functions testing suite:
- Mock external API responses
- Test all 5 function implementations
- Verify error handling and edge cases
- Test request validation
- Verify response formatting
- Test rate limiting and security
- Include performance benchmarks
```

#### File 31: `backend/tests/test_blockchain_integration.py`
**Cursor Instruction:**
```
Create Python tests for blockchain integration:
- Test Web3 service functionality
- Verify IPFS upload and retrieval
- Test contract interaction methods
- Validate transaction handling
- Test error scenarios and recovery
- Verify caching mechanisms
- Include performance tests
```

#### File 32: `backend/tests/test_enhanced_detection.py`
**Cursor Instruction:**
```
Create tests for enhanced detection with blockchain:
- Test AI model integration with blockchain
- Verify IPFS upload in detection flow
- Test reward calculation and distribution
- Validate community alert triggering
- Test treatment tracking initiation
- Verify backward compatibility
```

### **PHASE 8: Configuration & Documentation (Files 33-37)**

#### File 33: `config/contracts.json`
**Cursor Instruction:**
```
Create contract configuration file:
- Contract addresses for all networks
- ABI storage and management
- Chainlink service addresses
- Network-specific configurations
- Version tracking for upgrades
```

#### File 34: `config/chainlink-config.json`
**Cursor Instruction:**
```
Create Chainlink services configuration:
- Functions router addresses
- Subscription IDs for each service
- DON IDs and key hashes
- Price feed addresses
- Automation registry addresses
- Network-specific Chainlink configurations
```

#### File 35: `docs/API_DOCUMENTATION.md`
**Cursor Instruction:**
```
Create comprehensive API documentation:
- All backend endpoints with examples
- Request/response formats
- Authentication requirements
- Error codes and handling
- Rate limiting information
- Integration examples for frontend
```

#### File 36: `docs/SMART_CONTRACT_DOCUMENTATION.md`
**Cursor Instruction:**
```
Create smart contract documentation:
- Contract architecture overview
- Function descriptions and parameters
- Event definitions and usage
- Integration patterns
- Security considerations
- Upgrade procedures
```

#### File 37: `docs/DEPLOYMENT_GUIDE.md`
**Cursor Instruction:**
```
Create step-by-step deployment guide:
- Environment setup requirements
- Contract deployment procedures
- Chainlink service configuration
- Backend deployment steps
- Frontend deployment process
- Testing and verification procedures
```

### **PHASE 9: Demo Materials (Files 38-40)**

#### File 38: `demo/LIVE_DEMO_DASHBOARD.html`
**Cursor Instruction:**
```
Create beautiful live demo dashboard:
- Real-time Chainlink Functions activity display
- Transaction monitoring with blockchain proof
- Token reward animations
- Community alert visualizations
- Market intelligence displays
- Treatment tracking progress
- Beautiful responsive design for judge presentation
```

#### File 39: `demo/JUDGE_PRESENTATION_SCRIPT.md`
**Cursor Instruction:**
```
Create winning 5-minute presentation script:
- Opening hook with $220B problem statement
- Live demo flow with timing
- Technical superiority proof points
- Business impact and market opportunity
- Closing statement for maximum impact
- Backup plans for technical issues
- Prize positioning for each track
```

#### File 40: `demo/sample-data/`
**Cursor Instruction:**
```
Create sample data for demonstrations:
- Sample crop disease images
- Mock API responses for testing
- Sample user data and statistics
- Demo transaction data
- Community alert examples
- Treatment tracking samples
```

## 🎯 **CURSOR AI PROMPTS FOR EACH PHASE**

### **Phase 1 Prompt:**
```
We're starting the AgroAI blockchain platform. Create the foundational files (package.json, hardhat.config.js, .env.example, README.md, .gitignore) for a production-ready Chainlink hackathon project targeting $100K+ in prizes. Focus on professional setup with all necessary dependencies and configurations.
```

### **Phase 2 Prompt:**
```
Now create the smart contracts. We need AgroAIToken.sol (ERC-20 with rewards/tiers/burning) and AgroAICore.sol (main contract with all 5 Chainlink services). These must be production-ready with gas optimization and comprehensive functionality for agricultural use cases.
```

### **Phase 3 Prompt:**
```
Create all 5 Chainlink Functions: photo-verification.js, market-intelligence.js, treatment-tracking.js, community-alerts.js, insurance-verification.js. Each should be sophisticated with multi-source data integration, error handling, and real agricultural utility.
```

### **Phase 4 Prompt:**
```
Create deployment and setup scripts: deploy.js, setup-chainlink.js, test-deployment.js. These should handle complete deployment to Sepolia testnet with verification and testing.
```

### **Phase 5 Prompt:**
```
Create Python backend integration: web3_service.py, ipfs_service.py, blockchain_routes.py, enhanced_detection.py, blockchain_config.py. Integrate with existing Flask app and AI model while adding comprehensive blockchain functionality.
```

### **Phase 6 Prompt:**
```
Create frontend Web3 integration: web3-integration.js, token-rewards.js, marketplace-integration.js, web3-styles.css, enhanced_dashboard.html. Seamlessly integrate with existing beautiful UI while adding Web3 features.
```

### **Phase 7 Prompt:**
```
Create comprehensive testing suite: AgroAIToken.test.js, AgroAICore.test.js, chainlink-functions.test.js, test_blockchain_integration.py, test_enhanced_detection.py. Ensure 100% functionality and edge case coverage.
```

### **Phase 8 Prompt:**
```
Create configuration and documentation: contracts.json, chainlink-config.json, API_DOCUMENTATION.md, SMART_CONTRACT_DOCUMENTATION.md, DEPLOYMENT_GUIDE.md. Professional documentation for production deployment.
```

### **Phase 9 Prompt:**
```
Create demo materials: LIVE_DEMO_DASHBOARD.html, JUDGE_PRESENTATION_SCRIPT.md, sample-data/. Beautiful presentation materials to win the hackathon with visual proof of Chainlink integration.
```

## ⚡ **RAPID EXECUTION SEQUENCE**

### **Hour 1: Foundation**
- Files 1-5: Project setup and configuration
- Initialize git repository
- Install dependencies

### **Hour 2: Smart Contracts**
- Files 6-8: Core blockchain functionality
- Compile and test locally

### **Hour 3: Chainlink Integration**
- Files 9-16: Functions and deployment
- Deploy to Sepolia testnet

### **Hour 4: Full Integration**
- Files 17-40: Backend, frontend, testing, demo
- Complete end-to-end testing

## 🏆 **SUCCESS VALIDATION**

After each phase, validate with Cursor:
```
Review the files we just created for Phase X. Ensure they:
1. Follow best practices for production code
2. Include comprehensive error handling
3. Are properly documented
4. Integrate seamlessly with existing components
5. Support the hackathon winning strategy

Suggest any improvements or missing elements.
```

## 🎯 **FINAL CURSOR PROMPT**

```
We've completed the AgroAI blockchain platform with all 40 files. This is our hackathon submission targeting:
- $50,000 Onchain Finance prize
- $25,000 Chainlink Functions prize  
- $25,000 Best Overall prize

Review the complete implementation and suggest any final optimizations, documentation improvements, or demo enhancements that would maximize our chances of winning all three prizes.
```

---

**This sequence will create a production-ready, hackathon-winning AgroAI platform in 4 hours! 🚀🏆**

