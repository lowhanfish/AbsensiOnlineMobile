# TODO - Hooks Update untuk Face Crop & Resize

## ✅ STATUS: COMPLETED

---

### ✅ Phase 1: Update useFaceVector.ts - COMPLETED

- [x] Hapus TFLite dependency dan embedding code
- [x] Tambah ML Kit face detection untuk bounding box
- [x] Implementasi face crop (center/cover)
- [x] Resize ke 480x480 px, JPEG quality 80%
- [x] Update interface (FaceCropResult + LivenessResult)
- [x] Integrasi liveness detection ke dalam useFaceVector

### ✅ Phase 2: Cleanup - COMPLETED

- [x] Hapus useLivenessDetection.ts (logic sudah di-merge)
- [x] Simpan useFaceEmbedding.ts untuk referensi
- [x] Hapus file face_embedder.tflite
- [x] Hapus react-native-fast-tflite dari package.json
- [x] Hapus react-native-worklets & worklets-core

---

## 📝 Specs - FINAL

- **Resolution**: 480x480 pixel
- **Format**: JPEG
- **Quality**: 80%
- **Method**: Cover/Center Crop (auto-center wajah)
- **Target Size**: 100-180 KB

---

## 📦 Dependencies yang Dipakai (tetap)

- `@react-native-ml-kit/face-detection` - Face detection
- `@bam.tech/react-native-image-resizer` - Resize & compress
- `react-native-vision-camera` - Camera
- `react-native-fs` - File operations

## ❌ Dependencies yang Dihapus

- `react-native-fast-tflite` - Tidak dipakai lagi
- `react-native-worklets` - Tidak dipakai lagi
- `react-native-worklets-core` - Tidak dipakai lagi

---

## 📂 Files yang Diedit/Dihapus

| File                                                             | Status                  |
| ---------------------------------------------------------------- | ----------------------- |
| `AbsensiKonsel/src/hooks/useFaceVector.ts`                       | ✅ DIUBAH TOTAL         |
| `AbsensiKonsel/src/hooks/index.ts`                               | ✅ DIUPDATE             |
| `AbsensiKonsel/src/hooks/useLivenessDetection.ts`                | ✅ DIHAPUS              |
| `AbsensiKonsel/src/hooks/useFaceEmbedding.ts`                    | ✅ DISIMPAN (referensi) |
| `AbsensiKonsel/android/app/src/main/assets/face_embedder.tflite` | ✅ DIHAPUS              |
| `AbsensiKonsel/package.json`                                     | ✅ DIUPDATE             |

---

## 🔄 Arsitektur Baru

```
MOBILE (Client)
│
├─ 📷 Camera → useFaceVector.processFaceImage()
│   ├─ ML Kit: Deteksi wajah
│   ├─ ✂️ Crop (center/cover)
│   ├─ 📐 Resize 480x480
│   └─ 🗜️ Compress 80% JPEG
│
├─ 🎬 Liveness Check → useFaceVector.startLivenessCheck()
│   ├─ 2 random gestures (blink/smile/right_eye_close)
│   ├─ Record frames
│   ├─ Analyze gesture
│   └─ 📸 Final photo dengan crop & resize
│
└─ 📤 Upload gambar ke server
    │
    ▼

SERVER (RTX 5090)
│
├─ 📥 Terima gambar
├─ 🧠 Ekstrak Face Embedding (Python/TF/PyTorch)
├─ 🔍 Bandingkan dengan database
└─ ✅ Return hasil absensi
```

---

## 📋 Penggunaan Hook

```typescript
import { useFaceVector } from "./hooks";

// Di component:
const {
  processFaceImage, // Process foto wajah
  startLivenessCheck, // Jalankan liveness detection
  livenessStatus, // Status text
  isLivenessChecking, // Loading state
  cropResult, // Hasil gambar (path, size, dll)
  clearResult, // Cleanup
} = useFaceVector();

// 1. Process foto wajah (crop + resize)
const result = await processFaceImage(photoPath);
// Output: { imagePath, fileSize, width, height, confidence, ... }

// 2. Jalankan liveness check dengan kamera
const liveness = await startLivenessCheck(cameraRef);
// Output: { isLive, score, reason, results, finalPath }
```

---

## ⚠️ Catatan Penting

1. **useFaceEmbedding.ts** - File ini DISIMPAN tapi TIDAK DIGUNAKAN. Bisa dihapus nanti jika yakin tidak perlu.

2. **Server-side** - Anda perlu menyiapkan:

   - Endpoint API untuk menerima gambar
   - Face embedding extraction (bisa menggunakan ArcFace/MobileFaceNet dengan PyTorch)
   - Face comparison dengan database

3. **Testing** - Jalankan `npm install` setelah update package.json
