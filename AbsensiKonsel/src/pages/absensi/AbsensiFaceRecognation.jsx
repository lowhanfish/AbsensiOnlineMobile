import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';

const AbsensiFaceRecognation = () => {
    const [hasPermission, setHasPermission] = useState(false);
    const devices = useCameraDevices();

    // 🔧 Pemilihan kamera dengan fallback ke TrueDepth atau back
    const device =
        devices.front ||
        Object.values(devices).find(
            (d) =>
                d.id?.toLowerCase().includes('truedepth') ||
                d.position === 'front'
        ) ||
        devices.back ||
        devices[0];

    useEffect(() => {
        const requestPermission = async () => {
            const status = await Camera.requestCameraPermission();
            console.log('📸 Camera permission:', status);
            setHasPermission(status === 'authorized' || status === 'granted');
        };
        requestPermission();
    }, []);

    // Log semua kamera yang terdeteksi
    useEffect(() => {
        if (devices) {
            console.log('🔍 Semua kamera terdeteksi:', devices);
            Object.values(devices).forEach((d) =>
                console.log(`📷 ${d.position} — ${d.id}`)
            );
        }
    }, [devices]);

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
                <Text style={styles.text}>Kamera depan tidak ditemukan</Text>
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
                    Arahkan wajah Anda ke kamera depan
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
