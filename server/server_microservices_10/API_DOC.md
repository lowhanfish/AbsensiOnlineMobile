# Dokumentasi API - Face Matching Microservice (ArcFace)

## Micorservices 10 - Absensi Online

---

## 🚀 Cara Menjalankan

### Untuk Testing (Sementara)
```bash
cd /home/diskominfo-konsel/Documents/App/AbsensiOnlineMobile/server/server_microservices_10
source venv/bin/activate
python3 main.py
```

### Untuk Production (Permanen)
```bash
# Activate venv dan cek path python
source venv/bin/activate
which python

# Hasil: /home/diskominfo-konsel/Documents/App/AbsensiOnlineMobile/server/server_microservices_10/venv/bin/python

# Jalankan dengan PM2
pm2 start main.py --name "microservices-10 (face-matching)" --interpreter /home/diskominfo-konsel/Documents/App/AbsensiOnlineMobile/server/server_microservices_10/venv/bin/python

# Simpan konfigurasi PM2
pm2 save

# Setup startup
pm2 startup
```

---

## 📋 Endpoint List

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/` | Health check |
| POST | `/api/v1/verify` | Verifikasi 3 gambar (multipart/form-data) |
| POST | `/api/v1/verify-url` | Verifikasi dari URL gambar (JSON) |
| POST | `/api/v1/extract-embedding` | Ekstrak embedding wajah |
| POST | `/api/v1/compare` | Bandingkan 2 embedding |

---

## 1. Health Check

### **GET /**

Cek status server.

**Response:**
```json
{
  "message": "Face Matching Microservice - ArcFace",
  "version": "1.0.0",
  "status": "running",
  "models": {
    "arcface": "loaded",
    "scrfd": "available"
  }
}
```

---

## 2. Verifikasi 3 Gambar (dari File)

### **POST /api/v1/verify**

Verifikasi wajah dengan membandingkan 1 gambar referensi dengan 2 gambar probe.

**Request:**
- **Content-Type:** `multipart/form-data`
- **Body Parameters:**
  - `reference` (file, **wajib**): Gambar referensi/wajah yang akan dicocokkan
  - `probe1` (file, opsional): Gambar probe pertama
  - `probe2` (file, opsional): Gambar probe kedua

**Contoh Request Postman:**
1. Method: `POST`
2. URL: `http://localhost:5010/api/v1/verify`
3. Body → form-data:
   - Key: `reference`, Type: File, Value: [pilih gambar wajah 1]
   - Key: `probe1`, Type: File, Value: [pilih gambar wajah 2]
   - Key: `probe2`, Type: File, Value: [pilih gambar wajah 3]

**Response:**
```json
{
  "reference": {
    "face_detected": true,
    "bbox": [120, 45, 280, 265],
    "face_size": 220,
    "embedding_dim": 512,
    "image_shape": [480, 640]
  },
  "probe_results": [
    {
      "filename": "wajah2.jpg",
      "face_detected": true,
      "bbox": [100, 30, 250, 240],
      "face_size": 210,
      "similarity": 0.8234,
      "confidence": "High",
      "match": true
    },
    {
      "filename": "wajah3.jpg",
      "face_detected": true,
      "bbox": [150, 60, 300, 270],
      "face_size": 195,
      "similarity": 0.7521,
      "confidence": "High",
      "match": true
    }
  ],
  "overall_result": {
    "status": "match",
    "average_similarity": 0.7878,
    "all_passed": true,
    "total_probes": 2,
    "matched_probes": 2
  }
}
```

**Penjelasan Response:**
- `similarity`: Nilai cosine similarity (0-1), semakin tinggi semakin mirip
- `confidence`: Label "High", "Medium", atau "Low"
- `match`: `true` jika similarity ≥ 0.50

---

## 3. Verifikasi dari URL Gambar

### **POST /api/v1/verify-url**

Verifikasi wajah dari URL gambar.

**Request:**
- **Content-Type:** `application/json`
- **Body (raw JSON):**
```json
{
  "reference_url": "https://contoh.com/wajah-referensi.jpg",
  "probe1_url": "https://contoh.com/wajah-probe1.jpg",
  "probe2_url": "https://contoh.com/wajah-probe2.jpg"
}
```

**Contoh Request Postman:**
1. Method: `POST`
2. URL: `http://localhost:5010/api/v1/verify-url`
3. Headers: `Content-Type: application/json`
4. Body → raw JSON:
```json
{
    "reference_url": "https://link-gambar.com/reference.jpg",
    "probe1_url": "https://link-gambar.com/probe1.jpg"
}
```

**Response:**
```json
{
  "reference": {
    "face_detected": true,
    "bbox": [120, 45, 280, 265],
    "face_size": 220
  },
  "probe_results": [
    {
      "url": "https://link-gambar.com/probe1.jpg",
      "face_detected": true,
      "bbox": [100, 30, 250, 240],
      "face_size": 210,
      "similarity": 0.8234,
      "confidence": "High",
      "match": true
    }
  ],
  "overall_result": {
    "status": "match",
    "average_similarity": 0.8234,
    "all_passed": true
  }
}
```

---

## 4. Ekstrak Embedding Wajah

### **POST /api/v1/extract-embedding**

Ekstrak vector embedding dari satu gambar wajah.
Berguna untuk membuat database embedding.

**Request:**
- **Content-Type:** `multipart/form-data`
- **Body Parameters:**
  - `image` (file, **wajib**): File gambar wajah

**Response:**
```json
{
  "face_detected": true,
  "bbox": [120, 45, 280, 265],
  "face_size": 220,
  "embedding": [0.123, -0.456, 0.789, ..., -0.321],
  "embedding_dim": 512
}
```

---

## 5. Bandingkan 2 Embedding

### **POST /api/v1/compare**

Bandingkan dua embedding vector secara langsung.

**Request:**
- **Content-Type:** `application/json`
- **Body (raw JSON):**
```json
{
  "embedding1": [0.123, -0.456, 0.789, ..., -0.321],
  "embedding2": [0.124, -0.455, 0.790, ..., -0.320]
}
```

**Response:**
```json
{
  "similarity": 0.9876,
  "confidence": "High",
  "match": true
}
```

---

## 📊 Confidence Label Logic

| Similarity Score | Face Size (pixels) | Label |
|-----------------|-------------------|-------|
| ≥ 0.65 | ≥ 100 | **High** |
| 0.50 - 0.64 | ≥ 80 | **Medium** |
| < 0.50 | < 80 | **Low** |

**Keterangan:**
- **High**: Kemungkinan besar wajah sama, kualitas baik
- **Medium**: Kemungkinan wajah sama, perlu verifikasi tambahan
- **Low**: Kemungkinan besar wajah berbeda atau kualitas buruk

---

## ⚙️ Pipeline Processing

```
Input Gambar
    ↓
1. Face Detection (SCRFD / RetinaFace)
   - Deteksi wajah
   - Ekstrak 5-point landmarks (mata, hidung, mulut)
    ↓
2. Eye Detection & Angle Calculation
   - Hitung sudut rotasi dari landmarks mata
    ↓
3. Image Rotation
   - Rotasi gambar sesuai sudut
    ↓
4. Face Cropping
   - Crop wajah dengan margin
    ↓
5. Face Alignment (Landmark-based)
   - Transformasi affine berdasarkan landmarks
    ↓
6. Resize (112x112)
   - Sesuaikan ukuran input ArcFace
    ↓
7. Normalization
   - (pixel - 127.5) / 127.5
    ↓
8. ArcFace Inference
   - Ekstrak 512-dim embedding
    ↓
9. Cosine Similarity
   - Hitung similarity antar embedding
    ↓
10. Confidence Label
    - High / Medium / Low
```

---

## 🔧 Konfigurasi

| Parameter | Nilai | Keterangan |
|-----------|-------|------------|
| Port | 5010 | Default port |
| ArcFace Input Size | 112x112 | Ukuran input model |
| Similarity Threshold | 0.50 | Minimum untuk match |
| Similarity High | 0.65 | Threshold High confidence |
| Face Size High | 100px | Minimum ukuran wajah High |
| Face Size Medium | 80px | Minimum ukuran wajah Medium |

---

## 📝 Catatan

1. **Wajib ada wajah** di semua gambar yang diupload
2. **Gambar blur atau terlalu kecil** mungkin tidak terdeteksi
3. **Lighting yang baik** akan meningkatkan akurasi
4. **GPU (CUDA)** diperlukan untuk performa optimal
5. Output embedding berdimensi **512**

---

## 🐛 Troubleshooting

### Face tidak terdeteksi
- Pastikan gambar memiliki wajah yang terlihat jelas
- Coba gambar dengan resolusi lebih tinggi
- Hindari wajah yang terlalu miring

### Similarity terlalu rendah
- Coba gambar dengan lighting lebih baik
- Pastikan wajah tidak terhalang (kacamata, masker)
- Cek apakah benar-benar wajah yang sama

### Error "CUDA not available"
- Install onnxruntime-gpu dengan versi yang sesuai GPU
- Cek compatibility CUDA version

