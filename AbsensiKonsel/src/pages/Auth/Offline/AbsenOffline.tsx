
import { Text, TextInput, ScrollView, View, StyleSheet, Dimensions, ImageBackground, TouchableOpacity, Modal } from "react-native"
import React, { useEffect, useState, useCallback } from 'react';
import { Stylex } from "../../../assets/styles/main";
import ImageLib from '../../../components/ImageLib';
import CheckBox from '@react-native-community/checkbox';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import ButtonBack from "../../../components/ButtonBack";
import axios from "axios";
import { useSelector } from "react-redux";
import LoadingImage from "../../../components/LoadingImage";
import GestureRecognizer from 'react-native-swipe-gestures';
import { tglConvert, namaLengkap } from "../../../lib/kiken";

// Import Database
import {
    initDatabase,
    getAllAbsensi,
    getAbsensiStats,
    AbsensiOffline,
    ABSENSI_STATUS
} from "../../../lib/database";

const { height, width } = Dimensions.get('window');





const Darurat = () => {


    const navigation = useNavigation<any>();

    const URL = useSelector((state: any) => state.URL);
    const token = useSelector((state: any) => state.TOKEN);

    const [isChecked, setIsChecked] = useState(false);
    const [text, setText] = useState('');
    const [selectedItem, setSelectedItem] = useState<AbsensiOffline | null>(null);

    const [listData, setListData] = useState<AbsensiOffline[]>([]);
    const [filteredData, setFilteredData] = useState<AbsensiOffline[]>([]);
    const [pageLimit, setPageLimit] = useState(10);
    const [pageFirst, setPageFirst] = useState(1);
    const [pageLast, setPageLast] = useState(1);
    const [cariValue, setCariValue] = useState('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0, unsynced: 0 });


    const [gestureName, setGestureName] = useState('none');



    const [modalVisible, setModalVisible] = useState(false);


    const config = {
        velocityThreshold: 0.3,
        directionalOffsetThreshold: 80
    };

    // Fungsi untuk memuat data dari SQLite
    const viewData = async () => {
        try {
            setLoading(true);

            // Inisialisasi database
            await initDatabase();

            // Ambil semua data absensi
            const data = await getAllAbsensi();
            console.log('📋 Data dari SQLite:', data.length, 'records');

            setListData(data);
            setFilteredData(data);

            // Hitung pagination
            const totalPages = Math.ceil(data.length / pageLimit) || 1;
            setPageLast(totalPages);

            // Ambil statistik
            const statsData = await getAbsensiStats();
            setStats(statsData);
            console.log('📊 Stats:', statsData);

        } catch (error) {
            console.error('❌ Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter data berdasarkan pencarian
    const handleButtonPress = () => {
        console.log('Filter Data By Text:', cariValue);
        if (cariValue.trim() === '') {
            setFilteredData(listData);
        } else {
            const filtered = listData.filter(item =>
                item.nip.toLowerCase().includes(cariValue.toLowerCase()) ||
                item.timestamp.includes(cariValue)
            );
            setFilteredData(filtered);
        }
    };

    const getBackgroundColor = (status: number | string) => {
        const statusStr = String(status);
        if (statusStr === '0') {
            return '#FFF8E0';
        } else if (statusStr === '1') {
            return '#F7EEFF';
        } else if (statusStr === '2') {
            return '#FFE0E0';
        }
        return '#FFF8E0'; // default
    };

    const getStatusImage = (status: number | string) => {
        const statusStr = String(status);
        if (statusStr === '0') {
            return require('../../../assets/images/icon/process.png');
        } else if (statusStr === '1') {
            return require('../../../assets/images/icon/true.png');
        } else if (statusStr === '2') {
            return require('../../../assets/images/icon/false.png');
        }
        return require('../../../assets/images/icon/process.png'); // default
    };

    const openPopup = (item: AbsensiOffline) => {
        setSelectedItem(item);
        setModalVisible(true);
    };

    const closePopup = () => {
        setModalVisible(false);
        setSelectedItem(null);
    };


    const handleAction = (action: string) => {
        console.log(`${action} clicked for item ID:`, selectedItem?.id);
        closePopup();
    };

    // Format tanggal untuk tampilan
    const formatDate = (timestamp: string) => {
        try {
            const date = new Date(timestamp);
            return date.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return timestamp;
        }
    };

    // Get status label
    const getStatusLabel = (status: number) => {
        switch (status) {
            case ABSENSI_STATUS.PENDING: return 'Pending';
            case ABSENSI_STATUS.ACCEPTED: return 'Diterima';
            case ABSENSI_STATUS.REJECTED: return 'Ditolak';
            default: return 'Unknown';
        }
    };

    // Refresh data saat screen focus
    useFocusEffect(
        useCallback(() => {
            viewData();
        }, [])
    );

    useEffect(() => {
        viewData();
    }, [pageFirst])

    return (
        <ImageBackground style={{ flex: 1 }} source={require('../../../assets/images/bg.png')}>
            <View style={{ flex: 1 }}>

                <ButtonBack
                    routex="Dashboard"
                />
                <ScrollView>
                    <View style={{ flex: 1 }}>
                        <View style={Stylex.daruratTitle}>
                            <Text style={[Stylex.fontTitle, Stylex.shaddowText]}>ABSEN OFFLINE</Text>
                        </View>


                        <View style={styles.container} >
                            <ImageBackground style={{ flex: 1 }} resizeMode="stretch" source={require('../../../assets/images/bg1.png')}>
                                <View style={Stylex.daruratHeader}>
                                    <View style={Stylex.checkboxContainer}>
                                        <Text style={[Stylex.dateContent, { marginLeft: 1 }]}>Page {pageFirst} dari {pageLast}</Text>
                                    </View>
                                    <View style={Stylex.jumlahContainer}>
                                        <Text style={Stylex.dateContent}>Jumlah Tampil</Text>
                                        <Text style={Stylex.jumlahTampil}>10</Text>
                                    </View>
                                </View>
                                <View style={Stylex.inputWrapper}>
                                    <TextInput style={{ flex: 1, fontSize: 8, paddingHorizontal: 10, height: 35, backgroundColor: 'white', color: '#000000' }} placeholder="Filter Data" placeholderTextColor="#999" value={cariValue} onChangeText={setCariValue} />
                                    <TouchableOpacity onPress={handleButtonPress} style={Stylex.button}>
                                        <ImageLib urix={require('../../../assets/images/icon/filter.png')} customWidth={20} style={Stylex.icon} />
                                    </TouchableOpacity>
                                </View>

                                {
                                    loading ? (
                                        <LoadingImage />
                                    ) : filteredData.length === 0 ? (
                                        <View style={styles.emptyContainer}>
                                            <Text style={styles.emptyText}>📭 Belum ada data absensi offline</Text>
                                            <Text style={styles.emptySubText}>Tekan tombol + untuk menambah absensi baru</Text>
                                        </View>
                                    ) : (
                                        <View>
                                            {/* Stats Summary */}
                                            <View style={styles.statsContainer}>
                                                <View style={[styles.statItem, { backgroundColor: '#FFF8E0' }]}>
                                                    <Text style={styles.statNumber}>{stats.pending}</Text>
                                                    <Text style={styles.statLabel}>Pending</Text>
                                                </View>
                                                <View style={[styles.statItem, { backgroundColor: '#E8F5E9' }]}>
                                                    <Text style={styles.statNumber}>{stats.accepted}</Text>
                                                    <Text style={styles.statLabel}>Diterima</Text>
                                                </View>
                                                <View style={[styles.statItem, { backgroundColor: '#FFEBEE' }]}>
                                                    <Text style={styles.statNumber}>{stats.rejected}</Text>
                                                    <Text style={styles.statLabel}>Ditolak</Text>
                                                </View>
                                            </View>

                                            {/* List Data */}
                                            {filteredData.map((item, index) => (
                                                <TouchableOpacity
                                                    key={item.id || index}
                                                    onPress={() => openPopup(item)}
                                                    style={[Stylex.daruratContent, { backgroundColor: getBackgroundColor(item.status), marginBottom: 10, marginHorizontal: 25 }]}
                                                >
                                                    <ImageLib style={{ width: 50, margin: 8, alignSelf: 'center' }} customWidth={50} urix={require('../../../assets/images/icon/absenDarurat.png')} />
                                                    <View style={Stylex.textContent}>
                                                        <Text style={Stylex.titleContent}>NIP. {item.nip}</Text>
                                                        <Text style={[Stylex.dateContent]}>
                                                            📍 {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
                                                        </Text>
                                                        <Text style={Stylex.nameContent}>
                                                            🕐 {formatDate(item.timestamp)}
                                                        </Text>
                                                        <Text style={[styles.statusText, {
                                                            color: item.status === 0 ? '#FFA000' : item.status === 1 ? '#4CAF50' : '#F44336'
                                                        }]}>
                                                            {item.is_synced === 0 ? '⏳ Belum sync' : `✅ ${getStatusLabel(item.status)}`}
                                                        </Text>
                                                    </View>

                                                    <ImageLib style={{ width: 20, top: -5 }} customWidth={20} urix={getStatusImage(item.status)} />
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )
                                }



                            </ImageBackground>
                        </View>
                    </View>
                </ScrollView>

                <TouchableOpacity onPress={() => navigation.navigate('VerifikasiWajah', { lokasi: { latitude: 0, longitude: 0, nip: 'TEST123' } })} style={{ position: 'absolute', bottom: 16, right: 26, elevation: 5, }}>
                    <ImageLib style={{ width: 61, height: 61 }} customWidth={61} urix={require('../../../assets/images/icon/addBtn.png')} />
                </TouchableOpacity>

                {/* ================= MODAL DETAIL =================*/}
                <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closePopup} >
                    <View style={Stylex.overlay}>
                        <View style={[Stylex.popup, { maxHeight: '80%' }]}>
                            <TouchableOpacity style={Stylex.closeButton} onPress={closePopup}>
                                <Text style={Stylex.closeText}>✕</Text>
                            </TouchableOpacity>
                            <Text style={Stylex.popupTitle}>Detail Absensi</Text>

                            {selectedItem && (
                                <View style={styles.detailContainer}>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>NIP:</Text>
                                        <Text style={styles.detailValue}>{selectedItem.nip}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Waktu:</Text>
                                        <Text style={styles.detailValue}>{formatDate(selectedItem.timestamp)}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Lokasi:</Text>
                                        <Text style={styles.detailValue}>{selectedItem.latitude.toFixed(6)}, {selectedItem.longitude.toFixed(6)}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Status:</Text>
                                        <Text style={[styles.detailValue, {
                                            color: selectedItem.status === 0 ? '#FFA000' : selectedItem.status === 1 ? '#4CAF50' : '#F44336',
                                            fontWeight: 'bold'
                                        }]}>
                                            {getStatusLabel(selectedItem.status)}
                                        </Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Sync:</Text>
                                        <Text style={styles.detailValue}>
                                            {selectedItem.is_synced === 0 ? '⏳ Belum' : '✅ Sudah'}
                                        </Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Deskripsi:</Text>
                                        <Text style={styles.detailValue}>{selectedItem.description}</Text>
                                    </View>
                                </View>
                            )}

                            <TouchableOpacity style={[Stylex.popupButton, { backgroundColor: '#C66963', borderColor: '#C66963', marginTop: 15 }]} onPress={closePopup} >
                                <Text style={[Stylex.popupButtonText, { color: '#FFFFFF' }]}>Tutup</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                {/* ================= MODAL DETAIL =================*/}

            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minHeight: height,
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 50,
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginHorizontal: 25,
        marginBottom: 15,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        marginHorizontal: 5,
        borderRadius: 10,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    statLabel: {
        fontSize: 10,
        color: '#666',
        marginTop: 2,
    },
    statusText: {
        fontSize: 10,
        marginTop: 4,
        fontWeight: '600',
    },
    detailContainer: {
        width: '100%',
        paddingVertical: 10,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    detailLabel: {
        fontSize: 12,
        color: '#666',
        flex: 1,
    },
    detailValue: {
        fontSize: 12,
        color: '#333',
        flex: 2,
        textAlign: 'right',
    },
});


export default Darurat


