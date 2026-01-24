# 📱 AbsensiKonsel APK Build Guide

Panduan sederhana untuk build APK release dari project AbsensiKonsel.

## 📋 Prerequisites

- **Node.js**: ≥ 20.19.0
- **Java JDK**: 17.0.10 (gunakan Zulu JDK)
- **Android SDK**: Target SDK 35, Min SDK 24
- **Gradle**: 8.14.1 (sudah included di project)

## 🛠️ Setup Environment

### 1. Install Dependencies

```bash
cd AbsensiKonsel
npm install --legacy-peer-deps
```

### 2. Set JAVA_HOME ke Zulu JDK 17

```bash
export JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home
```

## 🏗️ Build APK Release

### Command Build

```bash
export JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home
cd android
./gradlew assembleRelease
```

### Output

- **Lokasi APK**: `android/app/build/outputs/apk/release/app-release.apk`
- **Ukuran Estimasi**: ~96MB

## 🧪 Testing APK

1. Transfer APK ke device Android
2. Aktifkan "Install from unknown sources"
3. Install dan test fitur:
   - Geolocation
   - Face capture
   - Offline storage

## 🐛 Troubleshooting

### Error: "Java 11 detected"

```bash
export JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home
```

### Error: "Build failed"

- Pastikan semua dependencies terinstall
- Cek log di `android/build/reports/problems/problems-report.html`

---

**Last Updated**: January 24, 2026  
**APK Version**: 1.0  
**Build Tools**: Gradle 8.14.1, React Native 0.80.1
