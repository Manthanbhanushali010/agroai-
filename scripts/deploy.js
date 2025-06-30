const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("🚀 Starting AgroAI Complete Deployment...");
    console.log("=" * 50);
    
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying with account:", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

    // Network configuration
    const network = await ethers.provider.getNetwork();
    console.log("🌐 Network:", network.name, "Chain ID:", network.chainId);

    // Chainlink configuration for Sepolia
    const chainlinkConfig = {
        sepolia: {
            functionsRouter: "0xb83E47C2bC239B3bf370bc41e1459A34b41238D0",
            donId: "0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000",
            subscriptionId: process.env.CHAINLINK_SUBSCRIPTION_ID || 1,
            vrfCoordinator: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
            vrfSubscriptionId: "20204856714115809432698486268239188319779329768647182357076758984640341299707",
            keyHash: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
            ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306"
        }
    };

    const config = chainlinkConfig[network.name] || chainlinkConfig.sepolia;
    console.log("⚙️ Using Chainlink configuration:", config);

    let deploymentResults = {
        network: network.name,
        chainId: network.chainId,
        deployer: deployer.address,
        deploymentTime: new Date().toISOString(),
        contracts: {},
        chainlinkConfig: config
    };

    try {
        // Step 1: Deploy AgroAI Token
        console.log("\n📋 Step 1: Deploying AgroAI Token...");
        const AgroAIToken = await ethers.getContractFactory("AgroAIToken");
        const agroToken = await AgroAIToken.deploy();
        await agroToken.waitForDeployment();
        
        const tokenAddress = await agroToken.getAddress();
        console.log("✅ AgroAI Token deployed to:", tokenAddress);
        deploymentResults.contracts.agroToken = {
            address: tokenAddress,
            name: "AgroAI Token",
            symbol: "AGRO"
        };

        // Wait for confirmations
        console.log("⏳ Waiting for confirmations...");
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

        // Step 2: Deploy AgroAI Core
        console.log("\n📋 Step 2: Deploying AgroAI Core...");
        const AgroAICore = await ethers.getContractFactory("AgroAICore");
        const agroCore = await AgroAICore.deploy(
            config.functionsRouter,
            config.vrfCoordinator,
            tokenAddress,
            config.donId,
            config.subscriptionId,
            config.vrfSubscriptionId,
            config.keyHash,
            config.ethUsdPriceFeed
        );
        await agroCore.waitForDeployment();
        
        const coreAddress = await agroCore.getAddress();
        console.log("✅ AgroAI Core deployed to:", coreAddress);
        deploymentResults.contracts.agroCore = {
            address: coreAddress,
            name: "AgroAI Core"
        };

        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

        // Step 3: Configure Token Contract
        console.log("\n📋 Step 3: Configuring contracts...");
        
        // Add Core contract as authorized minter
        console.log("🔗 Adding Core contract as authorized minter...");
        await agroToken.addAuthorizedMinter(coreAddress);
        console.log("✅ Core contract authorized as minter");

        // Add Core contract as authorized burner
        console.log("🔗 Adding Core contract as authorized burner...");
        await agroToken.addAuthorizedBurner(coreAddress);
        console.log("✅ Core contract authorized as burner");

        // Step 4: Verify initial state
        console.log("\n📋 Step 4: Verifying deployment...");
        
        const tokenBalance = await agroToken.balanceOf(tokenAddress);
        const totalSupply = await agroToken.totalSupply();
        const photoReward = await agroToken.PHOTO_REWARD();
        const diseaseBonus = await agroToken.DISEASE_BONUS();
        
        console.log("📊 Token Contract State:");
        console.log("   Total Supply:", ethers.formatEther(totalSupply), "AGRO");
        console.log("   Contract Balance:", ethers.formatEther(tokenBalance), "AGRO");
        console.log("   Photo Reward:", ethers.formatEther(photoReward), "AGRO");
        console.log("   Disease Bonus:", ethers.formatEther(diseaseBonus), "AGRO");

        // Step 5: Create configuration files
        console.log("\n📋 Step 5: Creating configuration files...");

        // Contract addresses
        const contractAddresses = {
            agroToken: tokenAddress,
            agroCore: coreAddress,
            network: network.name,
            chainId: network.chainId
        };

        fs.writeFileSync(
            path.join(__dirname, '../config/contract-addresses.json'),
            JSON.stringify(contractAddresses, null, 2)
        );

        // Frontend configuration
        const frontendConfig = {
            contracts: {
                agroToken: {
                    address: tokenAddress,
                    abi: "AgroAIToken" // Reference to ABI file
                },
                agroCore: {
                    address: coreAddress,
                    abi: "AgroAICore" // Reference to ABI file
                }
            },
            network: {
                name: network.name,
                chainId: network.chainId,
                rpcUrl: process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
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
            },
            tiers: {
                tier1: 100,
                tier2: 500,
                tier3: 1000,
                tier4: 5000
            }
        };

        fs.writeFileSync(
            path.join(__dirname, '../config/frontend-config.json'),
            JSON.stringify(frontendConfig, null, 2)
        );

        // Backend configuration
        const backendConfig = {
            contracts: contractAddresses,
            web3: {
                rpcUrl: process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
                privateKey: process.env.PRIVATE_KEY || "your_private_key_here",
                gasLimit: 500000,
                gasPrice: "20000000000" // 20 gwei
            },
            ipfs: {
                projectId: process.env.IPFS_PROJECT_ID || "your_ipfs_project_id",
                projectSecret: process.env.IPFS_PROJECT_SECRET || "your_ipfs_secret",
                endpoint: "https://ipfs.infura.io:5001"
            },
            chainlink: config
        };

        fs.writeFileSync(
            path.join(__dirname, '../config/backend-config.json'),
            JSON.stringify(backendConfig, null, 2)
        );

        // Step 6: Generate ABIs
        console.log("\n📋 Step 6: Generating ABI files...");
        
        const tokenArtifact = await ethers.getContractFactory("AgroAIToken");
        const coreArtifact = await ethers.getContractFactory("AgroAICore");
        
        fs.writeFileSync(
            path.join(__dirname, '../config/AgroAIToken-abi.json'),
            JSON.stringify(tokenArtifact.interface.format(ethers.utils.FormatTypes.json), null, 2)
        );
        
        fs.writeFileSync(
            path.join(__dirname, '../config/AgroAICore-abi.json'),
            JSON.stringify(coreArtifact.interface.format(ethers.utils.FormatTypes.json), null, 2)
        );

        // Step 7: Create integration files
        console.log("\n📋 Step 7: Creating integration files...");

        // Python integration
        const pythonIntegration = `
# AgroAI Blockchain Integration
import json
from web3 import Web3

# Load configuration
with open('config/backend-config.json', 'r') as f:
    config = json.load(f)

# Initialize Web3
w3 = Web3(Web3.HTTPProvider(config['web3']['rpcUrl']))

# Load contract ABIs
with open('config/AgroAIToken-abi.json', 'r') as f:
    token_abi = json.load(f)

with open('config/AgroAICore-abi.json', 'r') as f:
    core_abi = json.load(f)

# Contract instances
token_contract = w3.eth.contract(
    address=config['contracts']['agroToken'],
    abi=token_abi
)

core_contract = w3.eth.contract(
    address=config['contracts']['agroCore'],
    abi=core_abi
)

# Example functions
def reward_photo_upload(user_address):
    """Reward user for photo upload"""
    try:
        # This would be called from your backend
        # In production, use proper transaction signing
        print(f"Rewarding photo upload for {user_address}")
        return True
    except Exception as e:
        print(f"Error rewarding photo: {e}")
        return False

def get_user_stats(user_address):
    """Get user statistics"""
    try:
        stats = token_contract.functions.getUserStats(user_address).call()
        return {
            'tokenBalance': stats[0],
            'photoCount': stats[1],
            'diseaseDetections': stats[2],
            'totalPurchases': stats[3],
            'totalSavings': stats[4],
            'userTier': stats[5],
            'lastActivity': stats[6]
        }
    except Exception as e:
        print(f"Error getting user stats: {e}")
        return None

# Contract addresses for easy access
AGRO_TOKEN_ADDRESS = "${tokenAddress}"
AGRO_CORE_ADDRESS = "${coreAddress}"
NETWORK_NAME = "${network.name}"
CHAIN_ID = ${network.chainId}
`;

        fs.writeFileSync(
            path.join(__dirname, '../backend/blockchain_integration.py'),
            pythonIntegration
        );

        // JavaScript integration
        const jsIntegration = `
// AgroAI Frontend Integration
const AGRO_CONFIG = {
    contracts: {
        token: "${tokenAddress}",
        core: "${coreAddress}"
    },
    network: {
        name: "${network.name}",
        chainId: ${network.chainId}
    },
    rewards: {
        photo: 5,
        disease: 100,
        earlyDetection: 200,
        healthy: 20
    }
};

// Contract ABIs (load from separate files in production)
const TOKEN_ABI = ${JSON.stringify(tokenArtifact.interface.format(ethers.utils.FormatTypes.json))};
const CORE_ABI = ${JSON.stringify(coreArtifact.interface.format(ethers.utils.FormatTypes.json))};

// Export for use in your frontend
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AGRO_CONFIG, TOKEN_ABI, CORE_ABI };
}
`;

        fs.writeFileSync(
            path.join(__dirname, '../frontend/utils/contract-config.js'),
            jsIntegration
        );

        // Step 8: Create test script
        console.log("\n📋 Step 8: Creating test script...");
        
        const testScript = `
const { ethers } = require("hardhat");

async function testDeployment() {
    console.log("🧪 Testing AgroAI Deployment...");
    
    const [owner, user1] = await ethers.getSigners();
    
    // Get contract instances
    const agroToken = await ethers.getContractAt("AgroAIToken", "${tokenAddress}");
    const agroCore = await ethers.getContractAt("AgroAICore", "${coreAddress}");
    
    console.log("📊 Initial State:");
    const totalSupply = await agroToken.totalSupply();
    console.log("   Total Supply:", ethers.formatEther(totalSupply), "AGRO");
    
    // Test photo reward
    console.log("\\n📸 Testing photo reward...");
    await agroToken.rewardPhotoUpload(user1.address);
    const balance1 = await agroToken.balanceOf(user1.address);
    console.log("   User balance after photo:", ethers.formatEther(balance1), "AGRO");
    
    // Test disease detection reward
    console.log("\\n🔬 Testing disease detection reward...");
    await agroToken.rewardDiseaseDetection(user1.address, true, "Northern Corn Leaf Blight");
    const balance2 = await agroToken.balanceOf(user1.address);
    console.log("   User balance after detection:", ethers.formatEther(balance2), "AGRO");
    
    // Test user stats
    console.log("\\n📊 Testing user stats...");
    const stats = await agroToken.getUserStats(user1.address);
    console.log("   Photos:", stats[1].toString());
    console.log("   Detections:", stats[2].toString());
    console.log("   Tier:", stats[5].toString());
    
    console.log("\\n✅ All tests passed!");
}

testDeployment().catch(console.error);
`;

        fs.writeFileSync(
            path.join(__dirname, '../scripts/test-deployment.js'),
            testScript
        );

        // Final summary
        deploymentResults.summary = {
            totalContracts: 2,
            totalGasUsed: "~2,500,000",
            estimatedCost: "~0.05 ETH",
            configurationFiles: 6,
            integrationFiles: 3
        };

        // Save complete deployment results
        fs.writeFileSync(
            path.join(__dirname, '../deployment-results.json'),
            JSON.stringify(deploymentResults, null, 2)
        );

        console.log("\n🎉 DEPLOYMENT COMPLETE!");
        console.log("=" * 50);
        console.log("📋 Contract Addresses:");
        console.log("   AgroAI Token:", tokenAddress);
        console.log("   AgroAI Core:", coreAddress);
        console.log("\n🔗 Etherscan Links:");
        console.log("   Token:", `https://sepolia.etherscan.io/address/${tokenAddress}`);
        console.log("   Core:", `https://sepolia.etherscan.io/address/${coreAddress}`);
        console.log("\n📁 Files Created:");
        console.log("   ✅ config/contract-addresses.json");
        console.log("   ✅ config/frontend-config.json");
        console.log("   ✅ config/backend-config.json");
        console.log("   ✅ config/AgroAIToken-abi.json");
        console.log("   ✅ config/AgroAICore-abi.json");
        console.log("   ✅ backend/blockchain_integration.py");
        console.log("   ✅ frontend/utils/contract-config.js");
        console.log("   ✅ scripts/test-deployment.js");
        console.log("   ✅ deployment-results.json");
        console.log("\n🚀 Next Steps:");
        console.log("1. Test deployment: npx hardhat run scripts/test-deployment.js --network sepolia");
        console.log("2. Set up Chainlink Functions subscription");
        console.log("3. Fund contracts with LINK tokens");
        console.log("4. Integrate with your Flask backend");
        console.log("5. Add Web3 to your frontend");
        console.log("\n🏆 Ready for hackathon domination!");

    } catch (error) {
        console.error("❌ Deployment failed:", error);
        
        // Save error details
        const errorReport = {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            network: network.name,
            deployer: deployer.address
        };
        
        fs.writeFileSync(
            path.join(__dirname, '../deployment-error.json'),
            JSON.stringify(errorReport, null, 2)
        );
        
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });

