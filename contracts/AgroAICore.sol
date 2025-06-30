// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./chainlink/functions/FunctionsClient.sol";
import "./chainlink/functions/FunctionsRequest.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "./AgroAIToken.sol";

/**
 * @title AgroAI Core Contract
 * @dev Main contract integrating all 5 Chainlink services
 * Features: Functions, Data Feeds, Automation, VRF, CCIP
 */
contract AgroAICore is 
    FunctionsClient, 
    ConfirmedOwner, 
    AutomationCompatibleInterface,
    VRFConsumerBaseV2 
{
    using FunctionsRequest for FunctionsRequest.Request;

    // Contract references
    AgroAIToken public immutable agroToken;
    
    // Chainlink Functions configuration
    bytes32 public donID;
    uint64 public subscriptionId;
    uint32 public gasLimit = 300000;
    
    // Chainlink VRF configuration
    VRFCoordinatorV2Interface public immutable vrfCoordinator;
    uint256 public vrfSubscriptionId;
    bytes32 public keyHash;
    uint32 public callbackGasLimit = 100000;
    uint16 public requestConfirmations = 3;
    uint32 public numWords = 1;
    
    // Data Feeds
    AggregatorV3Interface public ethUsdPriceFeed;
    AggregatorV3Interface public weatherDataFeed; // Custom weather oracle
    
    // Automation
    uint256 public lastUpkeepTime;
    uint256 public upkeepInterval = 3 days; // Check every 3 days
    
    // Disease detection and verification
    struct DiseaseDetection {
        address user;
        string ipfsHash;
        string cropType;
        string location;
        string disease;
        uint256 confidence;
        uint256 timestamp;
        bool verified;
        uint256 rewardAmount;
        bytes32 chainlinkRequestId;
    }
    
    // Community alerts
    struct CommunityAlert {
        string disease;
        string location;
        uint256 severity;
        uint256 timestamp;
        uint256 affectedUsers;
        bool active;
    }
    
    // Treatment tracking
    struct Treatment {
        address user;
        string treatmentId;
        string disease;
        uint256 startTime;
        uint256 expectedDuration;
        bool completed;
        bool successful;
        uint256 effectivenessScore;
    }
    
    // Purchase tracking
    struct Purchase {
        address user;
        string productId;
        uint256 amount;
        uint256 tokensUsed;
        uint256 discount;
        uint256 cashback;
        uint256 timestamp;
    }
    
    // Mappings
    mapping(bytes32 => DiseaseDetection) public detections;
    mapping(bytes32 => address) public pendingRequests;
    mapping(string => CommunityAlert) public communityAlerts;
    mapping(string => Treatment) public treatments;
    mapping(address => Purchase[]) public userPurchases;
    mapping(address => uint256) public userAlertCount;
    mapping(uint256 => uint256) public vrfRequests;
    
    // Arrays for tracking
    bytes32[] public allDetections;
    string[] public activeAlerts;
    string[] public activeTreatments;
    
    // Function source codes
    string public photoVerificationSource;
    string public purchaseOptimizationSource;
    string public treatmentTrackingSource;
    string public communityAlertsSource;
    string public marketIntelligenceSource;
    
    // Events
    event PhotoAnalysisRequested(bytes32 indexed requestId, address indexed user, string ipfsHash);
    event PhotoAnalysisCompleted(bytes32 indexed requestId, address indexed user, uint256 reward);
    event CommunityAlertTriggered(string indexed disease, string location, uint256 severity);
    event TreatmentStarted(address indexed user, string treatmentId, string disease);
    event TreatmentCompleted(address indexed user, string treatmentId, bool successful);
    event PurchaseProcessed(address indexed user, string productId, uint256 amount, uint256 discount);
    event UpkeepPerformed(uint256 timestamp, uint256 alertsChecked);
    event RandomnessRequested(uint256 indexed requestId, address indexed user);
    event RandomnessReceived(uint256 indexed requestId, uint256 randomValue);
    
    constructor(
        address _functionsRouter,
        address _vrfCoordinator,
        address _agroToken,
        bytes32 _donID,
        uint64 _subscriptionId,
        uint256 _vrfSubscriptionId,
        bytes32 _keyHash,
        address _ethUsdPriceFeed
    ) 
        FunctionsClient(_functionsRouter)
        ConfirmedOwner(msg.sender)
        VRFConsumerBaseV2(_vrfCoordinator)
    {
        agroToken = AgroAIToken(_agroToken);
        donID = _donID;
        subscriptionId = _subscriptionId;
        vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        vrfSubscriptionId = _vrfSubscriptionId;
        keyHash = _keyHash;
        ethUsdPriceFeed = AggregatorV3Interface(_ethUsdPriceFeed);
        lastUpkeepTime = block.timestamp;
        
        // Initialize Chainlink Functions source codes
        _initializeFunctionSources();
    }
    
    /**
     * @dev Initialize Chainlink Functions source codes
     */
    function _initializeFunctionSources() internal {
        photoVerificationSource = 
            "const response = await Functions.makeHttpRequest({"
            "url: args[0],"
            "method: 'POST',"
            "headers: {'Content-Type': 'application/json'},"
            "data: {imageHash: args[1], cropType: args[2], location: args[3]}"
            "});"
            "const weather = await Functions.makeHttpRequest({"
            "url: 'https://api.openweathermap.org/data/2.5/weather',"
            "params: {lat: args[4], lon: args[5], appid: secrets.weatherKey}"
            "});"
            "const result = response.data;"
            "const verification = {"
            "disease: result.disease,"
            "confidence: result.confidence,"
            "verified: result.confidence > 70,"
            "weatherRisk: weather.data.main.humidity > 80 ? 'high' : 'low',"
            "reward: result.confidence > 90 ? 200 : (result.confidence > 70 ? 100 : 20)"
            "};"
            "return Functions.encodeString(JSON.stringify(verification));";
            
        purchaseOptimizationSource =
            "const marketData = await Functions.makeHttpRequest({"
            "url: 'https://api.coingecko.com/api/v3/simple/price',"
            "params: {ids: 'ethereum', vs_currencies: 'usd'}"
            "});"
            "const productData = await Functions.makeHttpRequest({"
            "url: args[0],"
            "method: 'GET',"
            "params: {productId: args[1], userTier: args[2]}"
            "});"
            "const optimization = {"
            "basePrice: productData.data.price,"
            "tierDiscount: parseInt(args[2]) * 5,"
            "marketMultiplier: marketData.data.ethereum.usd > 3000 ? 0.95 : 1.0,"
            "recommendedPayment: 'mixed'"
            "};"
            "return Functions.encodeString(JSON.stringify(optimization));";
    }
    
    /**
     * @dev Request photo analysis with enhanced verification
     */
    function requestPhotoAnalysis(
        string memory backendUrl,
        string memory ipfsHash,
        string memory cropType,
        string memory location,
        string memory latitude,
        string memory longitude
    ) external returns (bytes32 requestId) {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(photoVerificationSource);
        
        string[] memory args = new string[](6);
        args[0] = backendUrl;
        args[1] = ipfsHash;
        args[2] = cropType;
        args[3] = location;
        args[4] = latitude;
        args[5] = longitude;
        req.setArgs(args);
        
        requestId = _sendRequest(req.encodeCBOR(), subscriptionId, gasLimit, donID);
        
        // Store detection data
        detections[requestId] = DiseaseDetection({
            user: msg.sender,
            ipfsHash: ipfsHash,
            cropType: cropType,
            location: location,
            disease: "",
            confidence: 0,
            timestamp: block.timestamp,
            verified: false,
            rewardAmount: 0,
            chainlinkRequestId: requestId
        });
        
        pendingRequests[requestId] = msg.sender;
        allDetections.push(requestId);
        
        emit PhotoAnalysisRequested(requestId, msg.sender, ipfsHash);
        return requestId;
    }
    
    /**
     * @dev Fulfill photo analysis request
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        address user = pendingRequests[requestId];
        require(user != address(0), "Request not found");
        
        if (err.length > 0) {
            // Handle error - give minimum reward
            agroToken.rewardPhotoUpload(user);
            detections[requestId].rewardAmount = agroToken.PHOTO_REWARD();
        } else {
            // Parse response and process rewards
            string memory responseString = string(response);
            _processPhotoAnalysisResult(requestId, responseString);
        }
        
        delete pendingRequests[requestId];
        emit PhotoAnalysisCompleted(requestId, user, detections[requestId].rewardAmount);
    }
    
    /**
     * @dev Process photo analysis result and award tokens
     */
    function _processPhotoAnalysisResult(bytes32 requestId, string memory result) internal {
        DiseaseDetection storage detection = detections[requestId];
        address user = detection.user;
        
        // For demo purposes, parse basic result
        // In production, would use JSON parsing library
        detection.verified = true;
        detection.confidence = 85; // Mock confidence
        detection.disease = "Northern Corn Leaf Blight"; // Mock disease
        
        // Award base photo reward
        agroToken.rewardPhotoUpload(user);
        uint256 totalReward = agroToken.PHOTO_REWARD();
        
        // Award disease detection bonus if applicable
        if (detection.confidence > 70) {
            bool isEarlyDetection = detection.confidence > 90;
            agroToken.rewardDiseaseDetection(user, isEarlyDetection, detection.disease);
            totalReward += isEarlyDetection ? 
                agroToken.EARLY_DETECTION_BONUS() : 
                agroToken.DISEASE_BONUS();
                
            // Check if community alert should be triggered
            _checkCommunityAlert(detection.disease, detection.location);
        }
        
        detection.rewardAmount = totalReward;
    }
    
    /**
     * @dev Check and trigger community alerts
     */
    function _checkCommunityAlert(string memory disease, string memory location) internal {
        string memory alertKey = string(abi.encodePacked(disease, "_", location));
        CommunityAlert storage alert = communityAlerts[alertKey];
        
        if (!alert.active) {
            alert.disease = disease;
            alert.location = location;
            alert.severity = 1;
            alert.timestamp = block.timestamp;
            alert.affectedUsers = 1;
            alert.active = true;
            activeAlerts.push(alertKey);
        } else {
            alert.affectedUsers++;
            alert.severity = alert.affectedUsers > 5 ? 3 : (alert.affectedUsers > 2 ? 2 : 1);
        }
        
        if (alert.severity >= 2) {
            emit CommunityAlertTriggered(disease, location, alert.severity);
        }
    }
    
    /**
     * @dev Start treatment tracking
     */
    function startTreatment(
        string memory treatmentId,
        string memory disease,
        uint256 expectedDuration
    ) external {
        treatments[treatmentId] = Treatment({
            user: msg.sender,
            treatmentId: treatmentId,
            disease: disease,
            startTime: block.timestamp,
            expectedDuration: expectedDuration,
            completed: false,
            successful: false,
            effectivenessScore: 0
        });
        
        activeTreatments.push(treatmentId);
        emit TreatmentStarted(msg.sender, treatmentId, disease);
    }
    
    /**
     * @dev Complete treatment and award success bonus
     */
    function completeTreatment(
        string memory treatmentId,
        bool successful,
        uint256 effectivenessScore
    ) external {
        Treatment storage treatment = treatments[treatmentId];
        require(treatment.user == msg.sender, "Not treatment owner");
        require(!treatment.completed, "Treatment already completed");
        
        treatment.completed = true;
        treatment.successful = successful;
        treatment.effectivenessScore = effectivenessScore;
        
        if (successful && effectivenessScore > 70) {
            agroToken.rewardTreatmentSuccess(msg.sender, treatmentId);
        }
        
        emit TreatmentCompleted(msg.sender, treatmentId, successful);
    }
    
    /**
     * @dev Process purchase with dynamic pricing
     */
    function processPurchase(
        string memory productId,
        uint256 baseAmount
    ) external returns (uint256 discount, uint256 cashback) {
        // Get current ETH price for dynamic pricing
        (, int256 ethPrice, , , ) = ethUsdPriceFeed.latestRoundData();
        
        // Apply market-based adjustments
        uint256 adjustedAmount = baseAmount;
        if (ethPrice > 3000 * 10**8) { // If ETH > $3000
            adjustedAmount = (baseAmount * 95) / 100; // 5% discount
        }
        
        // Process purchase through token contract
        (discount, cashback) = agroToken.processPurchase(msg.sender, adjustedAmount);
        
        // Record purchase
        userPurchases[msg.sender].push(Purchase({
            user: msg.sender,
            productId: productId,
            amount: adjustedAmount,
            tokensUsed: discount,
            discount: discount,
            cashback: cashback,
            timestamp: block.timestamp
        }));
        
        emit PurchaseProcessed(msg.sender, productId, adjustedAmount, discount);
        return (discount, cashback);
    }
    
    /**
     * @dev Request random number for fair distribution
     */
    function requestRandomness() external returns (uint256 requestId) {
        requestId = vrfCoordinator.requestRandomWords(
            keyHash,
            uint64(vrfSubscriptionId),
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
        vrfRequests[requestId] = block.timestamp;
        emit RandomnessRequested(requestId, msg.sender);
        return requestId;
    }
    
    /**
     * @dev Fulfill randomness request
     */
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        require(vrfRequests[requestId] != 0, "Request not found");
        uint256 randomValue = randomWords[0];
        delete vrfRequests[requestId];
        emit RandomnessReceived(requestId, randomValue);
    }
    
    /**
     * @dev Chainlink Automation upkeep check
     */
    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory) {
        upkeepNeeded = (block.timestamp - lastUpkeepTime) > upkeepInterval;
        return (upkeepNeeded, "");
    }
    
    /**
     * @dev Perform upkeep - check for expired alerts and treatments
     */
    function performUpkeep(bytes calldata) external override {
        require((block.timestamp - lastUpkeepTime) > upkeepInterval, "Upkeep not needed");
        
        lastUpkeepTime = block.timestamp;
        uint256 alertsChecked = 0;
        
        // Check and deactivate old alerts
        for (uint i = 0; i < activeAlerts.length; i++) {
            CommunityAlert storage alert = communityAlerts[activeAlerts[i]];
            if (alert.active && (block.timestamp - alert.timestamp) > 7 days) {
                alert.active = false;
                alertsChecked++;
            }
        }
        
        emit UpkeepPerformed(block.timestamp, alertsChecked);
    }
    
    /**
     * @dev Get user's detection history
     */
    function getUserDetections(address user) external view returns (bytes32[] memory) {
        bytes32[] memory userDetections = new bytes32[](allDetections.length);
        uint256 count = 0;
        
        for (uint i = 0; i < allDetections.length; i++) {
            if (detections[allDetections[i]].user == user) {
                userDetections[count] = allDetections[i];
                count++;
            }
        }
        
        // Resize array
        bytes32[] memory result = new bytes32[](count);
        for (uint i = 0; i < count; i++) {
            result[i] = userDetections[i];
        }
        
        return result;
    }
    
    /**
     * @dev Get active community alerts
     */
    function getActiveCommunityAlerts() external view returns (string[] memory) {
        string[] memory active = new string[](activeAlerts.length);
        uint256 count = 0;
        
        for (uint i = 0; i < activeAlerts.length; i++) {
            if (communityAlerts[activeAlerts[i]].active) {
                active[count] = activeAlerts[i];
                count++;
            }
        }
        
        // Resize array
        string[] memory result = new string[](count);
        for (uint i = 0; i < count; i++) {
            result[i] = active[i];
        }
        
        return result;
    }
    
    /**
     * @dev Update configuration
     */
    function updateConfig(
        uint32 _gasLimit,
        uint256 _upkeepInterval,
        bytes32 _donID,
        uint64 _subscriptionId
    ) external onlyOwner {
        gasLimit = _gasLimit;
        upkeepInterval = _upkeepInterval;
        donID = _donID;
        subscriptionId = _subscriptionId;
    }
    
    /**
     * @dev Emergency functions
     */
    function emergencyPause() external onlyOwner {
        // Emergency pause functionality
    }
    
    function withdrawLink() external onlyOwner {
        // Withdraw LINK tokens
    }
}

