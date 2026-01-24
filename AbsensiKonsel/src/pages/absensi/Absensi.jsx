import React, { useEffect, useState } from 'react';
import {
    Text,
    Image,
    View,
    StyleSheet,
    Dimensions,
    Alert,
    TouchableOpacity,
    Platform,
    PermissionsAndroid,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Circle } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import NetInfo from '@react-native-community/netinfo'; // ✅ Tambahan

import DeviceInfo from 'react-native-device-info';
import JailMonkey from 'jail-monkey';

import { Stylex } from '../../assets/styles/main';
import ImageLib from '../../components/ImageLib';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { hitungJarak } from '../../lib/kiken';

const { height, width } = Dimensions.get('window');

const Absensi = () => {
    const navigation = useNavigation();
    const AbsenLoc = useSelector(state => state.PROFILE.profile.lokasi_absen);

    const [lokasi, setLokasi] = useState({
        latitude: -4.3324188,
        longitude: 122.2809425,
        latitudeDelta: 0.003,
        longitudeDelta: 0.003,
    });

    const [errorMsg, setErrorMsg] = useState(null);
    const [statusx, setStatusx] = useState(false);
    const [jarakMinimal, setJarakMinimal] = useState(null);
    const [isOnline, setIsOnline] = useState(true); // ✅ Tambahan

    /** 🔌 Cek status koneksi internet */
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            const connected = !!state.isConnected;
            setIsOnline(connected);
            console.log(`📶 Koneksi: ${connected ? 'Online' : 'Offline'}`);
        });

        return () => unsubscribe();
    }, []);

    /** 🔒 Verifikasi keamanan device & lokasi */
    const verifyDeviceSecurity = async (position) => {
        try {
            const isEmulator = await DeviceInfo.isEmulator();
            if (isEmulator) return { trusted: false, reason: 'Perangkat emulator terdeteksi' };
            if (JailMonkey.isJailBroken?.()) return { trusted: false, reason: 'Perangkat di-root / jailbreak' };

            if (Platform.OS === 'android') {
                if (JailMonkey.canMockLocation?.()) return { trusted: false, reason: 'Mock location diizinkan' };
                if (position?.mocked) return { trusted: false, reason: 'Lokasi palsu terdeteksi' };
                if (JailMonkey.isOnExternalStorage?.()) return { trusted: false, reason: 'Aplikasi di eksternal storage' };
                if (JailMonkey.hookDetected?.()) return { trusted: false, reason: 'Hooking terdeteksi' };
            }

            if (JailMonkey.isDebugged?.()) return { trusted: false, reason: 'Aplikasi sedang di-debug' };
            if (JailMonkey.trustFall?.()) return { trusted: false, reason: 'Pemeriksaan trustFall gagal' };

            return { trusted: true };
        } catch (err) {
            console.error('verifyDeviceSecurity error:', err);
            return { trusted: false, reason: 'Gagal memeriksa keamanan perangkat' };
        }
    };

    /** Tombol fingerprint */
    const tombolAbsensi = () => {
        if (!isOnline) {
            Alert.alert('Tidak Ada Koneksi', 'Harap aktifkan koneksi internet untuk melanjutkan absensi.');
            return;
        }

        if (statusx) {
            navigation.navigate('AbsensiFaceRecognation');
        } else {
            const jarakInfo = jarakMinimal !== null ? `${jarakMinimal.toFixed(2)} meter` : 'tidak diketahui';
            Alert.alert(
                'Jarak Terlalu Jauh / Perangkat Tidak Aman',
                `Anda berada ${jarakInfo} dari titik absen terdekat. Absen ditolak.`
            );
        }
    };

    /** Tombol cek lokasi */
    const tombolCekLokasi = async () => {
        await getLocation();
        // Alert.alert('Lokasi Anda', `Latitude: ${lokasi.latitude}\nLongitude: ${lokasi.longitude}`);
        CekJarakAbsen();
    };

    /** Ambil lokasi */
    const getLocation = async () => {
        try {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Izin Lokasi',
                        message: 'Aplikasi membutuhkan akses lokasi Anda',
                        buttonPositive: 'OK',
                    }
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    Alert.alert('Akses Ditolak', 'Izin lokasi tidak diberikan');
                    return;
                }
            }

            Geolocation.getCurrentPosition(
                async (position) => {
                    console.log('Lokasi saat ini:', position.coords);

                    const security = await verifyDeviceSecurity(position);
                    if (!security.trusted) {
                        Alert.alert('Perangkat Tidak Aman', security.reason);
                        setStatusx(false);
                        setLokasi({
                            ...lokasi,
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        });
                        return;
                    }

                    CekJarakAbsen(position.coords);

                    setLokasi({
                        ...lokasi,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                    setErrorMsg(null);
                },
                (error) => {
                    console.error('Gagal ambil lokasi:', error);
                    setErrorMsg(error.message);
                    setStatusx(false);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
        } catch (err) {
            console.error('Error izin lokasi:', err);
            setErrorMsg(err.message);
        }
    };

    /** Hitung jarak terdekat */
    const CekJarakAbsen = (lokasix) => {
        if (!AbsenLoc || AbsenLoc.length === 0) {
            console.warn('Data Lokasi Absen tidak ditemukan.');
            setStatusx(false);
            setJarakMinimal(null);
            return;
        }

        let isInsideRadius = false;
        let minJarak = Infinity;

        AbsenLoc.forEach((element) => {
            const jarakSaatIni = hitungJarak(lokasix.latitude, lokasix.longitude, element.lat, element.lng);
            if (jarakSaatIni < minJarak) {
                minJarak = jarakSaatIni
            };
            if (jarakSaatIni < element.rad) {
                isInsideRadius = true
            };
        });

        setJarakMinimal(minJarak);
        setStatusx(isInsideRadius);
    };

    useEffect(() => {
        getLocation();
    }, []);

    return (
        <View style={styles.wrappermap}>
            <MapView
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                style={styles.map}
                region={lokasi}
                showsUserLocation={true}
            >
                {AbsenLoc.map((loc, index) => (
                    <React.Fragment key={index}>
                        <Circle
                            center={{ latitude: loc.lat, longitude: loc.lng }}
                            radius={loc.rad}
                            strokeColor="rgba(0, 128, 0, 0.5)"
                            fillColor="#67940933"
                            strokeWidth={2}
                        />
                    </React.Fragment>
                ))}

                <Marker
                    coordinate={lokasi}
                    title="Lokasi Saya"
                    image={require('../../assets/images/icon/pin.png')}
                />
            </MapView>

            {/* 🔌 Indikator koneksi */}
            <View style={[styles.netStatus, { backgroundColor: isOnline ? '#4CAF50' : '#E53935' }]}>
                <Text style={styles.netText}>
                    {isOnline ? 'Online' : 'Offline (mode GPS-only)'}
                </Text>
            </View>

            <TouchableOpacity style={Stylex.backBtn} onPress={() => navigation.goBack()}>
                <ImageLib
                    urix={require('../../assets/images/icon/tombolkembali.png')}
                    style={{ width: 64, height: 23 }}
                />
            </TouchableOpacity>

            <View style={styles.absenSection}>
                <Text style={styles.absenTitle}>ABSENSI</Text>
                <Text style={styles.absenSubtitle}>
                    Sebelum melakukan pengabsenan, pastikan anda berada di posisi yang tepat
                </Text>
                <Text style={{ marginTop: -15, color: '#555', fontFamily: 'Audiowide-Regular', }}>
                    {`\nStatus: ${statusx ? '✅ Diizinkan' : '❌ Ditolak'}`}
                    {jarakMinimal !== null && ` | Jarak: ${jarakMinimal.toFixed(2)}m`}
                </Text>
            </View>

            <TouchableOpacity style={styles.locationBtn} onPress={tombolCekLokasi} activeOpacity={0.8}>
                <ImageLib urix={require('../../assets/images/icon/Iconlokasi.png')} style={styles.iconLocation} />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.fingerprintBtn, { opacity: statusx ? 1 : 0.5 }]}
                onPress={tombolAbsensi}
                activeOpacity={0.8}
                disabled={!statusx}
            >
                <ImageLib
                    urix={require('../../assets/images/icon/fingerprint3.png')}
                    style={styles.fingerprint}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    wrappermap: { ...StyleSheet.absoluteFillObject, backgroundColor: '#eaeaea' },
    map: { ...StyleSheet.absoluteFillObject },
    fingerprintBtn: {
        position: 'absolute',
        bottom: 100,
        alignSelf: 'center',
        backgroundColor: 'white',
        borderRadius: 100,
        padding: 1,
        elevation: 5,
    },
    fingerprint: { width: 110, height: 110 },
    locationBtn: {
        position: 'absolute',
        top: 155,
        right: 25,
        backgroundColor: 'white',
        borderRadius: 40,
        padding: 1,
        elevation: 4,
    },
    iconLocation: { width: 45, height: 45 },
    absenSection: { top: 75, left: 28, paddingHorizontal: 20 },
    absenTitle: {
        fontSize: 32,
        color: '#FFFFFF',
        fontFamily: 'Audiowide-Regular',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
    },
    absenSubtitle: { top: 1, color: '#555', fontFamily: 'Almarai-Regular', fontSize: 8 },
    netStatus: {
        position: 'absolute',
        top: 50,
        right: 20,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 10,
    },
    netText: { color: '#fff', fontSize: 10, fontWeight: '600' },
});

export default Absensi;
