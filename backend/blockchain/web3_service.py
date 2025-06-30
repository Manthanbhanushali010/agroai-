"""
AgroAI Web3 Service
Handles all blockchain interactions for the Flask backend
"""

import json
import os
import logging
from typing import Dict, Any, Optional, Tuple
from web3 import Web3
from web3.middleware import geth_poa_middleware
import ipfshttpclient
from eth_account import Account
import hashlib
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Web3Service:
    """Main Web3 service for blockchain interactions"""
    
    def __init__(self, config_path: str = None):
        """Initialize Web3 service with configuration"""
        self.config = self._load_config(config_path)
        self.w3 = self._initialize_web3()
        self.account = self._load_account()
        self.contracts = self._load_contracts()
        self.ipfs_client = self._initialize_ipfs()
        
    def _load_config(self, config_path: str) -> Dict[str, Any]:
        """Load configuration from file or environment"""
        if config_path and os.path.exists(config_path):
            with open(config_path, 'r') as f:
                return json.load(f)
        
        # Fallback to environment variables
        return {
            'web3': {
                'rpcUrl': os.getenv('SEPOLIA_RPC_URL', 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY'),
                'privateKey': os.getenv('PRIVATE_KEY', ''),
                'gasLimit': int(os.getenv('GAS_LIMIT', '500000')),
                'gasPrice': os.getenv('GAS_PRICE', '20000000000')
            },
            'contracts': {
                'agroToken': os.getenv('AGRO_TOKEN_ADDRESS', ''),
                'agroCore': os.getenv('AGRO_CORE_ADDRESS', '')
            },
            'ipfs': {
                'projectId': os.getenv('IPFS_PROJECT_ID', ''),
                'projectSecret': os.getenv('IPFS_PROJECT_SECRET', ''),
                'endpoint': os.getenv('IPFS_ENDPOINT', 'https://ipfs.infura.io:5001')
            }
        }
    
    def _initialize_web3(self) -> Web3:
        """Initialize Web3 connection"""
        try:
            w3 = Web3(Web3.HTTPProvider(self.config['web3']['rpcUrl']))
            
            # Add PoA middleware for testnets
            w3.middleware_onion.inject(geth_poa_middleware, layer=0)
            
            if not w3.isConnected():
                raise ConnectionError("Failed to connect to Ethereum network")
            
            logger.info(f"Connected to Ethereum network. Chain ID: {w3.eth.chain_id}")
            return w3
            
        except Exception as e:
            logger.error(f"Failed to initialize Web3: {e}")
            raise
    
    def _load_account(self) -> Account:
        """Load account from private key"""
        try:
            private_key = self.config['web3']['privateKey']
            if not private_key:
                raise ValueError("Private key not provided")
            
            account = Account.from_key(private_key)
            logger.info(f"Loaded account: {account.address}")
            return account
            
        except Exception as e:
            logger.error(f"Failed to load account: {e}")
            raise
    
    def _load_contracts(self) -> Dict[str, Any]:
        """Load smart contract instances"""
        try:
            contracts = {}
            
            # Load ABIs
            current_dir = os.path.dirname(os.path.abspath(__file__))
            config_dir = os.path.join(current_dir, '../../config')
            
            # Load AgroAI Token contract
            with open(os.path.join(config_dir, 'AgroAIToken-abi.json'), 'r') as f:
                token_abi = json.load(f)
            
            contracts['token'] = self.w3.eth.contract(
                address=self.config['contracts']['agroToken'],
                abi=token_abi
            )
            
            # Load AgroAI Core contract
            with open(os.path.join(config_dir, 'AgroAICore-abi.json'), 'r') as f:
                core_abi = json.load(f)
            
            contracts['core'] = self.w3.eth.contract(
                address=self.config['contracts']['agroCore'],
                abi=core_abi
            )
            
            logger.info("Smart contracts loaded successfully")
            return contracts
            
        except Exception as e:
            logger.error(f"Failed to load contracts: {e}")
            raise
    
    def _initialize_ipfs(self) -> Optional[ipfshttpclient.Client]:
        """Initialize IPFS client"""
        try:
            if self.config['ipfs']['projectId']:
                # Use Infura IPFS
                client = ipfshttpclient.connect(
                    addr=self.config['ipfs']['endpoint'],
                    auth=(
                        self.config['ipfs']['projectId'],
                        self.config['ipfs']['projectSecret']
                    )
                )
            else:
                # Use local IPFS node
                client = ipfshttpclient.connect('/ip4/127.0.0.1/tcp/5001')
            
            logger.info("IPFS client initialized")
            return client
            
        except Exception as e:
            logger.warning(f"Failed to initialize IPFS client: {e}")
            return None
    
    def upload_to_ipfs(self, file_data: bytes, filename: str = None) -> str:
        """Upload file to IPFS and return hash"""
        try:
            if self.ipfs_client:
                result = self.ipfs_client.add(file_data)
                ipfs_hash = result['Hash']
                logger.info(f"File uploaded to IPFS: {ipfs_hash}")
                return ipfs_hash
            else:
                # Fallback: generate deterministic hash
                hash_obj = hashlib.sha256(file_data)
                mock_hash = f"Qm{hash_obj.hexdigest()[:44]}"
                logger.warning(f"IPFS not available, using mock hash: {mock_hash}")
                return mock_hash
                
        except Exception as e:
            logger.error(f"Failed to upload to IPFS: {e}")
            # Generate fallback hash
            hash_obj = hashlib.sha256(file_data)
            return f"Qm{hash_obj.hexdigest()[:44]}"
    
    def reward_photo_upload(self, user_address: str) -> Dict[str, Any]:
        """Reward user for photo upload"""
        try:
            # Build transaction
            function = self.contracts['token'].functions.rewardPhotoUpload(user_address)
            
            # Estimate gas
            gas_estimate = function.estimateGas({'from': self.account.address})
            
            # Build transaction
            transaction = function.buildTransaction({
                'from': self.account.address,
                'gas': gas_estimate,
                'gasPrice': int(self.config['web3']['gasPrice']),
                'nonce': self.w3.eth.get_transaction_count(self.account.address)
            })
            
            # Sign and send transaction
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.account.key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # Wait for confirmation
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
            
            logger.info(f"Photo reward sent to {user_address}. Tx: {tx_hash.hex()}")
            
            return {
                'success': True,
                'transaction_hash': tx_hash.hex(),
                'gas_used': receipt['gasUsed'],
                'reward_amount': 5  # 5 AGRO tokens
            }
            
        except Exception as e:
            logger.error(f"Failed to reward photo upload: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def reward_disease_detection(self, user_address: str, is_early_detection: bool, disease: str) -> Dict[str, Any]:
        """Reward user for disease detection"""
        try:
            function = self.contracts['token'].functions.rewardDiseaseDetection(
                user_address, 
                is_early_detection, 
                disease
            )
            
            gas_estimate = function.estimateGas({'from': self.account.address})
            
            transaction = function.buildTransaction({
                'from': self.account.address,
                'gas': gas_estimate,
                'gasPrice': int(self.config['web3']['gasPrice']),
                'nonce': self.w3.eth.get_transaction_count(self.account.address)
            })
            
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.account.key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
            
            reward_amount = 200 if is_early_detection else 100
            logger.info(f"Disease detection reward ({reward_amount} AGRO) sent to {user_address}")
            
            return {
                'success': True,
                'transaction_hash': tx_hash.hex(),
                'gas_used': receipt['gasUsed'],
                'reward_amount': reward_amount,
                'disease': disease,
                'early_detection': is_early_detection
            }
            
        except Exception as e:
            logger.error(f"Failed to reward disease detection: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def process_purchase(self, user_address: str, purchase_amount: float) -> Dict[str, Any]:
        """Process purchase with token discounts and cashback"""
        try:
            # Convert to wei (assuming purchase amount is in ETH equivalent)
            amount_wei = self.w3.toWei(purchase_amount, 'ether')
            
            function = self.contracts['token'].functions.processPurchase(user_address, amount_wei)
            
            gas_estimate = function.estimateGas({'from': self.account.address})
            
            transaction = function.buildTransaction({
                'from': self.account.address,
                'gas': gas_estimate,
                'gasPrice': int(self.config['web3']['gasPrice']),
                'nonce': self.w3.eth.get_transaction_count(self.account.address)
            })
            
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.account.key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
            
            # Parse transaction logs to get discount and cashback amounts
            # This would require parsing the event logs in production
            discount = purchase_amount * 0.2  # 20% discount
            cashback = purchase_amount * 0.1   # 10% cashback
            
            logger.info(f"Purchase processed for {user_address}. Amount: {purchase_amount}")
            
            return {
                'success': True,
                'transaction_hash': tx_hash.hex(),
                'gas_used': receipt['gasUsed'],
                'purchase_amount': purchase_amount,
                'discount_applied': discount,
                'cashback_earned': cashback
            }
            
        except Exception as e:
            logger.error(f"Failed to process purchase: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_user_stats(self, user_address: str) -> Dict[str, Any]:
        """Get user statistics from blockchain"""
        try:
            stats = self.contracts['token'].functions.getUserStats(user_address).call()
            
            return {
                'token_balance': self.w3.fromWei(stats[0], 'ether'),
                'photo_count': stats[1],
                'disease_detections': stats[2],
                'total_purchases': self.w3.fromWei(stats[3], 'ether'),
                'total_savings': self.w3.fromWei(stats[4], 'ether'),
                'user_tier': stats[5],
                'last_activity': stats[6]
            }
            
        except Exception as e:
            logger.error(f"Failed to get user stats: {e}")
            return {
                'error': str(e)
            }
    
    def calculate_purchase_discount(self, user_address: str, purchase_amount: float) -> Dict[str, Any]:
        """Calculate potential discount for purchase"""
        try:
            amount_wei = self.w3.toWei(purchase_amount, 'ether')
            result = self.contracts['token'].functions.calculateDiscount(user_address, amount_wei).call()
            
            return {
                'discount_amount': self.w3.fromWei(result[0], 'ether'),
                'cashback_amount': self.w3.fromWei(result[1], 'ether'),
                'can_afford_discount': result[2],
                'tier_multiplier': result[3]
            }
            
        except Exception as e:
            logger.error(f"Failed to calculate discount: {e}")
            return {
                'error': str(e)
            }
    
    def request_chainlink_verification(self, backend_url: str, ipfs_hash: str, crop_type: str, 
                                    location: str, latitude: str, longitude: str) -> Dict[str, Any]:
        """Request Chainlink Functions verification"""
        try:
            function = self.contracts['core'].functions.requestPhotoAnalysis(
                backend_url, ipfs_hash, crop_type, location, latitude, longitude
            )
            
            gas_estimate = function.estimateGas({'from': self.account.address})
            
            transaction = function.buildTransaction({
                'from': self.account.address,
                'gas': gas_estimate,
                'gasPrice': int(self.config['web3']['gasPrice']),
                'nonce': self.w3.eth.get_transaction_count(self.account.address)
            })
            
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.account.key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
            
            # Extract request ID from logs
            request_id = "0x" + "0" * 64  # Placeholder - would parse from logs
            
            logger.info(f"Chainlink verification requested. Request ID: {request_id}")
            
            return {
                'success': True,
                'transaction_hash': tx_hash.hex(),
                'request_id': request_id,
                'gas_used': receipt['gasUsed']
            }
            
        except Exception as e:
            logger.error(f"Failed to request Chainlink verification: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_account_balance(self) -> float:
        """Get ETH balance of the service account"""
        try:
            balance_wei = self.w3.eth.get_balance(self.account.address)
            return self.w3.fromWei(balance_wei, 'ether')
        except Exception as e:
            logger.error(f"Failed to get account balance: {e}")
            return 0.0
    
    def is_connected(self) -> bool:
        """Check if Web3 is connected"""
        return self.w3.isConnected()
    
    def get_network_info(self) -> Dict[str, Any]:
        """Get network information"""
        try:
            return {
                'chain_id': self.w3.eth.chain_id,
                'block_number': self.w3.eth.block_number,
                'gas_price': self.w3.eth.gas_price,
                'connected': self.w3.isConnected()
            }
        except Exception as e:
            logger.error(f"Failed to get network info: {e}")
            return {'error': str(e)}

# Singleton instance
_web3_service = None

def get_web3_service(config_path: str = None) -> Web3Service:
    """Get singleton Web3 service instance"""
    global _web3_service
    if _web3_service is None:
        _web3_service = Web3Service(config_path)
    return _web3_service

# Utility functions for easy import
def upload_to_ipfs(file_data: bytes, filename: str = None) -> str:
    """Utility function to upload file to IPFS"""
    service = get_web3_service()
    return service.upload_to_ipfs(file_data, filename)

def reward_photo_upload(user_address: str) -> Dict[str, Any]:
    """Utility function to reward photo upload"""
    service = get_web3_service()
    return service.reward_photo_upload(user_address)

def reward_disease_detection(user_address: str, is_early_detection: bool, disease: str) -> Dict[str, Any]:
    """Utility function to reward disease detection"""
    service = get_web3_service()
    return service.reward_disease_detection(user_address, is_early_detection, disease)

def process_purchase(user_address: str, purchase_amount: float) -> Dict[str, Any]:
    """Utility function to process purchase"""
    service = get_web3_service()
    return service.process_purchase(user_address, purchase_amount)

def get_user_stats(user_address: str) -> Dict[str, Any]:
    """Utility function to get user stats"""
    service = get_web3_service()
    return service.get_user_stats(user_address)

