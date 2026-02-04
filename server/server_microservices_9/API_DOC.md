# Face Anti-Spoofing API Documentation

Face Anti-Spoofing Microservice untuk aplikasi Absensi Online - mendeteksi apakah gambar wajah adalah asli (real) atau palsu (fake/cetakan).

**Base URL:** `http://localhost:5009`

---

## Endpoints

### 1. Inference (Upload Gambar)

Prediksi apakah gambar wajah yang diupload adalah asli atau palsu.

- **URL:** `/api/v1/inference`
- **Method:** `POST`
- **Content-Type:** `multipart/form-data`

**Request Body:**

| Parameter | Tipe | Wajib | Deskripsi |
|-----------|------|-------|-----------|
| image | File | Ya | File gambar wajah (JPG, PNG, dll) |

**Response Sukses:**

```json
{
  "prediction": "real",
  "confidence": 0.92,
  "prob_real": 0.92,
  "prob_fake": 0.08,
  "threshold_used": 0.55
}
```

**Response Error:**

```json
{
  "error": "No image file provided"
}
```

---

### 2. Inference dari URL

Prediksi apakah gambar wajah dari URL adalah asli atau palsu.

- **URL:** `/api/v1/inference-url`
- **Method:** `POST`
- **Content-Type:** `application/json`

**Request Body:**

```json
{
  "url": "https://example.com/wajah.jpg"
}
```

**Response Sukses:**

```json
{
  "prediction": "real",
  "confidence": 0.87,
  "prob_real": 0.87,
  "prob_fake": 0.13,
  "threshold_used": 0.55
}
```

---

### 3. Inference dari File Lokal

Prediksi apakah gambar wajah dari direktori server uploads adalah asli atau palsu.

- **URL:** `/api/v1/uploads`
- **Method:** `POST`
- **Content-Type:** `application/json`

**Request Body:**

```json
{
  "filename": "1768754045524.jpg"
}
```

**Response Sukses:**

```json
{
  "prediction": "real",
  "confidence": 0.95,
  "prob_real": 0.95,
  "prob_fake": 0.05,
  "threshold_used": 0.55
}
```

---

### 4. Fine-tuning Model

Melatih ulang model dengan dataset baru.

- **URL:** `/api/v1/finetune`
- **Method:** `POST`
- **Content-Type:** `multipart/form-data`

**Request Body:**

| Parameter | Tipe | Wajib | Deskripsi |
|-----------|------|-------|-----------|
| data_dir | String | Ya | Path direktori dataset |
| epochs | Integer | Tidak | Jumlah epoch (default: 10) |
| batch_size | Integer | Tidak | Ukuran batch (default: 32) |

**Response Sukses:**

```json
{
  "message": "Fine-tuning started successfully"
}
```

---

### 5. Health Check

Memeriksa status server.

- **URL:** `/`
- **Method:** `GET`

**Response:**

```json
{
  "message": "Face Anti-Spoofing Microservice - Absensi Online",
  "status": "running"
}
```

---

## Konfigurasi Threshold

| Threshold | Sensitivitas | Deskripsi |
|-----------|--------------|-----------|
| 0.35-0.40 | Longgar | Lebih banyak terdeteksi "fake" |
| 0.45-0.50 | Seimbang | Default untuk penggunaan umum |
| 0.55-0.60 | Ketat | Lebih banyak terdeteksi "real" |

**Logika Threshold:**
- Jika `prob_fake >= FAKE_THRESHOLD` → **"fake"**
- Jika `prob_fake < FAKE_THRESHOLD` → **"real"**

---

## Menjalankan Server

### Development

```bash
cd server/server_microservices_9
source venv/bin/activate
python3 main.py
```

### Production (PM2)

```bash
# Activate virtual environment
source venv/bin/activate

# Get Python path
which python
# Output: /home/diskominfo-konsel/Documents/App/AbsensiOnlineMobile/server/server_microservices_9/venv/bin/python

# Start with PM2
pm2 start main.py \
  --name "microservices-9-spoofing" \
  --interpreter /home/diskominfo-konsel/Documents/App/AbsensiOnlineMobile/server/server_microservices_9/venv/bin/python

# Save PM2 config
pm2 save

# Setup startup
pm2 startup
```

---

## Library Dependencies

```
flask>=2.0.0
flask-cors>=3.0.0
onnxruntime-gpu>=1.16.0
numpy>=1.21.0
opencv-python>=4.5.0
requests>=2.28.0
```

---

## Catatan

- Model default: `saved_models/AntiSpoofing_bin_1.5_128.onnx`
- Server berjalan di port **5009**
- Support GPU (CUDA) dengan fallback ke CPU
- Gambar di-resize ke 128x128 pixels untuk inferensi

