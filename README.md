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

›
Navigate to the iOS directory and install pods:

```bash
cd ios
pod install
```

---

## ▶️ Running the Application

### 🔹 Android››

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
- **SQLite** → Local database for offline attendance
- **ML Kit Face Detection** → Liveness detection with gesture verification

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

| Column        | Type    | Description                                                |
| ------------- | ------- | ---------------------------------------------------------- |
| `id`          | INTEGER | Primary key, auto increment                                |
| `nip`         | TEXT    | Civil servant identification number                        |
| `latitude`    | REAL    | Attendance location latitude                               |
| `longitude`   | REAL    | Attendance location longitude                              |
| `timestamp`   | TEXT    | Attendance time (ISO 8601 format)                          |
| `image_path`  | TEXT    | Selfie photo path on device                                |
| `status`      | INTEGER | Validation status: `0`=pending, `1`=accepted, `2`=rejected |
| `description` | TEXT    | Validation result description from server                  |
| `is_synced`   | INTEGER | Sync status (0=not synced, 1=synced)                       |
| `created_at`  | TEXT    | Record creation time                                       |
| `synced_at`   | TEXT    | Time when successfully synced to server                    |

### 📋 Status Codes

| Code | Label    | Description                    |
| ---- | -------- | ------------------------------ |
| `0`  | Pending  | Waiting for synchronization    |
| `1`  | Accepted | Attendance validated by server |
| `2`  | Rejected | Attendance rejected by server  |

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
7. Data saved to SQLite (status: 0)
```

---

## 🌿 Branch Information

### 🔸 New Branch: `hi_dayat`

This branch is created for **development and testing** of the new Face Recognition feature in the attendance module.

#### 🧠 Purpose

- Implement face recognition-based attendance.
- Enhance security and reliability in attendance validation.
- Optimize camera performance for real-time processing.

#### 🧩 Included Libraries

- `@react-native-ml-kit/face-detection` — Face Detection module.
- `react-native-vision-camera` — Camera component for React Native.

---

## 🛠️ Recent Changes

- 🧠 Added Face Detection & Recognition using **ML Kit**.
- 📸 Implemented camera permission handling with **react-native-vision-camera**.

---

## ⚙️ Library Installation

To support Face Recognition, Camera, and Offline Database functionality, make sure to install the following dependencies:

```bash
# Install ML Kit Face Detection
npm install @react-native-ml-kit/face-detection

# Install Vision Camera
npm install react-native-vision-camera

# Install SQLite Storage
npm install react-native-sqlite-storage

# Install File System
npm install react-native-fs
```

Adding line for camera permission in android/app/src/main/AndroidManifest.xml

```bash
<uses-permission android:name="android.permission.CAMERA" />
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
