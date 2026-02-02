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

import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { hitungJarak } from '../../lib/kiken';
import { CheckWaktuAbsen, JamRealtime, cekWaktu } from '../../lib/kiken';
import { setWaktuData } from '../../redux/actions';
import { Stylex } from '../../assets/styles/main';
import ImageLib from '../../components/ImageLib';

const dimensions = Dimensions.get('window');
const height = dimensions.height;
const width = dimensions.width;

function Absensi() {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const AbsenLoc = useSelector(state => state.PROFILE.profile.lokasi_absen);
    const tetapanWaktuAbsen = useSelector(state => state.WAKTU);
    const url = useSelector(state => state.URL);
    const token = useSelector(state => state.TOKEN);

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
    const [gpsEnabled, setGpsEnabled] = useState(true); // ✅ Status GPS

    const getWaktuAbsen = async () => {
        try {
            const xxx = await CheckWaktuAbsen(
                url.URL_MasterWaktuAbsen + 'viewOne',
                token,
            );
            console.log(xxx);
            dispatch(setWaktuData(xxx));
        } catch (error) {
            console.error('Gagal mengambil waktu absen dari API:', error);
        }
    };

    /** 🔌 Cek status koneksi internet */
    useEffect(function () {
        const unsubscribe = NetInfo.addEventListener(function (state) {
            const connected = !!state.isConnected;
            setIsOnline(connected);
            console.log('📶 Koneksi: ' + (connected ? 'Online' : 'Offline'));
        });

        return function () {
            unsubscribe();
        };
    }, []);

    /** 🔒 Verifikasi keamanan device & lokasi */
    const verifyDeviceSecurity = async function (position) {
        try {
            const isEmulator = await DeviceInfo.isEmulator();
            if (isEmulator)
                return { trusted: false, reason: 'Perangkat emulator terdeteksi' };
            if (JailMonkey.isJailBroken && JailMonkey.isJailBroken())
                return { trusted: false, reason: 'Perangkat di-root / jailbreak' };

            if (Platform.OS === 'android') {
                if (JailMonkey.canMockLocation && JailMonkey.canMockLocation())
                    return { trusted: false, reason: 'Mock location diizinkan' };
                if (position && position.mocked)
                    return { trusted: false, reason: 'Lokasi palsu terdeteksi' };
                if (JailMonkey.isOnExternalStorage && JailMonkey.isOnExternalStorage())
                    return { trusted: false, reason: 'Aplikasi di eksternal storage' };
                if (JailMonkey.hookDetected && JailMonkey.hookDetected())
                    return { trusted: false, reason: 'Hooking terdeteksi' };
            }

            if (JailMonkey.isDebugged && JailMonkey.isDebugged())
                return { trusted: false, reason: 'Aplikasi sedang di-debug' };
            if (JailMonkey.trustFall && JailMonkey.trustFall())
                return { trusted: false, reason: 'Pemeriksaan trustFall gagal' };

            return { trusted: true };
        } catch (err) {
            console.error('verifyDeviceSecurity error:', err);
            return { trusted: false, reason: 'Gagal memeriksa keamanan perangkat' };
        }
    };

    /** Tombol fingerprint */
    const tombolAbsensi = () => {
        if (!isOnline) {
            Alert.alert(
                'Tidak Ada Koneksi',
                'Harap aktifkan koneksi internet untuk melanjutkan absensi.',
            );
            return;
        }

        if (!tetapanWaktuAbsen.status) {
            Alert.alert(
                'Absen Terkunci',
                `${tetapanWaktuAbsen.keterangan}. Waktu absen belum dimulai atau sudah berakhir.`,
            );
            return;
        }

        if (statusx) {
            navigation.navigate('AbsensiFaceRecognation');
        } else {
            const jarakInfo =
                jarakMinimal !== null
                    ? `${jarakMinimal.toFixed(2)} meter`
                    : 'tidak diketahui';
            Alert.alert(
                'Jarak Terlalu Jauh / Perangkat Tidak Aman',
                `Anda berada ${jarakInfo} dari titik absen terdekat. Absen ditolak.`,
            );
        }
    };

    /** Tombol cek lokasi */
    const tombolCekLokasi = async () => {
        await getLocation();
        // Alert.alert('Lokasi Anda', `Latitude: ${lokasi.latitude}\nLongitude: ${lokasi.longitude}`);
        CekJarakAbsen();
    };

    /** Ambil lokasi dengan retry mechanism */
    const getLocation = async () => {
        try {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Izin Lokasi',
                        message: 'Aplikasi membutuhkan akses lokasi Anda untuk absensi',
                        buttonPositive: 'OK',
                    },
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    Alert.alert('Akses Ditolak', 'Izin lokasi tidak diberikan');
                    setGpsEnabled(false);
                    return;
                }
            }

            // Opsi geolocation yang lebih baik dengan fallback
            const geoOptions = {
                enableHighAccuracy: false, // Mulai dengan network-based untuk kecepatan
                timeout: 20000, // Timeout lebih panjang (20 detik)
                maximumAge: 60000, // Izinkan posisi cache sampai 1 menit
                forceRequestLocation: true,
                showLocationDialog: true,
            };

            const getPosition = () => {
                return new Promise((resolve, reject) => {
                    Geolocation.getCurrentPosition(resolve, reject, geoOptions);
                });
            };

            let position;
            try {
                position = await getPosition();
                console.log('✅ Lokasi berhasil diambil:', position.coords);
            } catch (firstError) {
                console.warn(
                    '⚠️ Pertama gagal, coba dengan high accuracy:',
                    firstError,
                );

                // Coba lagi dengan high accuracy jika gagal
                const highAccuracyOptions = {
                    enableHighAccuracy: true,
                    timeout: 30000, // Timeout lebih lama untuk GPS
                    maximumAge: 30000,
                };

                position = await new Promise((resolve, reject) => {
                    Geolocation.getCurrentPosition(resolve, reject, highAccuracyOptions);
                });
            }

            const security = await verifyDeviceSecurity(position);
            if (!security.trusted) {
                Alert.alert('Perangkat Tidak Aman', security.reason);
                setStatusx(false);
                setLokasi(
                    Object.assign({}, lokasi, {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    }),
                );
                return;
            }

            CekJarakAbsen(position.coords);

            setLokasi(
                Object.assign({}, lokasi, {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                }),
            );
            setErrorMsg(null);
            setGpsEnabled(true);
        } catch (err) {
            console.error('❌ Error ambil lokasi:', err);
            setErrorMsg(err.message);

            // Berikan pesan error yang lebih jelas
            let errorMessage = 'Gagal mendapatkan lokasi.';
            if (err.code === 3) {
                errorMessage =
                    'Timeout: Lokasi tidak ditemukan dalam waktu yang ditentukan.\n\nSaran:\n1. Pastikan GPS aktif\n2. Coba di luar ruangan\n3. Tunggu beberapa saat sampai GPS terkunci';
            } else if (err.code === 2) {
                errorMessage =
                    'Lokasi tidak tersedia. Pastikan GPS aktif di pengaturan perangkat.';
            } else if (err.code === 1) {
                errorMessage =
                    'Izin lokasi ditolak. Berikan akses lokasi di pengaturan.';
            }

            Alert.alert('Gagal Lokasi', errorMessage);
            setStatusx(false);
            setGpsEnabled(false);
        }
    };

    /** Hitung jarak terdekat */
    const CekJarakAbsen = function (lokasix) {
        if (!AbsenLoc || AbsenLoc.length === 0) {
            console.warn('Data Lokasi Absen tidak ditemukan.');
            setStatusx(false);
            setJarakMinimal(null);
            return;
        }

        let isInsideRadius = false;
        let minJarak = Infinity;

        AbsenLoc.forEach(function (element) {
            const jarakSaatIni = hitungJarak(
                lokasix.latitude,
                lokasix.longitude,
                element.lat,
                element.lng,
            );
            if (jarakSaatIni < minJarak) {
                minJarak = jarakSaatIni;
            }
            if (jarakSaatIni < element.rad) {
                isInsideRadius = true;
            }
        });

        setJarakMinimal(minJarak);
        setStatusx(isInsideRadius);
    };

    useEffect(function () {
        getLocation();
        getWaktuAbsen();
    }, []);

    // Timer untuk update waktu absen setiap detik
    useEffect(() => {
        const secTimer = setInterval(() => {
            const newTime = JamRealtime();
            const datatampil = cekWaktu(newTime, tetapanWaktuAbsen);
            dispatch(setWaktuData(datatampil));
        }, 1000);

        return () => {
            clearInterval(secTimer);
        };
    }, [dispatch, tetapanWaktuAbsen]);

    let statusText = '\nStatus: ';
    if (statusx && tetapanWaktuAbsen.status) {
        statusText += '✅ Diizinkan';
    } else {
        statusText += '❌ Ditolak';
    }
    if (jarakMinimal !== null) {
        statusText += ' | Jarak: ' + jarakMinimal.toFixed(2) + 'm';
    }
    statusText += ` | Waktu: ${tetapanWaktuAbsen.keterangan}`;

    let opacityValue = 0.5;
    if (statusx && tetapanWaktuAbsen.status) {
        opacityValue = 1;
    }

    let isDisabled = true;
    if (statusx && tetapanWaktuAbsen.status) {
        isDisabled = false;
    }

    return (
        <View style={styles.wrappermap}>
            <MapView
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                style={styles.map}
                region={lokasi}
                showsUserLocation={true}
            >
                {AbsenLoc.map(function (loc, index) {
                    return (
                        <React.Fragment key={index}>
                            <Circle
                                center={{ latitude: loc.lat, longitude: loc.lng }}
                                radius={loc.rad}
                                strokeColor="rgba(0, 128, 0, 0.5)"
                                fillColor="#67940933"
                                strokeWidth={2}
                            />
                        </React.Fragment>
                    );
                })}

                <Marker
                    coordinate={lokasi}
                    title="Lokasi Saya"
                    image={require('../../assets/images/icon/pin.png')}
                />
            </MapView>

            {/* 🔌 Indikator koneksi & GPS */}
            <View style={styles.statusContainer}>
                {/* <View
          style={[
            styles.netStatus,
            { backgroundColor: isOnline ? '#4CAF50' : '#E53935' },
          ]}
        >
          <Text style={styles.netText}>{isOnline ? 'Online' : 'Offline'}</Text>
        </View> */}
                <View
                    style={[
                        styles.netStatus,
                        {
                            backgroundColor: gpsEnabled ? '#4CAF50' : '#FF9800',
                            marginTop: -15,
                        },
                    ]}
                >
                    <Text style={styles.netText}>
                        {gpsEnabled ? 'GPS Aktif' : 'GPS Mati'}
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                style={Stylex.backBtn}
                onPress={() => navigation.goBack()}
            >
                <ImageLib
                    urix={require('../../assets/images/icon/tombolkembali.png')}
                    style={{ width: 64, height: 23 }}
                />
            </TouchableOpacity>

            <View style={styles.absenSection}>
                <Text style={styles.absenTitle}>ABSENSI</Text>
                <Text style={styles.absenSubtitle}>
                    Sebelum melakukan pengabsenan, pastikan anda berada di posisi yang
                    tepat
                </Text>
                <Text
                    style={{
                        marginTop: -15,
                        paddingRight: 10,
                        color: '#555',
                        fontFamily: 'Audiowide-Regular',
                    }}
                >
                    {statusText}
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
                style={[styles.fingerprintBtn, { opacity: opacityValue }]}
                onPress={tombolAbsensi}
                activeOpacity={0.8}
                disabled={isDisabled}
            >
                <ImageLib
                    urix={require('../../assets/images/icon/fingerprint3.png')}
                    style={styles.fingerprint}
                />
            </TouchableOpacity>
        </View>
    );
}

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
    absenSubtitle: {
        top: 1,
        color: '#555',
        fontFamily: 'Almarai-Regular',
        fontSize: 8,
    },
    netStatus: {
        position: 'absolute',
        top: 50,
        right: 20,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 10,
    },
    statusContainer: {
        position: 'absolute',
        top: 50,
        right: 20,
    },
    netText: { color: '#fff', fontSize: 10, fontWeight: '600' },
});

export default Absensi;
