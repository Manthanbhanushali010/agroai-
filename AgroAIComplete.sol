// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/ccip/applications/CCIPReceiver.sol";

/**
 * @title AgroAI - Complete Agricultural Blockchain Platform
 * @dev Integrates all 5 Chainlink services for comprehensive agricultural solutions
 * @author AgroAI Team - Chainlink Hackathon 2025
 */
contract AgroAIComplete is 
    ERC20, 
    ERC20Burnable, 
    Pausable, 
    AccessControl, 
    ReentrancyGuard,
    FunctionsClient,
    AutomationCompatibleInterface,
    VRFConsumerBaseV2,
    CCIPReceiver
{
    // ============ ROLES ============
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant AUTOMATION_ROLE = keccak256("AUTOMATION_ROLE");

    // ============ CHAINLINK INTERFACES ============
    AggregatorV3Interface internal priceFeed;
    uint64 public subscriptionId;
    bytes32 public donId;
    uint32 public gasLimit = 300000;
    
    // VRF Configuration
    uint64 public vrfSubscriptionId;
    bytes32 public keyHash;
    uint32 public numWords = 1;
    uint16 public requestConfirmations = 3;
    
    // ============ STRUCTS ============
    struct User {
        uint256 totalPhotos;
        uint256 totalRewards;
        uint256 totalPurchases;
        uint256 stakingBalance;
        uint256 lastPhotoTimestamp;
        uint8 tier; // 0=Bronze, 1=Silver, 2=Gold, 3=Platinum, 4=Diamond
        bool isActive;
        uint256 streakDays;
        uint256 referralCount;
    }

    struct Crop {
        string ipfsHash;
        address owner;
        string cropType;
        string diseaseDetected;
        uint8 confidenceScore;
        uint256 timestamp;
        bool isHealthy;
        uint256 rewardsClaimed;
        string treatmentPlan;
        uint8 treatmentProgress;
    }

    struct Purchase {
        address buyer;
        uint256 productId;
        uint256 amount;
        uint256 tokenDiscount;
        uint256 cashbackAmount;
        uint256 timestamp;
        bool treatmentTracking;
    }

    struct CommunityAlert {
        string diseaseType;
        uint256 severity; // 1-10
        uint256 radius; // in kilometers
        uint256 timestamp;
        uint256 farmersNotified;
        bool isActive;
        string location;
    }

    struct InsuranceClaim {
        address farmer;
        uint256 cropId;
        uint256 claimAmount;
        string damageType;
        uint8 verificationScore;
        bool isPaid;
        uint256 timestamp;
        string satelliteData;
    }

    // ============ STATE VARIABLES ============
    mapping(address => User) public users;
    mapping(uint256 => Crop) public crops;
    mapping(uint256 => Purchase) public purchases;
    mapping(uint256 => CommunityAlert) public communityAlerts;
    mapping(uint256 => InsuranceClaim) public insuranceClaims;
    mapping(bytes32 => uint256) public functionRequests;
    mapping(uint256 => address) public vrfRequests;
    
    uint256 public nextCropId = 1;
    uint256 public nextPurchaseId = 1;
    uint256 public nextAlertId = 1;
    uint256 public nextClaimId = 1;
    
    // Reward Configuration
    uint256 public basePhotoReward = 5 * 10**18; // 5 AGRO
    uint256 public diseaseDetectionBonus = 100 * 10**18; // 100 AGRO
    uint256 public earlyDetectionBonus = 200 * 10**18; // 200 AGRO
    uint256 public healthyPlantReward = 20 * 10**18; // 20 AGRO
    
    // Tier Requirements (token balance)
    uint256[5] public tierRequirements = [
        0,           // Bronze: 0 AGRO
        1000 * 10**18,  // Silver: 1,000 AGRO
        5000 * 10**18,  // Gold: 5,000 AGRO
        15000 * 10**18, // Platinum: 15,000 AGRO
        50000 * 10**18  // Diamond: 50,000 AGRO
    ];
    
    // Discount Rates by Tier (percentage)
    uint8[5] public tierDiscounts = [5, 10, 15, 20, 25];
    
    // ============ EVENTS ============
    event PhotoUploaded(address indexed user, uint256 indexed cropId, string ipfsHash);
    event DiseaseDetected(uint256 indexed cropId, string disease, uint8 confidence);
    event RewardsEarned(address indexed user, uint256 amount, string reason);
    event PurchaseMade(address indexed user, uint256 indexed purchaseId, uint256 amount);
    event TierUpgraded(address indexed user, uint8 newTier);
    event CommunityAlertIssued(uint256 indexed alertId, string diseaseType, uint256 severity);
    event InsuranceClaimProcessed(uint256 indexed claimId, address indexed farmer, uint256 amount);
    event TreatmentProgressUpdated(uint256 indexed cropId, uint8 progress);
    event StakingRewardsDistributed(address indexed user, uint256 amount);

    // ============ CONSTRUCTOR ============
    constructor(
        address _functionsRouter,
        address _priceFeed,
        address _vrfCoordinator,
        address _ccipRouter,
        uint64 _subscriptionId,
        bytes32 _donId,
        bytes32 _keyHash
    ) 
        ERC20("AgroAI Token", "AGRO")
        FunctionsClient(_functionsRouter)
        VRFConsumerBaseV2(_vrfCoordinator)
        CCIPReceiver(_ccipRouter)
    {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, msg.sender);
        _grantRole(AUTOMATION_ROLE, msg.sender);
        
        priceFeed = AggregatorV3Interface(_priceFeed);
        subscriptionId = _subscriptionId;
        donId = _donId;
        keyHash = _keyHash;
        
        // Mint initial supply for rewards pool
        _mint(address(this), 1000000 * 10**18); // 1M AGRO for rewards
    }

    // ============ CHAINLINK FUNCTIONS ============
    
    /**
     * @dev Upload photo and trigger AI verification
     */
    function uploadPhoto(
        string memory _ipfsHash,
        string memory _cropType,
        string memory _functionCode
    ) external returns (bytes32 requestId) {
        require(bytes(_ipfsHash).length > 0, "Invalid IPFS hash");
        
        // Create crop record
        uint256 cropId = nextCropId++;
        crops[cropId] = Crop({
            ipfsHash: _ipfsHash,
            owner: msg.sender,
            cropType: _cropType,
            diseaseDetected: "",
            confidenceScore: 0,
            timestamp: block.timestamp,
            isHealthy: false,
            rewardsClaimed: 0,
            treatmentPlan: "",
            treatmentProgress: 0
        });
        
        // Update user stats
        users[msg.sender].totalPhotos++;
        users[msg.sender].lastPhotoTimestamp = block.timestamp;
        
        // Trigger Chainlink Functions for AI verification
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(_functionCode);
        req.addSecretsReference("donHostedSecretsSlotID");
        
        string[] memory args = new string[](3);
        args[0] = _ipfsHash;
        args[1] = _cropType;
        args[2] = Strings.toString(cropId);
        req.setArgs(args);
        
        requestId = _sendRequest(req.encodeCBOR(), subscriptionId, gasLimit, donId);
        functionRequests[requestId] = cropId;
        
        emit PhotoUploaded(msg.sender, cropId, _ipfsHash);
        
        // Give base reward immediately
        _mintReward(msg.sender, basePhotoReward, "Photo upload");
        
        return requestId;
    }
    
    /**
     * @dev Handle Chainlink Functions response
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        uint256 cropId = functionRequests[requestId];
        require(cropId > 0, "Invalid request");
        
        if (err.length == 0) {
            // Parse response (disease, confidence, treatment)
            (string memory disease, uint8 confidence, string memory treatment) = 
                abi.decode(response, (string, uint8, string));
            
            crops[cropId].diseaseDetected = disease;
            crops[cropId].confidenceScore = confidence;
            crops[cropId].treatmentPlan = treatment;
            crops[cropId].isHealthy = keccak256(bytes(disease)) == keccak256(bytes("Healthy"));
            
            address owner = crops[cropId].owner;
            
            // Calculate and distribute rewards
            uint256 rewardAmount = _calculateDiseaseReward(disease, confidence);
            if (rewardAmount > 0) {
                _mintReward(owner, rewardAmount, "Disease detection");
                crops[cropId].rewardsClaimed = rewardAmount;
            }
            
            // Check for community alert
            if (!crops[cropId].isHealthy && confidence > 80) {
                _triggerCommunityAlert(disease, confidence);
            }
            
            emit DiseaseDetected(cropId, disease, confidence);
        }
        
        delete functionRequests[requestId];
    }
    
    // ============ DATA FEEDS ============
    
    /**
     * @dev Get latest ETH/USD price for token valuation
     */
    function getLatestPrice() public view returns (int256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return price;
    }
    
    /**
     * @dev Calculate token value in USD
     */
    function getTokenValueUSD(uint256 _tokenAmount) public view returns (uint256) {
        int256 ethPrice = getLatestPrice();
        require(ethPrice > 0, "Invalid price");
        
        // Simple calculation: assume 1 AGRO = 0.001 ETH for demo
        uint256 ethValue = (_tokenAmount * 1e15) / 1e18; // 0.001 ETH per AGRO
        return (uint256(ethPrice) * ethValue) / 1e8; // Price feed has 8 decimals
    }
    
    // ============ AUTOMATION ============
    
    /**
     * @dev Check if upkeep is needed for automated tasks
     */
    function checkUpkeep(bytes calldata)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        // Check for pending staking rewards distribution
        upkeepNeeded = block.timestamp % 86400 == 0; // Daily check
        performData = abi.encode("daily_rewards");
    }
    
    /**
     * @dev Perform automated upkeep tasks
     */
    function performUpkeep(bytes calldata performData) external override {
        require(hasRole(AUTOMATION_ROLE, msg.sender), "Not authorized");
        
        string memory task = abi.decode(performData, (string));
        
        if (keccak256(bytes(task)) == keccak256(bytes("daily_rewards"))) {
            _distributeStakingRewards();
        }
    }
    
    // ============ VRF (RANDOMNESS) ============
    
    /**
     * @dev Request random number for fair distribution
     */
    function requestRandomReward() external returns (uint256 requestId) {
        require(balanceOf(msg.sender) >= 100 * 10**18, "Minimum 100 AGRO required");
        
        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            vrfSubscriptionId,
            requestConfirmations,
            gasLimit,
            numWords
        );
        
        vrfRequests[requestId] = msg.sender;
        return requestId;
    }
    
    /**
     * @dev Handle VRF response
     */
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        address user = vrfRequests[requestId];
        require(user != address(0), "Invalid request");
        
        // Generate random reward between 10-1000 AGRO
        uint256 randomReward = (randomWords[0] % 991) + 10;
        uint256 rewardAmount = randomReward * 10**18;
        
        _mintReward(user, rewardAmount, "Random reward");
        delete vrfRequests[requestId];
    }
    
    // ============ CCIP (CROSS-CHAIN) ============
    
    /**
     * @dev Handle cross-chain messages
     */
    function _ccipReceive(Client.Any2EVMMessage memory message) internal override {
        // Handle cross-chain token transfers or data
        address sender = abi.decode(message.sender, (address));
        uint256 amount = abi.decode(message.data, (uint256));
        
        // Mint tokens for cross-chain user
        _mint(sender, amount);
    }
    
    // ============ CORE FUNCTIONS ============
    
    /**
     * @dev Process purchase with token discount
     */
    function processPurchase(
        uint256 _productId,
        uint256 _price,
        uint256 _tokenAmount
    ) external payable nonReentrant {
        require(_price > 0, "Invalid price");
        
        User storage user = users[msg.sender];
        uint8 userTier = _getUserTier(msg.sender);
        uint256 discount = tierDiscounts[userTier];
        
        // Calculate discounted price
        uint256 discountAmount = (_price * discount) / 100;
        uint256 finalPrice = _price - discountAmount;
        
        // Handle token payment
        if (_tokenAmount > 0) {
            require(balanceOf(msg.sender) >= _tokenAmount, "Insufficient tokens");
            require(_tokenAmount <= finalPrice, "Token amount exceeds price");
            
            _burn(msg.sender, _tokenAmount);
            finalPrice -= _tokenAmount;
        }
        
        // Handle ETH payment for remaining amount
        require(msg.value >= finalPrice, "Insufficient payment");
        
        // Create purchase record
        uint256 purchaseId = nextPurchaseId++;
        uint256 cashbackAmount = (_price * 10) / 100; // 10% cashback
        
        purchases[purchaseId] = Purchase({
            buyer: msg.sender,
            productId: _productId,
            amount: _price,
            tokenDiscount: _tokenAmount,
            cashbackAmount: cashbackAmount,
            timestamp: block.timestamp,
            treatmentTracking: true
        });
        
        // Update user stats
        user.totalPurchases++;
        
        // Mint cashback tokens
        _mintReward(msg.sender, cashbackAmount, "Purchase cashback");
        
        // Refund excess ETH
        if (msg.value > finalPrice) {
            payable(msg.sender).transfer(msg.value - finalPrice);
        }
        
        emit PurchaseMade(msg.sender, purchaseId, _price);
    }
    
    /**
     * @dev Stake tokens for premium benefits
     */
    function stakeTokens(uint256 _amount) external {
        require(_amount > 0, "Invalid amount");
        require(balanceOf(msg.sender) >= _amount, "Insufficient balance");
        
        _transfer(msg.sender, address(this), _amount);
        users[msg.sender].stakingBalance += _amount;
    }
    
    /**
     * @dev Unstake tokens
     */
    function unstakeTokens(uint256 _amount) external {
        require(_amount > 0, "Invalid amount");
        require(users[msg.sender].stakingBalance >= _amount, "Insufficient staked balance");
        
        users[msg.sender].stakingBalance -= _amount;
        _transfer(address(this), msg.sender, _amount);
    }
    
    /**
     * @dev Update treatment progress
     */
    function updateTreatmentProgress(uint256 _cropId, uint8 _progress) external {
        require(_progress <= 100, "Invalid progress");
        require(crops[_cropId].owner == msg.sender, "Not crop owner");
        
        crops[_cropId].treatmentProgress = _progress;
        
        // Reward for treatment completion
        if (_progress == 100) {
            uint256 completionReward = 50 * 10**18; // 50 AGRO
            _mintReward(msg.sender, completionReward, "Treatment completion");
        }
        
        emit TreatmentProgressUpdated(_cropId, _progress);
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    function _mintReward(address _user, uint256 _amount, string memory _reason) internal {
        _mint(_user, _amount);
        users[_user].totalRewards += _amount;
        
        // Check for tier upgrade
        uint8 newTier = _getUserTier(_user);
        if (newTier > users[_user].tier) {
            users[_user].tier = newTier;
            emit TierUpgraded(_user, newTier);
        }
        
        emit RewardsEarned(_user, _amount, _reason);
    }
    
    function _calculateDiseaseReward(string memory _disease, uint8 _confidence) internal view returns (uint256) {
        if (keccak256(bytes(_disease)) == keccak256(bytes("Healthy"))) {
            return healthyPlantReward;
        }
        
        uint256 baseReward = diseaseDetectionBonus;
        
        // Early detection bonus (high confidence)
        if (_confidence >= 90) {
            baseReward += earlyDetectionBonus;
        }
        
        return baseReward;
    }
    
    function _getUserTier(address _user) internal view returns (uint8) {
        uint256 balance = balanceOf(_user);
        
        for (uint8 i = 4; i > 0; i--) {
            if (balance >= tierRequirements[i]) {
                return i;
            }
        }
        return 0; // Bronze
    }
    
    function _triggerCommunityAlert(string memory _disease, uint8 _severity) internal {
        uint256 alertId = nextAlertId++;
        
        communityAlerts[alertId] = CommunityAlert({
            diseaseType: _disease,
            severity: _severity,
            radius: 10, // 10km radius
            timestamp: block.timestamp,
            farmersNotified: 0,
            isActive: true,
            location: "GPS_COORDINATES" // Would be populated by oracle
        });
        
        emit CommunityAlertIssued(alertId, _disease, _severity);
    }
    
    function _distributeStakingRewards() internal {
        // Distribute daily staking rewards (simplified)
        uint256 totalStaked = balanceOf(address(this));
        if (totalStaked > 0) {
            uint256 dailyRewardPool = 1000 * 10**18; // 1000 AGRO daily
            // In practice, would iterate through all stakers
            // For demo, just emit event
            emit StakingRewardsDistributed(address(this), dailyRewardPool);
        }
    }
    
    // ============ VIEW FUNCTIONS ============
    
    function getUserStats(address _user) external view returns (
        uint256 totalPhotos,
        uint256 totalRewards,
        uint256 totalPurchases,
        uint8 tier,
        uint256 stakingBalance,
        uint256 streakDays
    ) {
        User memory user = users[_user];
        return (
            user.totalPhotos,
            user.totalRewards,
            user.totalPurchases,
            _getUserTier(_user),
            user.stakingBalance,
            user.streakDays
        );
    }
    
    function getCropDetails(uint256 _cropId) external view returns (
        string memory ipfsHash,
        address owner,
        string memory cropType,
        string memory diseaseDetected,
        uint8 confidenceScore,
        bool isHealthy,
        string memory treatmentPlan,
        uint8 treatmentProgress
    ) {
        Crop memory crop = crops[_cropId];
        return (
            crop.ipfsHash,
            crop.owner,
            crop.cropType,
            crop.diseaseDetected,
            crop.confidenceScore,
            crop.isHealthy,
            crop.treatmentPlan,
            crop.treatmentProgress
        );
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    function updateRewardAmounts(
        uint256 _basePhoto,
        uint256 _diseaseBonus,
        uint256 _earlyBonus,
        uint256 _healthyReward
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        basePhotoReward = _basePhoto;
        diseaseDetectionBonus = _diseaseBonus;
        earlyDetectionBonus = _earlyBonus;
        healthyPlantReward = _healthyReward;
    }
    
    function withdrawETH() external onlyRole(DEFAULT_ADMIN_ROLE) {
        payable(msg.sender).transfer(address(this).balance);
    }
    
    // ============ OVERRIDES ============
    
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }
}

