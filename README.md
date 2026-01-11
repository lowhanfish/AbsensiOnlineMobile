# 📱 AbsensiKonsel - Complete System

**AbsensiKonsel** is a **comprehensive online attendance system** designed for **civil servants (ASN)** within the **Konawe Selatan Regency Government**.

This repository contains the complete ecosystem including **Mobile App**, **Backend Server (Microservices)**, and **Web Client**.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    AbsensiKonsel System                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Mobile     │    │    Web       │    │   Admin      │      │
│  │    App       │    │   Client     │    │   Panel      │      │
│  │  (React      │    │   (Vue.js)   │    │   (Vue.js)   │      │
│  │   Native)    │    │              │    │              │      │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘      │
│         │                   │                   │               │
│         └───────────────────┼───────────────────┘               │
│                             │                                   │
│                             ▼                                   │
│              ┌──────────────────────────────┐                   │
│              │     API Gateway / Server      │                   │
│              │       (Node.js/Express)       │                   │
│              └──────────────┬───────────────┘                   │
│                             │                                   │
│         ┌───────────────────┼───────────────────┐               │
│         ▼                   ▼                   ▼               │
│  ┌────────────┐     ┌────────────┐     ┌────────────┐          │
│  │ Microservice│     │ Microservice│     │ Microservice│         │
│  │     1-4     │     │     5-6     │     │     7-8     │         │
│  └──────┬─────┘     └──────┬─────┘     └──────┬─────┘          │
│         │                  │                  │                 │
│         └──────────────────┼──────────────────┘                 │
│                            ▼                                    │
│                   ┌──────────────┐                              │
│                   │    MySQL     │                              │
│                   │   Database   │                              │
│                   └──────────────┘                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```
AbsensiOnlineMobile/
├── AbsensiKonsel/           # 📱 Mobile App (React Native)
│   ├── src/
│   ├── android/
│   ├── ios/
│   └── README.md            # Mobile-specific documentation
│
├── client/                  # 🌐 Web Client (Vue.js + Quasar)
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/                  # ⚙️ Backend Services
│   ├── server/              # Main API Server
│   ├── server_microservices_1/
│   ├── server_microservices_2/
│   ├── server_microservices_3/
│   ├── server_microservices_4/
│   ├── server_microservices_5/
│   ├── server_microservices_6/
│   ├── server_microservices_7/
│   └── server_microservices_8/
│
├── assets/                  # 🎨 Shared Assets
└── README.md                # This file
```

---

## 🚀 Components Overview

### 📱 Mobile App (`/AbsensiKonsel`)

React Native mobile application for ASN attendance with:

- **Face Recognition** - Biometric identity validation
- **Liveness Detection** - Anti-spoofing with gesture verification
- **Geolocation** - Location-based attendance verification
- **Offline Mode** - SQLite local storage with sync capability

📖 [View Mobile App Documentation](./AbsensiKonsel/README.md)

---

### 🌐 Web Client (`/client`)

Vue.js web application with Quasar framework:

- User dashboard
- Attendance history
- Profile management

| Technology | Version |
| ---------- | ------- |
| Vue.js     | 2.x     |
| Quasar     | 1.x     |

---

### ⚙️ Backend Server (`/server`)

Node.js/Express microservices architecture:

| Service                  | Port | Description            |
| ------------------------ | ---- | ---------------------- |
| `server`                 | 3000 | Main API Gateway       |
| `server_microservices_1` | 3001 | Auth & User Management |
| `server_microservices_2` | 3002 | Attendance Processing  |
| `server_microservices_3` | 3003 | Face Vector Storage    |
| `server_microservices_4` | 3004 | Report Generation      |
| `server_microservices_5` | 3005 | Notification Service   |
| `server_microservices_6` | 3006 | Location Validation    |
| `server_microservices_7` | 3007 | Sync Service           |
| `server_microservices_8` | 3008 | Analytics              |

---

## ⚙️ Server Specifications

| Component        | Specification         |
| ---------------- | --------------------- |
| **CPU**          | 16 Core               |
| **RAM**          | 32 GB                 |
| **Bandwidth**    | 50 Mbps               |
| **Database**     | MySQL                 |
| **Target Users** | 10,000 concurrent ASN |

---

## 🔐 Face Recognition Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Face Recognition Flow                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Mobile Device                          Server              │
│  ─────────────                          ──────              │
│                                                             │
│  1. Capture Photo                                           │
│         │                                                   │
│         ▼                                                   │
│  2. Liveness Detection                                      │
│     (Blink/Smile/Wink)                                      │
│         │                                                   │
│         ▼                                                   │
│  3. ML Kit Face Detection                                   │
│         │                                                   │
│         ▼                                                   │
│  4. Generate 192-dim Vector  ────────►  5. Receive Vector   │
│     (on device)                            (~3KB)           │
│                                              │              │
│                                              ▼              │
│                                         6. Cosine Similarity│
│                                            Comparison       │
│                                              │              │
│                              ┌───────────────┴──────────────┐
│                              ▼                              ▼
│                         MATCH ≥ 0.85                   NO MATCH
│                              │                              │
│                              ▼                              ▼
│  7. Attendance Recorded  ◄───┘           Attendance Rejected
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key Benefits:**

- ✅ Processing on device → Reduces server load
- ✅ Only 3KB vector sent → Minimal bandwidth
- ✅ Fast comparison (~0.01ms) → High throughput

---

## 🧩 Quick Start

### 1️⃣ Clone Repository

```bash
git clone https://github.com/lowhanfish/AbsensiOnlineMobile.git
cd AbsensiOnlineMobile
```

### 2️⃣ Setup Mobile App

```bash
cd AbsensiKonsel
npm install
npx react-native run-android  # or run-ios
```

### 3️⃣ Setup Web Client

```bash
cd client
npm install
npm run serve
```

### 4️⃣ Setup Server

```bash
cd server/server
npm install
node index.js
```

---

## 📦 Technology Stack

| Layer              | Technology                                 |
| ------------------ | ------------------------------------------ |
| **Mobile**         | React Native 0.80.1, Vision Camera, ML Kit |
| **Web**            | Vue.js 2.x, Quasar Framework               |
| **Backend**        | Node.js, Express.js                        |
| **Database**       | MySQL                                      |
| **Face Detection** | Google ML Kit                              |
| **Authentication** | JWT                                        |

---

## 🧑‍💻 Contributors

- **IT Development Team of Konawe Selatan Regency Government**

---

## 📄 License

This project is developed for the internal use of the **Konawe Selatan Regency Government**.  
© 2025 Department of Communication and Informatics (Diskominfo) Konawe Selatan. All rights reserved.

---

> "Accurate, transparent, and verified attendance — for a more professional ASN workforce."
