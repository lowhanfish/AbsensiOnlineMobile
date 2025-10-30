import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { FaceDetection } from 'react-native-mediapipe';

const AbsensiFaceRecognation = () => {
    const [hasPermission, setHasPermission] = useState(false);
    const [faces, setFaces] = useState([]);
    const devices = useCameraDevices();
    const device =
        devices.front ||
        Object.values(devices).find((d) =>
            d.id?.toLowerCase().includes('truedepth') || d.position === 'front'
        ) ||
        devices.back;

    const detectorRef = useRef(null);

    useEffect(() => {
        const requestPermission = async () => {
            const status = await Camera.requestCameraPermission();
            console.log('Camera permission:', status);
            setHasPermission(status === 'authorized' || status === 'granted');
        };
        requestPermission();
    }, []);

    useEffect(() => {
        const faceDetector = new FaceDetection({
            selfieMode: true,
            minDetectionConfidence: 0.5,
        });

        faceDetector.onResults((results) => {
            const detectedFaces = results.detections || [];
            setFaces(detectedFaces);
        });

        detectorRef.current = faceDetector;
        console.log('Face detector initialized');

        return () => {
            faceDetector.close();
        };
    }, []);

    if (!hasPermission) {
        return (
            <View style={styles.center}>
                <Text style={styles.text}>Izin kamera belum diberikan</Text>
            </View>
        );
    }

    if (!device) {
        return (
            <View style={styles.center}>
                <Text style={styles.text}>Kamera tidak ditemukan</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
            />
            <View style={styles.overlay}>
                <Text style={styles.overlayText}>
                    {faces.length > 0
                        ? `Wajah terdeteksi: ${faces.length}`
                        : 'Arahkan wajah Anda ke kamera'}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    text: { color: '#fff', fontSize: 16 },
    overlay: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 12,
    },
    overlayText: { color: '#fff', fontSize: 16 },
});

export default AbsensiFaceRecognation;
