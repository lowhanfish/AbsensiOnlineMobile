import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Alert, Text, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import FaceDetector from '@react-native-ml-kit/face-detection';
import { useNavigation } from '@react-navigation/native';

// ⭐️ TENSORFLOW IMPORTS (Dipertahankan)
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import RNFetchBlob from 'react-native-blob-util'; // Digunakan untuk membaca file foto yang diambil


const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

// 💡 Konstanta
const DETECTION_INTERVAL_MS = 1000;
const TIMEOUT_DURATION_MS = 10000;
const BLINK_THRESHOLD = 0.8;

// ⭐️ KONFIGURASI MODEL FACE EMBEDDING
const MODEL_URL = Platform.select({
    // ⚠️ Ganti dengan jalur file model FaceNet Anda yang sebenarnya!
    ios: 'asset://facenet_model.json',
    android: 'file:///android_asset/facenet_model.json',
});
const MODEL_INPUT_SIZE = 160;
let faceNetModel = null;


export default function FaceAttendanceVisualFeedback() {
    const navigation = useNavigation();
    const device = useCameraDevice('front');
    const [hasPermission, setHasPermission] = useState(false);
    const [isModelLoaded, setIsModelLoaded] = useState(false); // State untuk melacak status model

    // Status Absensi dan Kontrol
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [isDetectionActive, setIsDetectionActive] = useState(true);
    const cameraRef = useRef(null);

    // LIVENESS STATE
    const [isFaceDetected, setIsFaceDetected] = useState(false);
    const [blinkStatus, setBlinkStatus] = useState('open');


    // --- TENSORFLOW & EMBEDDING LOGIC ---

    // ⭐️ FUNGSI 0: INIT TENSORFLOW DAN LOAD MODEL
    const initTensorflow = async () => {
        try {
            await tf.ready();
            // Memuat model
            faceNetModel = await tf.loadGraphModel(MODEL_URL);

            setIsModelLoaded(true);
            console.log('✅ TensorFlow dan Model FaceNet berhasil dimuat!');
        } catch (error) {
            console.error('❌ Gagal memuat model atau inisialisasi TF:', error);
            Alert.alert('Error ML', `Gagal memuat model: ${error.message}`);
        }
    };

    // ⭐️ FUNGSI EKSTRAKSI FACE EMBEDDING (NYATA)
    const getFaceEmbedding = useCallback(async (photoPath) => {
        if (!faceNetModel) return null;

        let imageTensor = null;
        let resized = null;
        let predictions = null;
        const fullPath = photoPath.startsWith('file://') ? photoPath.substring(7) : photoPath;

        try {
            const base64Image = await RNFetchBlob.fs.readFile(fullPath, 'base64');
            imageTensor = tf.io.decodeBase64(base64Image);

            // Pra-pemrosesan
            resized = tf.image.resizeBilinear(imageTensor, [MODEL_INPUT_SIZE, MODEL_INPUT_SIZE])
                .toFloat().div(255).expandDims(0);

            // Jalankan prediksi
            predictions = faceNetModel.predict(resized);
            const embeddingArray = await predictions.data();

            // Cleanup tensor
            tf.dispose([resized, imageTensor, predictions]);

            return Array.from(embeddingArray);
        } catch (error) {
            console.error('Error saat ekstraksi embedding:', error);
            tf.dispose([imageTensor, resized, predictions].filter(t => t !== null));
            return null;
        }
    }, []);

    // ⭐️ FUNGSI NAVIGASI YANG HANYA MENCETAK DATA (Logging)
    const navigateToDashboard = useCallback((embeddingData) => {
        if (!embeddingData) {
            Alert.alert('Gagal', 'Gagal mendapatkan vektor wajah. Coba lagi.');
            resetDetection();
            return;
        }

        // ⭐️⭐️ FOKUS UTAMA: MENCETAK DATA EMBEDDING KE KONSOL (LOG)
        console.log("-----------------------------------------");
        console.log("✅ FACE EMBEDDING BERHASIL DIEKSTRAKSI (LOG):");
        console.log(`Panjang Vektor: ${embeddingData.length}`);
        console.log("10 Angka Awal Vektor:", embeddingData.slice(0, 10));
        console.log("-----------------------------------------");

        // Peringatan bahwa data telah dicetak di log
        Alert.alert("Data Logged", "Data Face Embedding telah dicetak di konsol (log). Menuju Dashboard...");

        // NAVIGASI SETELAH LOGGING
        navigation.navigate('Dashboard');
        setIsDetectionActive(false);
        setIsCheckedIn(false);
    }, [navigation]);

    // --- END: LOGIC ---


    // FUNGSI 1: Mereset semua status ke awal
    const resetDetection = useCallback(() => {
        setIsCheckedIn(false);
        setIsDetectionActive(true);
        setIsFaceDetected(false);
        setBlinkStatus('open');
        Alert.alert('Mulai Ulang', 'Proses verifikasi wajah dimulai kembali.');
    }, []);


    // 1. Izin Kamera & Inisialisasi Model
    useEffect(() => {
        (async () => {
            await initTensorflow(); // Inisialisasi TensorFlow dan Model di awal
            const status = await Camera.requestCameraPermission();
            setHasPermission(status === 'granted');
        })();
    }, []);

    // 2. Timeout (Tidak berubah)
    useEffect(() => {
        if (isCheckedIn || !isDetectionActive) return;
        const timeout = setTimeout(() => {
            if (!isCheckedIn) {
                setIsDetectionActive(false);
                Alert.alert(
                    '⏱️ Waktu Habis',
                    'Verifikasi wajah/kedipan mata gagal dalam batas waktu 10 detik.',
                    [{ text: "Coba Lagi", onPress: resetDetection }, { text: "Batal", style: "cancel" }]
                );
            }
        }, TIMEOUT_DURATION_MS);
        return () => clearTimeout(timeout);
    }, [isCheckedIn, isDetectionActive, resetDetection]);


    // 3. Fungsi Deteksi Utama
    const runFaceDetection = useCallback(async () => {
        // Cek isModelLoaded
        if (!cameraRef.current || isCheckedIn || !isDetectionActive || !isModelLoaded) return;

        try {
            const photo = await cameraRef.current.takePhoto({
                qualityPrioritization: 'speed',
                skipMetadata: true,
                saveToPhotoLibrary: false,
            });

            const faces = await FaceDetector.detect(`file://${photo.path}`, { /* ... */ });

            if (faces.length === 0) { /* ... */ return; }
            setIsFaceDetected(true);
            const firstFace = faces[0];
            const isLeftEyeClosed = firstFace.leftEyeOpenProbability < 1.0 - BLINK_THRESHOLD;
            const isRightEyeClosed = firstFace.rightEyeOpenProbability < 1.0 - BLINK_THRESHOLD;

            if (blinkStatus === 'open') {
                if (isLeftEyeClosed && isRightEyeClosed) { setBlinkStatus('closed'); }
            } else if (blinkStatus === 'closed') {
                if (!isLeftEyeClosed && !isRightEyeClosed) {

                    // ⭐️ EKSTRAKSI EMBEDDING NYATA
                    const faceVector = await getFaceEmbedding(photo.path);

                    setBlinkStatus('verified');
                    setIsCheckedIn(true);
                    setIsDetectionActive(false);

                    Alert.alert(
                        '✅ Verifikasi Liveness Berhasil',
                        'Mempersiapkan data Face Embedding untuk logging...',
                        [
                            {
                                text: "Lanjut (Lihat Log)",
                                // Panggil fungsi navigasi untuk mencetak log
                                onPress: () => navigateToDashboard(faceVector)
                            }
                        ]
                    );
                    return;
                }
            }

        } catch (err) {
            console.error('Error deteksi atau embedding:', err);
            // ... (Error handling)
        }
    }, [isCheckedIn, isDetectionActive, blinkStatus, resetDetection, navigateToDashboard, getFaceEmbedding, isModelLoaded]);


    // 4. Loop Interval Deteksi
    useEffect(() => {
        if (!hasPermission || !device || isCheckedIn || !isDetectionActive || !isModelLoaded) return;
        const interval = setInterval(runFaceDetection, DETECTION_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [hasPermission, device, isCheckedIn, isDetectionActive, runFaceDetection, isModelLoaded]);


    // 5. Render UI dan Instruksi
    const getInstructionText = () => {
        if (!isModelLoaded) return '⏳ Memuat Model AI (TensorFlow)...';
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
    }

    if (!hasPermission || !device) {
        return (
            <View style={styles.center}>
                <Text style={{ color: '#FFF' }}>Meminta izin kamera...</Text>
            </View>
        );
    }

    if (!isModelLoaded) {
        return (
            <View style={styles.center}>
                <Text style={{ color: '#FFF' }}>⏳ Memuat model AI untuk verifikasi...</Text>
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
                <Text style={styles.instruction}>
                    {getInstructionText()}
                </Text>

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
});