/**
 * ============================================
 * VERIFIKASI WAJAH - REFACTORED
 * ============================================
 * Komponen untuk verifikasi wajah dengan liveness detection
 * Menggunakan custom hooks untuk logic yang lebih clean
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
import * as RNFS from 'react-native-fs';

// Import Custom Hooks
import { useLivenessDetection, useFaceVector } from '../../../hooks';

// Import Database Functions (langsung tanpa hook wrapper)
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
    const cameraRef = useRef<Camera>(null);
    const { hasPermission, requestPermission } = useCameraPermission();
    const device = useCameraDevice('front');

    // Custom Hooks
    const {
        detectionStatus,
        isDetecting,
        performLivenessCheck,
        setDetectionStatus,
    } = useLivenessDetection();

    const {
        vectorData,
        isExtracting,
        extractError,
        extractVectorFromImage,
        clearVector,
    } = useFaceVector();

    // Local State
    const [cameraReady, setCameraReady] = useState(false);
    const [isCaptured, setIsCaptured] = useState(false);
    const [imageData, setImageData] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    console.log('📍 Lokasi yang diterima:', lokasi);

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
                    setError('Izin kamera ditolak');
                    return;
                }
            } else {
                await requestPermission();
            }
        }
        setCameraReady(true);
    };

    // ============ CAPTURE & VERIFY ============
    const handleCapturePhoto = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!cameraRef.current) {
                setError('Kamera tidak siap');
                return;
            }

            // Step 1: Liveness Check
            setDetectionStatus('🎬 Persiapan verifikasi...');
            console.log('🎬 Memulai verifikasi liveness...');

            const livenessResult = await performLivenessCheck(cameraRef);

            console.log('📊 Hasil liveness:', livenessResult);

            if (!livenessResult.isLive) {
                setDetectionStatus('❌ Verifikasi gagal');
                setError(`Liveness check gagal: ${livenessResult.reason}`);
                return;
            }

            console.log(`✅ Liveness terverifikasi! Skor: ${livenessResult.score}`);
            setDetectionStatus('✅ Liveness terverifikasi!');

            // Step 2: Save Photo
            if (livenessResult.finalPhotoPath) {
                const fileExists = await RNFS.exists(livenessResult.finalPhotoPath);
                if (fileExists) {
                    console.log('✅ Foto diam tersimpan:', livenessResult.finalPhotoPath);
                    setImageData(livenessResult.finalPhotoPath);
                    setIsCaptured(true);
                    setDetectionStatus('✅ Verifikasi Berhasil');

                    // Step 3: Extract Vector
                    console.log('🧠 Mengekstrak vektor wajah...');
                    setDetectionStatus('🧠 Mengekstrak vektor wajah...');
                    await extractVectorFromImage(livenessResult.finalPhotoPath);
                } else {
                    setError('File foto tidak ditemukan');
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

    // ============ RETRY EXTRACT VECTOR ============
    const handleRetryExtract = async () => {
        if (imageData) {
            setError(null);
            await extractVectorFromImage(imageData);
        } else {
            setError('Tidak ada foto untuk diekstrak');
        }
    };

    // ============ SAVE TO DATABASE ============
    const handleSaveToDatabase = async () => {
        if (!imageData || !vectorData) {
            setError('Data tidak lengkap');
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const insertId = await saveAbsensiOffline({
                nip: lokasi?.nip || 'UNKNOWN',
                latitude: lokasi?.latitude || 0,
                longitude: lokasi?.longitude || 0,
                timestamp: new Date().toISOString(),
                image_path: imageData,
                vektor: JSON.stringify(vectorData.embedding),
            });

            if (insertId) {
                const unsyncedCount = await countUnsyncedAbsensi();

                Alert.alert(
                    '✅ Berhasil',
                    `Absensi tersimpan secara offline.\nTotal pending sync: ${unsyncedCount} data`,
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            } else {
                setError('Gagal menyimpan data');
            }
        } catch (err: any) {
            console.error('❌ Error saving to database:', err);
            setError(`Gagal menyimpan: ${err?.message || 'Unknown error'}`);
        } finally {
            setIsSaving(false);
        }
    };

    // ============ RESET ============
    const handleRetake = () => {
        setIsCaptured(false);
        setImageData(null);
        clearVector();
        setError(null);
        setDetectionStatus('📷 Siap untuk verifikasi');
    };

    // ============ COMPUTED ============
    const isLoading = loading || isDetecting || isExtracting || isSaving;
    const displayError = error || extractError;

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

    // ============ RENDER: MAIN ============
    return (
        <View style={styles.container}>
            {/* CAMERA SECTION */}
            {!isCaptured ? (
                <CameraSection
                    cameraRef={cameraRef}
                    device={device}
                    detectionStatus={detectionStatus}
                    isLoading={isLoading}
                    onCapture={handleCapturePhoto}
                />
            ) : (
                <ReviewSection
                    imageData={imageData}
                    vectorData={vectorData}
                    lokasi={lokasi}
                    isLoading={isLoading}
                    isSaving={isSaving}
                    onRetryExtract={handleRetryExtract}
                    onSave={handleSaveToDatabase}
                    onRetake={handleRetake}
                />
            )}

            {/* ERROR MESSAGE */}
            {displayError && (
                <View style={styles.errorBox}>
                    <Text style={styles.errorText}>⚠️ {displayError}</Text>
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

interface CameraSectionProps {
    cameraRef: React.RefObject<Camera | null>;
    device: any;
    detectionStatus: string;
    isLoading: boolean;
    onCapture: () => void;
}

const CameraSection: React.FC<CameraSectionProps> = ({
    cameraRef,
    device,
    detectionStatus,
    isLoading,
    onCapture,
}) => (
    <View style={styles.cameraSection}>
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
            <>
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#2196F3" />
                </View>
                <View style={styles.blinkProgressContainer}>
                    <Text style={styles.blinkProgressText}>🔍 Menganalisis liveness...</Text>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: '100%' }]} />
                    </View>
                </View>
            </>
        )}

        {/* Capture Button */}
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
);

interface ReviewSectionProps {
    imageData: string | null;
    vectorData: any;
    lokasi?: LokasiParams;
    isLoading: boolean;
    isSaving: boolean;
    onRetryExtract: () => void;
    onSave: () => void;
    onRetake: () => void;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({
    imageData,
    vectorData,
    lokasi,
    isLoading,
    isSaving,
    onRetryExtract,
    onSave,
    onRetake,
}) => (
    <View style={styles.reviewSection}>
        {/* Success Badge */}
        <View style={styles.successBadge}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>Verifikasi Berhasil!</Text>
            <Text style={styles.successSubtitle}>Wajah Anda telah terverifikasi</Text>
        </View>

        {/* Image Preview */}
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

        {/* Action Buttons */}
        {!vectorData ? (
            <View style={styles.actionContainer}>
                <Text style={styles.actionHint}>⏳ Mengekstrak vektor wajah...</Text>
                {isLoading ? (
                    <ActivityIndicator size="large" color="#4CAF50" />
                ) : (
                    <TouchableOpacity
                        style={[styles.button, styles.primaryBtn]}
                        onPress={onRetryExtract}
                        disabled={isLoading}
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
                            <Text style={styles.infoValue}>
                                {lokasi?.latitude?.toFixed(4)}, {lokasi?.longitude?.toFixed(4)}
                            </Text>
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
                    onPress={onSave}
                    disabled={isSaving}
                >
                    {isSaving ? (
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

        {/* Retake Button */}
        <TouchableOpacity
            style={[styles.button, styles.retakeBtn]}
            onPress={onRetake}
            disabled={isLoading || isSaving}
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
        bottom: 70,
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
    previewText: {
        fontSize: 16,
        color: '#4CAF50',
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
    infoText: {
        color: '#4CAF50',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    locationText: {
        color: '#aaa',
        fontSize: 11,
        fontFamily: 'monospace',
        flex: 1,
    },
});

export default VerifikasiWajah;
