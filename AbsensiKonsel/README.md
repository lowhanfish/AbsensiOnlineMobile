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

## 🧑‍💻 Contributors

- **IT Development Team of Konawe Selatan Regency Government**

---

## 📄 License

This project is developed for the internal use of the **Konawe Selatan Regency Government**.  
© 2025 Department of Communication and Informatics (Diskominfo) Konawe Selatan. All rights reserved.

---

> “Accurate, transparent, and verified attendance — for a more professional ASN workforce.”
