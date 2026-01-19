import React, { Dispatch, SetStateAction } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import { Stylex } from '../../../assets/styles/main';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

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

interface DaruratSettingsProps {
    modalVisible: boolean;
    setModalVisible: Dispatch<SetStateAction<boolean>>;
    closePopup: () => void;
    selectedItem: DaruratItemProps | null;
    viewData: () => void;
}

const DaruratSettings = ({ modalVisible, setModalVisible, closePopup, selectedItem, viewData }: DaruratSettingsProps) => {
    const navigation = useNavigation();
    const URL = useSelector((state: { URL: any }) => state.URL);
    const token = useSelector((state: { TOKEN: string }) => state.TOKEN);

    const removeData = () => {
        setModalVisible(false);
        fetch(URL.URL_AbsenHarian + 'removeDarurat_v2', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(selectedItem)
        }).then((response) => {
            if (!response.ok) {
                closePopup();
                throw new Error(`HTTP Error : ${response.status}`)
            }
            return response.json();
        }).then((result) => {
            closePopup();
            viewData();
            Alert.alert("Sukses", "🎉 Data berhasil dihapus! Terima kasih. 😊");
        }).catch((error) => {
            closePopup();
            Alert.alert("Gagal mengirim data 🥺");
        });
    };

    return (
        <Modal
            visible={modalVisible}
            transparent
            animationType="fade"
            onRequestClose={closePopup}
        >
            <View style={Stylex.overlay}>
                <View style={Stylex.popup}>
                    <TouchableOpacity style={Stylex.closeButton} onPress={closePopup}>
                        <Text style={Stylex.closeText}>✕</Text>
                    </TouchableOpacity>
                    <Text style={Stylex.popupTitle}>Settings</Text>

                    <TouchableOpacity
                        style={[Stylex.popupButton, { borderColor: '#9ABFFA' }]}
                        onPress={() => {
                            setModalVisible(false);
                            // @ts-ignore - params type mismatch in navigation
                            navigation.navigate("MainPage" as never, { screen: "DaruratDetail", params: selectedItem });
                        }}
                    >
                        <Text style={[Stylex.popupButtonText, { color: '#9ABFFA' }]}>Detail</Text>
                    </TouchableOpacity>

                    {selectedItem && (selectedItem.status == 2 || selectedItem.status == 0) && (
                        <>
                            <TouchableOpacity
                                style={[Stylex.popupButton, { borderColor: '#C66963' }]}
                                onPress={removeData}
                            >
                                <Text style={[Stylex.popupButtonText, { color: '#C66963' }]}>Delete</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    <TouchableOpacity
                        style={[Stylex.popupButton, { backgroundColor: '#C66963', borderColor: '#C66963' }]}
                        onPress={closePopup}
                    >
                        <Text style={[Stylex.popupButtonText, { color: '#FFFFFF' }]}>Batal</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2c3e50',
    },
});

export default DaruratSettings;

