"""
Enhanced Detection Route with Blockchain Integration
Extends your existing Flask detection route with Web3 functionality
"""

from flask import Blueprint, request, jsonify, current_app
import os
import logging
import json
import time
from typing import Dict, Any, Optional
from werkzeug.utils import secure_filename

# Import your existing detection function
# from your_existing_app import detect_disease_function

# Import blockchain services
from ..blockchain.web3_service import get_web3_service, upload_to_ipfs

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create blueprint
enhanced_detection_bp = Blueprint('enhanced_detection', __name__)

# Configuration
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def calculate_token_reward(ai_result: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate token rewards based on AI detection results"""
    base_reward = 5  # 5 AGRO for photo upload
    bonus_reward = 0
    is_early_detection = False
    
    disease = ai_result.get('disease', '').lower()
    confidence = ai_result.get('confidence', 0)
    
    if disease and disease not in ['healthy', 'no disease', 'unknown']:
        # Disease detected
        if confidence > 90:
            bonus_reward = 200  # Early detection bonus
            is_early_detection = True
        elif confidence > 70:
            bonus_reward = 100  # Standard disease detection
        else:
            bonus_reward = 50   # Low confidence detection
    else:
        # Healthy plant
        bonus_reward = 20
    
    return {
        'base_reward': base_reward,
        'bonus_reward': bonus_reward,
        'total_reward': base_reward + bonus_reward,
        'is_early_detection': is_early_detection,
        'confidence_threshold_met': confidence > 70
    }

def should_trigger_community_alert(ai_result: Dict[str, Any], location: str) -> Dict[str, Any]:
    """Determine if community alert should be triggered"""
    disease = ai_result.get('disease', '').lower()
    confidence = ai_result.get('confidence', 0)
    severity = ai_result.get('severity', 0)
    
    # Trigger alert for high-confidence disease detections
    should_alert = (
        disease and 
        disease not in ['healthy', 'no disease', 'unknown'] and
        confidence > 80 and
        severity > 0.5
    )
    
    alert_severity = 1
    if confidence > 95 and severity > 0.8:
        alert_severity = 3  # High severity
    elif confidence > 85 and severity > 0.6:
        alert_severity = 2  # Medium severity
    
    return {
        'should_alert': should_alert,
        'severity': alert_severity,
        'disease': disease,
        'location': location,
        'confidence': confidence
    }

@enhanced_detection_bp.route('/detect-enhanced', methods=['POST'])
def detect_disease_enhanced():
    """
    Enhanced disease detection with blockchain integration
    Extends your existing detection with Web3 features
    """
    try:
        # Validate request
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400
        
        # Get optional parameters
        user_wallet = request.form.get('wallet_address', '')
        crop_type = request.form.get('crop_type', 'unknown')
        location = request.form.get('location', 'unknown')
        latitude = request.form.get('latitude', '0')
        longitude = request.form.get('longitude', '0')
        
        # Read file data
        file_data = file.read()
        if len(file_data) > MAX_FILE_SIZE:
            return jsonify({'error': 'File too large'}), 400
        
        # Reset file pointer for your existing detection function
        file.seek(0)
        
        logger.info(f"Processing enhanced detection for user: {user_wallet}")
        
        # Step 1: Upload to IPFS
        ipfs_hash = None
        try:
            web3_service = get_web3_service()
            ipfs_hash = web3_service.upload_to_ipfs(file_data, file.filename)
            logger.info(f"Image uploaded to IPFS: {ipfs_hash}")
        except Exception as e:
            logger.warning(f"IPFS upload failed: {e}")
            # Continue without IPFS - use fallback hash
            import hashlib
            ipfs_hash = f"Qm{hashlib.sha256(file_data).hexdigest()[:44]}"
        
        # Step 2: Run your existing AI detection
        # Replace this with your actual detection function
        ai_result = run_existing_ai_detection(file)
        
        # Step 3: Calculate blockchain rewards
        reward_info = calculate_token_reward(ai_result)
        
        # Step 4: Check for community alerts
        alert_info = should_trigger_community_alert(ai_result, location)
        
        # Step 5: Prepare enhanced result
        enhanced_result = {
            # Your existing AI results
            'disease': ai_result.get('disease', 'Unknown'),
            'confidence': ai_result.get('confidence', 0),
            'severity': ai_result.get('severity', 0),
            'treatment': ai_result.get('treatment', 'None'),
            'description': ai_result.get('description', ''),
            
            # Blockchain enhancements
            'blockchain': {
                'ipfs_hash': ipfs_hash,
                'rewards': reward_info,
                'community_alert': alert_info,
                'timestamp': int(time.time())
            },
            
            # Metadata
            'metadata': {
                'crop_type': crop_type,
                'location': location,
                'coordinates': {
                    'latitude': float(latitude) if latitude != '0' else None,
                    'longitude': float(longitude) if longitude != '0' else None
                },
                'file_size': len(file_data),
                'filename': secure_filename(file.filename)
            }
        }
        
        # Step 6: Process blockchain rewards (if wallet provided)
        if user_wallet and web3_service.is_connected():
            try:
                # Award photo upload reward
                photo_reward_result = web3_service.reward_photo_upload(user_wallet)
                enhanced_result['blockchain']['photo_reward'] = photo_reward_result
                
                # Award disease detection bonus if applicable
                if reward_info['bonus_reward'] > 20:  # More than healthy plant bonus
                    disease_reward_result = web3_service.reward_disease_detection(
                        user_wallet,
                        reward_info['is_early_detection'],
                        ai_result.get('disease', 'Unknown')
                    )
                    enhanced_result['blockchain']['disease_reward'] = disease_reward_result
                
                # Request Chainlink verification (optional)
                if ipfs_hash and current_app.config.get('ENABLE_CHAINLINK_VERIFICATION', False):
                    backend_url = request.host_url.rstrip('/')
                    verification_result = web3_service.request_chainlink_verification(
                        backend_url, ipfs_hash, crop_type, location, latitude, longitude
                    )
                    enhanced_result['blockchain']['chainlink_verification'] = verification_result
                
                logger.info(f"Blockchain rewards processed for {user_wallet}")
                
            except Exception as e:
                logger.error(f"Blockchain reward processing failed: {e}")
                enhanced_result['blockchain']['reward_error'] = str(e)
        
        # Step 7: Log analytics (for future insights)
        analytics_data = {
            'timestamp': time.time(),
            'user_wallet': user_wallet,
            'disease': ai_result.get('disease'),
            'confidence': ai_result.get('confidence'),
            'location': location,
            'crop_type': crop_type,
            'ipfs_hash': ipfs_hash,
            'rewards_earned': reward_info['total_reward']
        }
        
        # Save analytics (implement based on your needs)
        save_analytics_data(analytics_data)
        
        return jsonify(enhanced_result)
        
    except Exception as e:
        logger.error(f"Enhanced detection failed: {e}")
        return jsonify({
            'error': 'Detection failed',
            'message': str(e),
            'blockchain': {
                'rewards': {'total_reward': 0},
                'error': 'Blockchain integration failed'
            }
        }), 500

def run_existing_ai_detection(file) -> Dict[str, Any]:
    """
    Placeholder for your existing AI detection function
    Replace this with your actual implementation
    """
    # This is where you'd call your existing detection function
    # Example:
    # return detect_disease_function(file)
    
    # Mock result for demonstration
    import random
    
    diseases = [
        'Healthy',
        'Northern Corn Leaf Blight',
        'Common Rust',
        'Gray Leaf Spot',
        'Apple Scab',
        'Cedar Apple Rust',
        'Tomato Early Blight',
        'Tomato Late Blight',
        'Potato Late Blight'
    ]
    
    disease = random.choice(diseases)
    confidence = random.uniform(0.6, 0.98)
    severity = random.uniform(0.1, 0.9) if disease != 'Healthy' else 0
    
    return {
        'disease': disease,
        'confidence': confidence,
        'severity': severity,
        'treatment': 'Apply fungicide' if disease != 'Healthy' else 'Continue monitoring',
        'description': f'Detected {disease} with {confidence:.1%} confidence'
    }

@enhanced_detection_bp.route('/blockchain-status', methods=['GET'])
def blockchain_status():
    """Get blockchain service status"""
    try:
        web3_service = get_web3_service()
        network_info = web3_service.get_network_info()
        account_balance = web3_service.get_account_balance()
        
        return jsonify({
            'connected': web3_service.is_connected(),
            'network': network_info,
            'account_balance': account_balance,
            'contracts_loaded': len(web3_service.contracts) > 0,
            'ipfs_available': web3_service.ipfs_client is not None
        })
        
    except Exception as e:
        return jsonify({
            'connected': False,
            'error': str(e)
        }), 500

@enhanced_detection_bp.route('/user-stats/<wallet_address>', methods=['GET'])
def get_user_blockchain_stats(wallet_address):
    """Get user's blockchain statistics"""
    try:
        web3_service = get_web3_service()
        stats = web3_service.get_user_stats(wallet_address)
        
        return jsonify({
            'wallet_address': wallet_address,
            'stats': stats
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

@enhanced_detection_bp.route('/calculate-discount', methods=['POST'])
def calculate_purchase_discount():
    """Calculate potential discount for purchase"""
    try:
        data = request.get_json()
        wallet_address = data.get('wallet_address')
        purchase_amount = float(data.get('purchase_amount', 0))
        
        if not wallet_address or purchase_amount <= 0:
            return jsonify({'error': 'Invalid parameters'}), 400
        
        web3_service = get_web3_service()
        discount_info = web3_service.calculate_purchase_discount(wallet_address, purchase_amount)
        
        return jsonify({
            'wallet_address': wallet_address,
            'purchase_amount': purchase_amount,
            'discount_info': discount_info
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

@enhanced_detection_bp.route('/process-purchase', methods=['POST'])
def process_blockchain_purchase():
    """Process purchase with blockchain integration"""
    try:
        data = request.get_json()
        wallet_address = data.get('wallet_address')
        purchase_amount = float(data.get('purchase_amount', 0))
        product_id = data.get('product_id', '')
        
        if not wallet_address or purchase_amount <= 0:
            return jsonify({'error': 'Invalid parameters'}), 400
        
        web3_service = get_web3_service()
        purchase_result = web3_service.process_purchase(wallet_address, purchase_amount)
        
        # Log purchase for analytics
        purchase_analytics = {
            'timestamp': time.time(),
            'wallet_address': wallet_address,
            'product_id': product_id,
            'purchase_amount': purchase_amount,
            'discount_applied': purchase_result.get('discount_applied', 0),
            'cashback_earned': purchase_result.get('cashback_earned', 0)
        }
        save_analytics_data(purchase_analytics)
        
        return jsonify({
            'wallet_address': wallet_address,
            'product_id': product_id,
            'purchase_result': purchase_result
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

def save_analytics_data(data: Dict[str, Any]):
    """Save analytics data for insights"""
    try:
        # Implement based on your analytics needs
        # Could save to database, file, or analytics service
        analytics_file = 'analytics.jsonl'
        with open(analytics_file, 'a') as f:
            f.write(json.dumps(data) + '\n')
    except Exception as e:
        logger.warning(f"Failed to save analytics: {e}")

# Error handlers
@enhanced_detection_bp.errorhandler(413)
def file_too_large(error):
    return jsonify({'error': 'File too large'}), 413

@enhanced_detection_bp.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

