//import liraries
import React, { useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, Image, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import FaceDetector from '@react-native-ml-kit/face-detection';

import { Stylex } from "../../assets/styles/main";
import ImageLib from '../../components/ImageLib';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

// 🔹 Hitung bounding box dari landmarks/contours
const computeFaceBoundsFromFace = (face) => {
    const pts = [];

    if (face.landmarks) {
        Object.values(face.landmarks).forEach(lm => {
            if (lm?.position?.x != null && lm?.position?.y != null) {
                pts.push({ x: lm.position.x, y: lm.position.y });
            }
        });
    }

    if (face.contours) {
        Object.values(face.contours).forEach(c => {
            if (Array.isArray(c.points)) {
                c.points.forEach(p => {
                    if (p?.x != null && p?.y != null) pts.push({ x: p.x, y: p.y });
                });
            }
        });
    }

    if (pts.length === 0) return null;

    let minX = pts[0].x, minY = pts[0].y, maxX = pts[0].x, maxY = pts[0].y;
    pts.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
    });

    return {
        left: minX,
        top: minY,
        width: maxX - minX,
        height: maxY - minY,
        centerX: (minX + maxX) / 2,
        centerY: (minY + maxY) / 2,
    };
};

// 🔹 Cek apakah wajah di dalam frame lingkaran
const isFaceInsideCircle = (face, imageW, imageH) => {
    const faceBounds = computeFaceBoundsFromFace(face);
    if (!faceBounds) return false;

    const scaleX = windowWidth / imageW;
    const scaleY = windowHeight / imageH;

    const faceScreen = {
        left: faceBounds.left * scaleX,
        top: faceBounds.top * scaleY,
        right: (faceBounds.left + faceBounds.width) * scaleX,
        bottom: (faceBounds.top + faceBounds.height) * scaleY,
    };

    const circle = {
        left: windowWidth * 0.10,
        top: windowHeight * 0.20,
        width: 326,
        height: 443,
    };
    const circleRight = circle.left + circle.width;
    const circleBottom = circle.top + circle.height;

    const inside =
        faceScreen.left >= circle.left &&
        faceScreen.top >= circle.top &&
        faceScreen.right <= circleRight &&
        faceScreen.bottom <= circleBottom;

    console.log("🎯 Face in screen:", faceScreen, "Circle:", circle, "Inside:", inside);

    return inside;
};

// create a component
const AbsensiFaceRecognation = () => {
    const { hasPermission, requestPermission } = useCameraPermission();
    const device = useCameraDevice('front');
    const camera = useRef(null);
    const [capturedImagePath, setCapturedImagePath] = useState(null);
    const [detectionResult, setDetectionResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [imageDimensions, setImageDimensions] = useState({ width: 1, height: 1 });

    const runFaceDetection = useCallback(async (path) => {
        if (isLoading) return;
        setIsLoading(true);
        setDetectionResult(null);
        console.log("Memulai deteksi wajah pada:", path);

        try {
            const dimensions = await new Promise((resolve, reject) => {
                Image.getSize(path, (w, h) => resolve({ width: w, height: h }), reject);
            });
            setImageDimensions(dimensions);

            const result = await FaceDetector.detect(path, {
                performanceMode: 'accurate',
                landmarkMode: 'all',
                classificationMode: 'all',
                contourMode: 'all',
            });

            console.log("🔍 Hasil deteksi wajah:", JSON.stringify(result, null, 2));

            if (result.length > 0) {
                const firstFace = result[0];

                if (!isFaceInsideCircle(firstFace, dimensions.width, dimensions.height)) {
                    Alert.alert('Posisi Wajah Salah', 'Pastikan wajah Anda berada di dalam lingkaran.');
                    setCapturedImagePath(null);
                    setIsLoading(false);
                    return;
                }

                setDetectionResult(result);
                sendAttendance(path, result);
            } else {
                Alert.alert('Gagal Deteksi', 'Wajah tidak terdeteksi. Silakan coba lagi.');
                setCapturedImagePath(null);
                setIsLoading(false);
            }
        } catch (e) {
            console.error('Error saat deteksi wajah:', e);
            Alert.alert('Error', 'Gagal memproses gambar untuk deteksi wajah.');
            setCapturedImagePath(null);
            setIsLoading(false);
        }
    }, [isLoading]);

    const sendAttendance = async (photoPath, detectionData) => {
        setIsLoading(true);
        console.log("Mempersiapkan data untuk server...");

        const formData = new FormData();
        formData.append('photo', {
            uri: photoPath,
            type: 'image/jpeg',
            name: 'attendance_photo.jpg',
        });

        const firstFace = detectionData[0];
        formData.append('user_id', '12345');
        formData.append('detection_status', 'Wajah Terdeteksi');
        formData.append('face_data', JSON.stringify(firstFace));

        try {
            await new Promise(resolve => setTimeout(resolve, 3000));
            Alert.alert('Sukses Absensi', 'Absensi Berhasil! Wajah terdeteksi.');
        } catch (e) {
            console.error('Error kirim data:', e);
            Alert.alert('Error Jaringan', 'Gagal mengirim data absensi.');
        } finally {
            setIsLoading(false);
            handleRetake();
        }
    };

    // --- Ambil Foto ---
    const handleTakePhoto = async () => {
        if (isLoading) return;
        setIsLoading(true);
        setCapturedImagePath(null);
        setDetectionResult(null);

        if (device && camera.current) {
            try {
                const photo = await camera.current.takePhoto({
                    qualityPrioritization: 'quality',
                });

                const fullPath = `file://${photo.path}`;
                setCapturedImagePath(fullPath);

                runFaceDetection(fullPath);
            } catch (e) {
                console.error('Gagal mengambil foto:', e);
                Alert.alert('Error Kamera', 'Gagal mengambil foto.');
                setIsLoading(false);
            }
        } else {
            Alert.alert('Error', 'Perangkat kamera tidak tersedia.');
            setIsLoading(false);
        }
    };

    const handleRetake = () => {
        setCapturedImagePath(null);
        setDetectionResult(null);
        setImageDimensions({ width: 1, height: 1 });
    };

    // Jika izin belum diberikan
    if (!hasPermission || device == null) {
        return (
            <View style={styles.beriIzin}>
                <Text>Aplikasi memerlukan izin kamera.</Text>
                <Button title="Beri Izin" onPress={requestPermission} />
            </View>
        );
    }

    // Tentukan fungsi tombol FAB
    const handleFabPress = () => {
        if (isLoading) return;

        if (capturedImagePath) {
            // Jika foto sudah ada, tombol berfungsi sebagai Ambil Ulang (Retake)
            handleRetake();
        } else {
            // Jika foto belum ada, tombol berfungsi sebagai Ambil Foto
            handleTakePhoto();
        }
    };

    // --- Komponen Bounding Box ---
    const BoundingBox = ({ bounds, imageW, imageH }) => {
        const scaleX = windowWidth / imageW;
        const scaleY = windowHeight / imageH;

        const boxStyle = {
            position: 'absolute',
            left: bounds.left * scaleX,
            top: bounds.top * scaleY,
            width: bounds.width * scaleX,
            height: bounds.height * scaleY,
            borderWidth: 3,
            borderColor: '#34D399',
            borderRadius: 5,
        };

        return <View style={boxStyle} />;
    };

    return (
        <View style={styles.container}>
            {capturedImagePath ? (
                <Image source={{ uri: capturedImagePath }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            ) : (
                <Camera ref={camera} style={StyleSheet.absoluteFill} device={device} isActive={true} photo={true} />
            )}

            {/* Overlay Hasil Deteksi */}
            {capturedImagePath && detectionResult && (
                <View style={StyleSheet.absoluteFill}>
                    {detectionResult.map((face, idx) => {
                        const bounds = computeFaceBoundsFromFace(face);
                        if (!bounds) return null;

                        const scaleX = windowWidth / imageDimensions.width;
                        const scaleY = windowHeight / imageDimensions.height;

                        const boxStyle = {
                            position: 'absolute',
                            left: bounds.left * scaleX,
                            top: bounds.top * scaleY,
                            width: bounds.width * scaleX,
                            height: bounds.height * scaleY,
                            borderWidth: 2,
                            borderColor: '#00FF00',
                        };
                        return <View key={idx} style={boxStyle} />;
                    })}
                </View>
            )}

            <TouchableOpacity style={Stylex.backBtn}>
                <ImageLib urix={require('../../assets/images/icon/back.png')} style={Stylex.iconBack} />
                <Text style={Stylex.backTitle}>KEMBALI</Text>
            </TouchableOpacity>

            <View style={styles.divText}>
                <Text style={styles.title}>Face Recognation</Text>
                <Text style={styles.subTitle}>
                    {capturedImagePath
                        ? (detectionResult ? 'Wajah Terdeteksi, Mengirim Data...' : 'Foto diambil, memproses...')
                        : 'Pastikan wajah anda berada tepat di dalam lingkaran.'
                    }
                </Text>
            </View>

            <View style={styles.circleFrame} />

            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                    <Text style={styles.loadingText}>
                        {capturedImagePath ? 'Mendeteksi Wajah & Mengirim Data...' : 'Mengambil Foto...'}
                    </Text>
                </View>
            )}


            <TouchableOpacity
                style={styles.fabButton}
                onPress={capturedImagePath ? handleRetake : handleTakePhoto}
                disabled={isLoading}>
                <ImageLib
                    urix={
                        capturedImagePath
                            ? require('../../assets/images/icon/back.png')
                            : require('../../assets/images/icon/send.png')
                    }
                    style={styles.fabIcon}
                />
            </TouchableOpacity>
        </View>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2c3e50',
    },
    divText: {
        paddingTop: 75,
        paddingLeft: 28,
    },
    circleFrame: {
        position: 'absolute',
        top: '20%',
        left: '10%',
        width: 326,
        height: 443,
        borderWidth: 6,
        borderColor: '#ffffffff',
        borderRadius: '50%',
        borderStyle: 'dashed',
        overflow: 'hidden',
    },
    backTitle: {
        fontSize: 10,
        color: '#FFFFFF',
        fontWeight: '700',
        fontFamily: 'Almarai-Bold',
    },
    title: {
        fontSize: 24,
        color: '#FFFFFF',
        fontWeight: '400',
        fontFamily: 'Audiowide-Regular',
    },
    subTitle: {
        fontSize: 8,
        color: '#757575',
        fontWeight: '400',
        fontFamily: 'Audiowide-Regular',
    },
    fabButton: {
        width: 73,
        height: 73,
        borderRadius: '50%',
        opacity: 0.63,

        position: 'absolute',
        alignSelf: 'center',
        bottom: 40,

        backgroundColor: '#EBE6DF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    fabIcon: {
        width: 65.82,
        height: 65.82,
        opacity: 1,
    },
    beriIzin: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },
    loadingText: {
        marginTop: 15,
        color: '#FFFFFF',
        fontSize: 16,
    }
});

//make this component available to the app
export default AbsensiFaceRecognation;