from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from api.face_check import face_check_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(face_check_bp, url_prefix='/api/v1')

@app.route('/')
def home():
    return jsonify({
        "message": "Face Anti-Spoofing Microservice - Absensi Online",
        "status": "running"
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5009))
    app.run(host='0.0.0.0', port=port, debug=True)
