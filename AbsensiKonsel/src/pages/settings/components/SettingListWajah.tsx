//import liraries
import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { Stylex } from '../../../assets/styles/main';




import BadgexPending from "../../../assets/images/icon/process.png";
import BadgexApprove from "../../../assets/images/icon/true.png";
import BadgexReject from "../../../assets/images/icon/false.png";
import ModalFile from '../../../components/ModalFile';


type formProps = {
    id: number,
    file: string,
    fileOld: string,
    keterangan: string,
    nip: string,
    private: string,
    status: number,
    vectors: string,
    verificationBy: string,
}

type stateProps = {
    TOKEN: string,
    URL: any
}


// create a component
const SettingListWajah = () => {

    const navigation = useNavigation();
    const token = useSelector((state: stateProps) => state.TOKEN);
    const URL = useSelector((state: stateProps) => state.URL);

    const [listPhoto, setListPhoto] = useState([] as formProps[]);

    const [form, setForm] = useState({
        id: 0,
        file: "",
        keterangan: "",
        nip: "",
        fileOld: "",
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

        setForm(prev => ({
            ...prev,
            id: data.id,
            fileOld: data.file,
            keterangan: data.keterangan,
            nip: data.nip,
            private: data.private,
            status: data.status,
            vectors: data.vectors,
            verificationBy: data.verificationBy,
        }))
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
                                    <TouchableOpacity onPress={() => { SetOpenModal(true); selectData(item); }} key={index} style={Stylex.photoWrapper}>
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
                form={form}
                view={viewDataPhoto}
            />
        </View>
    );
};


type ModalSettingProps = {
    openModal: boolean,
    SetOpenModal: Dispatch<SetStateAction<boolean>>,
    form: formProps,
    view: () => void
}

const ModalSetting = ({ openModal, SetOpenModal, form, view }: ModalSettingProps) => {



    const token = useSelector((state: stateProps) => state.TOKEN);
    const URL = useSelector((state: stateProps) => state.URL);
    const [openModalImage, setOpenModalImage] = useState(false)



    const postData = () => {
        fetch(URL.URL_presensi_settingProfile + 'removeData', {
            method: "POST",
            headers: {
                "Content-Type": 'application/json',
                'Authorization': `kikensbatara ${token}`
            },
            body: JSON.stringify(form)
        }).then(response => {
            if (!response.ok) {
                throw new Error(`HTTP Error : ${response.status}`)
            }
            return response.json();
        }).then(result => {
            // console.log(result);
            view();
            Alert.alert("Sukses", "🎉 Data berhasil dihapus! Terima kasih. 😊"); // Updated to use Alert
            SetOpenModal(!openModal);
        }).catch(error => {
            console.log(`Gagal mengirim data. error : ${error}`);
        })
    }


    const closeModalFile = () => {
        setOpenModalImage(!openModalImage)
    }


    return (
        <Modal visible={openModal} transparent animationType="fade" onRequestClose={() => SetOpenModal(!openModal)} >
            <View style={Stylex.overlay}>
                <View style={Stylex.popup}>
                    <TouchableOpacity style={Stylex.closeButton} onPress={() => SetOpenModal(!openModal)}>
                        <Text style={Stylex.closeText}>✕</Text>
                    </TouchableOpacity>
                    <Text style={Stylex.popupTitle}>Settings</Text>
                    <TouchableOpacity style={[Stylex.popupButton, { borderColor: '#9ABFFA' }]} onPress={() => { setOpenModalImage(true) }} >
                        <Text style={[Stylex.popupButtonText, { color: '#9ABFFA' }]}>Detail</Text>
                    </TouchableOpacity>

                    {
                        (form.status === 2 || form.status === 0) && (
                            <TouchableOpacity style={[Stylex.popupButton, { borderColor: '#C66963' }]} onPress={() => { postData(); }} >
                                <Text style={[Stylex.popupButtonText, { color: '#C66963' }]}>Delete</Text>

                            </TouchableOpacity>
                        )
                    }
                    {/* <Text>{form.status}</Text> */}
                    <TouchableOpacity style={[Stylex.popupButton, { backgroundColor: '#C66963', borderColor: '#C66963' }]} onPress={() => SetOpenModal(!openModal)} >
                        <Text style={[Stylex.popupButtonText, { color: '#FFFFFF' }]}>Batal</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ModalFile
                modalVisible={openModalImage}
                closePopup={closeModalFile}
                pdfUrl={form.fileOld}
            />

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
