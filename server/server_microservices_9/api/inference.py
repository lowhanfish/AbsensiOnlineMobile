from flask import Flask, request, jsonify
from flask_cors import CORS
import onnxruntime as ort
import numpy as np
import cv2
import os

app = Flask(__name__)
CORS(app)

# Load ONNX model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "saved_models", "AntiSpoofing_bin_1.5_128.onnx")
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")

ort_session = ort.InferenceSession(MODEL_PATH, providers=['CPUExecutionProvider'])
input_name = ort_session.get_inputs()[0].name

# Preprocessing function
def preprocess_image(image):
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image = cv2.resize(image, (128, 128))  # Resize to 128x128
    image = image.transpose(2, 0, 1).astype(np.float32) / 255.0  # Normalize
    image = np.expand_dims(image, axis=0)
    return image

# Route for inference
@app.route('/api/v1/inference', methods=['POST'])
def inference():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files['image']
    image = np.frombuffer(file.read(), np.uint8)
    image = cv2.imdecode(image, cv2.IMREAD_COLOR)

    if image is None:
        return jsonify({"error": "Invalid image file"}), 400

    # Preprocess and run inference
    input_tensor = preprocess_image(image)
    outputs = ort_session.run(None, {input_name: input_tensor})
    prediction = np.argmax(outputs[0])
    confidence = float(np.max(outputs[0]))

    return jsonify({
        "prediction": "real" if prediction == 0 else "fake",
        "confidence": confidence
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5009, debug=True)