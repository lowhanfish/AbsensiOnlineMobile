//import liraries
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { Stylex } from '../../../assets/styles/main';


import BadgexPending from "../../../assets/images/icon/process.png";
import BadgexApprove from "../../../assets/images/icon/true.png";
import BadgexReject from "../../../assets/images/icon/false.png";

type listPhotoProps = {
    id: number,
    file: string,
    keterangan: string,
    nip: string,
    status: number,
    vector: string,
}

// create a component
const SettingListWajah = () => {

    const navigation = useNavigation();
    const token = useSelector((state: any) => state.TOKEN);
    const URL = useSelector((state: any) => state.URL);

    const [listPhoto, setListPhoto] = useState([] as listPhotoProps[]);

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
                                    <View key={index} style={Stylex.photoWrapper}>
                                        {/* <Text>{URL.URL_APP + 'uploads/' + item}</Text> */}
                                        <Image source={{ uri: URL.URL_APP + 'uploads/' + item.file }} style={Stylex.photoSample} />
                                        <Image source={item.status === 0 ? (BadgexPending) : (item.status === 1 ? (BadgexApprove) : (BadgexReject))} style={styles.badge} />

                                        {/* <Text>{item.status}</Text> */}
                                    </View>

                                ))
                            }
                        </>
                    )
                }
            </View>
        </View>
    );
};

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
