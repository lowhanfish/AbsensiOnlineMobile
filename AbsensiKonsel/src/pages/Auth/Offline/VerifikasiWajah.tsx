// Import library
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform, PermissionsAndroid, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import * as RNFS from 'react-native-fs';

// Import Database
import { initDatabase, saveAbsensiOffline, countUnsyncedAbsensi } from '../../../lib/database';

// Import ML Kit Face Detection
let FaceDetection: any = null;
try {
    FaceDetection = require('@react-native-ml-kit/face-detection').default;
} catch (e) {
    console.warn('⚠️ ML Kit tidak tersedia');
}

// Komponen Verifikasi Wajah
const VerifikasiWajah = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { lokasi } = (route.params as any) || {};

    const cameraRef = useRef<Camera>(null);
    const { hasPermission, requestPermission } = useCameraPermission();
    const device = useCameraDevice('front');

    // ============ STATE ============
    const [cameraReady, setCameraReady] = useState(false);
    const [isCaptured, setIsCaptured] = useState(false);
    const [imageData, setImageData] = useState<string | null>(null);
    const [vectorData, setVectorData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sendingToServer, setSendingToServer] = useState(false);
    const [detectionStatus, setDetectionStatus] = useState('📷 Siap untuk verifikasi');

    console.log('Lokasi yang diterima:', lokasi);

    // ============ GESTURE-BASED LIVENESS ============
    const gestureInstructions = [
        { id: 'blink', text: '👁️ KEDIP MATA' },
        { id: 'smile', text: '😊 SENYUM' },
        { id: 'right_eye_close', text: '➡️ TUTUP MATA KANAN' },
    ];

    const getRandomGestures = () => {
        // Acak urutan dan ambil 2 gesture
        const shuffled = [...gestureInstructions].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 2);
    };

    const captureGestureWithInstruction = async (): Promise<{ isLive: boolean; score: number; reason: string; results: { [key: string]: boolean }; finalPhotoPath: string | null }> => {
        try {
            console.log('🎬 Memulai liveness berbasis gesture...');

            if (!FaceDetection || !FaceDetection.detect) {
                return {
                    isLive: false,
                    score: 0,
                    reason: 'ML Kit tidak tersedia',
                    results: {},
                    finalPhotoPath: null
                };
            }

            const selectedGestures = getRandomGestures();
            console.log('📋 Gesture terpilih:', selectedGestures.map(g => g.text));

            const results: { [key: string]: boolean } = {};

            // Proses setiap gesture - LANGSUNG REJECT jika gagal
            for (let i = 0; i < selectedGestures.length; i++) {
                const gesture = selectedGestures[i];
                let gestureDetected = false;
                let attemptCount = 0;
                const maxAttempts = 3;

                // Terus coba sampai gesture terdeteksi atau maksimal percobaan tercapai
                while (!gestureDetected && attemptCount < maxAttempts) {
                    attemptCount++;
                    setDetectionStatus(`${gesture.text}\n(Upaya ${attemptCount}/${maxAttempts})`);

                    console.log(`🎬 Gesture ${i + 1}/${selectedGestures.length}: ${gesture.text} (Upaya ${attemptCount})`);

                    // Rekam frame selama gesture ini
                    gestureDetected = await recordGestureFrames(gesture);

                    if (gestureDetected) {
                        console.log(`✅ Gesture terdeteksi pada upaya ${attemptCount}!`);
                        setDetectionStatus(`✅ ${gesture.text} - Terdeteksi!`);
                        results[gesture.id] = true;
                        // Pause sebelum instruksi berikutnya
                        await new Promise(resolve => setTimeout(resolve, 1500));
                    } else if (attemptCount < maxAttempts) {
                        console.log(`❌ Gesture TIDAK terdeteksi, upaya ${attemptCount}/${maxAttempts}`);
                        setDetectionStatus(`❌ Tidak terdeteksi\nCoba lagi... (${maxAttempts - attemptCount} kesempatan)`);
                        // Pause sebelum retry
                        await new Promise(resolve => setTimeout(resolve, 1500));
                    }
                }

                // JIKA GESTURE GAGAL - LANGSUNG REJECT, TIDAK LANJUT
                if (!gestureDetected) {
                    console.log(`❌ Gesture ${gesture.id} gagal setelah ${maxAttempts} upaya - REJECT`);
                    setDetectionStatus(`❌ ${gesture.text}\nGagal - Verifikasi dibatalkan`);
                    results[gesture.id] = false;

                    return {
                        isLive: false,
                        score: 0,
                        reason: `Gesture "${gesture.text}" gagal terdeteksi`,
                        results,
                        finalPhotoPath: null
                    };
                }
            }

            // SEMUA GESTURE BERHASIL - Ambil foto diam sebagai foto final
            console.log('📸 Semua gesture berhasil, mengambil foto diam...');
            setDetectionStatus('📸 DIAM - Jangan bergerak\nMengambil foto...');

            // Tunggu sebentar agar user siap
            await new Promise(resolve => setTimeout(resolve, 1000));

            let finalPhotoPath: string | null = null;
            try {
                if (cameraRef.current) {
                    const stillPhoto = await cameraRef.current.takePhoto();
                    if (stillPhoto && stillPhoto.path) {
                        finalPhotoPath = stillPhoto.path;
                        console.log('✅ Foto diam berhasil diambil:', finalPhotoPath);
                    }
                }
            } catch (photoErr: any) {
                console.warn('⚠️ Gagal mengambil foto diam:', photoErr?.message);
            }

            if (!finalPhotoPath) {
                return {
                    isLive: false,
                    score: 0,
                    reason: 'Gagal mengambil foto final',
                    results,
                    finalPhotoPath: null
                };
            }

            console.log(`📊 Hasil gesture: ${selectedGestures.length}/${selectedGestures.length} terdeteksi`);

            return {
                isLive: true,
                score: 1.0,
                reason: `Semua ${selectedGestures.length} gerakan terdeteksi - Liveness terverifikasi`,
                results,
                finalPhotoPath
            };

        } catch (err: any) {
            console.error('❌ Error capture gesture:', err?.message);
            return {
                isLive: false,
                score: 0,
                reason: 'Deteksi gesture gagal',
                results: {},
                finalPhotoPath: null
            };
        }
    };

    const recordGestureFrames = async (gesture: any): Promise<boolean> => {
        try {
            console.log(`📹 Recording frames for: ${gesture.text}`);

            const framePaths: string[] = [];
            const maxDuration = 10000; // Maksimal 10 detik
            const startTime = Date.now();
            let isRecording = true;

            // Tangkap frame dengan cepat (tanpa deteksi)
            const captureFrameLoop = async () => {
                while (isRecording && Date.now() - startTime < maxDuration) {
                    if (!cameraRef.current) {
                        await new Promise(resolve => setTimeout(resolve, 200));
                        continue;
                    }

                    try {
                        const photo = await cameraRef.current.takePhoto();
                        if (photo) {
                            framePaths.push(photo.path);
                            console.log(`📹 Frame captured (${framePaths.length})`);
                        }
                    } catch (photoErr: any) {
                        console.warn('⚠️ Photo error:', photoErr?.message);
                    }

                    // Tunggu sebelum tangkap berikutnya
                    await new Promise(resolve => setTimeout(resolve, 100)); // ~10 fps
                }
                console.log(`📹 Capture loop finished - ${framePaths.length} frames total`);
            };

            // Mulai menangkap
            const capturePromise = captureFrameLoop();

            // Tunggu 2.5 detik untuk perekaman
            await new Promise(resolve => setTimeout(resolve, 2500));

            // Hentikan loop perekaman
            isRecording = false;

            // Tunggu loop selesai sepenuhnya
            await capturePromise;

            console.log(`📹 Recording finished - captured ${framePaths.length} frames`);

            // Deteksi semua frame yang ditangkap
            if (framePaths.length < 3) {
                console.log(`❌ Too few frames: ${framePaths.length}`);
                // Bersihkan file
                for (const path of framePaths) {
                    try {
                        await RNFS.unlink(path);
                    } catch (e) { }
                }
                return false;
            }

            const frames: any[] = [];
            for (let i = 0; i < framePaths.length; i++) {
                try {
                    const path = framePaths[i];
                    let detectionPath = path;
                    if (!detectionPath.startsWith('file://')) {
                        detectionPath = 'file://' + detectionPath;
                    }

                    if (FaceDetection && FaceDetection.detect) {
                        const faces = await FaceDetection.detect(detectionPath, {
                            performanceMode: 'fast',
                            classificationMode: 'all', // Aktifkan probabilitas mata terbuka
                            landmarkMode: 'all',
                        });
                        if (faces && faces.length > 0) {
                            const face = faces[0];
                            frames.push({
                                face: face,
                                frameIndex: i,
                                timestamp: Date.now(),
                                leftEyeOpen: face.leftEyeOpenProbability,
                                rightEyeOpen: face.rightEyeOpenProbability,
                            });
                            console.log(`✅ Frame ${i + 1}: Face detected, leftEye=${face.leftEyeOpenProbability?.toFixed(2)}, rightEye=${face.rightEyeOpenProbability?.toFixed(2)}`);
                        }
                    }
                } catch (e) {
                    console.warn(`⚠️ Detection error for frame ${i}:`, (e as any)?.message);
                }
            }

            console.log(`📊 Detected faces in ${frames.length}/${framePaths.length} frames`);

            // Analisis gesture
            let gestureDetected = false;
            if (frames.length >= 3) {
                gestureDetected = analyzeGestureFrames(gesture, frames);
                console.log(`📊 Gesture analysis: ${gesture.id} = ${gestureDetected}`);
            } else {
                console.log(`❌ Insufficient face detections: ${frames.length}/3`);
            }

            // Bersihkan file
            for (const path of framePaths) {
                try {
                    await RNFS.unlink(path);
                } catch (e) { }
            }

            return gestureDetected;

        } catch (err: any) {
            console.warn('⚠️ Recording error:', err?.message);
            return false;
        }
    };

    const analyzeGestureFrames = (gesture: any, frames: any[]): boolean => {
        try {
            console.log(`📊 Analyzing ${frames.length} frames for gesture: ${gesture.id}`);

            if (frames.length < 3) {
                console.log('❌ Not enough frames');
                return false;
            }

            const firstFrame = frames[0].face;
            const lastFrame = frames[frames.length - 1].face;

            // Analisis berdasarkan jenis gesture
            switch (gesture.id) {
                case 'blink':
                    // Deteksi kedip menggunakan probabilitas mata terbuka ML Kit
                    // leftEyeOpenProbability / rightEyeOpenProbability: 0.0 = tertutup, 1.0 = terbuka
                    if (frames.length < 3) {
                        console.log(`❌ Blink: too few frames (${frames.length})`);
                        return false;
                    }

                    // Cek penutupan mata (probabilitas < 0.3) di frame manapun
                    let hasEyeClosure = false;
                    let hasEyeOpen = false;

                    for (const frame of frames) {
                        const leftEye = frame.leftEyeOpen ?? 1;
                        const rightEye = frame.rightEyeOpen ?? 1;
                        const avgEye = (leftEye + rightEye) / 2;

                        if (avgEye < 0.3) {
                            hasEyeClosure = true;
                            console.log(`✅ Eye closure detected: left=${leftEye.toFixed(2)}, right=${rightEye.toFixed(2)}`);
                        }
                        if (avgEye > 0.7) {
                            hasEyeOpen = true;
                        }
                    }

                    // Kedip = mata terbuka DAN tertutup di titik berbeda
                    const blinkDetected = hasEyeClosure && hasEyeOpen;
                    console.log(`📊 Blink analysis: closure=${hasEyeClosure}, open=${hasEyeOpen}, blink=${blinkDetected}`);
                    return blinkDetected;

                case 'smile':
                    // Senyum: wajah harus terdeteksi konsisten
                    // Senyum asli = wajah tetap terlihat, tidak ada perubahan besar
                    if (frames.length < 3) {
                        console.log(`❌ Smile: too few frames (${frames.length})`);
                        return false;
                    }

                    // Cek probabilitas senyum menggunakan ML Kit
                    let hasSmile = false;
                    let hasNeutral = false;
                    let minSmileProb = 1;
                    let maxSmileProb = 0;

                    for (const frame of frames) {
                        const smileProbability = frame.face.smilingProbability ?? 0.5;
                        minSmileProb = Math.min(minSmileProb, smileProbability);
                        maxSmileProb = Math.max(maxSmileProb, smileProbability);

                        console.log(`😊 Smile probability: ${(smileProbability * 100).toFixed(1)}%`);

                        // Ambang batas: > 0.6 = senyum, < 0.4 = netral
                        if (smileProbability > 0.6) hasSmile = true;
                        if (smileProbability < 0.4) hasNeutral = true;
                    }

                    console.log(`📊 Smile: min ${(minSmileProb * 100).toFixed(1)}%, max ${(maxSmileProb * 100).toFixed(1)}%`);
                    console.log(`📊 Has neutral: ${hasNeutral}, Has smile: ${hasSmile}`);

                    // Senyum valid: terdeteksi state netral DAN senyum
                    const smileDetected = hasSmile && hasNeutral;
                    console.log(`✅ Smile: ${smileDetected ? 'DETECTED' : 'REJECTED'}`);
                    return smileDetected;

                case 'right_eye_close':
                    // Tutup mata kanan: mata kanan tertutup, mata kiri tetap terbuka
                    // Catatan: kamera depan membalik gambar, jadi kanan user = kiri di kamera
                    if (frames.length < 3) {
                        console.log(`❌ Right eye close: terlalu sedikit frame (${frames.length})`);
                        return false;
                    }

                    let hasRightClosed = false;
                    let hasRightOpen = false;

                    for (const frame of frames) {
                        // rightEyeOpenProbability dari ML Kit (sudah di-mirror oleh kamera)
                        const rightEye = frame.rightEyeOpen ?? 1;
                        const leftEye = frame.leftEyeOpen ?? 1;

                        console.log(`👁️ Mata kanan: ${(rightEye * 100).toFixed(1)}%, Mata kiri: ${(leftEye * 100).toFixed(1)}%`);

                        // Mata kanan tertutup (< 0.3) DAN mata kiri terbuka (> 0.5)
                        if (rightEye < 0.3 && leftEye > 0.5) {
                            hasRightClosed = true;
                            console.log(`✅ Mata kanan tertutup terdeteksi`);
                        }
                        // Kedua mata terbuka (untuk transisi)
                        if (rightEye > 0.6 && leftEye > 0.6) {
                            hasRightOpen = true;
                        }
                    }

                    // Valid = ada transisi dari terbuka ke mata kanan tertutup
                    const rightEyeCloseDetected = hasRightClosed && hasRightOpen;
                    console.log(`📊 Tutup mata kanan: tertutup=${hasRightClosed}, terbuka=${hasRightOpen}, terdeteksi=${rightEyeCloseDetected}`);
                    return rightEyeCloseDetected;

                default:
                    return false;
            }
        } catch (err: any) {
            console.error('❌ Analysis error:', err?.message);
            return false;
        }
    };

    // ============ MINTA IZIN KAMERA ============
    useEffect(() => {
        requestPermissionCamera();
    }, []);

    const requestPermissionCamera = async () => {
        if (!hasPermission) {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: 'Izin Kamera',
                        message: 'Aplikasi membutuhkan akses kamera untuk verifikasi wajah',
                        buttonPositive: 'OK',
                        buttonNegative: 'Cancel',
                    }
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    setError('Izin kamera ditolak');
                    return;
                }
            } else {
                await requestPermission();
            }
        }
        setCameraReady(true);
    };

    // ============ AMBIL FOTO + CEK LIVENESS ============
    const capturePhoto = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!cameraRef.current) {
                setError('Kamera tidak siap');
                return;
            }

            // Langkah 1: Mulai verifikasi gesture (foto awal tidak perlu disimpan)
            setDetectionStatus('🎬 Persiapan verifikasi...');
            console.log('🎬 Memulai verifikasi liveness...');

            setLoading(true);
            const livenessResult = await captureGestureWithInstruction();
            setLoading(false);

            console.log('📊 Hasil liveness:', livenessResult);

            // Cek hasil liveness
            if (!livenessResult.isLive) {
                setDetectionStatus('❌ Verifikasi gagal');
                setError(`Liveness check gagal: ${livenessResult.reason}`);
                setLoading(false);
                return;
            }

            console.log(`✅ Liveness terverifikasi! Skor: ${livenessResult.score}`);
            setDetectionStatus('✅ Liveness terverifikasi!');

            // Foto final (diam) sudah diambil di dalam captureGestureWithInstruction
            // Simpan foto diam sebagai foto yang akan dikirim
            if (livenessResult.finalPhotoPath) {
                console.log('💾 Menyimpan foto diam sebagai foto final...');

                try {
                    const fileExists = await RNFS.exists(livenessResult.finalPhotoPath);
                    if (fileExists) {
                        console.log('✅ Foto diam tersimpan:', livenessResult.finalPhotoPath);
                        setImageData(livenessResult.finalPhotoPath);
                        setIsCaptured(true);
                        setDetectionStatus('✅ Verifikasi Berhasil');
                    } else {
                        setError('File foto tidak ditemukan');
                    }
                } catch (err: any) {
                    console.error('❌ Error simpan foto:', err?.message);
                    setError('Gagal menyimpan foto');
                }

                // ✅ OTOMATIS EXTRACT VEKTOR setelah foto berhasil
                if (livenessResult.finalPhotoPath) {
                    console.log('🧠 Mengekstrak vektor wajah...');
                    setDetectionStatus('🧠 Mengekstrak vektor wajah...');
                    await extractVectorFromImage(livenessResult.finalPhotoPath);
                }
            } else {
                setError('Foto final tidak tersedia');
            }
        } catch (err: any) {
            console.error('❌ Error capture:', err);
            setError(`Gagal: ${err?.message || 'Silakan coba lagi'}`);
        } finally {
            setLoading(false);
        }
    };

    // ============ EKSTRAK VEKTOR ============
    const extractVectorFromImage = async (imagePath: string) => {
        try {
            setLoading(true);
            setError(null);

            // TODO: Implementasi ekstrak vektor menggunakan TensorFlow Lite / MediaPipe
            // Contoh: const vector = await FaceNet.extractEmbedding(imagePath);

            // Untuk sekarang gunakan ML Kit untuk mendapatkan face landmarks sebagai vektor
            let extractedVector: number[] = [];

            if (FaceDetection && FaceDetection.detect) {
                let detectionPath = imagePath;
                if (!detectionPath.startsWith('file://')) {
                    detectionPath = 'file://' + detectionPath;
                }

                const faces = await FaceDetection.detect(detectionPath, {
                    performanceMode: 'accurate',
                    landmarkMode: 'all',
                    contourMode: 'all',
                    classificationMode: 'all',
                });

                if (faces && faces.length > 0) {
                    const face = faces[0];

                    // Ekstrak fitur dari face landmarks sebagai vektor sederhana
                    // TODO: Ganti dengan face embedding yang sebenarnya (FaceNet/ArcFace)
                    extractedVector = [
                        // Bounding box (normalized)
                        face.bounds?.x || 0,
                        face.bounds?.y || 0,
                        face.bounds?.width || 0,
                        face.bounds?.height || 0,
                        // Probabilitas
                        face.leftEyeOpenProbability || 0,
                        face.rightEyeOpenProbability || 0,
                        face.smilingProbability || 0,
                        // Head rotation
                        face.headEulerAngleX || 0,
                        face.headEulerAngleY || 0,
                        face.headEulerAngleZ || 0,
                    ];

                    // Tambahkan landmarks jika tersedia (sebagai object, bukan array)
                    if (face.landmarks && typeof face.landmarks === 'object') {
                        // ML Kit landmarks adalah object dengan key seperti 'leftEye', 'rightEye', etc.
                        const landmarkKeys = ['leftEye', 'rightEye', 'leftEar', 'rightEar', 'noseBase', 'leftCheek', 'rightCheek', 'leftMouth', 'rightMouth', 'bottomMouth'];
                        for (const key of landmarkKeys) {
                            const landmark = face.landmarks[key];
                            if (landmark) {
                                extractedVector.push(landmark.x || 0);
                                extractedVector.push(landmark.y || 0);
                            } else {
                                extractedVector.push(0);
                                extractedVector.push(0);
                            }
                        }
                    }

                    // Tambahkan contours jika tersedia
                    if (face.contours && typeof face.contours === 'object') {
                        const contourKeys = ['face', 'leftEyebrowTop', 'rightEyebrowTop', 'noseBridge', 'upperLipTop', 'lowerLipBottom'];
                        for (const key of contourKeys) {
                            const contour = face.contours[key];
                            if (contour && Array.isArray(contour) && contour.length > 0) {
                                // Ambil beberapa titik dari setiap contour
                                const point = contour[0];
                                extractedVector.push(point?.x || 0);
                                extractedVector.push(point?.y || 0);
                            } else {
                                extractedVector.push(0);
                                extractedVector.push(0);
                            }
                        }
                    }

                    // Pad ke 128 dimensi jika kurang
                    while (extractedVector.length < 128) {
                        extractedVector.push(0);
                    }
                    // Trim jika lebih
                    extractedVector = extractedVector.slice(0, 128);

                    console.log(`✅ Vektor berhasil diekstrak: ${extractedVector.length} dimensi`);
                } else {
                    throw new Error('Tidak ada wajah terdeteksi pada foto');
                }
            } else {
                throw new Error('ML Kit tidak tersedia untuk ekstraksi vektor');
            }

            const newVectorData = {
                embedding: extractedVector,
                confidence: 0.95,
                faceCount: 1,
                timestamp: new Date().toISOString(),
                imagePath: imagePath,
            };

            console.log('🧠 Vektor diekstrak');
            console.log('📊 Dimensi vektor:', extractedVector.length);

            setVectorData(newVectorData);
            setDetectionStatus('✅ Vektor wajah berhasil diekstrak');

        } catch (err: any) {
            console.error('❌ Error extract vector:', err);
            setError('Gagal ekstrak vektor: ' + err.message);
            setVectorData(null);
        } finally {
            setLoading(false);
        }
    };

    const extractVector = async () => {
        if (imageData) {
            await extractVectorFromImage(imageData);
        } else {
            setError('Tidak ada foto untuk diekstrak');
        }
    };

    // ============ SIMPAN KE DATABASE LOKAL ============
    const sendToServer = async () => {
        if (!imageData) {
            setError('Data foto tidak tersedia');
            return;
        }

        // ✅ VALIDASI: Vektor WAJIB ada
        if (!vectorData || !vectorData.embedding || vectorData.embedding.length === 0) {
            setError('Data vektor wajah tidak tersedia. Silakan ambil ulang foto.');
            return;
        }

        try {
            setSendingToServer(true);
            setError(null);

            // Inisialisasi database jika belum
            await initDatabase();

            // Konversi vektor ke JSON string
            const vektorString = JSON.stringify(vectorData.embedding);
            console.log('📊 Vektor disimpan:', vectorData.embedding.length, 'dimensi');

            // Data yang akan disimpan
            const absensiData = {
                nip: lokasi?.nip || 'UNKNOWN',
                latitude: lokasi?.latitude || 0,
                longitude: lokasi?.longitude || 0,
                timestamp: new Date().toISOString(),
                image_path: imageData,
                vektor: vektorString,
            };

            // Simpan ke SQLite
            const insertId = await saveAbsensiOffline(absensiData);
            console.log('✅ Data tersimpan dengan ID:', insertId);
            console.log('📊 Data yang disimpan:', JSON.stringify(absensiData, null, 2));

            // Hitung total data yang belum sync
            const unsyncedCount = await countUnsyncedAbsensi();

            Alert.alert(
                '✅ Berhasil',
                `Absensi tersimpan secara offline.\nTotal pending sync: ${unsyncedCount} data`,
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack(),
                    },
                ],
            );
        } catch (err: any) {
            console.error('❌ Error simpan ke database:', err);
            setError('Gagal menyimpan data: ' + err.message);
        } finally {
            setSendingToServer(false);
        }
    };

    // ============ TAMPILKAN UI ============
    if (!device || !cameraReady) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2196F3" />
                    <Text style={styles.loadingText}>Mempersiapkan kamera...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* CAMERA SECTION */}
            {!isCaptured ? (
                <View style={styles.cameraSection}>
                    <Camera
                        ref={cameraRef}
                        style={styles.camera}
                        device={device}
                        isActive={true}
                        photo={true}
                    />

                    {/* Lingkaran panduan penempatan wajah */}
                    <View style={styles.faceGuideOverlay}>
                        <View style={styles.faceGuideCircle}>
                            <Text style={styles.faceGuideText}>Posisikan wajah di sini</Text>
                        </View>
                    </View>

                    {/* Status indicator */}
                    <View style={styles.statusIndicator}>
                        <Text style={styles.statusText}>{detectionStatus}</Text>
                    </View>

                    {/* Loading indicator - separate dari status text */}
                    {loading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color="#2196F3" />
                        </View>
                    )}

                    {/* Blink progress indicator */}
                    {loading && (
                        <View style={styles.blinkProgressContainer}>
                            <Text style={styles.blinkProgressText}>� Menganalisis liveness...</Text>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: '100%' }]} />
                            </View>
                        </View>
                    )}

                    {/* Capture button */}
                    <TouchableOpacity
                        style={[styles.button, styles.captureBtn]}
                        onPress={capturePhoto}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>📸 Ambil Foto</Text>
                        )}
                    </TouchableOpacity>
                </View>
            ) : (
                /* REVIEW SECTION */
                <View style={styles.reviewSection}>
                    {/* Success Badge */}
                    <View style={styles.successBadge}>
                        <Text style={styles.successIcon}>✅</Text>
                        <Text style={styles.successTitle}>Verifikasi Berhasil!</Text>
                        <Text style={styles.successSubtitle}>Wajah Anda telah terverifikasi</Text>
                    </View>

                    {/* Image preview */}
                    <View style={styles.imagePreviewContainer}>
                        <View style={styles.imagePreview}>
                            {imageData ? (
                                <Image
                                    source={{ uri: `file://${imageData}` }}
                                    style={styles.capturedImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <Text style={styles.previewText}>📸 Foto Tersimpan</Text>
                            )}
                        </View>
                        <View style={styles.verifiedBadge}>
                            <Text style={styles.verifiedText}>✓ Terverifikasi</Text>
                        </View>
                    </View>

                    {/* Action buttons */}
                    {!vectorData ? (
                        <View style={styles.actionContainer}>
                            <Text style={styles.actionHint}>⏳ Mengekstrak vektor wajah...</Text>
                            {loading ? (
                                <ActivityIndicator size="large" color="#4CAF50" />
                            ) : (
                                <TouchableOpacity
                                    style={[styles.button, styles.primaryBtn]}
                                    onPress={extractVector}
                                    disabled={loading}
                                >
                                    <Text style={styles.buttonIcon}>🔄</Text>
                                    <Text style={styles.buttonText}>Coba Ekstrak Ulang</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        <View style={styles.completedContainer}>
                            <View style={styles.completedCard}>
                                <View style={styles.completedHeader}>
                                    <Text style={styles.completedIcon}>🎉</Text>
                                    <Text style={styles.completedTitle}>Data Siap Disimpan!</Text>
                                </View>
                                <View style={styles.completedInfo}>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>🧠 Vektor</Text>
                                        <Text style={styles.statusOnline}>✅ {vectorData.embedding.length} dimensi</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>📍 Lokasi</Text>
                                        <Text style={styles.infoValue}>{lokasi?.latitude?.toFixed(4)}, {lokasi?.longitude?.toFixed(4)}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>⏰ Waktu</Text>
                                        <Text style={styles.infoValue}>{new Date().toLocaleTimeString('id-ID')}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>📶 Status</Text>
                                        <Text style={styles.statusOnline}>Siap Sinkronisasi</Text>
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.button, styles.syncBtn]}
                                onPress={sendToServer}
                                disabled={sendingToServer}
                            >
                                {sendingToServer ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Text style={styles.buttonIcon}>💾</Text>
                                        <Text style={styles.buttonText}>Simpan ke Database Lokal</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Retake button */}
                    <TouchableOpacity
                        style={[styles.button, styles.retakeBtn]}
                        onPress={() => {
                            setIsCaptured(false);
                            setImageData(null);
                            setVectorData(null);
                            setDetectionStatus('🔍 Posisikan wajah di layar');
                        }}
                        disabled={loading || sendingToServer}
                    >
                        <Text style={styles.retakeBtnText}>🔄 Ambil Ulang Foto</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* ERROR MESSAGE */}
            {error && (
                <View style={styles.errorBox}>
                    <Text style={styles.errorText}>⚠️ {error}</Text>
                </View>
            )}

            {/* LOCATION INFO */}
            <View style={styles.locationInfo}>
                <Text style={styles.infoText}>📍 Lokasi Absensi</Text>
                <Text style={styles.locationText}>
                    {lokasi?.latitude?.toFixed(6)}, {lokasi?.longitude?.toFixed(6)}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        padding: 20,
        justifyContent: 'space-between',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        marginTop: 15,
        fontSize: 14,
    },
    cameraSection: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'stretch',
        gap: 20,
        position: 'relative',
    },
    camera: {
        flex: 1,
        width: '100%',
        alignSelf: 'center',
        borderRadius: 15,
        overflow: 'hidden',
    },
    faceGuideOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 70, // Ruang untuk tombol di bawah
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    faceGuideCircle: {
        width: 240,
        height: 300,
        borderRadius: 120,
        borderWidth: 3,
        borderColor: '#4CAF50',
        borderStyle: 'dashed',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 15,
        marginTop: -30, // Geser sedikit ke atas agar lebih tengah
    },
    faceGuideText: {
        color: '#fff',
        fontSize: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
    },
    placeholderCamera: {
        height: 300,
        borderRadius: 15,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#555',
    },
    cameraText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    smallText: {
        fontSize: 12,
        color: '#aaa',
    },
    reviewSection: {
        flex: 1,
        justifyContent: 'center',
        gap: 12,
    },
    successBadge: {
        alignItems: 'center',
        marginBottom: 10,
    },
    successIcon: {
        fontSize: 40,
        marginBottom: 8,
    },
    successTitle: {
        color: '#4CAF50',
        fontSize: 22,
        fontWeight: 'bold',
    },
    successSubtitle: {
        color: '#aaa',
        fontSize: 14,
        marginTop: 4,
    },
    imagePreviewContainer: {
        position: 'relative',
        alignItems: 'center',
    },
    imagePreview: {
        width: '100%',
        height: 220,
        borderRadius: 20,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 3,
        borderColor: '#4CAF50',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: -12,
        backgroundColor: '#4CAF50',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 5,
    },
    verifiedText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    actionContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    actionHint: {
        color: '#888',
        fontSize: 13,
        marginBottom: 12,
    },
    completedContainer: {
        marginTop: 15,
    },
    completedCard: {
        backgroundColor: '#1e3a1e',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#2d5a2d',
    },
    completedHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#2d5a2d',
    },
    completedIcon: {
        fontSize: 24,
        marginRight: 8,
    },
    completedTitle: {
        color: '#4CAF50',
        fontSize: 18,
        fontWeight: 'bold',
    },
    completedInfo: {
        gap: 10,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoLabel: {
        color: '#888',
        fontSize: 13,
    },
    infoValue: {
        color: '#fff',
        fontSize: 13,
        fontFamily: 'monospace',
    },
    statusOnline: {
        color: '#4CAF50',
        fontSize: 13,
        fontWeight: '600',
    },
    primaryBtn: {
        backgroundColor: '#4CAF50',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 12,
        width: '100%',
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    syncBtn: {
        backgroundColor: '#2196F3',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 16,
        paddingVertical: 16,
        borderRadius: 12,
        shadowColor: '#2196F3',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    buttonIcon: {
        fontSize: 18,
    },
    retakeBtnText: {
        color: '#f44336',
        fontSize: 14,
        fontWeight: '600',
    },
    previewText: {
        fontSize: 16,
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    button: {
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    captureBtn: {
        backgroundColor: '#4CAF50',
    },
    extractBtn: {
        backgroundColor: '#4CAF50',
    },
    sendBtn: {
        backgroundColor: '#FF9800',
        marginTop: 15,
    },
    retakeBtn: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#f44336',
        marginTop: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    statusIndicator: {
        position: 'absolute',
        top: 60,
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 12,
        zIndex: 10,
    },
    statusText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 24,
    },
    loadingOverlay: {
        position: 'absolute',
        bottom: 120,
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 30,
        paddingVertical: 20,
        borderRadius: 10,
        zIndex: 5,
    },
    blinkProgressContainer: {
        position: 'absolute',
        bottom: 120,
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 15,
        width: '80%',
    },
    blinkProgressText: {
        color: '#4CAF50',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center',
    },
    progressBar: {
        height: 4,
        backgroundColor: '#444',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#4CAF50',
    },
    capturedImage: {
        width: '100%',
        height: '100%',
    },
    vectorInfo: {
        backgroundColor: '#222',
        padding: 15,
        borderRadius: 10,
        marginVertical: 10,
    },
    infoText: {
        color: '#4CAF50',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    confidenceText: {
        color: '#aaa',
        fontSize: 12,
    },
    errorBox: {
        backgroundColor: '#f44336',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
    },
    errorText: {
        color: '#fff',
        fontSize: 12,
    },
    locationInfo: {
        backgroundColor: '#222',
        padding: 14,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#2196F3',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    locationText: {
        color: '#aaa',
        fontSize: 11,
        fontFamily: 'monospace',
        flex: 1,
    },
});

//make this component available to the app
export default VerifikasiWajah;
