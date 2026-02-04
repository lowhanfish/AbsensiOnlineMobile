

from flask import Flask, request, jsonify, Blueprint
from flask_cors import CORS
import os
import onnxruntime as ort
import numpy as np
import cv2
import requests
import subprocess

app = Flask(__name__)
CORS(app)

# Inference Blueprint
inference_bp = Blueprint('inference_bp', __name__)
MODEL_PATH = os.path.join(os.path.dirname(__file__), "saved_models", "AntiSpoofing_bin_1.5_128.onnx")
UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "server", "uploads")

# ============ THRESHOLD KONFIGURASI ============
# Threshold untuk deteksi fake/real
# Nilai lebih kecil = lebih mudah mendeteksi sebagai "fake" (kurang sensitif/strict)
# Nilai lebih besar = lebih ketat mendeteksi "real"
# Default: 0.45 (artinya: jika prob_fake >= 0.45, maka认定为 "fake")
FAKE_THRESHOLD = 0.55
# ===============================================

# Load ONNX model with GPU support (with fallback to CPU)
available_providers = ort.get_available_providers()
if 'CUDAExecutionProvider' in available_providers:
    ort_session = ort.InferenceSession(MODEL_PATH, providers=['CUDAExecutionProvider', 'CPUExecutionProvider'])
    print("Using GPU (CUDA)")
else:
    ort_session = ort.InferenceSession(MODEL_PATH, providers=['CPUExecutionProvider'])
    print("Using CPU (CUDA not available)")

print(f"Available providers: {available_providers}")
input_name = ort_session.get_inputs()[0].name

def preprocess_image(image):
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image = cv2.resize(image, (128, 128))
    image = image.transpose(2, 0, 1).astype(np.float32) / 255.0
    image = np.expand_dims(image, axis=0)
    return image

@inference_bp.route('/inference', methods=['POST'])
def inference():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    file = request.files['image']
    image = np.frombuffer(file.read(), np.uint8)
    image = cv2.imdecode(image, cv2.IMREAD_COLOR)
    if image is None:
        return jsonify({"error": "Invalid image file"}), 400
    input_tensor = preprocess_image(image)
    outputs = ort_session.run(None, {input_name: input_tensor})
    
    # Gunakan threshold untuk menentukan fake/real
    prob_real = float(outputs[0][0][0])
    prob_fake = float(outputs[0][0][1])
    
    # Jika prob_fake >= threshold, maka "fake"
    prediction = "fake" if prob_fake >= FAKE_THRESHOLD else "real"
    confidence = prob_fake if prediction == "fake" else prob_real
    
    return jsonify({
        "prediction": prediction,
        "confidence": confidence,
        "prob_real": prob_real,
        "prob_fake": prob_fake,
        "threshold_used": FAKE_THRESHOLD
    })

# Endpoint baru: inference dari URL gambar
@inference_bp.route('/inference-url', methods=['POST'])
def inference_url():
    data = request.get_json()
    if not data or 'url' not in data:
        return jsonify({"error": "No URL provided"}), 400
    image_url = data['url']
    try:
        response = requests.get(image_url, timeout=10)
        response.raise_for_status()
        image_bytes = np.frombuffer(response.content, np.uint8)
        image = cv2.imdecode(image_bytes, cv2.IMREAD_COLOR)
        if image is None:
            return jsonify({"error": "Invalid image from URL"}), 400
        input_tensor = preprocess_image(image)
        outputs = ort_session.run(None, {input_name: input_tensor})
        
        # Gunakan threshold untuk menentukan fake/real
        prob_real = float(outputs[0][0][0])
        prob_fake = float(outputs[0][0][1])
        
        # Jika prob_fake >= threshold, maka "fake"
        prediction = "fake" if prob_fake >= FAKE_THRESHOLD else "real"
        confidence = prob_fake if prediction == "fake" else prob_real
        
        return jsonify({
            "prediction": prediction,
            "confidence": confidence,
            "prob_real": prob_real,
            "prob_fake": prob_fake,
            "threshold_used": FAKE_THRESHOLD
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@inference_bp.route('/uploads', methods=['POST'])
def inference_from_uploads():
    data = request.get_json()
    filename = data.get('filename')
    if not filename:
        return jsonify({"error": "Filename is required"}), 400
    
    image_path = os.path.join(UPLOADS_DIR, filename)
    if not os.path.exists(image_path):
        return jsonify({"error": "File not found"}), 404
    
    image = cv2.imread(image_path)
    if image is None:
        return jsonify({"error": "Invalid image file"}), 400
    
    input_tensor = preprocess_image(image)
    outputs = ort_session.run(None, {input_name: input_tensor})
    
    # Gunakan threshold untuk menentukan fake/real
    prob_real = float(outputs[0][0][0])
    prob_fake = float(outputs[0][0][1])
    
    # Jika prob_fake >= threshold, maka "fake"
    prediction = "fake" if prob_fake >= FAKE_THRESHOLD else "real"
    confidence = prob_fake if prediction == "fake" else prob_real
    
    return jsonify({
        "prediction": prediction,
        "confidence": confidence,
        "prob_real": prob_real,
        "prob_fake": prob_fake,
        "threshold_used": FAKE_THRESHOLD
    })

finetune_bp = Blueprint('finetune_bp', __name__)

@finetune_bp.route('/finetune', methods=['POST'])
def finetune():
    data_dir = request.form.get('data_dir')
    epochs = request.form.get('epochs', 10, type=int)
    batch_size = request.form.get('batch_size', 32, type=int)

    if not data_dir or not os.path.exists(data_dir):
        return jsonify({"error": "Invalid or missing data directory"}), 400

    command = [
        "python3", "train.py",
        "--data_dir", data_dir,
        "--epochs", str(epochs),
        "--batch_size", str(batch_size)
    ]

    try:
        subprocess.run(command, check=True)
        return jsonify({"message": "Fine-tuning started successfully"})
    except subprocess.CalledProcessError as e:
        return jsonify({"error": str(e)})

app.register_blueprint(inference_bp, url_prefix='/api/v1')
app.register_blueprint(finetune_bp, url_prefix='/api/v1')

@app.route('/')
def home():
    return jsonify({
        "message": "Face Anti-Spoofing Microservice - Absensi Online",
        "status": "running"
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5009))
    app.run(host='0.0.0.0', port=port, debug=True)
