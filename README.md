# 🎯 Absensi Online - Konawe Selatan Regency Government

**Absensi Online** is a comprehensive attendance management system designed for **Civil Servants (ASN)** within the **Konawe Selatan Regency Government**. The system ensures accurate, transparent, and verified attendance through modern technologies.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Mobile App Setup](#mobile-app-setup)
  - [Web Dashboard Setup](#web-dashboard-setup)
  - [Server Setup](#server-setup)
- [API Documentation](#api-documentation)
- [Face Anti-Spoofing Microservice](#face-anti-spoofing-microservice)
- [Contributors](#-contributors)
- [License](#-license)

---

## 🌟 Overview

This system consists of multiple interconnected components:

| Component         | Description                           | Technology         |
| ----------------- | ------------------------------------- | ------------------ |
| **AbsensiKonsel** | Mobile application for ASN attendance | React Native       |
| **client**        | Web dashboard for management/admin    | Vue.js + Quasar    |
| **server**        | Backend microservices architecture    | Node.js/PHP/Python |
| **model**         | Face recognition ML models            | PyTorch/TensorFlow |

---

## ✨ Key Features

### Mobile Application (AbsensiKonsel)

- 🔐 **Secure authentication** for ASN through backend integration
- 📍 **Location-based attendance** using GPS verification
- 🧠 **Face Recognition** with liveness detection
- 📅 **Attendance history tracking** and status updates
- 📴 **Offline support** with SQLite database
- 📱 **Cross-platform**: Android & iOS

### Web Dashboard (client)

- 📊 **Real-time attendance monitoring**
- 👥 **Employee management**
- 📈 **Attendance reports and analytics**
- 🗺️ **Location tracking visualization**

### Backend Services

- 🔄 **Microservices architecture** for scalability
- 🔐 **Secure authentication** (JWT/Firebase)
- 🧠 **Face Anti-Spoofing** for biometric validation
- 💾 **Multi-database support** (MySQL/SQLite)

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ABSENSI ONLINE SYSTEM                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐      ┌──────────────────┐                │
│  │  Mobile Client   │      │   Web Dashboard  │                │
│  │  (AbsensiKonsel) │      │     (client)     │                │
│  │   React Native   │      │   Vue.js/Quasar  │                │
│  └────────┬─────────┘      └────────┬─────────┘                │
│           │                         │                          │
│           └──────────┬──────────────┘                          │
│                      ▼                                         │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                   API GATEWAY / LOAD BALANCER            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                      │                                         │
│     ┌────────────────┼────────────────┐                       │
│     ▼                ▼                ▼                       │
│  ┌─────────┐   ┌─────────────┐   ┌─────────┐                 │
│  │ Service │   │  Service    │   │ Service │                 │
│  │    1    │   │      2      │   │    3    │                 │
│  │ (Auth)  │   │  (Attendance)│   │ (Face)  │                 │
│  └─────────┘   └─────────────┘   └─────────┘                 │
│     │                │                │                       │
│     ▼                ▼                ▼                       │
│  ┌─────────┐   ┌─────────────┐   ┌─────────┐                 │
│  │  MySQL  │   │  MySQL/     │   │ ML Model│                 │
│  │         │   │  SQLite     │   │ (Pytorch│                 │
│  └─────────┘   └─────────────┘   └─────────┘                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
AbsensiOnlineMobile/
├── AbsensiKonsel/           # React Native Mobile Application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # App screens (Auth, Dashboard, Absensi, etc.)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities (database, API, helpers)
│   │   ├── redux/           # State management
│   │   └── assets/          # Images, fonts, icons
│   ├── android/             # Android native configuration
│   ├── ios/                 # iOS native configuration
│   └── package.json         # Dependencies & scripts
│
├── client/                  # Vue.js Web Dashboard
│   ├── src/
│   │   ├── components/      # Vue components
│   │   ├── views/           # Page views
│   │   ├── store/           # Vuex state management
│   │   ├── router/          # Vue Router configuration
│   │   └── library/         # Utilities & helpers
│   ├── public/              # Static assets
│   └── package.json         # Dependencies & scripts
│
├── server/                  # Backend Microservices
│   ├── server/              # Main server (Node.js/PHP)
│   ├── server_microservices_1/   # Authentication service
│   ├── server_microservices_2/   # Core attendance service
│   ├── server_microservices_3/   # Docker-based service
│   ├── server_microservices_4/   # Docker-based service
│   ├── server_microservices_5/   # Docker-based service
│   ├── server_microservices_6/   # Docker-based service
│   ├── server_microservices_7/   # Docker-based service
│   ├── server_microservices_8/   # Docker-based service
│   └── server_microservices_9/   # Face Anti-Spoofing (Python)
│
├── model/                   # ML Models
│   ├── 2.7_80x80_MiniFASNetV2.pth
│   ├── 4_0_0_80x80_MiniFASNetV1SE.pth
│   └── facenet.tflite
│
├── assets/                  # Shared assets (icons, splash screens)
│
└── README.md                # This file
```

---

## 🛠️ Technology Stack

### Mobile Application

| Technology            | Version | Purpose                         |
| --------------------- | ------- | ------------------------------- |
| React Native          | 0.80.1  | Cross-platform mobile framework |
| React                 | 19.1.0  | UI library                      |
| TypeScript            | 5.0.4   | Type safety                     |
| Redux Toolkit         | 2.9.2   | State management                |
| React Navigation      | 7.1.17  | Navigation                      |
| SQLite                | 6.0.1   | Offline database                |
| Vision Camera         | 4.7.2   | Camera access                   |
| ML Kit Face Detection | 2.1.2   | Face detection & liveness       |
| Geolocation           | 5.3.1   | GPS tracking                    |

### Web Dashboard

| Technology | Version | Purpose                 |
| ---------- | ------- | ----------------------- |
| Vue.js     | 2.6.11  | Framework               |
| Quasar     | 1.0.0   | UI framework            |
| Vuex       | 3.1.3   | State management        |
| Socket.io  | 2.2.0   | Real-time communication |
| Vue Router | 3.1.6   | Routing                 |

### Backend Services

| Technology         | Version  | Purpose               |
| ------------------ | -------- | --------------------- |
| Node.js            | ≥18      | Runtime environment   |
| PHP                | 7.x/8.x  | Server-side scripting |
| Python             | 3.8+     | ML & Face recognition |
| MySQL              | 5.7+/8.0 | Primary database      |
| TensorFlow/PyTorch | -        | ML model inference    |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** ≥ 18.x
- **npm** or **yarn**
- **Java** 17 (for Android development)
- **Android Studio** (for Android development)
- **Xcode** (for iOS development - macOS only)
- **Python** 3.8+ (for ML services)
- **MySQL** 5.7+ or MariaDB

### Mobile App Setup (AbsensiKonsel)

```bash
# Navigate to mobile app directory
cd AbsensiKonsel

# Install dependencies
npm install

# Install iOS pods (macOS only)
cd ios
pod install
cd ..

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Web Dashboard Setup (client)

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Run development server
npm run serve

# Build for production
npm run build
```

### Server Setup

#### Main Server

```bash
cd server/server

# Install Node.js dependencies
npm install

# Or for PHP version
# (Ensure Apache/Nginx + PHP-FPM is configured)

# Start Node.js server
node index.js
```

#### Microservices

```bash
# Each microservice has its own setup
cd server/server_microservices_1
npm install

cd ../server_microservices_2
npm install

# ... repeat for other services

# For Docker-based services (3-8)
cd server_microservices_3
docker build -t absensi-service-3 .
docker run -p 3003:3000 absensi-service-3
```

#### Face Anti-Spoofing Service (Microservice 9)

```bash
cd server/server_microservices_9

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Run the service
python main.py
```

---

## 📚 API Documentation

### Face Anti-Spoofing Service (Microservice 9)

#### 1. Inference (Face Prediction)

- **Endpoint:** `POST /api/v1/inference`
- **Description:** Predict whether a face image is real or fake
- **Request:** `multipart/form-data`
  - `image` (file): Face image to test
- **Response:**

```json
{
  "prediction": "real" | "fake",
  "confidence": 0.95
}
```

#### 2. Fine-tune (Model Training)

- **Endpoint:** `POST /api/v1/finetune`
- **Description:** Retrain model with new dataset
- **Request:** `multipart/form-data`
  - `data_dir` (string): Dataset directory path
  - `epochs` (integer, optional): Number of epochs (default: 10)
  - `batch_size` (integer, optional): Batch size (default: 32)
- **Response:**

```json
{
  "message": "Fine-tuning started successfully"
}
```

#### 3. Health Check

- **Endpoint:** `GET /`
- **Response:**

```json
{
  "message": "Face Anti-Spoofing Microservice - Absensi Online",
  "status": "running"
}
```

**Note:** Service runs on port 5009 by default.

---

## 🧠 Face Anti-Spoofing Microservice

This microservice handles liveness detection to ensure users are real humans, not photos or videos.

### Supported ML Models

- **MiniFASNetV2** (2.7 version, 80x80 input)
- **MiniFASNetV1SE** (4.0.0 version, 80x80 input)
- **FaceNet** (TFLite format for TensorFlow Lite)

### Detection Features

- Face detection and bounding box
- Liveness probability scoring
- Support for fine-tuning with custom datasets

### Usage Example

```bash
# Test inference
curl -X POST -F "image=@test_face.jpg" http://localhost:5009/api/v1/inference

# Response
{"prediction": "real", "confidence": 0.98}
```

---

## 👥 Contributors

- **IT Development Team of Konawe Selatan Regency Government**
- **Department of Communication and Informatics (Diskominfo) Konawe Selatan**

---

## 📄 License

This project is developed for the internal use of the **Konawe Selatan Regency Government**.

© 2025 Department of Communication and Informatics (Diskominfo) Konawe Selatan. All rights reserved.

---

## 🙏 Acknowledgments

- Konawe Selatan Regency Government for supporting this initiative
- Open source communities for the amazing libraries and frameworks

---

> **"Accurate, transparent, and verified attendance — for a more professional ASN workforce."**

---

## 📞 Support

For issues and feature requests, please contact:

- **Email:** it@konaselselatan.go.id
- **Website:** https://diskominfo.konaselselatan.go.id
