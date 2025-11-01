import React, { useState, useRef } from 'react'; // << Tambahkan useRef
import {
    Text,
    ScrollView,
    View,
    StyleSheet,
    Dimensions,
    ImageBackground,
    TouchableOpacity,
    Platform,
} from "react-native";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stylex } from "../../assets/styles/main";
import ImageLib from "../../components/ImageLib";
import { CheckWaktuAbsen, JamRealtime, cekWaktu } from '../../lib/kiken';

import { useDispatch, useSelector } from 'react-redux'
import { setWaktuData } from '../../redux/actions';


const { height, width } = Dimensions.get('window');

const Dashboard = () => {
    const navigation = useNavigation();

    const dispatch = useDispatch();
    const tetapanWaktuAbsen = useSelector(state => state.WAKTU)
    const url = useSelector(state => state.URL)
    const token = useSelector(state => state.TOKEN)

    // 🚀 LANGKAH 1: Buat ref untuk menyimpan nilai Redux terbaru
    const latestWaktuRef = useRef(tetapanWaktuAbsen);

    // 🚀 LANGKAH 2: useEffect untuk mengupdate ref setiap kali Redux state berubah
    // Ini memastikan timer selalu memiliki akses ke state terbaru.
    React.useEffect(() => {
        latestWaktuRef.current = tetapanWaktuAbsen;
    }, [tetapanWaktuAbsen]);


    // State Lokal
    const [currentDate, setCurrentDate] = useState('00:00:00');
    // ... State lainnya ...
    const [isChecked, setIsChecked] = useState(false);
    const [text, setText] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    // --- Fungsi Bantuan ---

    const handleButtonPress = () => {
        console.log('Filter Data By Text', text);
    };

    const data = [
        { id: 1, status: '1' },
        { id: 2, status: '1' },
        { id: 3, status: '2' },
        { id: 4, status: '3' },
        { id: 5, status: '3' },
        { id: 6, status: '2' },
    ];

    const getBackgroundColor = (status) => {
        switch (status) {
            case '1': return '#FFF8E0';
            case '2': return '#F7EEFF';
            case '3': return '#FFE0E0';
        }
    };

    const getStatusImage = (status) => {
        switch (status) {
            case '1': return require('../../assets/images/icon/process.png');
            case '2': return require('../../assets/images/icon/true.png');
            case '3': return require('../../assets/images/icon/false.png');
        }
    };

    const openPopup = (item) => {
        setSelectedItem(item);
        setModalVisible(true);
    };

    const closePopup = () => {
        setModalVisible(false);
        setSelectedItem(null);
    };

    const handleAction = (action) => {
        console.log(`${action} clicked for item ID:`, selectedItem?.id);
        closePopup();
    };

    const routex = (routexx) => {
        navigation.navigate("MainPage", { screen: routexx });
    };


    const getWaktuAbsen = async () => {
        try {
            const xxx = await CheckWaktuAbsen(url.URL_MasterWaktuAbsen + "viewOne", token);
            dispatch(setWaktuData(xxx));
        } catch (error) {
            console.error("Gagal mengambil waktu absen dari API:", error);
        }
    }


    // =================================================================
    // useFocusEffect + useRef
    // =================================================================
    useFocusEffect(
        React.useCallback(() => {

            getWaktuAbsen();

            let secTimer = setInterval(() => {

                // Mengambil waktu BARU
                const newTime = JamRealtime();

                // 1. Perbarui state lokal (Memicu re-render UI jam)
                setCurrentDate(newTime);

                // 2. Akses state Redux terbaru melalui REF (Menghindari Stale Closure)
                const latestWaktu = latestWaktuRef.current;

                // 3. Cek status baru
                const datatampil = cekWaktu(newTime, latestWaktu);

                // 4. Update state Redux (Memicu re-render komponen secara keseluruhan)
                dispatch(setWaktuData(datatampil));


            }, 1000);

            // 5. Cleanup: Hentikan timer saat layar hilang fokus
            return () => {
                clearInterval(secTimer);
                console.log("Timer Dashboard dihentikan.");
            };

            // Dependensi hanya [dispatch] (atau bahkan [ ] jika tidak ada dispatch di luar timer)
            // Kita hanya perlu memastikan timer berjalan. Kita TIDAK MEMASUKKAN tetapanWaktuAbsen di sini!
        }, [dispatch])
    );


    return (
        <ScrollView>
            <View style={{ flex: 1 }}>
                <View style={Stylex.titleContainer}>
                    <Text style={[Stylex.h_title1, Stylex.shaddowText]}>Selamat Datang</Text>
                    <Text style={Stylex.h_title2}>Kiken Sukma Batara, S.Si.,MT</Text>


                    <Text style={[Stylex.shaddowText, { paddingTop: 1, fontWeight: 'bold', fontSize: 14, color: 'white' }]}>
                        {/* currentDate berasal dari state lokal yang diupdate setiap detik. */}
                        {tetapanWaktuAbsen.keterangan} ({currentDate}) { }
                    </Text>
                </View>

                <View style={styles.container}>
                    <ImageBackground
                        style={{ flex: 1 }}
                        resizeMode="stretch"
                        source={require('../../assets/images/bg1.png')}
                    >
                        <View style={{ flex: 1, paddingHorizontal: 30 }}>
                            <View style={[styles.navContainer, { marginTop: -39 }]}>
                                <View style={styles.navButtonContainer}>
                                    <TouchableOpacity style={styles.navButtonImageNoticeContainer}>
                                        <Text style={styles.navButtonTextNotice}>999</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => routex('Absensi')} style={styles.navButtonSubContainer}>
                                        <View>
                                            <ImageLib urix={require('../../assets/images/icon/absensi.png')} style={styles.navButtonImage1} />
                                        </View>
                                        <View style={{ alignItems: 'center' }}>
                                            <Text style={styles.navButtonImagetext}>ABSENSI</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>

                                <View style={[styles.navButtonContainer, { marginHorizontal: 15 }]}>
                                    <TouchableOpacity style={styles.navButtonImageNoticeContainer}>
                                        <Text style={styles.navButtonTextNotice}>999</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.navButtonSubContainer}>
                                        <View>
                                            <ImageLib urix={require('../../assets/images/icon/darurat.png')} style={styles.navButtonImage1} />
                                        </View>
                                        <View style={{ alignItems: 'center' }}>
                                            <Text style={styles.navButtonImagetext}>DARURAT</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.navButtonContainer}>
                                    <TouchableOpacity style={styles.navButtonImageNoticeContainer}>
                                        <Text style={styles.navButtonTextNotice}>999</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.navButtonSubContainer}>
                                        <View>
                                            <ImageLib urix={require('../../assets/images/icon/izin.png')} style={styles.navButtonImage1} />
                                        </View>
                                        <View style={{ alignItems: 'center' }}>
                                            <Text style={styles.navButtonImagetext}>IZIN</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={[styles.navContainer, { marginTop: 15 }]}>
                                <View style={styles.navButtonContainer}>
                                    <TouchableOpacity style={styles.navButtonImageNoticeContainer}>
                                        <Text style={styles.navButtonTextNotice}>999</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.navButtonSubContainer}>
                                        <View>
                                            <ImageLib urix={require('../../assets/images/icon/kinerja.png')} style={styles.navButtonImage1} />
                                        </View>
                                        <View style={{ alignItems: 'center' }}>
                                            <Text style={styles.navButtonImagetext}>E-KINERJA</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>

                                <View style={[styles.navButtonContainer, { marginHorizontal: 15 }]}>
                                    <TouchableOpacity style={styles.navButtonImageNoticeContainer}>
                                        <Text style={styles.navButtonTextNotice}>999</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.navButtonSubContainer}>
                                        <View>
                                            <ImageLib urix={require('../../assets/images/icon/tte.png')} style={styles.navButtonImage1} />
                                        </View>
                                        <View style={{ alignItems: 'center' }}>
                                            <Text style={styles.navButtonImagetext}>TTE</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.navButtonContainer}>
                                    <TouchableOpacity style={styles.navButtonImageNoticeContainer}>
                                        <Text style={styles.navButtonTextNotice}>999</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.navButtonSubContainer}>
                                        <View>
                                            <ImageLib urix={require('../../assets/images/icon/apel.png')} style={styles.navButtonImage1} />
                                        </View>
                                        <View style={{ alignItems: 'center' }}>
                                            <Text style={styles.navButtonImagetext}>APEL/UPACARA</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={Stylex.barLine}></View>

                            <View style={Stylex.subTitleContainer}>
                                <Text style={Stylex.h_subTitle1}>PENGAJUAN TERAHIR</Text>
                            </View>

                            {data.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    onPress={() => openPopup(item)}
                                    style={[Stylex.daruratContent, { backgroundColor: getBackgroundColor(item.status), marginBottom: 10 }]}>
                                    <ImageLib style={{ width: 50, margin: 8, alignSelf: 'center' }} urix={require('../../assets/images/icon/absenDarurat.png')} />
                                    <View style={Stylex.textContent}>
                                        <Text style={Stylex.titleContent}>ABSENSI DARURAT</Text>
                                        <Text style={[Stylex.dateContent]}>20 Sep 2025 - 22 Sept 2025</Text>
                                        <Text style={Stylex.nameContent}>Kiken Sukma Batara, S.Si.,MT</Text>
                                    </View>
                                    <ImageLib style={{ width: 20, top: -5 }} urix={getStatusImage(item.status)} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ImageBackground>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minHeight: height,
        paddingHorizontal: 16,
        paddingTop: 65
    },
    navContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    navButtonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    navButtonSubContainer: {
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 85,
        width: 85,
        backgroundColor: 'white',
        borderRadius: 15,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 1, height: 1 },
                shadowOpacity: 0.25,
                shadowRadius: 2,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    navButtonImage1: { width: 51 },
    navButtonImageNoticeContainer: {
        marginTop: -20,
        position: 'absolute',
        left: 0,
        top: 20,
        width: 21,
        height: 21,
        backgroundColor: '#D49AFF',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        zIndex: 9
    },
    navButtonTextNotice: { fontSize: 7, color: 'white' },
    navButtonImagetext: { fontSize: 8, fontWeight: 'bold', color: '#8B8B8B' },
});

export default Dashboard;