// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title AgroAI Token (AGRO)
 * @dev ERC20 token for the AgroAI agricultural platform
 * Features: Minting, burning, pausing, and reward distribution
 */
contract AgroAIToken is ERC20, ERC20Burnable, Pausable, Ownable, ReentrancyGuard {
    
    // Token configuration
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10**18; // 100 million initial
    
    // Reward rates (in wei, 18 decimals)
    uint256 public constant PHOTO_REWARD = 5 * 10**18;           // 5 AGRO per photo
    uint256 public constant DISEASE_BONUS = 100 * 10**18;        // 100 AGRO for disease detection
    uint256 public constant HEALTHY_BONUS = 20 * 10**18;         // 20 AGRO for healthy plants
    uint256 public constant EARLY_DETECTION_BONUS = 200 * 10**18; // 200 AGRO for early detection
    uint256 public constant REFERRAL_REWARD = 50 * 10**18;       // 50 AGRO per referral
    uint256 public constant TREATMENT_SUCCESS_BONUS = 150 * 10**18; // 150 AGRO for successful treatment
    
    // Purchase system constants
    uint256 public constant DISCOUNT_RATE = 20;  // 20% discount with tokens
    uint256 public constant CASHBACK_RATE = 10;  // 10% cashback in tokens
    
    // User tracking
    mapping(address => uint256) public photoCount;
    mapping(address => uint256) public diseaseDetections;
    mapping(address => uint256) public totalPurchases;
    mapping(address => uint256) public totalSavings;
    mapping(address => uint256) public userTier;
    mapping(address => bool) public hasReferralBonus;
    mapping(address => uint256) public lastActivityTime;
    
    // Tier system
    uint256 public constant TIER_1_THRESHOLD = 100 * 10**18;     // 100 AGRO
    uint256 public constant TIER_2_THRESHOLD = 500 * 10**18;     // 500 AGRO
    uint256 public constant TIER_3_THRESHOLD = 1000 * 10**18;    // 1000 AGRO
    uint256 public constant TIER_4_THRESHOLD = 5000 * 10**18;    // 5000 AGRO
    
    // Authorized contracts
    mapping(address => bool) public authorizedMinters;
    mapping(address => bool) public authorizedBurners;
    
    // Events
    event PhotoRewarded(address indexed user, uint256 reward, uint256 photoNumber);
    event DiseaseDetectionRewarded(address indexed user, uint256 bonus, string disease, bool isEarlyDetection);
    event PurchaseProcessed(address indexed user, uint256 amount, uint256 discount, uint256 cashback);
    event ReferralRewarded(address indexed referrer, address indexed referred, uint256 reward);
    event TierUpdated(address indexed user, uint256 oldTier, uint256 newTier);
    event TreatmentSuccessRewarded(address indexed user, uint256 bonus, string treatmentId);
    event AuthorizedMinterAdded(address indexed minter);
    event AuthorizedMinterRemoved(address indexed minter);
    
    constructor() ERC20("AgroAI Token", "AGRO") {
        _mint(msg.sender, INITIAL_SUPPLY);
        authorizedMinters[msg.sender] = true;
        authorizedBurners[msg.sender] = true;
    }
    
    /**
     * @dev Modifier to check if caller is authorized minter
     */
    modifier onlyAuthorizedMinter() {
        require(authorizedMinters[msg.sender], "Not authorized to mint");
        _;
    }
    
    /**
     * @dev Modifier to check if caller is authorized burner
     */
    modifier onlyAuthorizedBurner() {
        require(authorizedBurners[msg.sender], "Not authorized to burn");
        _;
    }
    
    /**
     * @dev Add authorized minter
     */
    function addAuthorizedMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
        emit AuthorizedMinterAdded(minter);
    }
    
    /**
     * @dev Remove authorized minter
     */
    function removeAuthorizedMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
        emit AuthorizedMinterRemoved(minter);
    }
    
    /**
     * @dev Add authorized burner
     */
    function addAuthorizedBurner(address burner) external onlyOwner {
        authorizedBurners[burner] = true;
    }
    
    /**
     * @dev Remove authorized burner
     */
    function removeAuthorizedBurner(address burner) external onlyOwner {
        authorizedBurners[burner] = false;
    }
    
    /**
     * @dev Reward user for uploading a photo
     */
    function rewardPhotoUpload(address user) external onlyAuthorizedMinter nonReentrant {
        require(user != address(0), "Invalid user address");
        require(totalSupply() + PHOTO_REWARD <= MAX_SUPPLY, "Max supply exceeded");
        
        photoCount[user]++;
        lastActivityTime[user] = block.timestamp;
        
        _mint(user, PHOTO_REWARD);
        _updateUserTier(user);
        
        emit PhotoRewarded(user, PHOTO_REWARD, photoCount[user]);
    }
    
    /**
     * @dev Reward user for disease detection
     */
    function rewardDiseaseDetection(
        address user, 
        bool isEarlyDetection, 
        string memory disease
    ) external onlyAuthorizedMinter nonReentrant {
        require(user != address(0), "Invalid user address");
        
        uint256 bonus = isEarlyDetection ? EARLY_DETECTION_BONUS : DISEASE_BONUS;
        require(totalSupply() + bonus <= MAX_SUPPLY, "Max supply exceeded");
        
        diseaseDetections[user]++;
        lastActivityTime[user] = block.timestamp;
        
        _mint(user, bonus);
        _updateUserTier(user);
        
        emit DiseaseDetectionRewarded(user, bonus, disease, isEarlyDetection);
    }
    
    /**
     * @dev Reward user for healthy plant verification
     */
    function rewardHealthyPlant(address user) external onlyAuthorizedMinter nonReentrant {
        require(user != address(0), "Invalid user address");
        require(totalSupply() + HEALTHY_BONUS <= MAX_SUPPLY, "Max supply exceeded");
        
        lastActivityTime[user] = block.timestamp;
        
        _mint(user, HEALTHY_BONUS);
        _updateUserTier(user);
        
        emit PhotoRewarded(user, HEALTHY_BONUS, photoCount[user]);
    }
    
    /**
     * @dev Process purchase with token discount and cashback
     */
    function processPurchase(
        address user, 
        uint256 purchaseAmount
    ) external onlyAuthorizedMinter nonReentrant returns (uint256 discount, uint256 cashback) {
        require(user != address(0), "Invalid user address");
        require(purchaseAmount > 0, "Invalid purchase amount");
        
        // Calculate discount and cashback
        discount = (purchaseAmount * DISCOUNT_RATE) / 100;
        cashback = (purchaseAmount * CASHBACK_RATE) / 100;
        
        // Apply tier-based multipliers
        uint256 tierMultiplier = _getTierMultiplier(user);
        cashback = (cashback * tierMultiplier) / 100;
        
        // Check if user has enough tokens for discount
        if (balanceOf(user) >= discount) {
            _burn(user, discount);
        } else {
            discount = 0;
        }
        
        // Give cashback
        if (totalSupply() + cashback <= MAX_SUPPLY) {
            _mint(user, cashback);
        }
        
        totalPurchases[user] += purchaseAmount;
        totalSavings[user] += discount;
        lastActivityTime[user] = block.timestamp;
        
        _updateUserTier(user);
        
        emit PurchaseProcessed(user, purchaseAmount, discount, cashback);
        
        return (discount, cashback);
    }
    
    /**
     * @dev Reward referral
     */
    function rewardReferral(address referrer, address referred) external onlyAuthorizedMinter nonReentrant {
        require(referrer != address(0) && referred != address(0), "Invalid addresses");
        require(referrer != referred, "Cannot refer yourself");
        require(!hasReferralBonus[referred], "User already referred");
        require(totalSupply() + REFERRAL_REWARD <= MAX_SUPPLY, "Max supply exceeded");
        
        hasReferralBonus[referred] = true;
        lastActivityTime[referrer] = block.timestamp;
        
        _mint(referrer, REFERRAL_REWARD);
        _updateUserTier(referrer);
        
        emit ReferralRewarded(referrer, referred, REFERRAL_REWARD);
    }
    
    /**
     * @dev Reward successful treatment
     */
    function rewardTreatmentSuccess(
        address user, 
        string memory treatmentId
    ) external onlyAuthorizedMinter nonReentrant {
        require(user != address(0), "Invalid user address");
        require(totalSupply() + TREATMENT_SUCCESS_BONUS <= MAX_SUPPLY, "Max supply exceeded");
        
        lastActivityTime[user] = block.timestamp;
        
        _mint(user, TREATMENT_SUCCESS_BONUS);
        _updateUserTier(user);
        
        emit TreatmentSuccessRewarded(user, TREATMENT_SUCCESS_BONUS, treatmentId);
    }
    
    /**
     * @dev Update user tier based on token balance
     */
    function _updateUserTier(address user) internal {
        uint256 balance = balanceOf(user);
        uint256 oldTier = userTier[user];
        uint256 newTier = 0;
        
        if (balance >= TIER_4_THRESHOLD) {
            newTier = 4;
        } else if (balance >= TIER_3_THRESHOLD) {
            newTier = 3;
        } else if (balance >= TIER_2_THRESHOLD) {
            newTier = 2;
        } else if (balance >= TIER_1_THRESHOLD) {
            newTier = 1;
        }
        
        if (newTier != oldTier) {
            userTier[user] = newTier;
            emit TierUpdated(user, oldTier, newTier);
        }
    }
    
    /**
     * @dev Get tier-based cashback multiplier
     */
    function _getTierMultiplier(address user) internal view returns (uint256) {
        uint256 tier = userTier[user];
        if (tier == 4) return 150; // 50% bonus
        if (tier == 3) return 130; // 30% bonus
        if (tier == 2) return 120; // 20% bonus
        if (tier == 1) return 110; // 10% bonus
        return 100; // No bonus
    }
    
    /**
     * @dev Get user statistics
     */
    function getUserStats(address user) external view returns (
        uint256 tokenBalance,
        uint256 photos,
        uint256 detections,
        uint256 purchases,
        uint256 savings,
        uint256 tier,
        uint256 lastActivity
    ) {
        return (
            balanceOf(user),
            photoCount[user],
            diseaseDetections[user],
            totalPurchases[user],
            totalSavings[user],
            userTier[user],
            lastActivityTime[user]
        );
    }
    
    /**
     * @dev Calculate potential discount for purchase
     */
    function calculateDiscount(address user, uint256 purchaseAmount) external view returns (
        uint256 discountAmount,
        uint256 cashbackAmount,
        bool canAffordDiscount,
        uint256 tierMultiplier
    ) {
        discountAmount = (purchaseAmount * DISCOUNT_RATE) / 100;
        tierMultiplier = _getTierMultiplier(user);
        cashbackAmount = (purchaseAmount * CASHBACK_RATE * tierMultiplier) / 10000;
        canAffordDiscount = balanceOf(user) >= discountAmount;
    }
    
    /**
     * @dev Mint tokens (only authorized)
     */
    function mint(address to, uint256 amount) external onlyAuthorizedMinter {
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(to, amount);
    }
    
    /**
     * @dev Burn tokens from address (only authorized)
     */
    function burnFrom(address account, uint256 amount) public override onlyAuthorizedBurner {
        super.burnFrom(account, amount);
    }
    
    /**
     * @dev Pause token transfers
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Override transfer to include pause functionality
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        super._beforeTokenTransfer(from, to, amount);
        require(!paused(), "Token transfers paused");
    }
    
    /**
     * @dev Emergency withdrawal (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    /**
     * @dev Get contract information
     */
    function getContractInfo() external view returns (
        uint256 totalSupply_,
        uint256 maxSupply,
        uint256 photoReward,
        uint256 diseaseBonus,
        uint256 discountRate,
        uint256 cashbackRate
    ) {
        return (
            totalSupply(),
            MAX_SUPPLY,
            PHOTO_REWARD,
            DISEASE_BONUS,
            DISCOUNT_RATE,
            CASHBACK_RATE
        );
    }
}

