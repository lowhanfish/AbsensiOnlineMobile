/**
 * ============================================
 * ABSENSI FACE RECOGNATION - ONLINE VERSION (SIMPLIFIED)
 * ============================================
 * 
 * ARSIKTURE BARU: Client-side hanya untuk passive capture
 * Seluruh proses AI (embedding, comparison) dilakukan di SERVER (RTX 5090)
 * 
 * Flow:
 * 1. Passive capture foto wajah (dengan validasi ML Kit)
 * 2. Resize ke 480x480, JPEG 80%
 * 3. Upload foto ke server (NIP + foto)
 * 4. Server melakukan: Face Detection → Embedding → Comparison
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Platform,
    PermissionsAndroid,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';

// Import Custom Hooks
import { usePassiveCapture, uploadPhotoToServer, cleanupPhoto } from '../../hooks';

// ============ COMPONENT ============
const AbsensiFaceRecognation = () => {
    const navigation = useNavigation();

    // Redux State
    const TOKEN = useSelector(state => state.TOKEN);
    const PROFILE = useSelector(state => state.PROFILE);
    const URL = useSelector(state => state.URL);
    const WAKTU = useSelector(state => state.WAKTU);
    const VERSI_APP = useSelector(state => state.VERSI_APP);

    // Camera
    const cameraRef = useRef(null);
    const { hasPermission, requestPermission } = useCameraPermission();
    const device = useCameraDevice('front');

    // Custom Hooks
    const {
        capturedPhoto,
        isCapturing,
        captureError,
        detectionStatus,
        capturePhoto,
        clearCapture,
    } = usePassiveCapture();

    // Local State
    const [cameraReady, setCameraReady] = useState(false);
    const [isCaptured, setIsCaptured] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [serverResponse, setServerResponse] = useState(null);

    console.log('📍 Profile:', PROFILE?.profile?.NIP);
    console.log('⏰ Waktu:', WAKTU);

    // ============ CAMERA PERMISSION ============
    useEffect(() => {
        requestCameraPermission();
    }, []);

    const requestCameraPermission = async () => {
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
                    Alert.alert('Error', 'Izin kamera ditolak');
                    return;
                }
            } else {
                await requestPermission();
            }
        }
        setCameraReady(true);
    };

    // ============ CAPTURE PHOTO ============
    const handleCapturePhoto = async () => {
        try {
            const nip = PROFILE?.profile?.NIP || '';
            if (!nip) {
                Alert.alert('Error', 'NIP tidak ditemukan');
                return;
            }

            const result = await capturePhoto(cameraRef, nip);

            if (result) {
                setIsCaptured(true);
            }
        } catch (err) {
            console.error('❌ Error capture:', err);
            Alert.alert('Error', `Gagal mengambil foto: ${err?.message || 'Silakan coba lagi'}`);
        }
    };

    // ============ SEND TO SERVER ============
    const handleSendToServer = async () => {
        if (!capturedPhoto || !PROFILE?.profile?.NIP) {
            Alert.alert('Error', 'Data tidak lengkap');
            return;
        }

        setIsSending(true);
        setServerResponse(null);

        const nip = PROFILE.profile.NIP;
        const apiUrl = `${URL.URL_AbsenHarian}Add_v2`;

        try {
            // Prepare data for server (tanpa embedding, hanya NIP + metadata)
            const absenData = {
                NIP: nip,
                lat: PROFILE?.profile?.lokasi_absen?.[0]?.lat || 0,
                lng: PROFILE?.profile?.lokasi_absen?.[0]?.lng || 0,
                JenisStatus: WAKTU?.status ? 'ABSEN DATANG' : 'ABSEN PULANG',
                VERSI_APP: VERSI_APP,
                isUseEmulator: 'false',
                // Note: Foto sudah di-upload via uploadPhotoToServer
                // Server akan melakukan face detection & embedding
            };

            // Kirim data absensi
            console.log('📤 Mengirim data absensi:', absenData);

            const response = await fetch(`${apiUrl}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `kikensbatara ${TOKEN}`,
                },
                body: JSON.stringify(absenData),
            });

            const result = await response.json();
            console.log('📥 Response server:', result);

            setServerResponse(result);

            if (result.status === 'OK' || result.status === 'ABSEN SUKSES') {
                // Cleanup foto setelah sukses
                await cleanupPhoto(capturedPhoto.imagePath);
                clearCapture();
                setIsCaptured(false);

                Alert.alert(
                    '✅ Absen Berhasil',
                    `${result.ket || 'Absensi berhasil dicatat'}\nJam: ${result.jam || new Date().toLocaleTimeString('id-ID')}`,
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            } else if (result.status === 'ABSEN TERKUNCI') {
                Alert.alert(
                    '🔒 Absen Terkunci',
                    result.ket || 'Anda sudah melakukan absensi',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            } else {
                Alert.alert('❌ Gagal', result.ket || result.status || 'Gagal mengirim absensi');
            }

        } catch (err) {
            console.error('❌ Error sending to server:', err);
            Alert.alert('Error', `Gagal mengirim: ${err?.message || 'Periksa koneksi internet'}`);
        } finally {
            setIsSending(false);
        }
    };

    // ============ RETRY ============
    const handleRetake = async () => {
        if (capturedPhoto) {
            await cleanupPhoto(capturedPhoto.imagePath);
        }
        clearCapture();
        setIsCaptured(false);
        setServerResponse(null);
    };

    // ============ COMPUTED ============
    const isLoading = isCapturing || isSending;
    const nip = PROFILE?.profile?.NIP || '';
    const userName = PROFILE?.profile?.nama || 'Unknown';

    // ============ RENDER: LOADING ============
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

    // ============ RENDER ============
    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>← Kembali</Text>
                </TouchableOpacity>
                <View style={styles.onlineBadge}>
                    <Text style={styles.onlineBadgeText}>🌐 Online</Text>
                </View>
            </View>

            {/* USER INFO */}
            <View style={styles.infoBar}>
                <Text style={styles.infoText}>👤 {userName}</Text>
                <Text style={styles.infoSubText}>NIP: {nip}</Text>
            </View>

            {/* CAMERA / PREVIEW */}
            {!isCaptured ? (
                <CameraSection
                    cameraRef={cameraRef}
                    device={device}
                    detectionStatus={detectionStatus}
                    isLoading={isLoading}
                    captureError={captureError}
                    onCapture={handleCapturePhoto}
                />
            ) : (
                <PreviewSection
                    capturedPhoto={capturedPhoto}
                    isSending={isSending}
                    serverResponse={serverResponse}
                    waktuStatus={WAKTU?.status ? 'ABSEN DATANG' : 'ABSEN PULANG'}
                    onRetake={handleRetake}
                    onSend={handleSendToServer}
                />
            )}

            {/* ERROR MESSAGE */}
            {captureError && (
                <View style={styles.errorBox}>
                    <Text style={styles.errorText}>⚠️ {captureError}</Text>
                </View>
            )}
        </View>
    );
};

// ============ SUB-COMPONENTS ============

const CameraSection = ({
    cameraRef,
    device,
    detectionStatus,
    isLoading,
    captureError,
    onCapture,
}) => (
    <View style={styles.cameraSection}>
        <View style={styles.cameraContainer}>
            <Camera
                ref={cameraRef}
                style={styles.camera}
                device={device}
                isActive={true}
                photo={true}
            />

            {/* Face Guide */}
            <View style={styles.faceGuideOverlay}>
                <View style={styles.faceGuideCircle}>
                    <Text style={styles.faceGuideText}>Posisikan wajah di sini</Text>
                </View>
            </View>

            {/* Status */}
            <View style={styles.statusIndicator}>
                <Text style={styles.statusText}>{detectionStatus}</Text>
            </View>

            {/* Loading */}
            {isLoading && (
                <View style={styles.blinkProgressContainer}>
                    <ActivityIndicator size="small" color="#2196F3" style={{ marginBottom: 8 }} />
                    <Text style={styles.blinkProgressText}>🔍 Memproses foto...</Text>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: '100%' }]} />
                    </View>
                </View>
            )}
        </View>

        {/* Capture Button */}
        <View style={styles.captureButtonContainer}>
            <TouchableOpacity
                style={[styles.button, styles.captureBtn]}
                onPress={onCapture}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>📸 Ambil Foto</Text>
                )}
            </TouchableOpacity>
        </View>
    </View>
);

const PreviewSection = ({
    capturedPhoto,
    isSending,
    serverResponse,
    waktuStatus,
    onRetake,
    onSend,
}) => (
    <View style={styles.previewSection}>
        {/* Compact Success Badge */}
        <View style={styles.successBadgeCompact}>
            <Text style={styles.successIconSmall}>✅</Text>
            <View>
                <Text style={styles.successTitleSmall}>Foto Tersimpan!</Text>
                <Text style={styles.successSubtitleSmall}>Siap dikirim ke server</Text>
            </View>
        </View>

        {/* Image Preview */}
        <View style={styles.imagePreviewContainer}>
            <View style={styles.imagePreview}>
                {capturedPhoto?.imagePath ? (
                    <Image
                        source={{
                            uri: capturedPhoto.imagePath.startsWith('file://')
                                ? capturedPhoto.imagePath
                                : `file://${capturedPhoto.imagePath}`
                        }}
                        style={styles.capturedImage}
                        resizeMode="cover"
                    />
                ) : (
                    <Text style={styles.previewText}>📸 Foto Tersimpan</Text>
                )}
            </View>
            <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ {capturedPhoto?.width}x{capturedPhoto?.height}</Text>
            </View>
        </View>

        {/* Info Card */}
        <View style={styles.completedCard}>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📷 Foto</Text>
                <Text style={styles.statusOnline}>✅ {((capturedPhoto?.fileSize || 0) / 1024).toFixed(1)} KB</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📋 Jenis</Text>
                <Text style={styles.infoValue}>{waktuStatus}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>⏰ Waktu</Text>
                <Text style={styles.infoValue}>{new Date().toLocaleTimeString('id-ID')}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📶 Mode</Text>
                <Text style={styles.statusOnline}>🌐 Server AI</Text>
            </View>
        </View>

        {/* Send Button */}
        <TouchableOpacity
            style={[styles.button, styles.sendBtn]}
            onPress={onSend}
            disabled={isSending}
        >
            {isSending ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <>
                    <Text style={styles.buttonIcon}>📤</Text>
                    <Text style={styles.buttonText}>Kirim ke Server (AI)</Text>
                </>
            )}
        </TouchableOpacity>

        {/* Retake Button */}
        <TouchableOpacity
            style={[styles.button, styles.retakeBtn]}
            onPress={onRetake}
            disabled={isSending}
        >
            <Text style={styles.retakeBtnText}>🔄 Ambil Ulang Foto</Text>
        </TouchableOpacity>
    </View>
);

// ============ STYLES ============
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    onlineBadge: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    onlineBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
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
        justifyContent: 'space-between',
    },
    cameraContainer: {
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
        width: '100%',
    },
    faceGuideOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    captureButtonContainer: {
        paddingTop: 15,
    },
    faceGuideCircle: {
        width: 240,
        height: 300,
        borderRadius: 120,
        borderWidth: 3,
        borderColor: '#2196F3',
        borderStyle: 'dashed',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 15,
        marginTop: -30,
    },
    faceGuideText: {
        color: '#fff',
        fontSize: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
    },
    previewSection: {
        flex: 1,
        gap: 12,
    },
    infoBar: {
        backgroundColor: '#222',
        padding: 14,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#2196F3',
        marginBottom: 15,
    },
    infoText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    infoSubText: {
        color: '#aaa',
        fontSize: 11,
        fontFamily: 'monospace',
        marginTop: 4,
    },
    successBadgeCompact: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(76, 175, 80, 0.15)',
        padding: 12,
        borderRadius: 8,
        gap: 10,
    },
    successIconSmall: {
        fontSize: 24,
    },
    successTitleSmall: {
        color: '#4CAF50',
        fontSize: 15,
        fontWeight: 'bold',
    },
    successSubtitleSmall: {
        color: '#aaa',
        fontSize: 11,
    },
    imagePreviewContainer: {
        alignItems: 'center',
    },
    imagePreview: {
        width: 160,
        height: 160,
        borderRadius: 12,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#4CAF50',
    },
    capturedImage: {
        width: '100%',
        height: '100%',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: -8,
        backgroundColor: '#4CAF50',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    verifiedText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    previewText: {
        fontSize: 16,
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    completedCard: {
        backgroundColor: '#1e2a3e',
        borderRadius: 10,
        padding: 14,
        borderWidth: 1,
        borderColor: '#2d4a5a',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoLabel: {
        color: '#888',
        fontSize: 12,
    },
    infoValue: {
        color: '#fff',
        fontSize: 12,
        fontFamily: 'monospace',
    },
    statusOnline: {
        color: '#4CAF50',
        fontSize: 12,
        fontWeight: '600',
    },
    button: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    captureBtn: {
        backgroundColor: '#2196F3',
        shadowColor: '#2196F3',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    sendBtn: {
        backgroundColor: '#4CAF50',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    retakeBtn: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#f44336',
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    buttonIcon: {
        fontSize: 16,
    },
    retakeBtnText: {
        color: '#f44336',
        fontSize: 13,
        fontWeight: '600',
    },
    statusIndicator: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        zIndex: 10,
    },
    statusText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    blinkProgressContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        zIndex: 10,
    },
    blinkProgressText: {
        color: '#2196F3',
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
        backgroundColor: '#2196F3',
    },
    errorBox: {
        backgroundColor: '#f44336',
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
    },
    errorText: {
        color: '#fff',
        fontSize: 12,
    },
});

export default AbsensiFaceRecognation;

