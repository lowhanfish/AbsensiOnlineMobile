
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

// Camera & File System
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';

// Custom Hooks
import { useFaceVector } from '../../hooks';


// Komponen utama untuk capture foto dan ekstraksi embedding wajah
const SettingSampleImage = () => {
    const navigation = useNavigation();

    // Refs & hooks
    const cameraRef = useRef<Camera | null>(null);
    const { hasPermission, requestPermission } = useCameraPermission();
    const device = useCameraDevice('front');
    const { vectorData, isExtracting, extractError, extractVectorFromImage, clearVector } = useFaceVector();

    // State
    const [cameraReady, setCameraReady] = useState(false);
    const [isCaptured, setIsCaptured] = useState(false);
    const [imagePath, setImagePath] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string | null>(null);

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


    // Ambil foto dan ekstrak vektor wajah
    const handleCapture = async () => {
        try {
            setLoading(true);
            setError(null);
            if (!cameraRef.current) {
                setError('Kamera belum siap');
                return;
            }
            const photo = await cameraRef.current.takePhoto({ flash: 'off' } as any);
            const path = photo?.path;
            if (!path) {
                setError('Gagal mengambil foto');
                return;
            }
            setImagePath(path);
            setIsCaptured(true);
            await extractVectorFromImage(path);
        } catch (err: any) {
            console.error('❌ Capture error:', err);
            setError(err?.message || 'Gagal mengambil foto');
        } finally {
            setLoading(false);
        }
    };


    // Ambil ulang foto
    const handleRetake = async () => {
        if (imagePath) {
            try { await RNFS.unlink(imagePath); } catch (e) { /* ignore */ }
        }
        setIsCaptured(false);
        setImagePath(null);
        clearVector();
        setError(null);
    };


    // Simpan dan kembali (jika ingin dipakai)
    const handleSaveAndReturn = () => {
        if (!imagePath || !vectorData) {
            Alert.alert('Data incomplete', 'Pastikan foto dan vektor tersedia.');
            return;
        }
        // navigation.navigate('Settings' as any, { samplePhoto: imagePath, vector: vectorData });
    };


    // Upload foto & vektor ke server (dummy endpoint)
    const handleUpload = () => {
        if (!imagePath || !vectorData) {
            Alert.alert('Data incomplete', 'Pastikan foto dan vektor tersedia sebelum upload.');
            return;
        }
        setUploadLoading(true);
        setUploadStatus(null);
        const DUMMY_URL = 'https://example.com/api/face/encode';
        const form = new FormData();
        const uri = imagePath.startsWith('file://') ? imagePath : 'file://' + imagePath;
        const filename = uri.split('/').pop() || 'photo.jpg';
        // @ts-ignore
        form.append('photo', { uri, name: filename, type: 'image/jpeg' });
        form.append('vector', JSON.stringify(vectorData.embedding));
        form.append('timestamp', vectorData.timestamp);
        fetch(DUMMY_URL, {
            method: 'POST',
            body: form,
            headers: { 'Accept': 'application/json' },
        })
            .then(resp => {
                return resp.json().catch(() => null).then(json => ({ resp, json }));
            })
            .then(async ({ resp, json }) => {
                if (resp.ok) {
                    setUploadStatus('Upload berhasil');
                    Alert.alert('Upload berhasil', JSON.stringify(json || { status: 'ok' }));
                    try { await RNFS.unlink(imagePath); } catch (e) { /* ignore */ }
                    navigation.navigate('Settings' as any, { samplePhoto: imagePath, vector: vectorData });
                } else {
                    setUploadStatus('Upload gagal');
                    Alert.alert('Upload gagal', json?.message || 'Terjadi kesalahan saat upload');
                }
            })
            .catch((err) => {
                console.error('❌ Upload error:', err);
                setUploadStatus('Upload error');
                Alert.alert('Upload error', err?.message || 'Gagal menghubungi server');
            })
            .finally(() => {
                setUploadLoading(false);
            });
    };

    const isLoading = loading || isExtracting || uploadLoading;

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
                                <Text style={styles.infoText}>Vector:</Text>
                                <Text style={styles.infoValue}>
                                    {vectorData ? `${vectorData.embedding.length} dimensi` : 'Belum diekstrak'}
                                </Text>
                            </View>
                            {extractError && (
                                <Text style={styles.errorText}>{extractError}</Text>
                            )}
                            {error && (
                                <Text style={styles.errorText}>{error}</Text>
                            )}
                            <View style={styles.actionRow}>
                                <TouchableOpacity style={styles.btn} onPress={handleRetake}>
                                    <Text style={styles.btnText}>Ambil Ulang</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.btn} onPress={handleSaveAndReturn}>
                                    <Text style={styles.btnText}>Simpan & Kembali</Text>
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
        flexDirection: 'row',
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
