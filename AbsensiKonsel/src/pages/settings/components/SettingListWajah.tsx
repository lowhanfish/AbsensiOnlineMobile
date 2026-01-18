//import liraries
import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { Stylex } from '../../../assets/styles/main';


import BadgexPending from "../../../assets/images/icon/process.png";
import BadgexApprove from "../../../assets/images/icon/true.png";
import BadgexReject from "../../../assets/images/icon/false.png";


type formProps = {
    id: string,
    file: string,
    keterangan: string,
    nip: string,
    private: string,
    status: number,
    vectors: string,
    verificationBy: string,
}



// create a component
const SettingListWajah = () => {

    const navigation = useNavigation();
    const token = useSelector((state: any) => state.TOKEN);
    const URL = useSelector((state: any) => state.URL);

    const [listPhoto, setListPhoto] = useState([] as formProps[]);

    const [form, setForm] = useState({
        id: "",
        file: "",
        keterangan: "",
        nip: "",
        private: "",
        status: 0,
        vectors: "",
        verificationBy: "",
    })

    const [openModal, SetOpenModal] = useState(false);

    const viewDataPhoto = () => {
        axios.post(URL.URL_presensi_settingProfile + 'view', JSON.stringify({
            data_ke: "",
        }), {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        }).then(result => {
            console.log(result.data);
            setListPhoto(result.data);

        }).catch(error => {
            console.log("errornya : ", error);
        })
    }

    const selectData = (data: formProps) => {
        setForm({
            id: data.id,
            file: data.file,
            keterangan: data.keterangan,
            nip: data.nip,
            private: data.private,
            status: data.status,
            vectors: data.vectors,
            verificationBy: data.verificationBy,
        })
    }

    useEffect(() => {
        viewDataPhoto();
    }, [])

    return (
        <View style={Stylex.sectionx}>


            {
                listPhoto.length < 2 ? (
                    <TouchableOpacity onPress={() => { (navigation as any).navigate("MainPage", { screen: "SettingSampleImage" }); }} style={styles.btnAddPhoto}>
                        <Text style={{ fontSize: 16, fontWeight: 700, color: '#555' }}>➕ FOTO SAMPEL WAJAH</Text>
                    </TouchableOpacity>

                ) : (
                    <Text style={Stylex.sectionTitle}>SAMPLE FOTO WAJAH</Text>
                )
            }
            <View style={Stylex.photoContainer}>

                {
                    listPhoto.length < 1 ? (
                        <View style={Stylex.emptyDataContainer}>
                            <Text style={Stylex.emptyDataContainerText}>❌ Tidak ada foto wajah..! 📷</Text>
                        </View>
                    ) : (
                        <>
                            {
                                listPhoto?.map((item, index) => (
                                    <TouchableOpacity onPress={() => SetOpenModal(true)} key={index} style={Stylex.photoWrapper}>
                                        {/* <Text>{URL.URL_APP + 'uploads/' + item}</Text> */}
                                        <Image source={{ uri: URL.URL_APP + 'uploads/' + item.file }} style={Stylex.photoSample} />
                                        <Image source={item.status === 0 ? (BadgexPending) : (item.status === 1 ? (BadgexApprove) : (BadgexReject))} style={styles.badge} />

                                        {/* <Text>{item.status}</Text> */}
                                    </TouchableOpacity>

                                ))
                            }
                        </>
                    )
                }
            </View>
            <ModalSetting
                openModal={openModal}
                SetOpenModal={SetOpenModal}
            />
        </View>
    );
};


type ModalSetting = {
    openModal: boolean,
    SetOpenModal: Dispatch<SetStateAction<boolean>>
}


const ModalSetting = ({ openModal, SetOpenModal }: ModalSetting) => {
    return (

        <Modal visible={openModal} transparent animationType="fade" onRequestClose={() => SetOpenModal(!openModal)} >
            <View style={Stylex.overlay}>
                <View style={Stylex.popup}>
                    <TouchableOpacity style={Stylex.closeButton} onPress={() => SetOpenModal(!openModal)}>
                        <Text style={Stylex.closeText}>✕</Text>
                    </TouchableOpacity>
                    <Text style={Stylex.popupTitle}>Settings</Text>
                    <TouchableOpacity style={[Stylex.popupButton, { borderColor: '#9ABFFA' }]} onPress={() => { }} >
                        <Text style={[Stylex.popupButtonText, { color: '#9ABFFA' }]}>Detail</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[Stylex.popupButton, { borderColor: '#C66963' }]} onPress={() => { }} >
                        <Text style={[Stylex.popupButtonText, { color: '#C66963' }]}>Delete</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[Stylex.popupButton, { backgroundColor: '#C66963', borderColor: '#C66963' }]} onPress={() => SetOpenModal(!openModal)} >
                        <Text style={[Stylex.popupButtonText, { color: '#FFFFFF' }]}>Batal</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>

    )
}




// define your styles
const styles = StyleSheet.create({
    container: {

    },
    btnAddPhoto: {
        backgroundColor: 'white', flex: 1, justifyContent: 'center', alignItems: 'center', height: 45, borderWidth: 0.3, borderColor: '#555', borderRadius: 10, marginBottom: 15
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -5,
        width: 28,
        height: 28,
    },
});

//make this component available to the app
export default SettingListWajah;
