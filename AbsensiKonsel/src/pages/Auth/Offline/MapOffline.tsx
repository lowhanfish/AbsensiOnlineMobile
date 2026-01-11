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
    Modal,
    TextInput,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Circle } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import NetInfo from '@react-native-community/netinfo'; // ✅ Tambahan

import DeviceInfo from 'react-native-device-info';
import JailMonkey from 'jail-monkey';

import { Stylex } from '../../../assets/styles/main';
import ImageLib from '../../../components/ImageLib';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { hitungJarak } from '../../../lib/kiken';

const { height, width } = Dimensions.get('window');

const AbsensiOffline = () => {
    const navigation = useNavigation();

    const [lokasi, setLokasi] = useState({
        latitude: -4.3324188,
        longitude: 122.2809425,
        latitudeDelta: 0.003,
        longitudeDelta: 0.003,
    });

    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [statusx, setStatusx] = useState(false);
    const [jarakMinimal, setJarakMinimal] = useState<number | null>(null);
    const [isOnline, setIsOnline] = useState(true); // ✅ Tambahan
    // ============ MODAL ============
    const [modalVisible, setModalVisible] = useState(false);
    const openPopup = () => {
        setModalVisible(true);
    };

    const closePopup = () => {
        setModalVisible(false);

    };

    // ============ MODAL ============

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
    const verifyDeviceSecurity = async (position: any) => {
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

            return { trusted: true };
        } catch (err) {
            console.error('verifyDeviceSecurity error:', err);
            return { trusted: false, reason: 'Gagal memeriksa keamanan perangkat' };
        }
    };

    /** Tombol fingerprint */
    const tombolAbsensi = () => {
        console.log("OKEEEE");
        openPopup();
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

                    setLokasi({
                        ...lokasi,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                    setErrorMsg(null);
                },
                (error: any) => {
                    console.error('Gagal ambil lokasi:', error);
                    setErrorMsg(error.message);
                    setStatusx(false);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
        } catch (err: any) {
            console.error('Error izin lokasi:', err);
            setErrorMsg(err.message);
        }
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

                <Marker
                    coordinate={lokasi}
                    title="Lokasi Saya"
                    image={require('../../../assets/images/icon/pin.png')}
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
                    urix={require('../../../assets/images/icon/tombolkembali.png')}
                    customWidth={64}
                    style={{ width: 64, height: 23 }}
                />
            </TouchableOpacity>

            <View style={styles.absenSection}>
                <Text style={styles.absenTitle}>ABSENSI</Text>
                <Text style={styles.absenSubtitle}>
                    Sebelum melakukan pengabsenan, pastikan anda berada di posisi yang tepat

                    {jarakMinimal !== null && ` | Jarak: ${jarakMinimal.toFixed(2)}m`}
                </Text>
            </View>

            <TouchableOpacity style={styles.locationBtn} onPress={tombolCekLokasi} activeOpacity={0.8}>
                <ImageLib urix={require('../../../assets/images/icon/Iconlokasi.png')} customWidth={45} style={styles.iconLocation} />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.fingerprintBtn]}
                onPress={tombolAbsensi}
                activeOpacity={0.8}
            >
                <ImageLib
                    urix={require('../../../assets/images/icon/fingerprint3.png')}
                    customWidth={110}
                    style={styles.fingerprint}
                />
            </TouchableOpacity>

            <ModalNip modalVisible={modalVisible} closePopup={closePopup} lokasi={lokasi} />

        </View>
    );
};


const ModalNip = ({ modalVisible, closePopup, lokasi }: any) => {

    const navigation = useNavigation<any>();
    const [nipValue, setNipValue] = useState('');

    const handleMulaiRekam = () => {
        if (!nipValue.trim()) {
            Alert.alert('Peringatan', 'Silakan masukkan NIP Anda terlebih dahulu');
            return;
        }
        closePopup();
        // Kirim lokasi beserta NIP ke VerifikasiWajah
        navigation.navigate("VerifikasiWajah", { 
            lokasi: {
                ...lokasi,
                nip: nipValue.trim()
            }
        });
    };

    return (
        <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closePopup} >
            <View style={Stylex.overlay}>
                <View style={Stylex.popup}>

                    <TouchableOpacity style={Stylex.closeButton} onPress={closePopup}>
                        <Text style={Stylex.closeText}>✕</Text>
                    </TouchableOpacity>

                    <View style={{ marginTop: 20 }}>
                        <TextInput
                            style={Stylex.daruratInput}
                            placeholder="Masukkan NIP Anda"
                            placeholderTextColor="#999"
                            value={nipValue}
                            onChangeText={setNipValue}
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={{ marginTop: 20 }}>
                        <TouchableOpacity onPress={handleMulaiRekam} style={styles.buttonOffline}>
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Mulai Rekam Offline</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>
    )
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
    inputx: {
        height: 42,
        color: '#747474ff',
        fontSize: 12,
    },
    containerInputx: {
        marginTop: 18,
        marginLeft: 1,
        marginRight: 1,
        borderWidth: 1,
        borderRadius: 8,
        padding: 5,
        borderColor: '#DCDCDC',
        backgroundColor: '#FFFFFF',
    },
    buttonOffline: {
        height: 45,
        borderRadius: 8,
        borderColor: '#C2ABD5',
        backgroundColor: '#D1B7E7',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 0
    },
});

export default AbsensiOffline;
