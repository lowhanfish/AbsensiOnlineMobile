//import liraries
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Stylex } from '../../../assets/styles/main';
import ImageLib from '../../../components/ImageLib';
import { tglConvert, namaLengkap } from '../../../lib/kiken';
const { height, width } = Dimensions.get('window');

// Define the type for the `item` prop
interface DaruratItemProps {
    id: number;
    jenispresensi: number;
    jenisKategori: number;
    jenisizin: number;
    lat: number;
    lng: number;
    jamDatang: string;
    jamPulang: string;
    keterangan: string;
    JenisStatusId: number;
    TglMulai: string;
    TglSelesai: string;
    fileRef: string;
    status: number;
    notifikasi: number;
    notif_keterangan: string;
    NIP: string;
    unit_kerja: string;
    createdBy: string;
    createdAt: string;
    jenisizin_uraian: string | null;
    biodata_nama: string;
    biodata_gelar_belakang: string;
    biodata_gelar_depan: string;
    unit_kerja_uraian: string;
    jeniskategori_uraian: string;
}

// create a component
const DaruratItem = ({ item }: { item: DaruratItemProps }) => {
    console.log("DaruratItem received item:", item);

    const [selectedItem, setSelectedItem] = useState<DaruratItemProps | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const getBackgroundColor = (status: number) => {
        const statusStr = String(status);
        console.log("getBackgroundColor called with status:", statusStr);
        if (statusStr === '0') {
            return '#FFF8E0';
        } else if (statusStr === '1') {
            return '#F7EEFF';
        } else if (statusStr === '2') {
            return '#FFE0E0';
        }
        return '#FFF8E0'; // default
    };

    const getStatusImage = (status: number) => {
        const statusStr = String(status);
        console.log("getStatusImage called with status:", statusStr);
        if (statusStr === '0') {
            return require('../../assets/images/icon/process.png');
        } else if (statusStr === '1') {
            return require('../../assets/images/icon/true.png');
        } else if (statusStr === '2') {
            return require('../../assets/images/icon/false.png');
        }
        return require('../../assets/images/icon/process.png'); // default
    };


    const openPopup = (item: DaruratItemProps) => {
        console.log("openPopup called with item:", item);
        setSelectedItem((prev) => ({
            ...prev,
            ...item
        }));
        setModalVisible(true);
    };

    const closePopup = () => {
        setModalVisible(false);
        setSelectedItem(null);
    };

    return (
        <TouchableOpacity key={item.id} onPress={() => { openPopup(item) }} style={[Stylex.daruratContent, { backgroundColor: getBackgroundColor(item.status), marginBottom: 10, marginHorizontal: 25 }]}>
            <ImageLib customWidth={50} style={{ margin: 8, alignSelf: 'center' }} urix={require('../../assets/images/icon/absenDarurat.png')} />
            <View style={Stylex.textContent}>
                <Text style={Stylex.titleContent}>{item.jeniskategori_uraian}</Text>
                <Text style={[Stylex.dateContent]}>{tglConvert(item.TglMulai)} - {tglConvert(item.TglSelesai)}</Text>
                <Text style={Stylex.nameContent}>{namaLengkap(item.biodata_gelar_depan, item.biodata_nama, item.biodata_gelar_belakang)}</Text>
            </View>

            <ImageLib customWidth={20} style={{ top: -5 }} urix={getStatusImage(item.status)} />
        </TouchableOpacity>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        minHeight: height,
        paddingHorizontal: 16,
        paddingTop: 10,
    },
});

//make this component available to the app
export default DaruratItem;
