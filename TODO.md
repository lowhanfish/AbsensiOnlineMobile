# TODO - Face Recognition GPU Optimization with InsightFace

## Task: Migrate from face_recognition (dlib) to InsightFace + CUDA

### ✅ Step 1: Update requirements.txt
- [x] Updated onnxruntime-gpu >= 1.18.0
- [x] Added insightface >= 0.7.3
- [x] Added scipy >= 1.11.0 (untuk Rotation/similarity transform)

### ✅ Step 2: Rewrite main_recognation_cpu.py

#### 2.1 SCRFD Face Detection (GPU)
- [x] Load SCRFD model dari saved_models/
- [x] Configure CUDAExecutionProvider as primary
- [x] Thread-safe model loading dengan lock
- [x] Support batch detection dengan confidence score

#### 2.2 5-Point Landmark Detection
- [x] InsightFace built-in 5-point landmarks
- [x] Order: [left_eye, right_eye, nose, left_mouth, right_mouth]
- [x] Return landmarks dalam response

#### 2.3 Similarity Transform Alignment
- [x] Define STANDARD_LANDMARKS template (ArcFace standard)
- [x] Implement get_similarity_transform() dengan least squares
- [x] Implement align_face_similarity_transform() dengan cv2.warpAffine
- [x] Presisi lebih tinggi dari rotasi sudut biasa

#### 2.4 ArcFace dengan CUDA
- [x] Load Arc.onnx dengan CUDAExecutionProvider
- [x] Thread-safe session singleton
- [x] Input preprocessing: BGR -> RGB -> normalize -> transpose

#### 2.5 NumPy Cosine Similarity
- [x] Implement cosine_similarity_np() menggunakan NumPy
- [x] Batch-friendly untuk operasi massal

#### 2.6 Concurrency Optimization (RTX 5090)
- [x] ThreadPoolExecutor dengan 64 workers
- [x] Thread-safe model loading dengan locks
- [x] Flask app.run dengan threaded=True
- [x] Pre-load models di startup

### Step 3: Installation
```bash
cd server/server_microservices_9

# Hapus venv lama dan buat baru dengan Python 3.10+
rm -rf venv
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

**Note:** onnxruntime-gpu membutuhkan CUDA toolkit. Install sesuai versi:
```bash
# Untuk CUDA 12.x
pip install onnxruntime-gpu

# Untuk CUDA 11.x  
pip install onnxruntime-gpu --index-url https://aiinfra.pkgs.visualstudio.com/PublicPackages/_packaging/onnxruntime-cuda-11/pypi/simple/
```

### Step 4: SCRFD Model (Auto-download)
InsightFace akan otomatis download SCRFD model saat pertama dijalankan:
```
~/.insightface/models/scrfd_10g_bnkps.onnx
```

Jika ingin manual download:
```bash
mkdir -p ~/.insightface/models
# Download dari: https://github.com/deepinsight/insightface/tree/master/model_zoo
```

### Step 5: Testing
```bash
# Run server
python main_recognition_cpu.py

# Test endpoints
curl -X POST http://localhost:5010/api/v1/health
curl -X POST -F "image=@test.jpg" http://localhost:5010/api/v1/recognition
curl -X POST -F "image1=@img1.jpg" -F "image2=@img2.jpg" http://localhost:5010/api/v1/compare
```

## Fitur yang Diimplementasikan:

### 1. SCRFD Face Detection (GPU-accelerated)
- Super fast face detection dengan ONNX runtime
- CUDA execution untuk RTX 5090
- Confidence threshold dan size filtering

### 2. 5-Point Landmark Detection
- InsightFace built-in landmarks
- Lebih akurat dari dlib-based landmarks

### 3. Similarity Transform Alignment
- Affine transform berbasis least squares
- Presisi lebih tinggi dari rotation-only alignment
- Standard template: ArcFace 112x112 standard

### 4. ArcFace Embedding (CUDA)
- ONNX inference dengan GPU
- Thread-safe singleton pattern
- Proper preprocessing pipeline

### 5. Concurrent Processing (10,000+ ASN)
- ThreadPoolExecutor (64 workers)
- Lock-protected model loading
- Flask threaded mode

## Endpoint Baru:
- `POST /api/v1/recognition` - Extract embedding + bbox + landmarks
- `POST /api/v1/compare` - Compare 2 faces + quality check
- `POST /api/v1/detect` - Detection only
- `GET /api/v1/health` - Health check

