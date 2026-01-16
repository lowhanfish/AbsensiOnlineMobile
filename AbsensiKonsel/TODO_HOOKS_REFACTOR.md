# TODO: Hooks Refactoring - AI to Server Side

## Objective

Pindahkan seluruh proses AI ke server (RTX 5090). Sederhanakan client-side logic.

---

## Tasks

### Phase 1: Delete Deprecated Hooks

- [x] 1.1 Delete `useFaceEmbedding.ts`
- [x] 1.2 Delete `useFaceVector.ts`

### Phase 2: Simplify useLivenessDetection.ts

- [x] 2.1 Rewrite dengan Passive Capture logic saja
- [x] 2.2 Hapus gesture detection (blink, smile, head turn)
- [x] 2.3 ML Kit hanya untuk validasi ada wajah
- [x] 2.4 Auto-capture saat wajah terdeteksi & stabil
- [x] 2.5 Image resize: 480x480, JPEG 80%
- [x] 2.6 Auto cleanup cache files

### Phase 3: Update index.ts

- [x] 3.1 Export `usePassiveCapture`, `uploadPhotoToServer`, `cleanupPhoto`
- [x] 3.2 Hapus export hooks yang sudah dihapus

### Phase 4: Update AbsensiFaceRecognation.jsx

- [x] 4.1 Update imports (hapus `useFaceVector`, `useLivenessDetection` → `usePassiveCapture`)
- [x] 4.2 Update component API calls
- [x] 4.3 Hapus logic ekstraksi vector
- [x] 4.4 Kirim langsung foto + NIP ke server

### Phase 5: Check Other Components

- [ ] 5.1 Check VerifikasiWajah.tsx (offline mode)

---

## Status: READY TO START
