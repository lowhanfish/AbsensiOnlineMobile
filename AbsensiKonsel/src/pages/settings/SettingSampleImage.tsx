
// React & React Native
import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Platform,
    PermissionsAndroid,
    Alert,
} from 'react-native';

// Navigation
import { useNavigation } from '@react-navigation/native';
import { useSelector } from "react-redux";
import AsyncStorage from '@react-native-async-storage/async-storage';
// Camera & File System
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import ImageResizer from '@bam.tech/react-native-image-resizer';

// Custom Hooks
import { usePassiveCapture } from '../../hooks';


// Komponen utama untuk capture foto dan ekstraksi embedding wajah
const SettingSampleImage = () => {
    const navigation = useNavigation();
    const URL = useSelector((state: any) => state.URL);
    const token = useSelector((state: any) => state.TOKEN);


    console.log(URL.URL_presensi_settingProfile + "addData")

    // Refs & hooks
    const cameraRef = useRef<Camera | null>(null);
    const { hasPermission, requestPermission } = useCameraPermission();
    const device = useCameraDevice('front');
    const { capturedPhoto, isCapturing, captureError, detectionStatus, capturePhoto, clearCapture } = usePassiveCapture();

    // State
    const [cameraReady, setCameraReady] = useState(false);
    const [isCaptured, setIsCaptured] = useState(false);
    const [imagePath, setImagePath] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string | null>(null);

    const [nip, setNip] = useState("");

    // Permission setup
    useEffect(() => {
        const setup = async () => {
            if (!hasPermission) {
                if (Platform.OS === 'android') {
                    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
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
        setup();
    }, [hasPermission, requestPermission]);


    // Ambil foto menggunakan passive capture
    const handleCapture = async () => {
        try {
            setLoading(true);
            setError(null);
            const userNip = nip || 'UNKNOWN'; // Gunakan NIP jika tersedia
            const result = await capturePhoto(cameraRef, nip);

            if (result) {
                setImagePath(result.imagePath);
                setIsCaptured(true);
            }
        } catch (err: any) {
            console.error('❌ Capture error:', err);
            setError(err?.message || 'Gagal mengambil foto');
        } finally {
            setLoading(false);
        }
    };


    // Ambil ulang foto
    const handleRetake = async () => {
        clearCapture();
        setIsCaptured(false);
        setImagePath(null);
        setError(null);
    };


    // Simpan dan kembali (jika ingin dipakai)
    const handleSaveAndReturn = () => {
        if (!imagePath) {
            Alert.alert('Data incomplete', 'Pastikan foto tersedia.');
            return;
        }
        // (navigation as any).navigate('Settings', { samplePhoto: imagePath });
    };


    // Resize dan crop gambar menjadi 480x480, JPEG quality 80%
    const resizeAndCropImage = async (originalPath: string): Promise<string | null> => {
        try {
            setUploadStatus('Memproses gambar...');
            const uri = originalPath.startsWith('file://') ? originalPath : 'file://' + originalPath;

            // Resize gambar menjadi 480x480 dengan mempertahankan aspect ratio
            const resized = await ImageResizer.createResizedImage(
                uri,      // path
                480,      // maxWidth
                480,      // maxHeight
                'JPEG',   // compressFormat
                80,       // quality
                0,        // rotation
                undefined // outputPath
            );

            console.log('✅ Gambar berhasil di-resize:', resized.uri);
            return resized.uri;
        } catch (err: any) {
            console.error('❌ Resize error:', err);
            // Fallback: jika resize gagal, gunakan gambar asli
            return originalPath;
        }
    };

    // Upload foto ke server (endpoint sesuai backend)
    const handleUpload = () => {
        if (!imagePath || !nip) {
            Alert.alert('Data incomplete', 'Pastikan foto dan NIP tersedia sebelum upload.');
            return;
        }
        setUploadLoading(true);
        setUploadStatus(null);

        // Resize dan crop gambar terlebih dahulu
        resizeAndCropImage(imagePath)
            .then((processedImagePath) => {
                if (!processedImagePath) {
                    setUploadStatus('Gagal memproses gambar');
                    setUploadLoading(false);
                    return;
                }

                const uploadUrl = URL.URL_presensi_settingProfile + 'addData';
                const form = new FormData();
                const uri = processedImagePath.startsWith('file://') ? processedImagePath : 'file://' + processedImagePath;
                const filename = uri.split('/').pop() || 'photo.jpg';
                // @ts-ignore
                form.append('file', { uri, name: filename, type: 'image/jpeg' });
                form.append('nip', nip);
                // Note: Vektor akan diekstrak di server-side

                setUploadStatus('Mengupload gambar...');

                console.log(form);

                return fetch(uploadUrl, {
                    method: 'POST',
                    body: form,
                    headers: {
                        'Authorization': `kikensbarara ${token}`,
                    },
                }).then((response) => {
                    return response.json().catch(() => null).then((json) => {
                        if (response.ok) {
                            setUploadStatus('Upload berhasil');
                            Alert.alert('Upload berhasil', JSON.stringify(json || { status: 'ok' }));
                            // Hapus file asli jika berbeda dari yang di-resize
                            if (processedImagePath !== imagePath) {
                                RNFS.unlink(imagePath).catch(() => { });
                            }
                            (navigation as any).navigate('Settings', { samplePhoto: processedImagePath });
                        } else {
                            setUploadStatus('Upload gagal');
                            Alert.alert('Upload gagal', json?.message || 'Terjadi kesalahan saat upload');
                        }
                    });
                });
            })
            .catch((err: any) => {
                console.error('❌ Upload error:', err);
                setUploadStatus('Upload error');
                Alert.alert('Upload error', err?.message || 'Gagal menghubungi server');
            })
            .finally(() => {
                setUploadLoading(false);
            });
    };


    const loadAyncData = async () => {
        try {
            const profile = await AsyncStorage.getItem('userProfile');
            if (profile) {
                const profile1 = JSON.parse(profile);
                setNip(profile1.profile.NIP);
            }
        } catch (e) {
            setNip("");
        }
    };

    useEffect(() => {
        loadAyncData();
    }, []);

    const isLoading = loading || isCapturing || uploadLoading;

    return (
        <View style={styles.container}>
            {/* Loading kamera */}
            {(!device || !cameraReady) ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" />
                    <Text style={styles.loadingText}>Mempersiapkan kamera...</Text>
                </View>
            ) : (
                <View style={{ flex: 1, width: '100%' }}>
                    {/* Kamera aktif */}
                    {!isCaptured ? (
                        <View style={{ flex: 1 }}>
                            <Camera
                                ref={cameraRef}
                                style={styles.camera}
                                device={device}
                                isActive={true}
                                photo={true}
                            />
                            {/* Overlay area wajah lebih keren */}
                            <View style={styles.faceCircleOverlay} pointerEvents="none">
                                <View style={styles.faceCircleKeren}>
                                    {/* Garis bantu vertikal */}
                                    <View style={styles.guideLineVertical} />
                                    {/* Garis bantu horizontal */}
                                    <View style={styles.guideLineHorizontal} />
                                    {/* Efek highlight gradasi */}
                                    <View style={styles.faceCircleGradient} />
                                </View>
                            </View>
                            <View style={styles.captureContainer}>
                                <TouchableOpacity
                                    style={styles.captureButton}
                                    onPress={handleCapture}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.captureText}>📷</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.previewContainer}>
                            {/* Preview hasil foto */}
                            {imagePath && (
                                <Image
                                    source={{ uri: 'file://' + imagePath }}
                                    style={styles.capturedImage}
                                />
                            )}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoText}>Status:</Text>
                                <Text style={styles.infoValue}>
                                    Foto siap diupload ke server
                                </Text>
                            </View>
                            {captureError && (
                                <Text style={styles.errorText}>{captureError}</Text>
                            )}
                            {error && (
                                <Text style={styles.errorText}>{error}</Text>
                            )}
                            <View style={styles.actionRow}>
                                <TouchableOpacity style={styles.btn} onPress={handleRetake}>
                                    <Text style={styles.btnText}>🔁 Ambil Ulang</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.btn} onPress={handleSaveAndReturn}>
                                    <Text style={styles.btnText}> Simpan & Kembali</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.btn, styles.btnPrimary]}
                                    onPress={handleUpload}
                                    disabled={uploadLoading}
                                >
                                    {uploadLoading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={[styles.btnText, { color: '#fff' }]}>Upload</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};


// StyleSheet
const styles = StyleSheet.create({
    faceCircleOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    faceCircleKeren: {
        width: 250,
        height: 350,
        borderRadius: 210,
        borderWidth: 4,
        borderColor: 'rgba(46,204,113,0.95)',
        backgroundColor: 'rgba(255,255,255,0.07)',
        shadowColor: '#2ecc71',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 24,
        elevation: 16,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
    },
    faceCircleGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 320,
        height: 420,
        borderRadius: 210,
        // Simulasi gradasi highlight dengan border tambahan
        borderWidth: 12,
        borderColor: 'rgba(46,204,113,0.13)',
        opacity: 0.7,
    },
    guideLineVertical: {
        position: 'absolute',
        left: (250 / 2) - (3 / 2), // center of oval - half width of line
        top: 0,
        width: 3,
        height: 345,
        backgroundColor: 'rgba(46,204,113,0.28)',
        borderRadius: 1.5,
        zIndex: 3,
    },
    guideLineHorizontal: {
        position: 'absolute',
        top: (350 / 2) - (3 / 2), // center of oval - half height of line
        left: 0,
        width: 250,
        height: 3,
        backgroundColor: 'rgba(46,204,113,0.28)',
        borderRadius: 1.5,
        zIndex: 3,
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
    },
    camera: {
        flex: 1,
        backgroundColor: '#000',
    },
    captureContainer: {
        position: 'absolute',
        bottom: 36,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#e74c3c',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureText: {
        fontSize: 28,
        color: '#fff',
    },
    previewContainer: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    capturedImage: {
        width: 260,
        height: 340,
        borderRadius: 8,
        marginBottom: 16,
        resizeMode: 'cover',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoText: {
        fontWeight: '700',
        marginRight: 8,
    },
    infoValue: {
        color: '#333',
    },
    actionRow: {
        flexDirection: 'column',
        gap: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btn: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        marginHorizontal: 8,
        width: 265,
    },
    btnPrimary: {
        backgroundColor: '#2ecc71',
        borderColor: '#2ecc71',
    },
    btnText: {
        color: '#333',
        fontWeight: '700',
    },
    errorText: {
        color: '#c0392b',
        marginTop: 8,
    },
});

export default SettingSampleImage;
