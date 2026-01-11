# 📱 AbsensiKonsel

**AbsensiKonsel** is a **mobile-based online attendance application** designed for **civil servants (ASN)** within the **Konawe Selatan Regency Government**.  
This mobile version serves as an **integral part of the AbsensiKonsel backend system**, which manages authentication and attendance records.

The app leverages **Face Recognition** and **Geolocation** technologies to ensure attendance verification is both **accurate and location-based**.

---

## 🚀 Key Features

- 🔐 **Secure authentication** for ASN through backend integration.
- 📍 **Location-based attendance (Geolocation)** verification.
- 🧠 **Face Recognition** for biometric identity validation.
- 📅 **Attendance history tracking** and status updates.
- 📱 **Cross-platform support**: Android & iOS.

---

## ⚙️ Technical Specifications

| Component               | Version / Specification |
| ----------------------- | ----------------------- |
| **Gradle Plugin**       | 8.14.1                  |
| **Java**                | 17.0.10                 |
| **Node.js**             | ≥ 20.19.0               |
| **React**               | 19.1.0                  |
| **React Native**        | 0.80.1                  |
| **Build Tools Version** | 35.0.0                  |
| **Min SDK Version**     | 24                      |
| **Compile SDK Version** | 35                      |
| **Target SDK Version**  | 35                      |
| **NDK Version**         | 27.1.12297006           |
| **Kotlin Version**      | 2.1.20                  |

---

## 🧩 Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/lowhanfish/AbsensiOnlineMobile.git
cd AbsensiKonsel
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ iOS setup

Navigate to the iOS directory and install pods:

```bash
cd ios
pod install
```

---

## ▶️ Running the Application

### 🔹 Android

Ensure your Android emulator is running, then execute:

```bash
npx react-native run-android
```

### 🔹 iOS

Make sure **Xcode** and an iOS emulator are installed, then run:

```bash
npx run-ios
```

---

## 🧠 Technologies Used

- **React Native** → Mobile app framework
- **Face Recognition** → Biometric attendance validation
- **Geolocation API** → Location verification
- **Backend Server (AbsensiKonsel-Server)** → Data management and authentication
- **SQLite** → Local database untuk offline attendance
- **ML Kit Face Detection** → Liveness detection dengan gesture verification

---

## 🏗️ System Architecture

```
[Mobile App (AbsensiKonsel)]
        │
        ▼
[Face Recognition & GPS Validation]
        │
        ▼
[Backend Server]
        │
        ▼
[Database & Admin Panel]
```

---

## 📁 Project Structure

```
AbsensiKonsel/
├── src/
│   ├── assets/              # Images, fonts, and other assets
│   ├── components/          # Reusable UI components
│   ├── lib/
│   │   ├── database.ts      # SQLite database helper
│   │   ├── fetching.js      # API fetching utilities
│   │   └── kiken.js         # Helper functions
│   ├── pages/
│   │   └── Auth/
│   │       └── Offline/
│   │           └── VerifikasiWajah.tsx  # Face verification & liveness detection
│   └── redux/               # State management
├── android/                 # Android native code
├── ios/                     # iOS native code
└── assets/                  # App assets (splash, icons)
```

---

## 💾 Local Database (SQLite)

The application uses **SQLite** to store attendance data offline. Data will be synchronized to the server when an internet connection is available.

### 📊 Table: `absensi_offline`

| Column       | Type    | Description                             |
| ------------ | ------- | --------------------------------------- |
| `id`         | INTEGER | Primary key, auto increment             |
| `nip`        | TEXT    | Civil servant identification number     |
| `latitude`   | REAL    | Attendance location latitude            |
| `longitude`  | REAL    | Attendance location longitude           |
| `timestamp`  | TEXT    | Attendance time (ISO 8601 format)       |
| `image_path` | TEXT    | Selfie photo path on device             |
| `is_synced`  | INTEGER | Sync status (0=pending, 1=synced)       |
| `created_at` | TEXT    | Record creation time                    |
| `synced_at`  | TEXT    | Time when successfully synced to server |

### 🔧 Available Database Functions

File: `src/lib/database.ts`

| Function                 | Parameter             | Return            | Description                          |
| ------------------------ | --------------------- | ----------------- | ------------------------------------ |
| `initDatabase()`         | -                     | `Promise<void>`   | Initialize database & create tables  |
| `saveAbsensiOffline()`   | `AbsensiOfflineInput` | `Promise<number>` | Save new attendance data, returns ID |
| `getUnsyncedAbsensi()`   | -                     | `Promise<[]>`     | Get all unsynced data                |
| `getAllAbsensi()`        | -                     | `Promise<[]>`     | Get all attendance data              |
| `getAbsensiByNip()`      | `nip: string`         | `Promise<[]>`     | Get data by NIP                      |
| `getAbsensiByDate()`     | `date: string`        | `Promise<[]>`     | Get data by date                     |
| `markAsSynced()`         | `id: number`          | `Promise<void>`   | Mark single record as synced         |
| `markMultipleAsSynced()` | `ids: number[]`       | `Promise<void>`   | Mark multiple records as synced      |
| `deleteSyncedAbsensi()`  | -                     | `Promise<number>` | Delete all synced data               |
| `deleteAbsensiById()`    | `id: number`          | `Promise<void>`   | Delete data by ID                    |
| `countUnsyncedAbsensi()` | -                     | `Promise<number>` | Count pending sync records           |
| `closeDatabase()`        | -                     | `Promise<void>`   | Close database connection            |
| `resetDatabase()`        | -                     | `Promise<void>`   | Delete all data (for testing only)   |

### 📝 Usage Example

```typescript
import {
  initDatabase,
  saveAbsensiOffline,
  getUnsyncedAbsensi,
  markAsSynced,
} from './src/lib/database';

// Initialize database
await initDatabase();

// Save offline attendance
const id = await saveAbsensiOffline({
  nip: '199012312020011001',
  latitude: -4.0826,
  longitude: 122.5199,
  timestamp: new Date().toISOString(),
  image_path: '/path/to/photo.jpg',
});

// Get unsynced data
const pendingData = await getUnsyncedAbsensi();

// After successfully synced to server
await markAsSynced(id);
```

---

## 🧬 Liveness Detection

The application uses **gesture-based liveness detection** to ensure the user is a real human, not a photo or video.

### 🎯 Supported Gestures

| Gesture         | Icon | Detection                                    |
| --------------- | ---- | -------------------------------------------- |
| Blink           | 👁️   | `eyeOpenProbability` < 0.3 then > 0.7        |
| Smile           | 😊   | `smilingProbability` > 0.6 then < 0.4        |
| Close Right Eye | ➡️   | `rightEyeOpenProbability` < 0.3 & left > 0.5 |

### 🔄 Verification Flow

```
1. User taps "Take Photo"
         │
         ▼
2. System randomly selects 2 gestures
         │
         ▼
3. User follows gesture instructions
   (max 3 attempts per gesture)
         │
         ├── ❌ Failed → Verification rejected
         │
         ▼
4. ✅ All gestures successful
         │
         ▼
5. Capture still photo (final photo)
         │
         ▼
6. User taps "Save"
         │
         ▼
7. Data saved to SQLite
```

### ⚙️ ML Kit Configuration

```typescript
const detectionOptions = {
  performanceMode: 'fast',
  landmarkMode: 'none',
  contourMode: 'none',
  classificationMode: 'all', // Required for probability
  minFaceSize: 0.15,
  trackingEnabled: false,
};
```

---

## 📦 Main Dependencies

| Package                               | Version | Purpose                       |
| ------------------------------------- | ------- | ----------------------------- |
| `react-native-vision-camera`          | ^4.7.2  | Camera access & photo capture |
| `@react-native-ml-kit/face-detection` | ^2.1.2  | Face detection & liveness     |
| `react-native-sqlite-storage`         | ^6.0.1  | Local SQLite database         |
| `react-native-fs`                     | ^2.20.0 | File system operations        |
| `@react-navigation/native`            | ^7.1.8  | Navigation                    |
| `react-native-geolocation-service`    | ^5.3.1  | GPS location                  |

---

## 🧑‍💻 Contributors

- **IT Development Team of Konawe Selatan Regency Government**

---

## 📄 License

This project is developed for the internal use of the **Konawe Selatan Regency Government**.  
© 2025 Department of Communication and Informatics (Diskominfo) Konawe Selatan. All rights reserved.

---

> “Accurate, transparent, and verified attendance — for a more professional ASN workforce.”
