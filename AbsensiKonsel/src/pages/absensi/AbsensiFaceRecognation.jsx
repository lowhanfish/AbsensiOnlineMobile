import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Alert, Text, Dimensions, TouchableOpacity } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import FaceDetector from '@react-native-ml-kit/face-detection';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

// 💡 Konstanta untuk Durasi dan Liveness
const DETECTION_INTERVAL_MS = 1000; // Deteksi setiap 1 detik
const TIMEOUT_DURATION_MS = 10000; // Beri waktu 10 detik untuk berkedip
const BLINK_THRESHOLD = 0.8; // Probabilitas 80% atau lebih mata tertutup dianggap kedip

export default function FaceAttendanceVisualFeedback() {
    const device = useCameraDevice('front');
    const [hasPermission, setHasPermission] = useState(false);

    // Status Absensi dan Kontrol
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [isDetectionActive, setIsDetectionActive] = useState(true);
    const cameraRef = useRef(null);

    // ⭐️ LIVENESS STATE
    const [isFaceDetected, setIsFaceDetected] = useState(false);
    const [blinkStatus, setBlinkStatus] = useState('open'); // 'open', 'closed', 'verified'


    // ⭐️ FUNGSI 1: Mereset semua status ke awal (Mulai Lagi)
    const resetDetection = useCallback(() => {
        setIsCheckedIn(false);
        setIsDetectionActive(true);
        setIsFaceDetected(false);
        setBlinkStatus('open');
        Alert.alert('Mulai Ulang', 'Proses verifikasi wajah dimulai kembali.');
    }, []);

    // ⭐️ FUNGSI 2: Menangani aksi Tutup/Selesai
    const handleClose = useCallback(() => {
        // Di aplikasi nyata, ini adalah tempat Anda memanggil fungsi navigasi

        setIsDetectionActive(false);
        setIsCheckedIn(false);

        Alert.alert('Tutup Sesi', 'Sesi absensi telah diakhiri. Anda dapat keluar dari tampilan ini.');
    }, []);


    // 1. Izin Kamera
    useEffect(() => {
        (async () => {
            const status = await Camera.requestCameraPermission();
            setHasPermission(status === 'granted');
        })();
    }, []);

    // 2. Timeout untuk Menghentikan Deteksi
    useEffect(() => {
        if (isCheckedIn || !isDetectionActive) return;

        const timeout = setTimeout(() => {
            if (!isCheckedIn) {
                setIsDetectionActive(false);
                Alert.alert(
                    '⏱️ Waktu Habis',
                    'Verifikasi wajah/kedipan mata gagal dalam batas waktu 10 detik.',
                    [
                        { text: "Coba Lagi", onPress: resetDetection },
                        { text: "Batal", style: "cancel" }
                    ]
                );
            }
        }, TIMEOUT_DURATION_MS);

        return () => clearTimeout(timeout);
    }, [isCheckedIn, isDetectionActive, resetDetection]);


    // 3. Fungsi Deteksi Utama
    const runFaceDetection = useCallback(async () => {
        // Pengecekan awal sudah memfilter sebagian besar panggilan yang tidak perlu
        if (!cameraRef.current || isCheckedIn || !isDetectionActive) return;

        try {
            const photo = await cameraRef.current.takePhoto({
                qualityPrioritization: 'speed',
                skipMetadata: true,
                saveToPhotoLibrary: false,
            });

            const faces = await FaceDetector.detect(`file://${photo.path}`, {
                performanceMode: 'fast',
                landmarkMode: 'none',
                classificationMode: 'all',
            });

            if (faces.length === 0) {
                setIsFaceDetected(false);
                setBlinkStatus('open');
                return;
            }

            setIsFaceDetected(true);
            const firstFace = faces[0];

            // LOGIKA DETEKSI KEDIPAN (LIVENESS)
            const isLeftEyeClosed = firstFace.leftEyeOpenProbability < 1.0 - BLINK_THRESHOLD;
            const isRightEyeClosed = firstFace.rightEyeOpenProbability < 1.0 - BLINK_THRESHOLD;

            if (blinkStatus === 'open') {
                if (isLeftEyeClosed && isRightEyeClosed) {
                    setBlinkStatus('closed');
                }
            } else if (blinkStatus === 'closed') {
                if (!isLeftEyeClosed && !isRightEyeClosed) {

                    // ⭐️ PERBAIKAN: Atur state SUCCESS INSTAN
                    setBlinkStatus('verified');
                    setIsCheckedIn(true);
                    setIsDetectionActive(false);

                    // ✅ Absensi Berhasil
                    Alert.alert('✅ Absensi Berhasil', 'Wajah dan kedipan mata berhasil diverifikasi!');

                    // ⭐️ PENTING: HENTIKAN EKSEKUSI saat ini juga.
                    return;
                }
            }

        } catch (err) {
            console.log('Error deteksi:', err);
            setIsFaceDetected(false);
            if (isDetectionActive) {
                setIsDetectionActive(false);
                Alert.alert(
                    '❌ Error Kamera',
                    'Gagal memproses gambar. Coba lagi.',
                    [{ text: "Coba Lagi", onPress: resetDetection }]
                );
            }
        }
    }, [isCheckedIn, isDetectionActive, blinkStatus, resetDetection]);


    // 4. Loop Interval Deteksi
    useEffect(() => {
        // Pengecekan di sini memastikan interval tidak dibuat jika state sudah disetel ke success/inactive
        if (!hasPermission || !device || isCheckedIn || !isDetectionActive) return;

        const interval = setInterval(runFaceDetection, DETECTION_INTERVAL_MS);

        // Cleanup: Berjalan saat komponen unmount ATAU saat dependencies berubah
        return () => clearInterval(interval);
    }, [hasPermission, device, isCheckedIn, isDetectionActive, runFaceDetection]);


    // 5. Render UI dan Instruksi
    const getInstructionText = () => {
        if (isCheckedIn) return '✅ Absensi Berhasil!';
        if (!isDetectionActive && !isCheckedIn) return '❌ Gagal. Tekan Coba Lagi di bawah.'; // Added !isCheckedIn for precision
        if (!isFaceDetected) return 'Arahkan wajah ke dalam bingkai';

        switch (blinkStatus) {
            case 'open':
            default:
                return '👀 Wajah terdeteksi! SILAKAN KEDIPKAN MATA Anda sekali.';
            case 'closed':
                return '⏳ Mata tertutup! SILAKAN BUKA MATA Anda untuk verifikasi.';
            case 'verified':
                return 'Liveness OK! Verifikasi Final...';
        }
    };

    const getOvalStyle = () => {
        if (isCheckedIn) return styles.ovalSuccess;
        if (!isDetectionActive && !isCheckedIn) return styles.ovalFailure;
        if (blinkStatus === 'verified' && isFaceDetected) return styles.ovalDetected;
        if (isFaceDetected) return styles.ovalAlert;
        return styles.ovalBorder;
    }

    if (!hasPermission || !device) {
        return (
            <View style={styles.center}>
                <Text style={{ color: '#FFF' }}>Meminta izin kamera...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Camera
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                device={device}
                // Kamera harus tetap aktif (true) agar pratinjau tetap ada
                isActive={isDetectionActive || isCheckedIn}
                photo={true}
            />

            <View style={styles.faceGuide}>
                <View style={[styles.ovalBorder, getOvalStyle()]} />
                <Text style={styles.instruction}>
                    {getInstructionText()}
                </Text>

                {/* TOMBOL KETIKA BERHASIL */}
                {isCheckedIn && (
                    <View style={styles.successButtonContainer}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.closeButton]}
                            onPress={handleClose}
                        >
                            <Text style={styles.actionButtonText}>Tutup</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.retryButton]}
                            onPress={resetDetection}
                        >
                            <Text style={styles.actionButtonText}>Mulai Lagi</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* TOMBOL COBA LAGI (Hanya muncul jika deteksi GAGAL/timeout) */}
                {!isDetectionActive && !isCheckedIn && (
                    <TouchableOpacity
                        style={styles.singleRetryButton}
                        onPress={resetDetection}
                    >
                        <Text style={styles.retryButtonText}>Coba Lagi</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const OVAL_WIDTH = 260;
const OVAL_HEIGHT = 320;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
    faceGuide: {
        position: 'absolute',
        top: windowHeight * 0.2,
        left: (windowWidth - OVAL_WIDTH) / 2,
        width: OVAL_WIDTH,
        height: OVAL_HEIGHT,
        alignItems: 'center',
        zIndex: 10,
    },
    ovalBorder: {
        width: '100%',
        height: '100%',
        borderRadius: OVAL_WIDTH / 1.5,
        borderWidth: 3,
        borderColor: '#FF4444',
        borderStyle: 'dashed',
        transform: [{ scaleY: 1.2 }],
        opacity: 0.8,
    },
    ovalAlert: {
        borderColor: '#FF9900', // Oranye (Butuh Kedip)
        borderWidth: 5,
        opacity: 1,
    },
    ovalDetected: {
        borderColor: '#00FFAA', // Hijau Terang (Proses Verifikasi)
        borderWidth: 5,
        opacity: 1,
    },
    ovalSuccess: {
        borderColor: '#00FF00', // Hijau Penuh (Sukses)
        borderWidth: 6,
        opacity: 1,
    },
    ovalFailure: {
        borderColor: '#FF0000', // Merah Penuh (Gagal)
        borderWidth: 6,
        opacity: 1,
    },
    instruction: {
        marginTop: 20,
        color: '#FFFFFF',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    // Gaya untuk tombol tunggal (Coba Lagi)
    singleRetryButton: {
        backgroundColor: '#4A90E2',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginTop: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    // Gaya Baru: Container dan tombol setelah berhasil
    successButtonContainer: {
        flexDirection: 'row',
        marginTop: 40,
        width: '100%',
        justifyContent: 'space-around',
    },
    actionButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
        minWidth: 120,
        alignItems: 'center',
    },
    closeButton: {
        backgroundColor: '#999999', // Warna abu-abu untuk Tutup
    },
    retryButton: {
        backgroundColor: '#4A90E2', // Warna biru untuk Mulai Lagi
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});