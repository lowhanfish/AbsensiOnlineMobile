/**
 * ============================================
 * VERIFIKASI WAJAH - OFFLINE MODE (SIMPLIFIED)
 * ============================================
 * 
 * ARSIKTURE BARU: Offline mode dengan passive capture
 * Foto disimpan ke database lokal, embedding dibuat saat sync ke server
 * 
 * Flow:
 * 1. Passive capture foto wajah (dengan validasi ML Kit)
 * 2. Resize ke 480x480, JPEG 80%
 * 3. Simpan ke SQLite lokal (path foto + metadata)
 * 4. Saat online: sync ke server → server buat embedding
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
import { useRoute, useNavigation } from '@react-navigation/native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

// Import Custom Hooks
import { usePassiveCapture, cleanupPhoto } from '../../../hooks';

// Import Database Functions
import { saveAbsensiOffline, countUnsyncedAbsensi } from '../../../lib/database';

// ============ TYPES ============
interface LokasiParams {
    nip?: string;
    latitude?: number;
    longitude?: number;
}

// ============ COMPONENT ============
const VerifikasiWajah = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { lokasi } = (route.params as { lokasi?: LokasiParams }) || {};

    // Camera
    const cameraRef = useRef(null);
    const { hasPermission, requestPermission } = useCameraPermission();
    const device = useCameraDevice('front');

    // Custom Hook - Passive Capture
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
    const [isSaving, setIsSaving] = useState(false);
    const [unsyncedCount, setUnsyncedCount] = useState(0);

    console.log('📍 Lokasi yang diterima:', lokasi);

    // ============ CAMERA PERMISSION ============
    useEffect(() => {
        requestCameraPermission();
        updateUnsyncedCount();
    }, []);

    const updateUnsyncedCount = async () => {
        const count = await countUnsyncedAbsensi();
        setUnsyncedCount(count);
    };

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
            const nip = lokasi?.nip || 'UNKNOWN';
            const result = await capturePhoto(cameraRef, nip);

            if (result) {
                setIsCaptured(true);
            }
        } catch (err: any) {
            console.error('❌ Error capture:', err);
            Alert.alert('Error', `Gagal mengambil foto: ${err?.message || 'Silakan coba lagi'}`);
        }
    };

    // ============ SAVE TO DATABASE ============
    const handleSaveToDatabase = async () => {
        if (!capturedPhoto) {
            Alert.alert('Error', 'Foto tidak tersedia');
            return;
        }

        setIsSaving(true);

        try {
            const insertId = await saveAbsensiOffline({
                nip: lokasi?.nip || 'UNKNOWN',
                latitude: lokasi?.latitude || 0,
                longitude: lokasi?.longitude || 0,
                timestamp: new Date().toISOString(),
                image_path: capturedPhoto.imagePath,
                // Note: vektor tidak lagi disimpan di client
                // Server akan membuat embedding saat sync
                vektor: '[]', // String kosong, akan diisi saat sync ke server
            });

            if (insertId) {
                await updateUnsyncedCount();

                Alert.alert(
                    '✅ Berhasil',
                    `Absensi tersimpan secara offline.\nTotal pending sync: ${unsyncedCount + 1} data`,
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );

                // Cleanup
                await cleanupPhoto(capturedPhoto.imagePath);
                clearCapture();
                setIsCaptured(false);
            } else {
                Alert.alert('Error', 'Gagal menyimpan data');
            }
        } catch (err: any) {
            console.error('❌ Error saving to database:', err);
            Alert.alert('Error', `Gagal menyimpan: ${err?.message || 'Unknown error'}`);
        } finally {
            setIsSaving(false);
        }
    };

    // ============ RETRY ============
    const handleRetake = async () => {
        if (capturedPhoto) {
            await cleanupPhoto(capturedPhoto.imagePath);
        }
        clearCapture();
        setIsCaptured(false);
    };

    // ============ COMPUTED ============
    const isLoading = isCapturing || isSaving;
    const nip = lokasi?.nip || 'Unknown';

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
                <Text style={styles.offlineMode}>📴 Offline Mode</Text>
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
                    lokasi={lokasi}
                    isLoading={isLoading}
                    isSaving={isSaving}
                    unsyncedCount={unsyncedCount}
                    onRetake={handleRetake}
                    onSave={handleSaveToDatabase}
                />
            )}

            {/* ERROR MESSAGE */}
            {captureError && (
                <View style={styles.errorBox}>
                    <Text style={styles.errorText}>⚠️ {captureError}</Text>
                </View>
            )}

            {/* LOCATION INFO */}
            <View style={styles.locationInfo}>
                <Text style={styles.infoText}>📍 Lokasi Absensi</Text>
                <Text style={styles.locationText}>
                    {lokasi?.latitude?.toFixed(6) || '0'}, {lokasi?.longitude?.toFixed(6) || '0'}
                </Text>
            </View>
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
                video={false}
                audio={false}
                frameProcessor={undefined}
                format={undefined}
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
    lokasi,
    isLoading,
    isSaving,
    unsyncedCount,
    onRetake,
    onSave,
}) => (
    <View style={styles.previewSection}>
        {/* Success Badge */}
        <View style={styles.successBadge}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>Foto Tersimpan!</Text>
            <Text style={styles.successSubtitle}>Siap disimpan ke database lokal</Text>
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
                <Text style={styles.infoLabel}>📍 Lokasi</Text>
                <Text style={styles.infoValue}>
                    {lokasi?.latitude?.toFixed(4)}, {lokasi?.longitude?.toFixed(4)}
                </Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>⏰ Waktu</Text>
                <Text style={styles.infoValue}>{new Date().toLocaleTimeString('id-ID')}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📶 Pending Sync</Text>
                <Text style={styles.statusOnline}>📴 {unsyncedCount} data</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>🤖 Embedding</Text>
                <Text style={styles.infoValue}>Dibuat saat sync</Text>
            </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
            style={[styles.button, styles.syncBtn]}
            onPress={onSave}
            disabled={isSaving}
        >
            {isSaving ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <>
                    <Text style={styles.buttonIcon}>💾</Text>
                    <Text style={styles.buttonText}>Simpan (Offline)</Text>
                </>
            )}
        </TouchableOpacity>

        {/* Retake Button */}
        <TouchableOpacity
            style={[styles.button, styles.retakeBtn]}
            onPress={onRetake}
            disabled={isSaving}
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
        marginBottom: 15,
    },
    offlineMode: {
        color: '#ff9800',
        fontSize: 16,
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
        borderColor: '#4CAF50',
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
    successBadge: {
        alignItems: 'center',
        marginBottom: 5,
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
    capturedImage: {
        width: '100%',
        height: '100%',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: -12,
        backgroundColor: '#4CAF50',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    verifiedText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    previewText: {
        fontSize: 16,
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    completedCard: {
        backgroundColor: '#1e3a1e',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#2d5a2d',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
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
    button: {
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    captureBtn: {
        backgroundColor: '#4CAF50',
    },
    syncBtn: {
        backgroundColor: '#2196F3',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 10,
        shadowColor: '#2196F3',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
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
    buttonIcon: {
        fontSize: 18,
    },
    retakeBtnText: {
        color: '#f44336',
        fontSize: 14,
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
    locationInfo: {
        backgroundColor: '#222',
        padding: 14,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#ff9800',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 10,
    },
    infoText: {
        color: '#ff9800',
        fontSize: 14,
        fontWeight: 'bold',
    },
    locationText: {
        color: '#aaa',
        fontSize: 11,
        fontFamily: 'monospace',
        flex: 1,
    },
});

export default VerifikasiWajah;

