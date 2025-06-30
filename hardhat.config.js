require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("solidity-coverage");
require("dotenv").config();

// Ensure required environment variables are set
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/YOUR_INFURA_KEY";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "YOUR_ETHERSCAN_API_KEY";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  
  networks: {
    hardhat: {
      chainId: 31337,
      gas: 12000000,
      blockGasLimit: 12000000,
      allowUnlimitedContractSize: true,
      timeout: 1800000,
      accounts: {
        count: 20,
        accountsBalance: "10000000000000000000000", // 10,000 ETH
      },
    },
    
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      gas: 12000000,
      blockGasLimit: 12000000,
      allowUnlimitedContractSize: true,
    },
    
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: PRIVATE_KEY !== "0x0000000000000000000000000000000000000000000000000000000000000000" ? [PRIVATE_KEY] : [],
      chainId: 11155111,
      gas: 6000000,
      gasPrice: 20000000000, // 20 gwei
      timeout: 300000, // 5 minutes
      confirmations: 2,
    },
    
    polygon: {
      url: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
      accounts: PRIVATE_KEY !== "0x0000000000000000000000000000000000000000000000000000000000000000" ? [PRIVATE_KEY] : [],
      chainId: 137,
      gas: 6000000,
      gasPrice: 30000000000, // 30 gwei
    },
    
    mumbai: {
      url: process.env.MUMBAI_RPC_URL || "https://rpc-mumbai.maticvigil.com",
      accounts: PRIVATE_KEY !== "0x0000000000000000000000000000000000000000000000000000000000000000" ? [PRIVATE_KEY] : [],
      chainId: 80001,
      gas: 6000000,
      gasPrice: 20000000000, // 20 gwei
    },
  },
  
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
      polygon: process.env.POLYGONSCAN_API_KEY || ETHERSCAN_API_KEY,
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || ETHERSCAN_API_KEY,
    },
  },
  
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    gasPrice: 20,
    coinmarketcap: COINMARKETCAP_API_KEY,
    token: "ETH",
    gasPriceApi: "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
    showTimeSpent: true,
    showMethodSig: true,
    maxMethodDiff: 10,
    excludeContracts: ["Migrations"],
    src: "./contracts",
    outputFile: "./gas-report.txt",
    noColors: false,
  },
  
  contractSizer: {
    alphaSort: true,
    runOnCompile: process.env.CONTRACT_SIZE !== undefined,
    disambiguatePaths: false,
    strict: true,
    only: [],
    except: [],
  },
  
  mocha: {
    timeout: 300000, // 5 minutes
    bail: false,
    allowUncaught: false,
    reporter: "spec",
    slow: 10000,
  },
  
  paths: {
    sources: "./contracts",
    tests: "./tests",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
    alwaysGenerateOverloads: false,
    externalArtifacts: ["externalArtifacts/*.json"],
    dontOverrideCompile: false,
  },
  
  // Custom tasks
  task: {
    accounts: {
      description: "Prints the list of accounts",
      action: async (taskArgs, hre) => {
        const accounts = await hre.ethers.getSigners();
        for (const account of accounts) {
          console.log(account.address);
        }
      },
    },
    
    balance: {
      description: "Prints an account's balance",
      params: {
        account: {
          name: "account",
          description: "The account's address",
          type: "string",
        },
      },
      action: async (taskArgs, hre) => {
        const balance = await hre.ethers.provider.getBalance(taskArgs.account);
        console.log(hre.ethers.utils.formatEther(balance), "ETH");
      },
    },
  },
  
  // Compiler warnings
  warnings: {
    "*": {
      "code-size": false,
      "unused-param": false,
      "unused-var": false,
    },
  },
  
  // External deployments
  external: {
    contracts: [
      {
        artifacts: "node_modules/@chainlink/contracts/abi",
        deploy: "node_modules/@chainlink/contracts/deployments",
      },
      {
        artifacts: "node_modules/@openzeppelin/contracts/build/contracts",
      },
    ],
  },
  
  // Verification settings
  verify: {
    etherscan: {
      apiKey: ETHERSCAN_API_KEY,
    },
  },
  
  // Defender settings (for production)
  defender: {
    apiKey: process.env.DEFENDER_API_KEY || "",
    apiSecret: process.env.DEFENDER_API_SECRET || "",
  },
  
  // Tenderly settings (for debugging)
  tenderly: {
    project: process.env.TENDERLY_PROJECT || "agroai",
    username: process.env.TENDERLY_USERNAME || "",
    privateVerification: false,
  },
  
  // Sourcify settings
  sourcify: {
    enabled: true,
    apiUrl: "https://sourcify.dev/server",
    browserUrl: "https://repo.sourcify.dev",
  },
  
  // Dodoc settings (for documentation)
  dodoc: {
    runOnCompile: false,
    debugMode: false,
    outputDir: "./docs",
    include: ["contracts"],
    exclude: ["contracts/test", "contracts/mock"],
  },
};

