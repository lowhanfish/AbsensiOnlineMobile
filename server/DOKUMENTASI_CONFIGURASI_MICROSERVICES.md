# Dokumentasi Konfigurasi Microservices

**File Konfigurasi Utama:** `server/server/apiMysql/library/configurasi.js`

## URL Configuration Summary

| Variable     | Port  | Environment Variable     |
| ------------ | ----- | ------------------------ |
| url_micro_1  | 50281 | HOST_MICROSERVICES:50281 |
| url_micro_2  | 50282 | HOST_MICROSERVICES:50282 |
| url_micro_3  | 50283 | HOST_MICROSERVICES:50283 |
| url_micro_4  | 50284 | HOST_MICROSERVICES:50284 |
| url_micro_5  | 50285 | HOST_MICROSERVICES:50285 |
| url_micro_6  | 50286 | HOST_MICROSERVICES:50286 |
| url_micro_7  | 50287 | HOST_MICROSERVICES:50287 |
| url_micro_8  | 50288 | HOST_MICROSERVICES:50288 |
| url_micro_9  | 5009  | HOST_MICROSERVICES:5009  |
| url_micro_10 | 5010  | HOST_MICROSERVICES:5010  |

---

## Detail Penggunaan per File

### 1. url_micro_1 (Port: 50281)

**File:** `server/server/apiMysql/absensi/client/absenClient/absenHarian.js`

- Endpoint: `/api/v1/client_absenHarian/statistik`
- Method: POST
- Fungsi: Statistik absensi harian client

**File:** `server/server/apiMysql/absensi/client/absenClient/absenApel.js`

- Endpoint: `/api/v1/client_absenApel/statistik`
- Method: POST
- Fungsi: Statistik absensi apel client

**File:** `server/server/apiMysql/absensi/server/presensi/lapHarian.js`

- Endpoint: `/api/v1/presensi_lapHarian/view`
- Method: POST
- Fungsi: View laporan harian presensi

**File:** `server/server/apiMysql/absensi/server/presensi/lapCustom.js`

- Endpoint: `/api/v1/presensi_lapCustom/view`
- Method: POST
- Fungsi: View laporan custom presensi

---

### 2. url_micro_2 (Port: 50282)

**File:** `server/server/auth/middlewares.js`

- Endpoint: `/micro_2/getAuthorisation/view`
- Method: POST
- Fungsi: Mendapatkan otorisasi menu untuk user

---

### 3. url_micro_3 (Port: 50283)

**File:** `server/server/apiMysql/absensi/client/dataMaster/waktuAbsen.js`

- Endpoint: `/micro_3/clientWaktuAbsen/view`
- Method: GET
- Fungsi: View waktu absen untuk client

---

### 4. url_micro_4 (Port: 50284)

**File:** `server/server/apiMysql/absensi/client/absenClient/absenHarian.js`

- Endpoint: `/micro_4/Add_Absen/Add`
- Method: POST
- Fungsi: Menambahkan absensi harian

---

### 5. url_micro_5 (Port: 50285)

**File:** `server/server/auth/index.js`

- Endpoint: `/micro_5/getBiodataUser/view`
- Method: POST
- Fungsi: Mendapatkan biodata user untuk login

**File:** `server/server/auth/index.js`

- Endpoint: `/micro_5/getJenisLokasi/view`
- Method: POST
- Fungsi: Mendapatkan jenis lokasi absensi

---

### 6. url_micro_6 (Port: 50286)

**File:** `server/server/apiMysql/absensi/client/absenClient/absenApel.js`

- Endpoint: `/micro_6/absenApel/Add`
- Method: POST
- Fungsi: Menambahkan absensi apel

---

### 7. url_micro_7 (Port: 50287)

**Status:** TIDAK DIGUNAKAN

---

### 8. url_micro_8 (Port: 50288)

**File:** `server/server/apiMysql/absensi/server/presensi/lapCustom_v2.js`

- Endpoint: `/micro_8/listAbsenFull/viewList`
- Method: POST
- Fungsi: View list absensi penuh untuk laporan custom v2

---

### 9. url_micro_9 (Port: 5009)

**File:** `server/server/apiMysql/library/faceEmbedding.js`

- Endpoint: `/api/v1/uploads`
- Method: POST
- Fungsi: Cek spoofing untuk verifikasi wajah

---

### 10. url_micro_10 (Port: 5010)

**File:** `server/server/apiMysql/library/faceEmbedding.js`

- Endpoint: `/api/v1/verify-uploads`
- Method: POST
- Fungsi: Verifikasi pencocokan wajah

---

## Format Penggunaan di Kode

```javascript
const configurasi = require("../../../library/configurasi");
const url_micro_X = configurasi.url_micro_X;

// Contoh penggunaan
const response = await fetch(url_micro_X + "/endpoint/path", {
  method: "POST",
  body: JSON.stringify(body),
  headers: { "Content-Type": "application/json" },
});
```

## Catatan

- Environment variable `HOST_MICROSERVICES` digunakan untuk menentukan host base URL
- Semua microservices menggunakan format: `${HOST_MICROSERVICES}:${PORT}`
- url_micro_7 saat ini tidak digunakan oleh file manapun dalam project
- Client-side (Vue/Quasar) menggunakan URL dari `client/src/store/index.js` dan tidak menggunakan configurasi.js secara langsung

---

**Dibuat:** 2024
**Terakhir Diperbarui:** 2024
