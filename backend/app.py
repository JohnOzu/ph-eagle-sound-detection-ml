from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import numpy as np
import tensorflow as tf
import tensorflow_hub as hub
from werkzeug.utils import secure_filename
import os
import librosa
import sys

sys.path.append("src")
import utils
from utils import extract_mel_spectrogram
from utils import pad_features
from utils import normalize_features

app = Flask(__name__, static_folder="../frontend/dist")

# CORS configuration - allows React to make requests
# CORS(app, origins=['http://localhost:3000', 'http://localhost:5173'])  # Add your React dev server port

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max
app.config['UPLOAD_FOLDER'] = 'uploads'
ALLOWED_EXTENSIONS = {'wav', 'mp3', 'flac', 'ogg'}

# Create uploads folder
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# # Load YAMNet model (commented out - not currently used)
# print("Loading YAMNet model...")
# yamnet_model = hub.load('https://tfhub.dev/google/yamnet/1')
# print("YAMNet loaded successfully!")
yamnet_model = None  # Set to None since it's not loaded

# Load your eagle detection model
eagle_model = tf.keras.models.load_model('models/cnn-eagle-model.keras')

# ==================== HELPER FUNCTIONS ====================

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# def extract_yamnet_embeddings(audio_path):
#     """
#     Extract YAMNet embeddings from audio file
    
#     Args:
#         audio_path: Path to audio file
        
#     Returns:
#         embeddings: numpy array of shape (N, 1024)
#     """
#     try:
#         # Load audio at 16kHz (YAMNet's sample rate)
#         audio, sr = librosa.load(audio_path, sr=16000, mono=True)
        
#         # Convert to tensor
#         audio_tensor = tf.constant(audio, dtype=tf.float32)
        
#         # Extract embeddings
#         scores, embeddings, spectrogram = yamnet_model(audio_tensor)
        
#         return embeddings.numpy()
#     except Exception as e:
#         raise Exception(f"Error extracting embeddings: {str(e)}")
    
def extract_mel_spectrogram_features(audio_path):
    """
    Extract mel spectrogram features from audio file
    
    Args:
        audio_path: Path to audio file
        
    Returns:
        mel_spec: mel spectrogram features
    """
    try:
        audio, sr = librosa.load(audio_path, sr=16000, mono=True)
        
        mel_spec = extract_mel_spectrogram(audio, sr)
        mel_spec = pad_features(mel_spec, max_len=150)
        mel_spec = normalize_features(mel_spec)
        
        return mel_spec
    except Exception as e:
        raise Exception(f"Error extracting mel spectrograms: {str(e)}")

def predict_eagle(mel_spectrograms):
    """
    Predict if audio contains eagle sounds
    
    Args:
        mel_spectrograms: mel spectrograms extracted from audio (shape: 128, 150)
        
    Returns:
        dict: Prediction results
    """
    
    print(f"Input mel spectrogram shape: {mel_spectrograms.shape}")
    
    # Add channel dimension: (128, 150) -> (128, 150, 1)
    mel_spectrograms = mel_spectrograms[..., np.newaxis]
    print(f"After adding channel: {mel_spectrograms.shape}")
    
    # Add batch dimension: (128, 150, 1) -> (1, 128, 150, 1)
    mel_spectrograms = np.expand_dims(mel_spectrograms, axis=0)
    print(f"Final input shape for model: {mel_spectrograms.shape}")
    
    # Make prediction
    # Model outputs [prob_non_eagle, prob_eagle] due to softmax with 2 classes
    prediction = eagle_model.predict(mel_spectrograms, verbose=0)
    
    # prediction[0][0] = probability of non-eagle (class 0)
    # prediction[0][1] = probability of eagle (class 1)
    eagle_probability = float(prediction[0][1])
    
    print(f"Raw prediction: {prediction[0]}")
    print(f"Non-eagle prob: {prediction[0][0]:.4f}, Eagle prob: {prediction[0][1]:.4f}")
    
    return {
        'is_eagle': bool(eagle_probability > 0.5),
        'confidence': eagle_probability,
        'probabilities': {
            'non_eagle': float(prediction[0][0]),
            'eagle': float(prediction[0][1])
        },
        'feature_shape': list(mel_spectrograms.shape)
    }

# ==================== API ENDPOINTS ====================

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    
    GET /api/health
    
    Returns:
        {
            "status": "healthy",
            "yamnet_loaded": false,
            "eagle_model_loaded": true
        }
    """
    return jsonify({
        'status': 'healthy',
        'yamnet_loaded': yamnet_model is not None,
        'eagle_model_loaded': eagle_model is not None
    }), 200

@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Main prediction endpoint - upload audio file
    
    POST /api/predict
    Content-Type: multipart/form-data
    Body: 
        - audio: audio file (wav, mp3, flac, ogg)
    
    Returns:
        Success:
        {
            "success": true,
            "filename": "eagle_sound.wav",
            "result": {
                "is_eagle": true,
                "confidence": 0.87,
                "feature_shape": [150, 128, 1]
            }
        }
        
        Error:
        {
            "success": false,
            "error": "Error message"
        }
    """
    try:
        print("=" * 50)
        print("Received prediction request")
        
        # Check if file is present
        if 'audio' not in request.files:
            print("Error: No audio file in request")
            return jsonify({
                'success': False,
                'error': 'No audio file provided'
            }), 400
        
        file = request.files['audio']
        print(f"File received: {file.filename}")
        
        # Check if file was selected
        if file.filename == '':
            print("Error: Empty filename")
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400
        
        # Validate file type
        if not allowed_file(file.filename):
            print(f"Error: Invalid file type: {file.filename}")
            return jsonify({
                'success': False,
                'error': f'Invalid file type. Allowed: {", ".join(ALLOWED_EXTENSIONS)}'
            }), 400
        
        # Save file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        print(f"Saving file to: {filepath}")
        file.save(filepath)
        print("File saved successfully")
        
        try:
            # Extract Feature
            print("Extracting mel spectrogram features...")
            mel_spec = extract_mel_spectrogram_features(filepath)
            print(f"Features extracted. Shape: {mel_spec.shape}")
            
            # Get prediction
            print("Making prediction...")
            result = predict_eagle(mel_spec)
            print(f"Prediction complete: {result}")
            
            # Clean up file
            os.remove(filepath)
            print("Temporary file cleaned up")
            
            return jsonify({
                'success': True,
                'filename': filename,
                'result': result
            }), 200
            
        except Exception as e:
            # Clean up on error
            print(f"Error during processing: {str(e)}")
            import traceback
            traceback.print_exc()
            if os.path.exists(filepath):
                os.remove(filepath)
            raise e
            
    except Exception as e:
        print(f"Fatal error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/predict-embeddings', methods=['POST'])
def predict_from_embeddings():
    """
    Prediction from pre-computed embeddings (currently not supported)
    
    POST /api/predict-embeddings
    Content-Type: application/json
    Body:
        {
            "embeddings": [[0.1, 0.2, ...], ...]  // Shape: (N, 1024)
        }
    
    Returns:
        {
            "success": false,
            "error": "This endpoint is not currently supported"
        }
    """
    return jsonify({
        'success': False,
        'error': 'This endpoint is not currently supported. Please use /api/predict with audio files.'
    }), 501

@app.route('/api/info', methods=['GET'])
def api_info():
    """
    API information endpoint
    
    GET /api/info
    
    Returns:
        {
            "name": "Eagle Detection API",
            "version": "1.0",
            "endpoints": {...}
        }
    """
    return jsonify({
        'name': 'Eagle Detection API',
        'version': '1.0',
        'description': 'Audio classification API using mel spectrograms',
        'endpoints': {
            'GET /api/health': 'Health check',
            'GET /api/info': 'API information',
            'POST /api/predict': 'Upload audio file for prediction'
        },
        'supported_formats': list(ALLOWED_EXTENSIONS),
        'max_file_size': '16MB'
    }), 200

# Error handlers
@app.errorhandler(413)
def file_too_large(e):
    return jsonify({
        'success': False,
        'error': 'File too large. Maximum size is 16MB'
    }), 413

@app.errorhandler(404)
def not_found(e):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

# ==================== RUN SERVER ====================

if __name__ == '__main__':
    # print("\n" + "="*50)
    # print("🦅 Eagle Detection API Server")
    # print("="*50)
    # print(f"Server running on: http://localhost:5000")
    # print(f"API Info: http://localhost:5000/api/info")
    # print(f"Health Check: http://localhost:5000/api/health")
    # print("="*50 + "\n")
    
    # app.run(debug=True, host='0.0.0.0', port=5000)

    app.run(host="0.0.0.0", port=7860)