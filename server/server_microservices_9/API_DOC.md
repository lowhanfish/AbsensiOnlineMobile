# Dokumentasi API Absensi Online - Face Anti-Spoofing

## 1. Inference (Prediksi Gambar)

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

## 2. Fine-tune (Pelatihan Ulang Model)

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

## 3. Cek Status Server

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
