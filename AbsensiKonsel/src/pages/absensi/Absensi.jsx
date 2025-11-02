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
    PermissionsAndroid
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import Geolocation from '@react-native-community/geolocation';

import { Stylex } from "../../assets/styles/main";
import ImageLib from '../../components/ImageLib';
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from 'react-redux';
import { hitungJarak } from '../../lib/kiken';


const { height, width } = Dimensions.get('window');

const Absensi = () => {
    const navigation = useNavigation();
    // Diasumsikan AbsenLoc adalah Array lokasi: [{lat: ..., lng: ..., rad: ...}, ...]
    const AbsenLoc = useSelector(state => state.PROFILE.profile.lokasi_absen)


    const [lokasi, setLokasi] = useState({
        latitude: -4.3324188,
        longitude: 122.2809425,
        latitudeDelta: 0.003,
        longitudeDelta: 0.003,
    });

    const [errorMsg, setErrorMsg] = useState(null);
    const [statusx, setStatusx] = useState(false) // Status boleh/tidak boleh absen
    const [jarakMinimal, setJarakMinimal] = useState(null); // Tambah state untuk info jarak

    // === Tombol fingerprint ===
    // Tambahkan pengecekan statusx agar tombol hanya berfungsi jika statusx true
    const tombolAbsensi = () => {
        if (statusx) {
            console.log('Absen Diizinkan!');
            navigation.navigate('AbsensiFaceRecognation');
        } else {
            const jarakInfo = jarakMinimal !== null ? `${jarakMinimal.toFixed(2)} meter` : 'tidak diketahui';
            Alert.alert(
                "Jarak Terlalu Jauh",
                `Anda berada ${jarakInfo} dari titik absen terdekat. Absen ditolak.`
            );
        }
    };

    // === Tombol cek lokasi ===
    const tombolCekLokasi = async () => {
        await getLocation();
        Alert.alert(
            "Lokasi Anda",
            `Latitude: ${lokasi.latitude}\nLongitude: ${lokasi.longitude}`
        );
    };

    // === Ambil lokasi ===
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

            // Set statusx ke false/loading sebelum ambil lokasi baru (Opsional)
            // setStatusx(false); 
            // setJarakMinimal(null);

            Geolocation.getCurrentPosition(
                position => {
                    console.log('Lokasi saat ini:', position.coords);

                    // 1. Panggil CekJarakAbsen menggunakan koordinat terbaru
                    CekJarakAbsen(position.coords);

                    // 2. Update state lokasi untuk map marker
                    setLokasi(prev => ({
                        ...prev,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    }));
                    setErrorMsg(null);
                },
                error => {
                    console.error('Gagal ambil lokasi:', error);
                    setErrorMsg(error.message);
                    setStatusx(false); // Pastikan status absen false jika gagal ambil lokasi
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
        } catch (err) {
            console.error('Error izin lokasi:', err);
            setErrorMsg(err.message);
        }
    };

    // 🚀 FUNGSI PERBAIKAN: Hitung Jarak Terdekat dan Tentukan statusx Sekali Saja
    const CekJarakAbsen = (lokasix) => {
        if (!AbsenLoc || AbsenLoc.length === 0) {
            console.warn("Data Lokasi Absen tidak ditemukan.");
            setStatusx(false);
            setJarakMinimal(null);
            return;
        }

        // 1. Inisialisasi status menjadi false sebelum pengecekan
        let isInsideRadius = false;
        let minJarak = Infinity;

        AbsenLoc.forEach(element => {
            const jarakSaatIni = hitungJarak(lokasix.latitude, lokasix.longitude, element.lat, element.lng);
            console.log(`Jarak ke Lokasi (rad ${element.rad}m): ${jarakSaatIni.toFixed(2)} meter`);

            // Cek apakah jarak saat ini adalah jarak minimal
            if (jarakSaatIni < minJarak) {
                minJarak = jarakSaatIni;
            }

            // Cek apakah jarak sudah memenuhi syarat (percabangan utama)
            if (jarakSaatIni < element.rad) {
                isInsideRadius = true;
            }
        });

        // 2. Update state SETELAH SEMUA ITERASI SELESAI
        setJarakMinimal(minJarak);
        setStatusx(isInsideRadius);

        console.log(`Status Absen Final: ${isInsideRadius ? 'TRUE (Boleh Absen)' : 'FALSE (Jarak Jauh)'}`);
    }

    // === Jalankan saat mount ===
    // Jalankan getLocation HANYA SEKALI saat komponen dimuat
    useEffect(() => {
        getLocation();
    }, []);

    // Perhatikan: Menghapus [statusx] dari dependency array di atas.
    // Memasukkan [statusx] akan menyebabkan loop tak terbatas jika setStatusx(true) dipanggil.

    // Tambahkan useEffect untuk log perubahan statusx
    useEffect(() => {
        console.log(`STATUSX BERUBAH MENJADI: ${statusx}`);
    }, [statusx])

    return (
        <View style={styles.wrappermap}>
            {/* MAP VIEW */}
            <MapView
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                style={styles.map}
                region={lokasi}
                showsUserLocation={true}
            >
                {/* Tambahkan Marker Lokasi Absen */}
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

            {/* Tombol Kembali */}
            <TouchableOpacity
                style={Stylex.backBtn}
                onPress={() => navigation.goBack()}
            >
                <ImageLib
                    urix={require('../../assets/images/icon/tombolkembali.png')}
                    style={{ width: 64, height: 23 }}
                />
            </TouchableOpacity>

            {/* Tombol Setting */}
            <TouchableOpacity style={Stylex.btnSetting}>
                <ImageLib
                    style={{ width: 25 }}
                    urix={require('../../assets/images/icon/setting.png')}
                />
            </TouchableOpacity>

            {/* JUDUL */}
            <View style={styles.absenSection}>
                <Text style={styles.absenTitle}>ABSENSI</Text>
                <Text style={styles.absenSubtitle}>
                    {/* Tampilkan status */}
                    Sebelum melakukan pengabsenan, pastikan anda berada di posisi yang tepat
                    {`\nStatus: ${statusx ? '✅ Diizinkan' : '❌ Ditolak'}`}
                    {jarakMinimal !== null && ` | Jarak Terdekat: ${jarakMinimal.toFixed(2)}m`}
                </Text>
            </View>

            {/* Tombol Lokasi */}
            <TouchableOpacity
                style={styles.locationBtn}
                onPress={tombolCekLokasi}
                activeOpacity={0.8}
            >
                <ImageLib
                    urix={require("../../assets/images/icon/Iconlokasi.png")}
                    style={styles.iconLocation}
                />
            </TouchableOpacity>

            {/* Tombol Fingerprint */}
            <TouchableOpacity
                style={[styles.fingerprintBtn, { opacity: statusx ? 1 : 0.5 }]}
                onPress={tombolAbsensi}
                activeOpacity={0.8}
                disabled={!statusx} // Nonaktifkan jika belum diizinkan
            >
                <ImageLib
                    urix={require("../../assets/images/icon/fingerprint3.png")}
                    style={styles.fingerprint}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    // ... (styles Anda yang lain) ...
    wrappermap: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#eaeaea",
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    fingerprintBtn: {
        position: "absolute",
        bottom: 100,
        alignSelf: "center",
        backgroundColor: "white",
        borderRadius: 100,
        padding: 1,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    fingerprint: {
        width: 110,
        height: 110,
    },
    locationBtn: {
        position: "absolute",
        top: 155,
        right: 25,
        backgroundColor: "white",
        borderRadius: 40,
        padding: 1,
        elevation: 4,
        shadowColor: "#000",
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
