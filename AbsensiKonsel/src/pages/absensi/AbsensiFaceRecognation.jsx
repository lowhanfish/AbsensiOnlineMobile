import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Alert, Text, Dimensions, TouchableOpacity } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import FaceDetector from '@react-native-ml-kit/face-detection';
import RNFS from 'react-native-fs'; // 🧹 Tambahan: untuk hapus file
import { useNavigation } from '@react-navigation/native';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

const DETECTION_INTERVAL_MS = 1000;
const TIMEOUT_DURATION_MS = 10000;
const BLINK_THRESHOLD = 0.8;

export default function AbsensiFaceRecognation() {
    const navigation = useNavigation();
    const device = useCameraDevice('front');
    const [hasPermission, setHasPermission] = useState(false);
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [isDetectionActive, setIsDetectionActive] = useState(true);
    const cameraRef = useRef(null);

    const [isFaceDetected, setIsFaceDetected] = useState(false);
    const [blinkStatus, setBlinkStatus] = useState('open');

    const navigateToDashboard = useCallback(() => {
        navigation.navigate('Dashboard');
        setIsDetectionActive(false);
        setIsCheckedIn(false);
        Alert.alert('Navigasi', 'Anda telah diarahkan ke Dashboard.');
    }, [navigation]);

    const resetDetection = useCallback(() => {
        setIsCheckedIn(false);
        setIsDetectionActive(true);
        setIsFaceDetected(false);
        setBlinkStatus('open');
        Alert.alert('Mulai Ulang', 'Proses verifikasi wajah dimulai kembali.');
    }, []);

    useEffect(() => {
        (async () => {
            const status = await Camera.requestCameraPermission();
            setHasPermission(status === 'granted');
        })();
    }, []);

    useEffect(() => {
        if (isCheckedIn || !isDetectionActive) return;

        const timeout = setTimeout(() => {
            if (!isCheckedIn) {
                setIsDetectionActive(false);
                Alert.alert(
                    '⏱️ Waktu Habis',
                    'Verifikasi wajah/kedipan mata gagal dalam batas waktu 10 detik.',
                    [
                        { text: 'Coba Lagi', onPress: resetDetection },
                        { text: 'Batal', style: 'cancel' },
                    ]
                );
            }
        }, TIMEOUT_DURATION_MS);

        return () => clearTimeout(timeout);
    }, [isCheckedIn, isDetectionActive, resetDetection]);

    const runFaceDetection = useCallback(async () => {
        if (!cameraRef.current || isCheckedIn || !isDetectionActive) return;

        let photo = null;
        try {
            photo = await cameraRef.current.takePhoto({
                qualityPrioritization: 'speed',
                skipMetadata: true,
                saveToPhotoLibrary: false,
            });

            const photoPath = `file://${photo.path}`;
            const faces = await FaceDetector.detect(photoPath, {
                performanceMode: 'fast',
                landmarkMode: 'none',
                classificationMode: 'all',
            });

            // 🧹 DELETE TEMP PHOTO — hapus file setelah diproses
            RNFS.unlink(photo.path)
                .then(() => console.log('🧹 Foto sementara dihapus:', photo.path))
                .catch(err => console.log('⚠️ Gagal hapus foto:', err));

            if (faces.length === 0) {
                setIsFaceDetected(false);
                setBlinkStatus('open');
                return;
            }

            setIsFaceDetected(true);
            const firstFace = faces[0];
            const isLeftEyeClosed = firstFace.leftEyeOpenProbability < 1.0 - BLINK_THRESHOLD;
            const isRightEyeClosed = firstFace.rightEyeOpenProbability < 1.0 - BLINK_THRESHOLD;

            if (blinkStatus === 'open') {
                if (isLeftEyeClosed && isRightEyeClosed) {
                    setBlinkStatus('closed');
                }
            } else if (blinkStatus === 'closed') {
                if (!isLeftEyeClosed && !isRightEyeClosed) {
                    setBlinkStatus('verified');
                    setIsCheckedIn(true);
                    setIsDetectionActive(false);

                    Alert.alert('✅ Absensi Berhasil', 'Wajah dan kedipan mata berhasil diverifikasi!', [
                        { text: 'OK', onPress: navigateToDashboard },
                    ]);
                    return;
                }
            }
        } catch (err) {
            console.log('Error deteksi:', err);
            setIsFaceDetected(false);
            if (isDetectionActive) {
                setIsDetectionActive(false);
                Alert.alert('❌ Error Kamera', 'Gagal memproses gambar. Coba lagi.', [
                    { text: 'Coba Lagi', onPress: resetDetection },
                ]);
            }
        } finally {
            // 🧹 Backup — pastikan foto dihapus jika error
            if (photo?.path) {
                RNFS.unlink(photo.path).catch(() => { });
            }
        }
    }, [isCheckedIn, isDetectionActive, blinkStatus, resetDetection, navigateToDashboard]);

    useEffect(() => {
        if (!hasPermission || !device || isCheckedIn || !isDetectionActive) return;
        const interval = setInterval(runFaceDetection, DETECTION_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [hasPermission, device, isCheckedIn, isDetectionActive, runFaceDetection]);

    const getInstructionText = () => {
        if (isCheckedIn) return '✅ Absensi Berhasil! Mengarahkan ke Dashboard...';
        if (!isDetectionActive && !isCheckedIn) return '❌ Gagal. Tekan Coba Lagi di bawah.';
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
    };

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
                isActive={true}
                photo={true}
            />
            <View style={styles.faceGuide}>
                <View style={[styles.ovalBorder, getOvalStyle()]} />
                <Text style={styles.instruction}>{getInstructionText()}</Text>
                {!isDetectionActive && !isCheckedIn && (
                    <TouchableOpacity style={styles.singleRetryButton} onPress={resetDetection}>
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
    ovalAlert: { borderColor: '#FF9900', borderWidth: 5, opacity: 1 },
    ovalDetected: { borderColor: '#00FFAA', borderWidth: 5, opacity: 1 },
    ovalSuccess: { borderColor: '#00FF00', borderWidth: 6, opacity: 1 },
    ovalFailure: { borderColor: '#FF0000', borderWidth: 6, opacity: 1 },
    instruction: {
        marginTop: 20,
        color: '#FFFFFF',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    singleRetryButton: {
        backgroundColor: '#4A90E2',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginTop: 40,
    },
    retryButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});
