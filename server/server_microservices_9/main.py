

from flask import Flask, request, jsonify, Blueprint
from flask_cors import CORS
import os
import onnxruntime as ort
import numpy as np
import cv2
import requests

app = Flask(__name__)
CORS(app)

# Inference Blueprint
inference_bp = Blueprint('inference_bp', __name__)
MODEL_PATH = os.path.join(os.path.dirname(__file__), "saved_models", "AntiSpoofing_bin_1.5_128.onnx")

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
    prediction = int(np.argmax(outputs[0]))
    confidence = float(np.max(outputs[0]))
    return jsonify({
        "prediction": "real" if prediction == 0 else "fake",
        "confidence": confidence
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
        prediction = int(np.argmax(outputs[0]))
        confidence = float(np.max(outputs[0]))
        return jsonify({
            "prediction": "real" if prediction == 0 else "fake",
            "confidence": confidence
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Fine-tune Blueprint
from flask import current_app
import subprocess
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
