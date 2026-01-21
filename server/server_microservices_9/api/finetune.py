from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import subprocess

app = Flask(__name__)
CORS(app)

# Route for fine-tuning
@app.route('/api/v1/finetune', methods=['POST'])
def finetune():
    data_dir = request.form.get('data_dir')
    epochs = request.form.get('epochs', 10, type=int)
    batch_size = request.form.get('batch_size', 32, type=int)

    if not data_dir or not os.path.exists(data_dir):
        return jsonify({"error": "Invalid or missing data directory"}), 400

    # Command to fine-tune the model
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5010, debug=True)