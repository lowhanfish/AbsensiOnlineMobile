/**
 * ============================================
 * ABSENSI FACE RECOGNATION - ONLINE VERSION
 * ============================================
 * Komponen untuk verifikasi wajah dengan liveness detection
 * Data dikirim langsung ke server (versi online)
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
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import * as RNFS from 'react-native-fs';

// Import Custom Hooks
import { useLivenessDetection, useFaceVector } from '../../hooks';

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
    const [imageData, setImageData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSending, setIsSending] = useState(false);

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

        } catch (err) {
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

    // ============ SEND TO SERVER ============
    const handleSendToServer = () => {
        if (!imageData || !vectorData) {
            setError('Data tidak lengkap');
            return;
        }

        setIsSending(true);
        setError(null);

        // Prepare data for server
        const absenData = {
            NIP: PROFILE?.profile?.NIP || '',
            lat: PROFILE?.profile?.lokasi_absen?.[0]?.lat || 0,
            lng: PROFILE?.profile?.lokasi_absen?.[0]?.lng || 0,
            JenisStatus: WAKTU?.status ? 'ABSEN DATANG' : 'ABSEN PULANG',
            VERSI_APP: VERSI_APP,
            isUseEmulator: 'false',
            vektor: JSON.stringify(vectorData.embedding),
        };

        console.log('📤 Mengirim data absensi:', absenData);

        fetch(`${URL.URL_AbsenHarian}Add_v2`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `kikensbatara ${TOKEN}`,
            },
            body: JSON.stringify(absenData),
        })
            .then(response => response.json())
            .then(result => {
                console.log('📥 Response server:', result);

                if (result.status === 'OK' || result.status === 'ABSEN SUKSES') {
                    // Hapus foto temp
                    if (imageData) {
                        RNFS.unlink(imageData).catch(() => { });
                    }

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
                    setError(result.ket || result.status || 'Gagal mengirim absensi');
                }
            })
            .catch(err => {
                console.error('❌ Error sending to server:', err);
                setError(`Gagal mengirim: ${err?.message || 'Periksa koneksi internet'}`);
            })
            .finally(() => {
                setIsSending(false);
            });
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
    const isLoading = loading || isDetecting || isExtracting || isSending;
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
                    waktu={WAKTU}
                    profile={PROFILE}
                    isLoading={isLoading}
                    isSending={isSending}
                    onRetryExtract={handleRetryExtract}
                    onSend={handleSendToServer}
                    onRetake={handleRetake}
                />
            )}

            {/* ERROR MESSAGE */}
            {displayError && (
                <View style={styles.errorBox}>
                    <Text style={styles.errorText}>⚠️ {displayError}</Text>
                </View>
            )}

            {/* INFO - Only show on Camera mode, not on Review */}
            {!isCaptured && (
                <View style={styles.infoBar}>
                    <Text style={styles.infoText}>
                        👤 {PROFILE?.profile?.nama || 'Unknown'}
                    </Text>
                    <Text style={styles.infoSubText}>
                        NIP: {PROFILE?.profile?.NIP || '-'}
                    </Text>
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
    onCapture,
}) => (
    <View style={styles.cameraSection}>
        {/* Camera Container */}
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
                    <Text style={styles.blinkProgressText}>🔍 Menganalisis liveness...</Text>
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

const ReviewSection = ({
    imageData,
    vectorData,
    waktu,
    profile,
    isLoading,
    isSending,
    onRetryExtract,
    onSend,
    onRetake,
}) => (
    <ScrollView
        style={styles.reviewSection}
        contentContainerStyle={styles.reviewSectionContent}
        showsVerticalScrollIndicator={false}
    >
        {/* Compact User Info */}
        <View style={styles.compactUserInfo}>
            <Text style={styles.compactUserName}>👤 {profile?.profile?.nama || 'Unknown'}</Text>
            <Text style={styles.compactUserNip}>NIP: {profile?.profile?.NIP || '-'}</Text>
        </View>

        {/* Success Badge - More Compact */}
        <View style={styles.successBadgeCompact}>
            <Text style={styles.successIconSmall}>✅</Text>
            <View>
                <Text style={styles.successTitleSmall}>Verifikasi Berhasil!</Text>
                <Text style={styles.successSubtitleSmall}>Wajah Anda telah terverifikasi</Text>
            </View>
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
                        <Text style={styles.completedTitle}>Siap Kirim ke Server!</Text>
                    </View>
                    <View style={styles.completedInfo}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>🧠 Vektor</Text>
                            <Text style={styles.statusOnline}>✅ {vectorData.embedding.length} dimensi</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>📋 Jenis</Text>
                            <Text style={styles.infoValue}>
                                {waktu?.status ? 'ABSEN DATANG' : 'ABSEN PULANG'}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>⏰ Waktu</Text>
                            <Text style={styles.infoValue}>{new Date().toLocaleTimeString('id-ID')}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>📶 Mode</Text>
                            <Text style={styles.statusOnline}>🌐 Online</Text>
                        </View>
                    </View>
                </View>

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
                            <Text style={styles.buttonText}>Kirim ke Server</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        )}

        {/* Retake Button */}
        <TouchableOpacity
            style={[styles.button, styles.retakeBtn]}
            onPress={onRetake}
            disabled={isLoading || isSending}
        >
            <Text style={styles.retakeBtnText}>🔄 Ambil Ulang Foto</Text>
        </TouchableOpacity>
    </ScrollView>
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
    reviewSection: {
        flex: 1,
    },
    reviewSectionContent: {
        gap: 10,
        paddingBottom: 20,
    },
    // Compact User Info
    compactUserInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
        padding: 10,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#2196F3',
    },
    compactUserName: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
        flex: 1,
    },
    compactUserNip: {
        color: '#888',
        fontSize: 11,
        fontFamily: 'monospace',
    },
    // Compact Success Badge
    successBadgeCompact: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(76, 175, 80, 0.15)',
        padding: 10,
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
    // Original (keep for backward compatibility)
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
        width: 140,
        height: 160,
        borderRadius: 12,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#2196F3',
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
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 5,
    },
    verifiedText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    previewText: {
        fontSize: 16,
        color: '#2196F3',
        fontWeight: 'bold',
    },
    actionContainer: {
        alignItems: 'center',
        marginTop: 12,
    },
    actionHint: {
        color: '#888',
        fontSize: 12,
        marginBottom: 8,
    },
    completedContainer: {
        marginTop: 8,
    },
    completedCard: {
        backgroundColor: '#1e2a3e',
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: '#2d4a5a',
    },
    completedHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#2d4a5a',
    },
    completedIcon: {
        fontSize: 18,
        marginRight: 6,
    },
    completedTitle: {
        color: '#2196F3',
        fontSize: 14,
        fontWeight: 'bold',
    },
    completedInfo: {
        gap: 6,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoLabel: {
        color: '#888',
        fontSize: 11,
    },
    infoValue: {
        color: '#fff',
        fontSize: 11,
        fontFamily: 'monospace',
    },
    statusOnline: {
        color: '#4CAF50',
        fontSize: 11,
        fontWeight: '600',
    },
    button: {
        paddingVertical: 12,
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
    sendBtn: {
        backgroundColor: '#2196F3',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 10,
        paddingVertical: 12,
        borderRadius: 10,
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
        paddingVertical: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
    },
    buttonIcon: {
        fontSize: 14,
    },
    retakeBtnText: {
        color: '#f44336',
        fontSize: 12,
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
    infoBar: {
        backgroundColor: '#222',
        padding: 14,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#2196F3',
        marginTop: 10,
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
});

export default AbsensiFaceRecognation;
