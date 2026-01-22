# Dokumentasi API Absensi Online - Face Anti-Spoofing

### Untuk aktifkan sementara
source venv/bin/activate && python3 main.py
deactivate
============================================
### untuk paten

#### source venv/bin/activate
#### which python
##### Result : /home/diskominfo-konsel/Documents/App/AbsensiOnlineMobile/server/server_microservices_9/venv/bin/python

#### pm2 start main.py --name "microservices-9 (spoofing detection)" --interpreter /home/diskominfo-konsel/Documents/App/AbsensiOnlineMobile/server/server_microservices_9/venv/bin/python

#### pm2 save

#### pm2 startup


## 1. Inference (Prediksi Gambar dari File)

- **Endpoint:** `POST /api/v1/inference`
- **Deskripsi:** Memprediksi apakah gambar wajah yang dikirim adalah asli (real) atau palsu (fake).
- **Request:**
  - **Body:** form-data
    - `image` (file): File gambar yang akan diuji
- **Response:**
  - `prediction`: "real" atau "fake"
  - `confidence`: Nilai kepercayaan prediksi (float)
- **Contoh Response:**

```json
{
  "prediction": "fake",
  "confidence": 0.65
}
```

---

## 2. Inference dari URL Gambar

- **Endpoint:** `POST /api/v1/inference-url`
- **Deskripsi:** Memprediksi apakah gambar wajah dari URL adalah asli (real) atau palsu (fake).
- **Request:**
  - **Headers:** `Content-Type: application/json`
  - **Body:** raw JSON
    ```json
    {
      "url": "https://example.com/gambar-wajah.jpg"
    }
    ```
- **Response:**
  - `prediction`: "real" atau "fake"
  - `confidence`: Nilai kepercayaan prediksi (float)
- **Contoh Request Postman:**
  - Method: `POST`
  - URL: `http://localhost:5009/api/v1/inference-url`
  - Headers: `Content-Type: application/json`
  - Body (raw JSON):
    ```json
    {
        "url": "https://link-gambar.com/image.jpg"
    }
    ```
- **Contoh Response:**

```json
{
  "prediction": "real",
  "confidence": 0.98
}
```

---

## 4. Fine-tune (Pelatihan Ulang Model)

- **Endpoint:** `POST /api/v1/finetune`
- **Deskripsi:** Melakukan pelatihan ulang model dengan dataset baru.
- **Request:**
  - **Body:** form-data
    - `data_dir` (string): Path direktori dataset
    - `epochs` (integer, opsional): Jumlah epoch (default: 10)
    - `batch_size` (integer, opsional): Ukuran batch (default: 32)
- **Response:**
  - `message`: Status fine-tuning
  - atau `error`: Pesan error jika gagal
- **Contoh Response:**

```json
{
  "message": "Fine-tuning started successfully"
}
```

## 5. Cek Status Server

- **Endpoint:** `GET /`
- **Deskripsi:** Mengecek status server.
- **Response:**

```json
{
  "message": "Face Anti-Spoofing Microservice - Absensi Online",
  "status": "running"
}
```

---

**Catatan:**

- Semua endpoint berjalan di port 5009 (default)
- Kirim gambar dengan key `image` pada endpoint inference
- Untuk fine-tune, pastikan path dataset valid di server
