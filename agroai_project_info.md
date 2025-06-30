# AgroAI Project Information

## PROJECT GOAL
- Tokenize crops as NFTs with real-world data
- Use Chainlink Functions to call AI/ML APIs for disease detection and yield prediction
- Create decentralized agricultural finance ecosystem
- Target $50,000 Onchain Finance prize track

## CURRENT STATUS
- Implementing the blockchain/smart contract layer
- Team partner handles backend AI/ML APIs
- Need bulletproof Chainlink Functions integration
- Must work standalone with mock backend for testing

## KEY REQUIREMENTS
- 5 Chainlink services: Functions, Data Feeds, Automation, VRF, CCIP
- All services must make blockchain state changes
- Disease detection via AI image analysis
- Yield prediction using ML models
- Real-time weather data integration
- Comprehensive error handling and testing

## TECH STACK
- Solidity 0.8.19 smart contracts
- Hardhat development framework
- Chainlink Functions with JavaScript
- Mock Express.js backend for testing
- Sepolia testnet deployment

## INTEGRATION STRATEGY
- Standalone blockchain validation with mock backend
- Clear API specifications for backend team
- Ready-to-use Web3 package for frontend team
- Zero-risk integration approach

## HACKATHON CONTEXT
- Chromion-Chainlink Hackathon
- Targeting Onchain Finance prize track ($50,000)
- Focus on agricultural finance ecosystem

## QUESTIONS TO ADDRESS
- Why tokenize crops as NFTs? Are there alternative approaches?
- Need to explore different alternatives for crop representation



## ADDITIONAL CONTEXT FROM TEAM DISCUSSION

### Current System Description
- Frontend, backend, and ML models are ready
- System can identify plant diseases from images
- When user clicks picture, it shows what's wrong with the plant
- System suggests supplements that can be purchased with local currency
- Users get tokens credited back after purchases
- ML model can predict issues at very early onset
- Can help prevent crop destruction before it's too late

### Key Questions & Concerns
1. **Real-world viability**: How would farmers know when to take pictures?
2. **Evidence of need**: Is there proof that farmers lose harvests due to late disease detection?
3. **User adoption**: How viable is this for actual farmers?
4. **Weather integration**: Can weather fluctuations trigger alerts via Chainlink oracles?
5. **Tokenomics**: How to set issuance rates and burn mechanisms?

### Tokenization Strategy
- Users buy products (fertilizers, etc.) with local currency
- Get tokens distributed back after purchases
- Need to determine token quantity and issuance rates
- Burn tokens to track transactions
- Unclear on proportion of tokens vs purchase amount

### Hackathon Goals
- Maximize Chainlink Functions usage
- Outstand other projects
- Best use case implementation
- Need all relevant files for Cursor IDE integration

### Team Structure
- User: Blockchain/smart contract implementation
- Partner: Backend AI/ML APIs and frontend
- Target: $50,000 Onchain Finance prize track

