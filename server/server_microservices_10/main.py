#!/usr/bin/env python3
"""
Face Matching Microservice dengan ArcFace
Microservices 10 - Absensi Online

Pipeline:
1. Face Detection (SCRFD) → bbox & 5-point landmarks
2. Eye Detection → ekstrak koordinat mata
3. Calculate Angle → hitung sudut rotasi
4. Rotate Image → rotasi gambar
5. Crop Face → crop wajah
6. Resize → 112x112 untuk ArcFace
7. Normalization → preprocessing ArcFace
8. Inference → ekstrak embedding
9. Cosine Similarity → bandingkan embedding
10. Confidence Label → High/Medium/Low
"""

from flask import Flask, request, jsonify, Blueprint
from flask_cors import CORS
import onnxruntime as ort
import os
import numpy as np
import cv2
import math
import requests
from io import BytesIO

app = Flask(__name__)
CORS(app)

# ============================================================================
# CONFIGURATION
# ============================================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "saved_models", "Arc.onnx")
UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "server", "uploads")

# ArcFace input size (biasanya 112x112)
INPUT_SIZE = (112, 112)

# Similarity thresholds
SIMILARITY_HIGH = 0.65
SIMILARITY_MEDIUM = 0.50

# Face size thresholds (pixels)
FACE_SIZE_HIGH = 100
FACE_SIZE_MEDIUM = 80

# ============================================================================
# LOAD MODELS
# ============================================================================
print("Loading models...")

# Load ArcFace model
available_providers = ort.get_available_providers()
print(f"Available providers: {available_providers}")

if 'CUDAExecutionProvider' in available_providers:
    arcface_session = ort.InferenceSession(
        MODEL_PATH, 
        providers=['CUDAExecutionProvider', 'CPUExecutionProvider']
    )
    print("✓ ArcFace: Using GPU (CUDA)")
else:
    arcface_session = ort.InferenceSession(
        MODEL_PATH, 
        providers=['CPUExecutionProvider']
    )
    print("✓ ArcFace: Using CPU")

arcface_input_name = arcface_session.get_inputs()[0].name

# Load SCRFD face detector dari InsightFace
try:
    import insightface
    from insightface.utils import face_align
    SCRFD_AVAILABLE = True
    print("✓ InsightFace loaded successfully")
    
    # Load buffalo_l model yang包含 SCRFD detector dan landmark
    scrfd_model = insightface.model_zoo.get_model('buffalo_l')
    
    # Check if model loaded successfully
    if scrfd_model is None:
        print("✗ SCRFD model (buffalo_l) failed to load - will use fallback")
        SCRFD_AVAILABLE = False
    else:
        print("✓ SCRFD model loaded")
        
except ImportError as e:
    SCRFD_AVAILABLE = False
    print(f"✗ InsightFace not available: {e}")
    print("  Falling back to simple face detection")
except Exception as e:
    SCRFD_AVAILABLE = False
    print(f"✗ SCRFD model error: {e}")
    print("  Falling back to simple face detection")

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def calculate_angle(landmarks):
    """
    Hitung sudut rotasi dari landmark mata.
    landmarks: array [5, 2] dengan format [x, y]
    - landmarks[0]: left eye
    - landmarks[1]: right eye
    """
    if len(landmarks) < 2:
        return 0.0
    
    left_eye = landmarks[0]
    right_eye = landmarks[1]
    
    # Hitung sudut dalam derajat
    dx = right_eye[0] - left_eye[0]
    dy = right_eye[1] - left_eye[1]
    
    angle = math.degrees(math.atan2(dy, dx))
    return angle


def rotate_image(image, angle, center=None):
    """
    Rotasi gambar berdasarkan sudut.
    """
    (h, w) = image.shape[:2]
    
    if center is None:
        center = (w // 2, h // 2)
    
    # Rotasi
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, 
                              borderMode=cv2.BORDER_CONSTANT)
    
    return rotated


def get_rotation_matrix(angle, center, scale=1.0):
    """Get rotation matrix for affine transformation."""
    return cv2.getRotationMatrix2D(center, angle, scale)


def crop_and_align_face(image, bbox, landmarks, target_size=(112, 112)):
    """
    Crop dan align wajah berdasarkan landmark.
    
    Args:
        image: Input gambar (BGR format)
        bbox: Bounding box [x1, y1, x2, y2]
        landmarks: 5-point landmarks
        target_size: Ukuran output (width, height)
    
    Returns:
        aligned_face: Wajah yang sudah di-crop dan di-align
    """
    # Hitung sudut rotasi dari landmark mata
    angle = calculate_angle(landmarks)
    
    # Ekstrak koordinat mata untuk transformasi affine
    left_eye = landmarks[0]
    right_eye = landmarks[1]
    
    # Pusat mata
    eye_center = ((left_eye[0] + right_eye[0]) / 2, 
                  (left_eye[1] + right_eye[1]) / 2)
    
    # Scale factor untuk mempertahankan proporsi
    dist = np.sqrt((right_eye[0] - left_eye[0])**2 + 
                   (right_eye[1] - left_eye[1])**2)
    
    # Ukuran standar jarak antar mata dalam piksel
    desired_dist = 35.0
    scale = desired_dist / (dist + 1e-6)
    
    # Rotasi dan scale gambar
    M = get_rotation_matrix(angle, eye_center, scale)
    
    # Tambah translasi untuk center wajah
    # Dapatkan koordinat bounding box yang sudah dirotasi
    h, w = image.shape[:2]
    M[0, 2] += target_size[0] / 2 - eye_center[0]
    M[1, 2] += target_size[1] / 2 - eye_center[1]
    
    # Apply affine transformation
    aligned_face = cv2.warpAffine(image, M, target_size, 
                                   flags=cv2.INTER_LINEAR,
                                   borderMode=cv2.BORDER_CONSTANT,
                                   borderValue=(127, 127, 127))
    
    return aligned_face


def simple_face_detection(image):
    """
    Fallback face detection menggunakan OpenCV (Haar Cascade).
    Digunakan jika SCRFD tidak tersedia.
    """
    # Convert ke grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Load Haar cascade
    cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    face_cascade = cv2.CascadeClassifier(cascade_path)
    
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, 
                                           minNeighbors=5, minSize=(30, 30))
    
    results = []
    for (x, y, w, h) in faces:
        # Simple landmark estimation (tengah mata, hidung, mulut)
        landmarks = np.array([
            [x + w * 0.35, y + h * 0.3],   # left eye
            [x + w * 0.65, y + h * 0.3],   # right eye
            [x + w * 0.5, y + h * 0.45],   # nose
            [x + w * 0.35, y + h * 0.7],   # left mouth
            [x + w * 0.65, y + h * 0.7],   # right mouth
        ])
        
        results.append({
            'bbox': [int(x), int(y), int(x + w), int(y + h)],
            'landmarks': landmarks,
            'score': 1.0
        })
    
    return results


def preprocess_for_arcface(face_image):
    """
    Preprocess wajah untuk ArcFace inference.
    
    Args:
        face_image: Wajah yang sudah di-crop dan di-align (BGR)
    
    Returns:
        input_tensor: Tensor yang siap untuk ArcFace inference
    """
    # Convert BGR ke RGB
    face_image = cv2.cvtColor(face_image, cv2.COLOR_BGR2RGB)
    
    # Resize ke ArcFace input size
    face_image = cv2.resize(face_image, INPUT_SIZE)
    
    # Normalize dengan mean dan std ArcFace style
    face_image = face_image.astype(np.float32)
    
    # ArcFace normalization (InsightFace style) - range [-1, 1]
    face_image = (face_image - 127.5) / 127.5
    
    # HWC format untuk ONNX (Height, Width, Channel)
    # Pastikan format sesuai yang diharapkan model: (1, 112, 112, 3)
    input_tensor = np.expand_dims(face_image, axis=0)
    
    return input_tensor.astype(np.float32)


def extract_embedding(face_image):
    """
    Ekstrak embedding wajah menggunakan ArcFace.
    
    Args:
        face_image: Gambar wajah (numpy array BGR)
    
    Returns:
        embedding: 512-dimensional embedding vector
    """
    input_tensor = preprocess_for_arcface(face_image)
    
    # Inference
    outputs = arcface_session.run(None, {arcface_input_name: input_tensor})
    
    # Output biasanya berupa embedding vector
    embedding = outputs[0][0]
    
    # Normalize embedding
    embedding = embedding / (np.linalg.norm(embedding) + 1e-6)
    
    return embedding


def cosine_similarity(emb1, emb2):
    """
    Hitung cosine similarity antara dua embedding.
    """
    return np.dot(emb1, emb2)


def get_confidence_label(similarity, face_size):
    """
    Berikan label confidence berdasarkan similarity dan ukuran wajah.
    
    Args:
        similarity: Cosine similarity score (0-1)
        face_size: Ukuran wajah dalam piksel (max(bbox width, bbox height))
    
    Returns:
        label: "High", "Medium", atau "Low"
    """
    if similarity >= SIMILARITY_HIGH and face_size >= FACE_SIZE_HIGH:
        return "High"
    elif similarity >= SIMILARITY_MEDIUM and face_size >= FACE_SIZE_MEDIUM:
        return "Medium"
    else:
        return "Low"


def process_image(image_source):
    """
    Proses satu gambar: deteksi wajah → alignment → embedding.
    
    Args:
        image_source: Bisa berupa numpy array atau URL string
    
    Returns:
        dict dengan keys: face_detected, bbox, landmarks, embedding, error
    """
    # Load gambar jika URL
    if isinstance(image_source, str):
        try:
            response = requests.get(image_source, timeout=10)
            response.raise_for_status()
            image_bytes = np.frombuffer(response.content, np.uint8)
            image = cv2.imdecode(image_bytes, cv2.IMREAD_COLOR)
        except Exception as e:
            return {'face_detected': False, 'error': f"Failed to load image: {str(e)}"}
    elif isinstance(image_source, np.ndarray):
        image = image_source.copy()
    else:
        return {'face_detected': False, 'error': "Invalid image source"}
    
    if image is None:
        return {'face_detected': False, 'error': "Invalid image data"}
    
    # Face detection
    if SCRFD_AVAILABLE:
        try:
            # SCRFD detection
            bboxes, landmarks = scrfd_model.detect(image, threshold=0.5, max_num=1)
            
            if len(bboxes) == 0:
                return {'face_detected': False, 'error': "No face detected"}
            
            # Ambil wajah dengan confidence tertinggi
            best_idx = np.argmax(bboxes[:, 4])
            bbox = bboxes[best_idx][:4].astype(int)
            landmark = landmarks[best_idx]
            
        except Exception as e:
            return {'face_detected': False, 'error': f"Detection failed: {str(e)}"}
    else:
        # Fallback ke OpenCV
        faces = simple_face_detection(image)
        
        if len(faces) == 0:
            return {'face_detected': False, 'error': "No face detected"}
        
        # Ambil wajah dengan confidence tertinggi
        face = max(faces, key=lambda x: x['score'])
        bbox = face['bbox']
        landmark = face['landmarks']
    
    # Hitung ukuran wajah
    face_size = max(bbox[2] - bbox[0], bbox[3] - bbox[1])
    
    # Crop dan align wajah
    try:
        aligned_face = crop_and_align_face(image, bbox, landmark, INPUT_SIZE)
    except Exception as e:
        return {'face_detected': False, 'error': f"Alignment failed: {str(e)}"}
    
    # Ekstrak embedding
    try:
        embedding = extract_embedding(aligned_face)
    except Exception as e:
        return {'face_detected': False, 'error': f"Embedding extraction failed: {str(e)}"}
    
    # Convert bbox ke list jika berupa numpy array
    if hasattr(bbox, 'tolist'):
        bbox_list = bbox.tolist()
    else:
        bbox_list = list(bbox)
    
    return {
        'face_detected': True,
        'bbox': bbox_list,
        'face_size': int(face_size),
        'landmarks': landmark.tolist() if hasattr(landmark, 'tolist') else list(landmark),
        'embedding': embedding.tolist(),
        'image_shape': image.shape[:2]
    }


# ============================================================================
# FLASK BLUEPRINT
# ============================================================================
face_match_bp = Blueprint('face_match_bp', __name__)


@face_match_bp.route('/verify', methods=['POST'])
def verify():
    """
    Verifikasi wajah dari 3 gambar.
    
    Request (multipart/form-data):
        - reference: Gambar referensi (wajah 1)
        - probe1: Gambar pertama untuk dicocokkan (wajah 2)
        - probe2: Gambar kedua untuk dicocokkan (wajah 3)
    
    Response:
        - reference_info: Info wajah referensi
        - probe_results: Hasil pencocokan untuk setiap probe
        - overall_result: Hasil keseluruhan
    """
    # Validasi input
    if 'reference' not in request.files:
        return jsonify({"error": "Reference image is required"}), 400
    
    reference_file = request.files['reference']
    probe1_file = request.files.get('probe1')
    probe2_file = request.files.get('probe2')
    
    if not probe1_file and not probe2_file:
        return jsonify({"error": "At least one probe image is required"}), 400
    
    # Load gambar
    reference_image = np.frombuffer(reference_file.read(), np.uint8)
    reference_image = cv2.imdecode(reference_image, cv2.IMREAD_COLOR)
    
    if reference_image is None:
        return jsonify({"error": "Invalid reference image"}), 400
    
    # Process reference face
    reference_result = process_image(reference_image)
    
    if not reference_result.get('face_detected'):
        return jsonify({
            "error": "No face detected in reference image",
            "details": reference_result.get('error', 'Unknown error')
        }), 400
    
    # Reference embedding
    ref_embedding = np.array(reference_result['embedding'])
    
    # Prepare response
    response = {
        "reference": {
            "face_detected": True,
            "bbox": reference_result['bbox'],
            "face_size": reference_result['face_size'],
            "embedding_dim": len(ref_embedding),
            "image_shape": reference_result['image_shape']
        },
        "probe_results": [],
        "overall_result": {}
    }
    
    # Process probe images
    probe_files = []
    if probe1_file:
        probe_files.append(('probe1', probe1_file))
    if probe2_file:
        probe_files.append(('probe2', probe2_file))
    
    all_passed = True
    similarities = []
    
    for probe_name, probe_file in probe_files:
        # Load gambar
        probe_image = np.frombuffer(probe_file.read(), np.uint8)
        probe_image = cv2.imdecode(probe_image, cv2.IMREAD_COLOR)
        
        if probe_image is None:
            response["probe_results"].append({
                "filename": probe_file.filename,
                "face_detected": False,
                "error": "Invalid image file"
            })
            all_passed = False
            continue
        
        # Process probe face
        probe_result = process_image(probe_image)
        
        if not probe_result.get('face_detected'):
            response["probe_results"].append({
                "filename": probe_file.filename,
                "face_detected": False,
                "error": probe_result.get('error', 'Face detection failed')
            })
            all_passed = False
            continue
        
        # Calculate similarity
        probe_embedding = np.array(probe_result['embedding'])
        similarity = cosine_similarity(ref_embedding, probe_embedding)
        similarities.append(similarity)
        
        # Get confidence label
        confidence = get_confidence_label(similarity, probe_result['face_size'])
        
        # Determine if match
        is_match = bool(similarity >= SIMILARITY_MEDIUM)
        
        if not is_match:
            all_passed = False
        
        response["probe_results"].append({
            "filename": probe_file.filename,
            "face_detected": True,
            "bbox": probe_result['bbox'],
            "face_size": probe_result['face_size'],
            "similarity": round(float(similarity), 4),
            "confidence": confidence,
            "match": is_match
        })
    
    # Overall result
    avg_similarity = np.mean(similarities) if similarities else 0.0
    
    response["overall_result"] = {
        "status": "match" if all_passed else "no_match",
        "average_similarity": round(float(avg_similarity), 4),
        "all_passed": all_passed,
        "total_probes": len(probe_files),
        "matched_probes": len([s for s in similarities if s >= SIMILARITY_MEDIUM])
    }
    
    return jsonify(response)


@face_match_bp.route('/verify-uploads', methods=['POST'])
def verify_uploads():
    """
    Verifikasi wajah dari file di folder uploads.
    
    Request (JSON):
        {
            "reference": "nama_file_reference.jpg",
            "probe1": "nama_file_probe1.jpg", (opsional)
            "probe2": "nama_file_probe2.jpg" (opsional)
        }
    
    Response:
        - reference_info: Info wajah referensi
        - probe_results: Hasil pencocokan untuk setiap probe
        - overall_result: Hasil keseluruhan
    """
    data = request.get_json()
    
    if not data or 'reference' not in data:
        return jsonify({"error": "Reference filename is required"}), 400
    
    reference_filename = data['reference']
    probe1_filename = data.get('probe1')
    probe2_filename = data.get('probe2')
    
    if not probe1_filename and not probe2_filename:
        return jsonify({"error": "At least one probe filename is required"}), 400
    
    # Load reference image dari uploads folder
    reference_path = os.path.join(UPLOADS_DIR, reference_filename)
    if not os.path.exists(reference_path):
        return jsonify({"error": f"Reference file not found: {reference_filename}"}), 404
    
    reference_image = cv2.imread(reference_path)
    if reference_image is None:
        return jsonify({"error": "Invalid reference image file"}), 400
    
    # Process reference face
    reference_result = process_image(reference_image)
    
    if not reference_result.get('face_detected'):
        return jsonify({
            "error": "No face detected in reference image",
            "details": reference_result.get('error', 'Unknown error')
        }), 400
    
    # Reference embedding
    ref_embedding = np.array(reference_result['embedding'])
    
    # Prepare response
    response = {
        "reference": {
            "filename": reference_filename,
            "face_detected": True,
            "bbox": reference_result['bbox'],
            "face_size": reference_result['face_size'],
            "embedding_dim": len(ref_embedding),
            "image_shape": reference_result['image_shape']
        },
        "probe_results": [],
        "overall_result": {}
    }
    
    # Process probe filenames
    probe_files = []
    if probe1_filename:
        probe_files.append(('probe1', probe1_filename))
    if probe2_filename:
        probe_files.append(('probe2', probe2_filename))
    
    all_passed = True
    similarities = []
    
    for probe_name, probe_filename in probe_files:
        # Load probe image dari uploads folder
        probe_path = os.path.join(UPLOADS_DIR, probe_filename)
        if not os.path.exists(probe_path):
            response["probe_results"].append({
                "filename": probe_filename,
                "face_detected": False,
                "error": "File not found"
            })
            all_passed = False
            continue
        
        probe_image = cv2.imread(probe_path)
        if probe_image is None:
            response["probe_results"].append({
                "filename": probe_filename,
                "face_detected": False,
                "error": "Invalid image file"
            })
            all_passed = False
            continue
        
        # Process probe face
        probe_result = process_image(probe_image)
        
        if not probe_result.get('face_detected'):
            response["probe_results"].append({
                "filename": probe_filename,
                "face_detected": False,
                "error": probe_result.get('error', 'Face detection failed')
            })
            all_passed = False
            continue
        
        # Calculate similarity
        probe_embedding = np.array(probe_result['embedding'])
        similarity = cosine_similarity(ref_embedding, probe_embedding)
        similarities.append(similarity)
        
        # Get confidence label
        confidence = get_confidence_label(similarity, probe_result['face_size'])
        
        # Determine if match
        is_match = bool(similarity >= SIMILARITY_MEDIUM)
        
        if not is_match:
            all_passed = False
        
        response["probe_results"].append({
            "filename": probe_filename,
            "face_detected": True,
            "bbox": probe_result['bbox'],
            "face_size": probe_result['face_size'],
            "similarity": round(float(similarity), 4),
            "confidence": confidence,
            "match": is_match
        })
    
    # Overall result
    avg_similarity = np.mean(similarities) if similarities else 0.0
    
    response["overall_result"] = {
        "status": "match" if all_passed else "no_match",
        "average_similarity": round(float(avg_similarity), 4),
        "all_passed": all_passed,
        "total_probes": len(probe_files),
        "matched_probes": len([s for s in similarities if s >= SIMILARITY_MEDIUM])
    }
    
    return jsonify(response)


@face_match_bp.route('/verify-url', methods=['POST'])
def verify_url():
    """
    Verifikasi wajah dari URL gambar.
    
    Request (JSON):
        {
            "reference_url": "https://...",
            "probe1_url": "https://...",
            "probe2_url": "https://..."
        }
    """
    data = request.get_json()
    
    if not data or 'reference_url' not in data:
        return jsonify({"error": "reference_url is required"}), 400
    
    reference_url = data['reference_url']
    probe1_url = data.get('probe1_url')
    probe2_url = data.get('probe2_url')
    
    if not probe1_url and not probe2_url:
        return jsonify({"error": "At least one probe URL is required"}), 400
    
    # Process reference
    reference_result = process_image(reference_url)
    
    if not reference_result.get('face_detected'):
        return jsonify({
            "error": "No face detected in reference image",
            "details": reference_result.get('error', 'Unknown error')
        }), 400
    
    ref_embedding = np.array(reference_result['embedding'])
    
    response = {
        "reference": {
            "face_detected": True,
            "bbox": reference_result['bbox'],
            "face_size": reference_result['face_size']
        },
        "probe_results": [],
        "overall_result": {}
    }
    
    probe_urls = []
    if probe1_url:
        probe_urls.append(('probe1', probe1_url))
    if probe2_url:
        probe_urls.append(('probe2', probe2_url))
    
    all_passed = True
    similarities = []
    
    for probe_name, probe_url in probe_urls:
        probe_result = process_image(probe_url)
        
        if not probe_result.get('face_detected'):
            response["probe_results"].append({
                "url": probe_url,
                "face_detected": False,
                "error": probe_result.get('error', 'Face detection failed')
            })
            all_passed = False
            continue
        
        probe_embedding = np.array(probe_result['embedding'])
        similarity = cosine_similarity(ref_embedding, probe_embedding)
        similarities.append(similarity)
        
        confidence = get_confidence_label(similarity, probe_result['face_size'])
        is_match = bool(similarity >= SIMILARITY_MEDIUM)
        
        if not is_match:
            all_passed = False
        
        response["probe_results"].append({
            "url": probe_url,
            "face_detected": True,
            "bbox": probe_result['bbox'],
            "face_size": probe_result['face_size'],
            "similarity": round(float(similarity), 4),
            "confidence": confidence,
            "match": is_match
        })
    
    avg_similarity = np.mean(similarities) if similarities else 0.0
    
    response["overall_result"] = {
        "status": "match" if all_passed else "no_match",
        "average_similarity": round(float(avg_similarity), 4),
        "all_passed": all_passed
    }
    
    return jsonify(response)


@face_match_bp.route('/extract-embedding', methods=['POST'])
def extract_embedding_endpoint():
    """
    Ekstrak embedding dari satu gambar wajah.
    Berguna untuk membuat database embedding.
    
    Request:
        - image: File gambar wajah
    
    Response:
        - embedding: Vector embedding wajah
    """
    if 'image' not in request.files:
        return jsonify({"error": "Image file is required"}), 400
    
    image_file = request.files['image']
    image = np.frombuffer(image_file.read(), np.uint8)
    image = cv2.imdecode(image, cv2.IMREAD_COLOR)
    
    if image is None:
        return jsonify({"error": "Invalid image file"}), 400
    
    result = process_image(image)
    
    if not result.get('face_detected'):
        return jsonify({
            "error": "No face detected",
            "details": result.get('error', 'Unknown error')
        }), 400
    
    return jsonify({
        "face_detected": True,
        "bbox": result['bbox'],
        "face_size": result['face_size'],
        "embedding": result['embedding'],
        "embedding_dim": len(result['embedding'])
    })


@face_match_bp.route('/compare', methods=['POST'])
def compare():
    """
    Bandingkan dua embedding secara langsung.
    
    Request (JSON):
        {
            "embedding1": [...],
            "embedding2": [...]
        }
    """
    data = request.get_json()
    
    if not data or 'embedding1' not in data or 'embedding2' not in data:
        return jsonify({"error": "Both embeddings are required"}), 400
    
    emb1 = np.array(data['embedding1'])
    emb2 = np.array(data['embedding2'])
    
    similarity = cosine_similarity(emb1, emb2)
    
    # Hitung confidence (dummy face size)
    confidence = get_confidence_label(similarity, 100)
    
    return jsonify({
        "similarity": round(float(similarity), 4),
        "confidence": confidence,
        "match": bool(similarity >= SIMILARITY_MEDIUM)
    })


# ============================================================================
# HEALTH CHECK & MAIN
# ============================================================================
@app.route('/')
def home():
    return jsonify({
        "message": "Face Matching Microservice - ArcFace",
        "version": "1.0.0",
        "status": "running",
        "models": {
            "arcface": "loaded",
            "scrfd": "available" if SCRFD_AVAILABLE else "fallback"
        }
    })


# Register blueprint
app.register_blueprint(face_match_bp, url_prefix='/api/v1')


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5010))
    print(f"\n{'='*60}")
    print(f"Face Matching Microservice - ArcFace")
    print(f"{'='*60}")
    print(f"Port: {port}")
    print(f"ArcFace Model: {MODEL_PATH}")
    print(f"SCRFD: {'Enabled' if SCRFD_AVAILABLE else 'Disabled (using Haar Cascade)'}")
    print(f"GPU: {'Yes' if 'CUDAExecutionProvider' in available_providers else 'No'}")
    print(f"{'='*60}\n")
    
    app.run(host='0.0.0.0', port=port, debug=True)

