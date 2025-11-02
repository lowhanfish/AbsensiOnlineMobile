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
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';

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

    /** 🔒 Verifikasi keamanan device & lokasi */
    const verifyDeviceSecurity = async (position) => {
        try {
            // 1️⃣ Deteksi Emulator
            const isEmulator = await DeviceInfo.isEmulator();
            if (isEmulator) {
                return { trusted: false, reason: 'Perangkat emulator terdeteksi' };
            }

            // 2️⃣ Deteksi Jailbreak / Root
            if (JailMonkey.isJailBroken?.()) {
                return { trusted: false, reason: 'Perangkat telah di-root atau di-jailbreak' };
            }

            // 3️⃣ Deteksi Mock Location (Android)
            if (Platform.OS === 'android') {
                if (JailMonkey.canMockLocation?.()) {
                    return { trusted: false, reason: 'Perangkat dapat menggunakan lokasi palsu (mock location)' };
                }

                const mockedBySystem = position?.mocked === true || position?.coords?.mocked === true;
                if (mockedBySystem) {
                    return { trusted: false, reason: 'Lokasi palsu (mock) terdeteksi oleh sistem Android' };
                }

                if (JailMonkey.isOnExternalStorage?.()) {
                    return { trusted: false, reason: 'Aplikasi dijalankan dari penyimpanan eksternal (tidak aman)' };
                }

                if (JailMonkey.hookDetected?.()) {
                    return { trusted: false, reason: 'Aplikasi terdeteksi mengalami hooking atau modifikasi' };
                }
            }

            // 4️⃣ Deteksi Mode Debug (kalau tersedia)
            if (typeof JailMonkey.isDebugged === 'function' && JailMonkey.isDebugged()) {
                return { trusted: false, reason: 'Aplikasi sedang berjalan dalam mode debug' };
            }

            // 5️⃣ trustFall() – pemeriksaan lengkap gabungan
            if (JailMonkey.trustFall?.()) {
                return { trusted: false, reason: 'Perangkat gagal lulus pemeriksaan keamanan (trustFall)' };
            }

            // ✅ Semua aman
            return { trusted: true };
        } catch (err) {
            console.error('verifyDeviceSecurity error:', err);
            return { trusted: false, reason: 'Gagal memeriksa keamanan perangkat' };
        }
    };

    /** Tombol fingerprint */
    const tombolAbsensi = () => {
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
        Alert.alert('Lokasi Anda', `Latitude: ${lokasi.latitude}\nLongitude: ${lokasi.longitude}`);
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

                    // 🔒 Verifikasi keamanan
                    const security = await verifyDeviceSecurity(position);
                    if (!security.trusted) {
                        Alert.alert('Perangkat Tidak Aman', security.reason);
                        setStatusx(false);
                        setLokasi((prev) => ({
                            ...prev,
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        }));
                        return;
                    }

                    // Cek jarak absen
                    CekJarakAbsen(position.coords);

                    // Update lokasi
                    setLokasi((prev) => ({
                        ...prev,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    }));
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
            console.log(`Jarak ke Lokasi (rad ${element.rad}m): ${jarakSaatIni.toFixed(2)} meter`);
            if (jarakSaatIni < minJarak) minJarak = jarakSaatIni;
            if (jarakSaatIni < element.rad) isInsideRadius = true;
        });

        setJarakMinimal(minJarak);
        setStatusx(isInsideRadius);
        console.log(`Status Absen Final: ${isInsideRadius ? 'TRUE (Boleh Absen)' : 'FALSE (Jarak Jauh)'}`);
    };

    useEffect(() => {
        getLocation();
    }, []);

    useEffect(() => {
        console.log(`STATUSX BERUBAH MENJADI: ${statusx}`);
    }, [statusx]);

    return (
        <View style={styles.wrappermap}>
            <MapView
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                style={styles.map}
                region={lokasi}
                showsUserLocation={true}
            >
                {AbsenLoc.map((loc, index) => (
                    <Marker
                        key={index}
                        coordinate={{ latitude: loc.lat, longitude: loc.lng }}
                        title={`Absen Point ${index + 1}`}
                        pinColor="blue"
                    />
                ))}
                <Marker coordinate={lokasi} title="Lokasi Saya" />
            </MapView>

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
                    {`\nStatus: ${statusx ? '✅ Diizinkan' : '❌ Ditolak'}`}
                    {jarakMinimal !== null && ` | Jarak Terdekat: ${jarakMinimal.toFixed(2)}m`}
                </Text>
            </View>

            <TouchableOpacity
                style={styles.locationBtn}
                onPress={tombolCekLokasi}
                activeOpacity={0.8}
            >
                <ImageLib
                    urix={require('../../assets/images/icon/Iconlokasi.png')}
                    style={styles.iconLocation}
                />
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
    wrappermap: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#eaeaea',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    fingerprintBtn: {
        position: 'absolute',
        bottom: 100,
        alignSelf: 'center',
        backgroundColor: 'white',
        borderRadius: 100,
        padding: 1,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    fingerprint: {
        width: 110,
        height: 110,
    },
    locationBtn: {
        position: 'absolute',
        top: 155,
        right: 25,
        backgroundColor: 'white',
        borderRadius: 40,
        padding: 1,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 1 },
    },
    iconLocation: {
        width: 45,
        height: 45,
    },
    absenSection: {
        top: 75,
        left: 28,
        paddingHorizontal: 20,
    },
    absenTitle: {
        fontSize: 32,
        color: '#FFFFFF',
        fontFamily: 'Audiowide-Regular',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
    },
    absenSubtitle: {
        top: 1,
        color: '#555555',
        fontFamily: 'Almarai-Regular',
        fontSize: 8,
    },
});

export default Absensi;
