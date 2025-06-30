/**
 * AgroAI Web3 Frontend Integration
 * Seamlessly integrates blockchain features with your existing beautiful UI
 */

// Configuration
const AGROAI_CONFIG = {
    // Will be populated from backend config
    contracts: {
        token: "",
        core: ""
    },
    network: {
        name: "sepolia",
        chainId: 11155111,
        rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
    },
    rewards: {
        photo: 5,
        disease: 100,
        earlyDetection: 200,
        healthy: 20,
        referral: 50,
        treatmentSuccess: 150
    },
    purchase: {
        discountRate: 20,
        cashbackRate: 10
    }
};

// Global variables
let web3;
let userAccount;
let tokenContract;
let coreContract;
let isConnected = false;
let userStats = {};

// Contract ABIs (simplified - load full ABIs from config)
const TOKEN_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function getUserStats(address user) view returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256)",
    "function calculateDiscount(address user, uint256 purchaseAmount) view returns (uint256, uint256, bool, uint256)",
    "event PhotoRewarded(address indexed user, uint256 reward, uint256 photoNumber)",
    "event DiseaseDetectionRewarded(address indexed user, uint256 bonus, string disease, bool isEarlyDetection)",
    "event PurchaseProcessed(address indexed user, uint256 amount, uint256 discount, uint256 cashback)"
];

const CORE_ABI = [
    "function requestPhotoAnalysis(string backendUrl, string ipfsHash, string cropType, string location, string latitude, string longitude) returns (bytes32)",
    "function getUserDetections(address user) view returns (bytes32[])",
    "function getActiveCommunityAlerts() view returns (string[])"
];

/**
 * Initialize Web3 and load configuration
 */
async function initializeAgroAI() {
    try {
        console.log("🚀 Initializing AgroAI Web3 integration...");
        
        // Load configuration from backend
        await loadConfiguration();
        
        // Check if MetaMask is available
        if (typeof window.ethereum !== 'undefined') {
            web3 = new Web3(window.ethereum);
            
            // Initialize contracts
            if (AGROAI_CONFIG.contracts.token && AGROAI_CONFIG.contracts.core) {
                tokenContract = new web3.eth.Contract(TOKEN_ABI, AGROAI_CONFIG.contracts.token);
                coreContract = new web3.eth.Contract(CORE_ABI, AGROAI_CONFIG.contracts.core);
            }
            
            // Check if already connected
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                userAccount = accounts[0];
                isConnected = true;
                await updateUserInterface();
            }
            
            // Listen for account changes
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);
            
            console.log("✅ AgroAI Web3 integration initialized");
        } else {
            console.log("⚠️ MetaMask not detected");
            showNotification("MetaMask not detected. Install MetaMask to earn tokens!", "warning");
        }
        
    } catch (error) {
        console.error("❌ Failed to initialize Web3:", error);
    }
}

/**
 * Load configuration from backend
 */
async function loadConfiguration() {
    try {
        const response = await fetch('/api/blockchain-config');
        if (response.ok) {
            const config = await response.json();
            Object.assign(AGROAI_CONFIG, config);
        }
    } catch (error) {
        console.warn("Failed to load blockchain config:", error);
    }
}

/**
 * Connect wallet
 */
async function connectWallet() {
    try {
        if (!window.ethereum) {
            showNotification("Please install MetaMask to connect your wallet!", "error");
            window.open("https://metamask.io/download/", "_blank");
            return false;
        }
        
        showLoadingState("Connecting wallet...");
        
        // Request account access
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        
        userAccount = accounts[0];
        isConnected = true;
        
        // Check network
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (parseInt(chainId, 16) !== AGROAI_CONFIG.network.chainId) {
            await switchToCorrectNetwork();
        }
        
        // Update UI
        await updateUserInterface();
        
        hideLoadingState();
        showNotification("Wallet connected successfully! 🎉", "success");
        
        // Track connection event
        trackEvent('wallet_connected', { address: userAccount });
        
        return true;
        
    } catch (error) {
        console.error('Error connecting wallet:', error);
        hideLoadingState();
        showNotification("Failed to connect wallet: " + error.message, "error");
        return false;
    }
}

/**
 * Switch to correct network
 */
async function switchToCorrectNetwork() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x' + AGROAI_CONFIG.network.chainId.toString(16) }],
        });
    } catch (switchError) {
        // Network doesn't exist, add it
        if (switchError.code === 4902) {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: '0x' + AGROAI_CONFIG.network.chainId.toString(16),
                    chainName: 'Sepolia Test Network',
                    nativeCurrency: {
                        name: 'ETH',
                        symbol: 'ETH',
                        decimals: 18
                    },
                    rpcUrls: [AGROAI_CONFIG.network.rpcUrl],
                    blockExplorerUrls: ['https://sepolia.etherscan.io/']
                }]
            });
        }
    }
}

/**
 * Update user interface with wallet info
 */
async function updateUserInterface() {
    if (!isConnected || !userAccount) return;
    
    try {
        // Update wallet display
        updateWalletDisplay();
        
        // Load user stats
        await loadUserStats();
        
        // Update token balance
        await updateTokenBalance();
        
        // Show blockchain features
        showBlockchainFeatures();
        
    } catch (error) {
        console.error("Error updating UI:", error);
    }
}

/**
 * Update wallet display
 */
function updateWalletDisplay() {
    const connectBtn = document.getElementById('connectWallet');
    const walletInfo = document.getElementById('walletInfo');
    const walletAddress = document.getElementById('walletAddress');
    
    if (connectBtn) connectBtn.style.display = 'none';
    if (walletInfo) walletInfo.style.display = 'block';
    if (walletAddress) {
        walletAddress.textContent = `${userAccount.substring(0, 6)}...${userAccount.substring(38)}`;
    }
    
    // Add wallet info to existing UI if elements don't exist
    if (!walletInfo) {
        addWalletUIToExistingPage();
    }
}

/**
 * Load user statistics from blockchain
 */
async function loadUserStats() {
    if (!tokenContract || !userAccount) return;
    
    try {
        const stats = await tokenContract.methods.getUserStats(userAccount).call();
        
        userStats = {
            tokenBalance: web3.utils.fromWei(stats[0], 'ether'),
            photoCount: parseInt(stats[1]),
            diseaseDetections: parseInt(stats[2]),
            totalPurchases: web3.utils.fromWei(stats[3], 'ether'),
            totalSavings: web3.utils.fromWei(stats[4], 'ether'),
            userTier: parseInt(stats[5]),
            lastActivity: parseInt(stats[6])
        };
        
        updateStatsDisplay();
        
    } catch (error) {
        console.error("Error loading user stats:", error);
    }
}

/**
 * Update token balance display
 */
async function updateTokenBalance() {
    if (!tokenContract || !userAccount) return;
    
    try {
        const balance = await tokenContract.methods.balanceOf(userAccount).call();
        const balanceInEther = parseFloat(web3.utils.fromWei(balance, 'ether'));
        
        const tokenBalanceElement = document.getElementById('tokenBalance');
        if (tokenBalanceElement) {
            tokenBalanceElement.textContent = balanceInEther.toFixed(2);
        }
        
        // Update user stats
        userStats.tokenBalance = balanceInEther;
        updateStatsDisplay();
        
    } catch (error) {
        console.error("Error updating token balance:", error);
    }
}

/**
 * Update stats display
 */
function updateStatsDisplay() {
    const elements = {
        photoCount: document.getElementById('photoCount'),
        detectionCount: document.getElementById('detectionCount'),
        userTier: document.getElementById('userTier'),
        totalSavings: document.getElementById('totalSavings')
    };
    
    if (elements.photoCount) elements.photoCount.textContent = userStats.photoCount || 0;
    if (elements.detectionCount) elements.detectionCount.textContent = userStats.diseaseDetections || 0;
    if (elements.userTier) elements.userTier.textContent = userStats.userTier || 0;
    if (elements.totalSavings) elements.totalSavings.textContent = `$${(userStats.totalSavings || 0).toFixed(2)}`;
}

/**
 * Enhanced photo upload with blockchain rewards
 */
async function uploadPhotoWithBlockchain(fileInput, cropType = "unknown", location = "unknown") {
    try {
        if (!fileInput.files || !fileInput.files[0]) {
            showNotification("Please select a file first", "error");
            return;
        }
        
        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('crop_type', cropType);
        formData.append('location', location);
        
        // Add wallet address if connected
        if (isConnected && userAccount) {
            formData.append('wallet_address', userAccount);
            
            // Get user's location if available
            if (navigator.geolocation) {
                const position = await getCurrentPosition();
                formData.append('latitude', position.coords.latitude.toString());
                formData.append('longitude', position.coords.longitude.toString());
            }
        }
        
        showLoadingState("Analyzing image and processing blockchain rewards...");
        
        // Call enhanced detection endpoint
        const response = await fetch('/api/detect-enhanced', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Display AI results (your existing function)
            displayDetectionResults(result);
            
            // Handle blockchain rewards
            if (result.blockchain && isConnected) {
                await handleBlockchainRewards(result.blockchain);
            }
            
            // Track analytics
            trackEvent('photo_analyzed', {
                disease: result.disease,
                confidence: result.confidence,
                rewards_earned: result.blockchain?.rewards?.total_reward || 0
            });
            
        } else {
            showNotification("Analysis failed: " + result.error, "error");
        }
        
        hideLoadingState();
        
    } catch (error) {
        console.error('Error uploading photo:', error);
        hideLoadingState();
        showNotification("Upload failed: " + error.message, "error");
    }
}

/**
 * Handle blockchain rewards from detection
 */
async function handleBlockchainRewards(blockchainData) {
    try {
        const rewards = blockchainData.rewards;
        
        if (rewards && rewards.total_reward > 0) {
            // Show reward notification
            showRewardNotification(`🎉 +${rewards.total_reward} AGRO earned!`, rewards);
            
            // Update balance after a delay
            setTimeout(async () => {
                await updateTokenBalance();
            }, 3000);
        }
        
        // Handle community alerts
        if (blockchainData.community_alert && blockchainData.community_alert.should_alert) {
            showCommunityAlert(blockchainData.community_alert);
        }
        
        // Show Chainlink verification status
        if (blockchainData.chainlink_verification) {
            showChainlinkVerification(blockchainData.chainlink_verification);
        }
        
    } catch (error) {
        console.error("Error handling blockchain rewards:", error);
    }
}

/**
 * Process purchase with token discounts
 */
async function processPurchaseWithTokens(productId, price, productName) {
    if (!isConnected || !userAccount) {
        const shouldConnect = confirm("Connect wallet to earn tokens and get discounts?");
        if (shouldConnect) {
            const connected = await connectWallet();
            if (!connected) return;
        } else {
            // Proceed with regular purchase
            return processRegularPurchase(productId, price);
        }
    }
    
    try {
        showLoadingState("Calculating discounts...");
        
        // Calculate potential discount
        const discountResponse = await fetch('/api/calculate-discount', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                wallet_address: userAccount,
                purchase_amount: price
            })
        });
        
        const discountData = await discountResponse.json();
        const discountInfo = discountData.discount_info;
        
        hideLoadingState();
        
        // Show purchase options
        const purchaseOptions = createPurchaseOptionsModal(productName, price, discountInfo);
        document.body.appendChild(purchaseOptions);
        
    } catch (error) {
        console.error('Error processing purchase:', error);
        hideLoadingState();
        showNotification("Error calculating discount: " + error.message, "error");
    }
}

/**
 * Create purchase options modal
 */
function createPurchaseOptionsModal(productName, price, discountInfo) {
    const modal = document.createElement('div');
    modal.className = 'purchase-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Purchase ${productName}</h3>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <div class="purchase-option">
                    <h4>💰 Pay with Tokens (Best Deal!)</h4>
                    <p>Original Price: $${price.toFixed(2)}</p>
                    ${discountInfo.can_afford_discount ? `
                        <p class="discount">Discount: -$${discountInfo.discount_amount.toFixed(2)} (20%)</p>
                        <p class="final-price">Final Price: $${(price - discountInfo.discount_amount).toFixed(2)}</p>
                    ` : `
                        <p class="no-discount">Insufficient tokens for discount</p>
                        <p class="final-price">Price: $${price.toFixed(2)}</p>
                    `}
                    <p class="cashback">+ ${discountInfo.cashback_amount.toFixed(2)} AGRO cashback</p>
                    <button class="btn btn-primary" onclick="confirmPurchase('${productName}', ${price}, true)">
                        Purchase with Tokens
                    </button>
                </div>
                <div class="purchase-option">
                    <h4>💳 Pay with Fiat</h4>
                    <p>Price: $${price.toFixed(2)}</p>
                    <p class="cashback">+ ${(discountInfo.cashback_amount * 0.5).toFixed(2)} AGRO cashback</p>
                    <button class="btn btn-secondary" onclick="confirmPurchase('${productName}', ${price}, false)">
                        Purchase with Fiat
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add event listeners
    modal.querySelector('.close-modal').onclick = () => modal.remove();
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
    
    return modal;
}

/**
 * Confirm purchase
 */
async function confirmPurchase(productName, price, useTokens) {
    try {
        // Remove modal
        document.querySelector('.purchase-modal')?.remove();
        
        showLoadingState("Processing purchase...");
        
        const response = await fetch('/api/process-purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                wallet_address: userAccount,
                purchase_amount: price,
                product_id: productName,
                use_tokens: useTokens
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            const purchaseResult = result.purchase_result;
            
            // Show success notification
            showPurchaseSuccess(productName, purchaseResult);
            
            // Update balance
            setTimeout(async () => {
                await updateTokenBalance();
            }, 2000);
            
            // Track purchase
            trackEvent('purchase_completed', {
                product: productName,
                amount: price,
                discount: purchaseResult.discount_applied || 0,
                cashback: purchaseResult.cashback_earned || 0,
                used_tokens: useTokens
            });
            
        } else {
            showNotification("Purchase failed: " + result.error, "error");
        }
        
        hideLoadingState();
        
    } catch (error) {
        console.error('Error confirming purchase:', error);
        hideLoadingState();
        showNotification("Purchase failed: " + error.message, "error");
    }
}

/**
 * Show reward notification
 */
function showRewardNotification(message, rewardDetails) {
    const notification = document.createElement('div');
    notification.className = 'reward-notification';
    notification.innerHTML = `
        <div class="reward-content">
            <div class="reward-icon">🎉</div>
            <div class="reward-text">
                <h4>${message}</h4>
                ${rewardDetails ? `
                    <div class="reward-breakdown">
                        <p>📸 Photo: +${rewardDetails.base_reward} AGRO</p>
                        ${rewardDetails.bonus_reward > 20 ? `
                            <p>🔬 Detection: +${rewardDetails.bonus_reward} AGRO</p>
                        ` : ''}
                        ${rewardDetails.is_early_detection ? `
                            <p>⚡ Early Detection Bonus!</p>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(45deg, #4CAF50, #45a049);
        color: white;
        padding: 20px;
        border-radius: 15px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        z-index: 1000;
        animation: slideInRight 0.5s ease-out;
        max-width: 350px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease-in';
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}

/**
 * Show community alert
 */
function showCommunityAlert(alertData) {
    const alert = document.createElement('div');
    alert.className = 'community-alert';
    alert.innerHTML = `
        <div class="alert-content">
            <div class="alert-icon">⚠️</div>
            <div class="alert-text">
                <h4>Community Alert</h4>
                <p><strong>${alertData.disease}</strong> detected in ${alertData.location}</p>
                <p>Severity: ${alertData.severity}/3</p>
                <p>Check your crops and consider preventive measures</p>
            </div>
        </div>
    `;
    
    alert.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(45deg, #ff9800, #f57c00);
        color: white;
        padding: 20px;
        border-radius: 15px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        z-index: 1001;
        animation: slideInRight 0.5s ease-out;
        max-width: 350px;
    `;
    
    document.body.appendChild(alert);
    
    setTimeout(() => alert.remove(), 8000);
}

/**
 * Add wallet UI to existing page
 */
function addWalletUIToExistingPage() {
    const walletUI = document.createElement('div');
    walletUI.className = 'agroai-wallet-widget';
    walletUI.innerHTML = `
        <div class="wallet-widget">
            <button id="connectWallet" class="connect-btn">
                🔗 Connect Wallet
            </button>
            <div id="walletInfo" class="wallet-info" style="display: none;">
                <div class="wallet-header">
                    <span id="walletAddress" class="wallet-address"></span>
                    <span id="tokenBalance" class="token-balance">0</span> AGRO
                </div>
                <div class="wallet-stats">
                    <div class="stat">
                        <span class="stat-label">Photos:</span>
                        <span id="photoCount" class="stat-value">0</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Detections:</span>
                        <span id="detectionCount" class="stat-value">0</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Tier:</span>
                        <span id="userTier" class="stat-value">0</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    walletUI.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 100;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    document.body.appendChild(walletUI);
    
    // Add event listener
    document.getElementById('connectWallet').onclick = connectWallet;
}

/**
 * Show blockchain features
 */
function showBlockchainFeatures() {
    // Add blockchain indicators to existing UI elements
    const existingButtons = document.querySelectorAll('button, .btn');
    existingButtons.forEach(button => {
        if (button.textContent.includes('Upload') || button.textContent.includes('Analyze')) {
            button.innerHTML += ' 🪙';
            button.title = 'Earn AGRO tokens for analysis!';
        }
        if (button.textContent.includes('Buy') || button.textContent.includes('Purchase')) {
            button.innerHTML += ' 💰';
            button.title = 'Get discounts with AGRO tokens!';
        }
    });
}

/**
 * Event handlers
 */
function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // User disconnected
        isConnected = false;
        userAccount = null;
        updateUserInterface();
    } else {
        // User switched accounts
        userAccount = accounts[0];
        updateUserInterface();
    }
}

function handleChainChanged(chainId) {
    // Reload page on network change
    window.location.reload();
}

/**
 * Utility functions
 */
function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

function showLoadingState(message) {
    const loader = document.createElement('div');
    loader.id = 'agroai-loader';
    loader.innerHTML = `
        <div class="loader-overlay">
            <div class="loader-content">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        </div>
    `;
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
    `;
    document.body.appendChild(loader);
}

function hideLoadingState() {
    const loader = document.getElementById('agroai-loader');
    if (loader) loader.remove();
}

function showNotification(message, type = "info") {
    const colors = {
        success: "#4CAF50",
        error: "#f44336",
        info: "#2196F3",
        warning: "#ff9800"
    };
    
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${colors[type]};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 1001;
        animation: slideInDown 0.3s ease-out;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 4000);
}

function trackEvent(eventName, properties) {
    // Implement analytics tracking
    console.log('Event:', eventName, properties);
}

// CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes slideInDown {
        from { transform: translate(-50%, -100%); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
    }
    
    .spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #4CAF50;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 0 auto 15px;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .wallet-widget {
        background: white;
        border-radius: 15px;
        padding: 15px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        min-width: 250px;
    }
    
    .connect-btn {
        background: linear-gradient(45deg, #4CAF50, #45a049);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
        width: 100%;
    }
    
    .wallet-info {
        text-align: left;
    }
    
    .wallet-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        font-weight: bold;
    }
    
    .wallet-stats {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 10px;
        font-size: 12px;
    }
    
    .stat {
        text-align: center;
    }
    
    .stat-label {
        display: block;
        color: #666;
    }
    
    .stat-value {
        display: block;
        font-weight: bold;
        color: #4CAF50;
    }
    
    .purchase-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
    }
    
    .modal-content {
        background: white;
        border-radius: 15px;
        padding: 30px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        border-bottom: 1px solid #eee;
        padding-bottom: 15px;
    }
    
    .close-modal {
        font-size: 24px;
        cursor: pointer;
        color: #999;
    }
    
    .purchase-option {
        border: 2px solid #eee;
        border-radius: 10px;
        padding: 20px;
        margin-bottom: 15px;
        transition: border-color 0.3s;
    }
    
    .purchase-option:hover {
        border-color: #4CAF50;
    }
    
    .discount {
        color: #4CAF50;
        font-weight: bold;
    }
    
    .cashback {
        color: #2196F3;
        font-weight: bold;
    }
    
    .final-price {
        font-size: 18px;
        font-weight: bold;
        color: #333;
    }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAgroAI);
} else {
    initializeAgroAI();
}

// Export functions for global use
window.AgroAI = {
    connectWallet,
    uploadPhotoWithBlockchain,
    processPurchaseWithTokens,
    updateTokenBalance,
    showRewardNotification,
    showNotification,
    isConnected: () => isConnected,
    getUserAccount: () => userAccount,
    getUserStats: () => userStats
};

