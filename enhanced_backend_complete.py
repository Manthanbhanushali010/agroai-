"""
AgroAI Enhanced Backend - Complete Web3 Integration
Production-ready Flask application with blockchain capabilities
"""

import os
import json
import logging
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import hashlib
import uuid

from flask import Flask, request, jsonify, render_template, send_file
from flask_cors import CORS
# from flask_limiter import Limiter
# from flask_limiter.util import get_remote_address
import redis
from web3 import Web3
from web3.middleware import geth_poa_middleware
import ipfshttpclient
import requests
from PIL import Image
import torch
import torchvision.transforms as transforms
import cv2
import numpy as np

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'agroai-secret-key')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# CORS configuration
CORS(app, origins=['http://localhost:3000', 'http://localhost:5001', 'https://agroai.io'])

# Redis for caching
try:
    redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
    redis_client.ping()
except:
    redis_client = None
    print("Redis not available, using in-memory cache")

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('agroai.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class Web3Service:
    """Web3 blockchain interaction service"""
    
    def __init__(self):
        self.w3 = None
        self.contract = None
        self.account = None
        self.contract_address = None
        self.contract_abi = None
        self._initialize_web3()
    
    def _initialize_web3(self):
        """Initialize Web3 connection"""
        try:
            # Load configuration
            rpc_url = os.environ.get('SEPOLIA_RPC_URL', 'https://sepolia.infura.io/v3/')
            private_key = os.environ.get('PRIVATE_KEY', '')
            
            if not rpc_url or not private_key:
                logger.error("Missing Web3 configuration")
                return
            
            # Initialize Web3
            self.w3 = Web3(Web3.HTTPProvider(rpc_url))
            self.w3.middleware_onion.inject(geth_poa_middleware, layer=0)
            
            # Load account
            self.account = self.w3.eth.account.from_key(private_key)
            
            # Load contract
            self._load_contract()
            
            logger.info(f"Web3 initialized successfully. Network: {self.w3.eth.chain_id}")
            
        except Exception as e:
            logger.error(f"Failed to initialize Web3: {e}")
    
    def _load_contract(self):
        """Load smart contract"""
        try:
            # Load contract configuration
            with open('config/contract-config.json', 'r') as f:
                config = json.load(f)
            
            self.contract_address = config['address']
            self.contract_abi = config['abi']
            
            if self.w3 and self.contract_address and self.contract_abi:
                self.contract = self.w3.eth.contract(
                    address=self.contract_address,
                    abi=self.contract_abi
                )
                logger.info("Smart contract loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load contract: {e}")
    
    def is_connected(self) -> bool:
        """Check if Web3 is connected"""
        return self.w3 is not None and self.w3.is_connected()
    
    def get_status(self) -> Dict:
        """Get blockchain connection status"""
        if not self.is_connected():
            return {
                'connected': False,
                'error': 'Not connected to blockchain'
            }
        
        try:
            return {
                'connected': True,
                'network': self.w3.eth.chain_id,
                'block_number': self.w3.eth.block_number,
                'contract_address': self.contract_address,
                'account': self.account.address if self.account else None
            }
        except Exception as e:
            return {
                'connected': False,
                'error': str(e)
            }
    
    def get_token_balance(self, address: str) -> float:
        """Get AGRO token balance for address"""
        try:
            if not self.contract:
                return 0.0
            
            balance_wei = self.contract.functions.balanceOf(address).call()
            balance_ether = self.w3.from_wei(balance_wei, 'ether')
            return float(balance_ether)
            
        except Exception as e:
            logger.error(f"Failed to get token balance: {e}")
            return 0.0
    
    def get_user_stats(self, address: str) -> Dict:
        """Get user statistics from contract"""
        try:
            if not self.contract:
                return {}
            
            stats = self.contract.functions.getUserStats(address).call()
            return {
                'total_photos': stats[0],
                'total_rewards': float(self.w3.from_wei(stats[1], 'ether')),
                'total_purchases': stats[2],
                'tier': stats[3],
                'staking_balance': float(self.w3.from_wei(stats[4], 'ether')),
                'streak_days': stats[5]
            }
            
        except Exception as e:
            logger.error(f"Failed to get user stats: {e}")
            return {}
    
    def upload_photo_to_blockchain(self, user_address: str, ipfs_hash: str, 
                                 crop_type: str, ai_result: Dict) -> Dict:
        """Upload photo and trigger blockchain verification"""
        try:
            if not self.contract or not self.account:
                return {'success': False, 'error': 'Contract not available'}
            
            # Prepare function code for Chainlink Functions
            function_code = self._get_verification_function_code()
            
            # Build transaction
            function = self.contract.functions.uploadPhoto(
                ipfs_hash,
                crop_type,
                function_code
            )
            
            # Estimate gas
            gas_estimate = function.estimate_gas({'from': self.account.address})
            
            # Build transaction
            transaction = function.build_transaction({
                'from': self.account.address,
                'gas': gas_estimate + 50000,  # Add buffer
                'gasPrice': self.w3.eth.gas_price,
                'nonce': self.w3.eth.get_transaction_count(self.account.address)
            })
            
            # Sign and send transaction
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.account.key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # Wait for confirmation
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
            
            return {
                'success': True,
                'transaction_hash': receipt.transactionHash.hex(),
                'block_number': receipt.blockNumber,
                'gas_used': receipt.gasUsed
            }
            
        except Exception as e:
            logger.error(f"Failed to upload photo to blockchain: {e}")
            return {'success': False, 'error': str(e)}
    
    def _get_verification_function_code(self) -> str:
        """Get Chainlink Functions JavaScript code for verification"""
        return """
        const ipfsHash = args[0];
        const cropType = args[1];
        const cropId = args[2];
        
        // Call AI backend for verification
        const aiResponse = await Functions.makeHttpRequest({
            url: `${secrets.AI_BACKEND_URL}/api/verify-disease`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            data: { ipfs_hash: ipfsHash, crop_type: cropType }
        });
        
        // Get weather data
        const weatherResponse = await Functions.makeHttpRequest({
            url: `https://api.openweathermap.org/data/2.5/weather?q=location&appid=${secrets.WEATHER_API_KEY}`
        });
        
        // Combine results
        const result = {
            disease: aiResponse.data.disease,
            confidence: aiResponse.data.confidence,
            treatment: aiResponse.data.treatment,
            weather_risk: weatherResponse.data.main.humidity > 80 ? 'high' : 'low'
        };
        
        return Functions.encodeString(JSON.stringify(result));
        """

class IPFSService:
    """IPFS service for decentralized storage"""
    
    def __init__(self):
        self.client = None
        self._initialize_ipfs()
    
    def _initialize_ipfs(self):
        """Initialize IPFS client"""
        try:
            # Try Infura IPFS first
            project_id = os.environ.get('IPFS_PROJECT_ID')
            project_secret = os.environ.get('IPFS_PROJECT_SECRET')
            
            if project_id and project_secret:
                auth = (project_id, project_secret)
                self.client = ipfshttpclient.connect('/dns/ipfs.infura.io/tcp/5001/https', auth=auth)
            else:
                # Fallback to local IPFS
                self.client = ipfshttpclient.connect('/ip4/127.0.0.1/tcp/5001')
            
            logger.info("IPFS client initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize IPFS: {e}")
    
    def upload_file(self, file_path: str) -> Optional[str]:
        """Upload file to IPFS and return hash"""
        try:
            if not self.client:
                return None
            
            result = self.client.add(file_path)
            ipfs_hash = result['Hash']
            logger.info(f"File uploaded to IPFS: {ipfs_hash}")
            return ipfs_hash
            
        except Exception as e:
            logger.error(f"Failed to upload to IPFS: {e}")
            return None
    
    def upload_json(self, data: Dict) -> Optional[str]:
        """Upload JSON data to IPFS"""
        try:
            if not self.client:
                return None
            
            result = self.client.add_json(data)
            logger.info(f"JSON uploaded to IPFS: {result}")
            return result
            
        except Exception as e:
            logger.error(f"Failed to upload JSON to IPFS: {e}")
            return None

class AIService:
    """AI service for disease detection"""
    
    def __init__(self):
        self.model = None
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.classes = [
            'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy',
            'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot', 'Corn_(maize)___Common_rust_',
            'Corn_(maize)___Northern_Leaf_Blight', 'Corn_(maize)___healthy',
            'Grape___Black_rot', 'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
            'Grape___healthy', 'Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy',
            'Tomato___Bacterial_spot', 'Tomato___Early_blight', 'Tomato___Late_blight',
            'Tomato___Leaf_Mold', 'Tomato___Septoria_leaf_spot', 'Tomato___Spider_mites Two-spotted_spider_mite',
            'Tomato___Target_Spot', 'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Tomato___Tomato_mosaic_virus',
            'Tomato___healthy'
        ]
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        self._load_model()
    
    def _load_model(self):
        """Load the trained AI model"""
        try:
            model_path = 'models/plant_disease_model.pth'
            if os.path.exists(model_path):
                self.model = torch.load(model_path, map_location=self.device)
                self.model.eval()
                logger.info("AI model loaded successfully")
            else:
                logger.warning("AI model not found, using mock predictions")
                
        except Exception as e:
            logger.error(f"Failed to load AI model: {e}")
    
    def predict_disease(self, image_path: str) -> Dict:
        """Predict disease from image"""
        try:
            if not self.model:
                # Mock prediction for demo
                return self._mock_prediction(image_path)
            
            # Load and preprocess image
            image = Image.open(image_path).convert('RGB')
            input_tensor = self.transform(image).unsqueeze(0).to(self.device)
            
            # Make prediction
            with torch.no_grad():
                outputs = self.model(input_tensor)
                probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
                confidence, predicted_idx = torch.max(probabilities, 0)
            
            # Get prediction details
            predicted_class = self.classes[predicted_idx.item()]
            confidence_score = confidence.item() * 100
            
            # Parse class name
            parts = predicted_class.split('___')
            crop_type = parts[0].replace('_', ' ')
            disease = parts[1].replace('_', ' ') if len(parts) > 1 else 'Unknown'
            
            # Get treatment recommendation
            treatment = self._get_treatment_recommendation(disease)
            
            return {
                'crop_type': crop_type,
                'disease': disease,
                'confidence': round(confidence_score, 2),
                'is_healthy': 'healthy' in disease.lower(),
                'treatment': treatment,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to predict disease: {e}")
            return self._mock_prediction(image_path)
    
    def _mock_prediction(self, image_path: str) -> Dict:
        """Generate mock prediction for demo purposes"""
        import random
        
        diseases = [
            ('Apple', 'Apple scab', 'Apply fungicide spray every 2 weeks'),
            ('Tomato', 'Early blight', 'Remove affected leaves and apply copper fungicide'),
            ('Corn', 'Common rust', 'Use resistant varieties and apply fungicide'),
            ('Potato', 'Late blight', 'Improve air circulation and use preventive fungicides'),
            ('Grape', 'Black rot', 'Prune for air circulation and apply protective fungicides')
        ]
        
        crop, disease, treatment = random.choice(diseases)
        confidence = random.uniform(75, 95)
        
        return {
            'crop_type': crop,
            'disease': disease,
            'confidence': round(confidence, 2),
            'is_healthy': False,
            'treatment': treatment,
            'timestamp': datetime.now().isoformat()
        }
    
    def _get_treatment_recommendation(self, disease: str) -> str:
        """Get treatment recommendation for disease"""
        treatments = {
            'apple scab': 'Apply fungicide spray every 2 weeks during growing season',
            'black rot': 'Remove infected plant parts and apply copper-based fungicide',
            'early blight': 'Improve air circulation and apply preventive fungicides',
            'late blight': 'Use resistant varieties and apply protective fungicides',
            'common rust': 'Apply fungicide at first sign of infection',
            'healthy': 'Continue regular care and monitoring'
        }
        
        disease_lower = disease.lower()
        for key, treatment in treatments.items():
            if key in disease_lower:
                return treatment
        
        return 'Consult with agricultural extension service for specific treatment'

# Initialize services
web3_service = Web3Service()
ipfs_service = IPFSService()
ai_service = AIService()

# ============ API ROUTES ============

@app.route('/')
def index():
    """Main page"""
    return render_template('index.html')

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'services': {
            'web3': web3_service.is_connected(),
            'ipfs': ipfs_service.client is not None,
            'ai': ai_service.model is not None,
            'redis': redis_client is not None
        }
    })

@app.route('/api/blockchain-status')
def blockchain_status():
    """Get blockchain connection status"""
    return jsonify(web3_service.get_status())

@app.route('/api/contract-config')
def contract_config():
    """Get contract configuration for frontend"""
    try:
        return jsonify({
            'address': web3_service.contract_address,
            'abi': web3_service.contract_abi,
            'network': web3_service.w3.eth.chain_id if web3_service.w3 else None
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user-stats/<address>')
def get_user_stats(address):
    """Get user statistics"""
    try:
        # Validate address
        if not Web3.is_address(address):
            return jsonify({'error': 'Invalid address'}), 400
        
        # Get stats from blockchain
        stats = web3_service.get_user_stats(address)
        balance = web3_service.get_token_balance(address)
        
        return jsonify({
            'address': address,
            'token_balance': balance,
            **stats
        })
        
    except Exception as e:
        logger.error(f"Failed to get user stats: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/upload-photo-blockchain', methods=['POST'])
def upload_photo_blockchain():
    """Upload photo with blockchain integration"""
    try:
        # Validate request
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        user_address = request.form.get('user_address')
        
        if not file or not user_address:
            return jsonify({'error': 'Missing required parameters'}), 400
        
        if not Web3.is_address(user_address):
            return jsonify({'error': 'Invalid user address'}), 400
        
        # Save file temporarily
        filename = f"{uuid.uuid4()}_{file.filename}"
        filepath = os.path.join('uploads', filename)
        os.makedirs('uploads', exist_ok=True)
        file.save(filepath)
        
        try:
            # Run AI prediction
            ai_result = ai_service.predict_disease(filepath)
            
            # Upload to IPFS
            ipfs_hash = ipfs_service.upload_file(filepath)
            if not ipfs_hash:
                return jsonify({'error': 'Failed to upload to IPFS'}), 500
            
            # Upload to blockchain
            blockchain_result = web3_service.upload_photo_to_blockchain(
                user_address, ipfs_hash, ai_result['crop_type'], ai_result
            )
            
            if not blockchain_result['success']:
                return jsonify({'error': blockchain_result['error']}), 500
            
            # Calculate rewards
            base_reward = 5
            disease_bonus = 100 if not ai_result['is_healthy'] else 20
            confidence_bonus = int(ai_result['confidence'] / 10) if ai_result['confidence'] > 80 else 0
            total_reward = base_reward + disease_bonus + confidence_bonus
            
            # Clean up temporary file
            os.remove(filepath)
            
            return jsonify({
                'success': True,
                'ai_result': ai_result,
                'ipfs_hash': ipfs_hash,
                'blockchain': blockchain_result,
                'rewards': {
                    'base_reward': base_reward,
                    'disease_bonus': disease_bonus,
                    'confidence_bonus': confidence_bonus,
                    'total_reward': total_reward
                }
            })
            
        except Exception as e:
            # Clean up on error
            if os.path.exists(filepath):
                os.remove(filepath)
            raise e
            
    except Exception as e:
        logger.error(f"Failed to upload photo: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/predict', methods=['POST'])
def predict_disease():
    """AI disease prediction endpoint"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if not file:
            return jsonify({'error': 'Invalid file'}), 400
        
        # Save file temporarily
        filename = f"{uuid.uuid4()}_{file.filename}"
        filepath = os.path.join('uploads', filename)
        os.makedirs('uploads', exist_ok=True)
        file.save(filepath)
        
        try:
            # Run AI prediction
            result = ai_service.predict_disease(filepath)
            
            # Clean up
            os.remove(filepath)
            
            return jsonify(result)
            
        except Exception as e:
            # Clean up on error
            if os.path.exists(filepath):
                os.remove(filepath)
            raise e
            
    except Exception as e:
        logger.error(f"Failed to predict disease: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/marketplace/products')
def get_products():
    """Get marketplace products"""
    # Mock product data for demo
    products = [
        {
            'id': 1,
            'name': 'Organic Fungicide Spray',
            'price': 25.99,
            'description': 'Effective against apple scab and black rot',
            'category': 'fungicide',
            'image': '/static/images/fungicide.jpg'
        },
        {
            'id': 2,
            'name': 'Copper-Based Treatment',
            'price': 18.50,
            'description': 'Preventive treatment for bacterial infections',
            'category': 'bactericide',
            'image': '/static/images/copper-treatment.jpg'
        },
        {
            'id': 3,
            'name': 'Plant Nutrition Supplement',
            'price': 32.00,
            'description': 'Boost plant immunity and growth',
            'category': 'supplement',
            'image': '/static/images/nutrition.jpg'
        }
    ]
    
    return jsonify(products)

@app.route('/api/purchase', methods=['POST'])
def process_purchase():
    """Process purchase with token integration"""
    try:
        data = request.get_json()
        
        user_address = data.get('user_address')
        product_id = data.get('product_id')
        payment_method = data.get('payment_method', 'fiat')
        token_amount = data.get('token_amount', 0)
        
        if not user_address or not product_id:
            return jsonify({'error': 'Missing required parameters'}), 400
        
        # Mock purchase processing
        purchase_id = str(uuid.uuid4())
        
        # Calculate discounts based on user tier
        user_stats = web3_service.get_user_stats(user_address)
        tier = user_stats.get('tier', 0)
        discount_rates = [5, 10, 15, 20, 25]  # Bronze to Diamond
        discount_rate = discount_rates[min(tier, 4)]
        
        # Mock product price
        base_price = 25.99
        discount_amount = (base_price * discount_rate) / 100
        final_price = base_price - discount_amount
        
        # Calculate cashback
        cashback_amount = (base_price * 10) / 100  # 10% cashback in tokens
        
        return jsonify({
            'success': True,
            'purchase_id': purchase_id,
            'base_price': base_price,
            'discount_rate': discount_rate,
            'discount_amount': discount_amount,
            'final_price': final_price,
            'cashback_tokens': cashback_amount,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Failed to process purchase: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/community-alerts')
def get_community_alerts():
    """Get active community alerts"""
    # Mock alerts for demo
    alerts = [
        {
            'id': 1,
            'disease_type': 'Apple Scab',
            'severity': 8,
            'location': 'Northern California',
            'radius': 15,
            'farmers_affected': 23,
            'timestamp': (datetime.now() - timedelta(hours=2)).isoformat(),
            'status': 'active'
        },
        {
            'id': 2,
            'disease_type': 'Late Blight',
            'severity': 6,
            'location': 'Oregon Valley',
            'radius': 10,
            'farmers_affected': 12,
            'timestamp': (datetime.now() - timedelta(hours=6)).isoformat(),
            'status': 'monitoring'
        }
    ]
    
    return jsonify(alerts)

@app.route('/api/weather/<location>')
def get_weather_data(location):
    """Get weather data for location"""
    try:
        api_key = os.environ.get('WEATHER_API_KEY')
        if not api_key:
            return jsonify({'error': 'Weather API not configured'}), 500
        
        url = f"https://api.openweathermap.org/data/2.5/weather?q={location}&appid={api_key}&units=metric"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            return jsonify({
                'temperature': data['main']['temp'],
                'humidity': data['main']['humidity'],
                'pressure': data['main']['pressure'],
                'weather': data['weather'][0]['description'],
                'wind_speed': data['wind']['speed'],
                'location': data['name']
            })
        else:
            return jsonify({'error': 'Weather data not available'}), 404
            
    except Exception as e:
        logger.error(f"Failed to get weather data: {e}")
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({'error': 'Rate limit exceeded'}), 429

if __name__ == '__main__':
    # Ensure upload directory exists
    os.makedirs('uploads', exist_ok=True)
    os.makedirs('config', exist_ok=True)
    
    # Start the application
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    logger.info(f"Starting AgroAI backend on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)

