// Import library
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform, PermissionsAndroid, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import * as RNFS from 'react-native-fs';

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
    const extractVector = async () => {
        try {
            setLoading(true);
            setError(null);

            // TODO: Ekstrak vektor menggunakan mediapipe/face-detection
            // const vector = await extractFaceVector(imageData);
            // setVectorData(vector);

            console.log('🧠 Vektor diekstrak');
            // Vektor mock untuk development
            setVectorData({
                embedding: Array(128).fill(Math.random()),
                confidence: 0.95,
                faceCount: 1,
            });
        } catch (err: any) {
            console.error('Error extract vector:', err);
            setError('Gagal extract vector');
        } finally {
            setLoading(false);
        }
    };

    // ============ KIRIM KE SERVER ============
    const sendToServer = async () => {
        if (!vectorData) {
            setError('Data vektor tidak tersedia');
            return;
        }

        try {
            setSendingToServer(true);
            setError(null);

            // TODO: Implementasi sinkronisasi server
            // Untuk sekarang, tampilkan sukses saja
            Alert.alert('Info', 'Data akan disinkronkan saat online');
            navigation.goBack();
        } catch (err: any) {
            console.error('Error send to server:', err);
            setError('Gagal kirim ke server');
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
                    {/* Image preview */}
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

                    {/* Extract vector button */}
                    {!vectorData ? (
                        <TouchableOpacity
                            style={[styles.button, styles.extractBtn]}
                            onPress={extractVector}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>✓ Foto OK, Lanjut</Text>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.vectorInfo}>
                            <Text style={styles.infoText}>✅ Verifikasi Berhasil</Text>
                            <Text style={styles.confidenceText}>
                                Ready to sync
                            </Text>

                            <TouchableOpacity
                                style={[styles.button, styles.sendBtn]}
                                onPress={sendToServer}
                                disabled={sendingToServer}
                            >
                                {sendingToServer ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>Kirim ke Server</Text>
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
                        <Text style={styles.buttonText}>🔄 Ambil Ulang</Text>
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
        gap: 20,
    },
    camera: {
        flex: 1,
        borderRadius: 15,
        overflow: 'hidden',
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
        gap: 15,
    },
    imagePreview: {
        height: 250,
        borderRadius: 15,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#4CAF50',
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
        backgroundColor: '#f44336',
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
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#2196F3',
    },
    locationText: {
        color: '#aaa',
        fontSize: 11,
        marginTop: 5,
        fontFamily: 'monospace',
    },
});

//make this component available to the app
export default VerifikasiWajah;
