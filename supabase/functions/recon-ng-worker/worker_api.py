#!/usr/bin/env python3
"""
Recon-ng Worker REST API
Production-ready Flask API for executing recon-ng scans
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import os
from datetime import datetime
from server import ReconNgExecutor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize executor
executor = ReconNgExecutor()

# Worker authentication token (set via environment)
WORKER_TOKEN = os.environ.get('WORKER_TOKEN', 'dev-token-change-in-production')

def verify_token():
    """Verify worker authentication token"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if token != WORKER_TOKEN:
        return False
    return True

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'service': 'recon-ng-worker',
        'version': '1.0.0'
    })

@app.route('/scan', methods=['POST'])
def execute_scan():
    """Execute a recon-ng scan"""
    # Verify authentication
    if not verify_token():
        logger.warning(f"Unauthorized scan attempt from {request.remote_addr}")
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        data = request.get_json()
        
        # Validate request
        target = data.get('target')
        modules = data.get('modules', [])
        workspace = data.get('workspace')
        
        if not target:
            return jsonify({'error': 'Target is required'}), 400
        
        if not modules:
            return jsonify({'error': 'At least one module is required'}), 400
        
        logger.info(f"Starting scan for target: {target} with {len(modules)} modules")
        
        # Execute scan
        result = executor.execute_scan(target, modules, workspace)
        
        if result['success']:
            logger.info(f"Scan completed successfully for {target}. Found {len(result['results'])} results")
        else:
            logger.error(f"Scan failed for {target}: {result.get('error')}")
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error executing scan: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@app.route('/modules', methods=['GET'])
def list_modules():
    """List available recon-ng modules"""
    try:
        modules = executor.list_modules()
        return jsonify({
            'success': True,
            'modules': modules,
            'count': len(modules)
        })
    except Exception as e:
        logger.error(f"Error listing modules: {str(e)}")
        return jsonify({
            'error': 'Failed to list modules',
            'message': str(e)
        }), 500

@app.route('/validate', methods=['POST'])
def validate_target():
    """Validate a target before scanning"""
    try:
        data = request.get_json()
        target = data.get('target')
        target_type = data.get('target_type')
        
        # Basic validation
        if not target:
            return jsonify({'valid': False, 'error': 'Target is required'})
        
        # Type-specific validation
        validations = {
            'email': '@' in target and '.' in target,
            'domain': '.' in target and '@' not in target,
            'ip': all(part.isdigit() and 0 <= int(part) <= 255 
                     for part in target.split('.') if part),
            'username': len(target) > 0 and not '@' in target
        }
        
        is_valid = validations.get(target_type, True)
        
        return jsonify({
            'valid': is_valid,
            'target': target,
            'target_type': target_type
        })
        
    except Exception as e:
        return jsonify({'valid': False, 'error': str(e)}), 400

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {error}")
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=False)
