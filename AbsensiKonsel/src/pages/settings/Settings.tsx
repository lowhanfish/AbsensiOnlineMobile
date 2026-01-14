import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ImageBackground, Image,
    TouchableOpacity, Switch, ScrollView, TextInput
} from 'react-native';
import { Stylex } from '../../assets/styles/main';
import ButtonBack from "../../components/ButtonBack";
import Photo from "../../assets/images/image5.png";
import BadgexPending from "../../assets/images/icon/process.png";
import BadgexApprove from "../../assets/images/icon/true.png";
import BadgexReject from "../../assets/images/icon/false.png";
import { useNavigation } from "@react-navigation/native"
import axios from 'axios';
import { useSelector } from 'react-redux';
import { string } from 'joi';

type listPhotoProps = {
    id: number,
    file: string,
    keterangan: string,
    nip: string,
    status: number,
    vector: string,
}

const Settings = () => {

    const navigation = useNavigation();
    const token = useSelector((state: any) => state.TOKEN);
    const URL = useSelector((state: any) => state.URL);

    const [isNotifEnabled, setIsNotifEnabled] = useState(true);
    const [username, setUsername] = useState('administrator');
    const [password, setPassword] = useState('password123');
    const [email, setEmail] = useState('kikensbatara@gmail.com');


    const [listPhoto, setListPhoto] = useState([] as listPhotoProps[]);

    const toggleSwitch = () => setIsNotifEnabled(prev => !prev);

    const handleLogout = () => {
        // Logout logic here
        console.log('Logout pressed');
    };

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
        <View style={{ flex: 1 }}>
            <ButtonBack routex="Home" />

            <View style={{ flex: 1 }}>
                <View style={Stylex.titleContainer}>
                    <Text style={[styles.fontTitle, Stylex.shaddowText]}>SETTINGS</Text>
                </View>

                <View style={styles.container}>
                    <ImageBackground
                        style={Stylex.bg3}
                        resizeMode="stretch"
                        source={require('../../assets/images/bg1.png')}
                    >
                        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                            {/* Info Text */}
                            <View style={Stylex.textbg2}>
                                <Text style={Stylex.infoText}>
                                    Page ini diperuntukkan bagi ASN untuk melakukan konfigurasi ataupun perubahan
                                    data utama, baik pengaturan sampel wajah, username dan password, notifikasi dan
                                    lain sebagainya
                                </Text>
                            </View>

                            {/* Divider */}
                            <View style={styles.divider} />

                            {/* Foto Sampel Wajah */}
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

                            {/* Divider */}
                            <View style={styles.divider} />

                            {/* Akun Pengguna */}
                            <View style={Stylex.sectionx}>
                                <Text style={Stylex.sectionTitle}>AKUN PENGGUNA</Text>
                                <View style={styles.fieldRow}>
                                    <Text style={styles.fieldLabel}>Username :</Text>
                                    <TextInput
                                        style={styles.fieldValue}
                                        value={username}
                                        onChangeText={setUsername}
                                    />
                                    <Text style={styles.editIcon}>✏️</Text>
                                </View>
                                <View style={styles.fieldRow}>
                                    <Text style={styles.fieldLabel}>Password :</Text>
                                    <TextInput
                                        style={styles.fieldValue}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                    />
                                    <Text style={styles.editIcon}>✏️</Text>
                                </View>
                            </View>

                            {/* Divider */}
                            <View style={styles.divider} />

                            {/* Email Notifikasi */}
                            <View style={Stylex.sectionx}>
                                <Text style={Stylex.sectionTitle}>EMAIL NOTIFIKASI</Text>
                                <View style={styles.toggleRow}>
                                    <Switch
                                        trackColor={{ false: '#ccc', true: '#4CD964' }}
                                        thumbColor={'#fff'}
                                        onValueChange={toggleSwitch}
                                        value={isNotifEnabled}
                                    />
                                    <View style={[styles.statusBadge, isNotifEnabled ? styles.activeBadge : styles.inactiveBadge]}>
                                        <Text style={[styles.statusText, isNotifEnabled ? styles.activeText : styles.inactiveText]}>
                                            {isNotifEnabled ? 'AKTIF' : 'NON-AKTIF'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.fieldRow}>
                                    <Text style={styles.fieldLabel}>Email :</Text>
                                    <TextInput
                                        style={styles.fieldValue}
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                    />
                                    <Text style={styles.editIcon}>✏️</Text>
                                </View>
                            </View>

                            {/* Divider */}
                            <View style={styles.divider} />

                            {/* Logout Button */}
                            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                                <Text style={styles.logoutText}>LOGOUT 🔓</Text>
                            </TouchableOpacity>

                            <View style={{ height: 40 }} />
                        </ScrollView>
                    </ImageBackground>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16
    },
    scrollContent: {
        flex: 1,
    },
    fontTitle: {
        fontSize: 24,
        color: '#FFFFFF',
        fontWeight: '400',
        fontFamily: 'Audiowide-Regular',
    },
    divider: {
        height: 1,
        backgroundColor: '#E6E4EF',
        marginVertical: 15,
        marginHorizontal: 12,
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -5,
        width: 28,
        height: 28,
    },
    fieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    fieldLabel: {
        fontSize: 13,
        color: '#888',
        width: 80,
    },
    fieldValue: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        paddingVertical: 4,
    },
    editIcon: {
        fontSize: 14,
        marginLeft: 8,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
    },
    activeBadge: {
        borderColor: '#4CD964',
        backgroundColor: '#fff',
    },
    inactiveBadge: {
        borderColor: '#ccc',
        backgroundColor: '#f5f5f5',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    activeText: {
        color: '#4CD964',
    },
    inactiveText: {
        color: '#888',
    },
    logoutButton: {
        backgroundColor: '#E8B4B4',
        marginHorizontal: 12,
        paddingVertical: 14,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 10,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    btnAddPhoto: {
        backgroundColor: 'white', flex: 1, justifyContent: 'center', alignItems: 'center', height: 45, borderWidth: 0.3, borderColor: '#555', borderRadius: 10, marginBottom: 15
    }
});

export default Settings;

