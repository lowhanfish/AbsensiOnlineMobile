import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ImageBackground, Image,
    TouchableOpacity, Switch, ScrollView, TextInput
} from 'react-native';
import { Stylex } from '../../assets/styles/main';
import ButtonBack from "../../components/ButtonBack";
import Photo from "../../assets/images/image5.png";
import Badgex from "../../assets/images/icon/true.png";
import { useNavigation } from "@react-navigation/native"
import axios from 'axios';


const Settings = () => {


    const navigation = useNavigation();

    const [isNotifEnabled, setIsNotifEnabled] = useState(true);
    const [username, setUsername] = useState('administrator');
    const [password, setPassword] = useState('password123');
    const [email, setEmail] = useState('kikensbatara@gmail.com');


    const [listPhoto, setListPhoto] = useState([]);

    const toggleSwitch = () => setIsNotifEnabled(prev => !prev);

    const handleLogout = () => {
        // Logout logic here
        console.log('Logout pressed');
    };

    const viewDataPhoto = () => {



        axios.post(URL.URL_AbsenHarian + 'viewListDarurat_v2', JSON.stringify({
            data_ke: pageFirst,
            cari_value: cariValue,
            pageFirst: pageFirst,
            pageLimit: pageLimit,
        }), {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        }).then(result => {
            setLoading(true);
            console.log(result.data);
            setListData(result.data.data); // Update state with fetched data
            setPageLast(result.data.jml_data)
        }).catch(error => {
            setLoading(true);
            // console.log("errornya : ", error);
        })
        console.log(URL.URL_AbsenHarian + 'viewListDarurat')

    }


    useEffect(() => {

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
                            <View style={styles.section}>
                                <TouchableOpacity onPress={() => { (navigation as any).navigate("MainPage", { screen: "SettingSampleImage" }); }} style={styles.btnAddPhoto}>
                                    <Text style={{ fontSize: 16, fontWeight: 700, color: '#555' }}>➕ FOTO SAMPEL WAJAH</Text>
                                </TouchableOpacity>
                                <View style={styles.photoContainer}>
                                    <View style={styles.photoWrapper}>
                                        <Image source={Photo} style={styles.photo} />
                                        <Image source={Badgex} style={styles.badge} />
                                    </View>
                                    <View style={styles.photoWrapper}>
                                        <Image source={Photo} style={styles.photo} />
                                        <Image source={Badgex} style={styles.badge} />
                                    </View>
                                </View>
                            </View>




                            {/* Divider */}
                            <View style={styles.divider} />

                            {/* Akun Pengguna */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>AKUN PENGGUNA</Text>
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
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>EMAIL NOTIFIKASI</Text>
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
        // paddingTop: 20,
    },
    infoContainer: {
        paddingHorizontal: 12,
        marginBottom: 10,
    },
    infoText: {
        fontSize: 12,
        color: '#6b6b6b',
        lineHeight: 18
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
    section: {
        paddingHorizontal: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#555',
        marginBottom: 12,
    },
    photoContainer: {
        flexDirection: 'row',
        gap: 15,
    },
    photoWrapper: {
        position: 'relative',
    },
    photo: {
        width: 120,
        height: 140,
        borderRadius: 8,
        resizeMode: 'cover',
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

