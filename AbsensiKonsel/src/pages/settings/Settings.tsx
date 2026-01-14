import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ImageBackground, Image,
    TouchableOpacity, Switch, ScrollView, TextInput
} from 'react-native';
import { Stylex } from '../../assets/styles/main';
import ButtonBack from "../../components/ButtonBack";

import { useNavigation } from "@react-navigation/native"

import axios from 'axios';
import { useSelector } from 'react-redux';
// import { string } from 'joi';


import SettingListWajah from './components/SettingListWajah';
import SettingNotifikasi from './components/SettingNotifikasi';



const Settings = () => {

    const navigation = useNavigation();
    // const token = useSelector((state: any) => state.TOKEN);
    // const URL = useSelector((state: any) => state.URL);

    const [isNotifEnabled, setIsNotifEnabled] = useState(true);
    const [username, setUsername] = useState('administrator');
    const [password, setPassword] = useState('password123');
    const [email, setEmail] = useState('kikensbatara@gmail.com');




    const toggleSwitch = () => setIsNotifEnabled(prev => !prev);

    const handleLogout = () => {
        // Logout logic here
        console.log('Logout pressed');
    };



    useEffect(() => {
        // No side effect needed
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
                            <SettingListWajah />

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
                            <SettingNotifikasi />

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
    // badge: {
    //     position: 'absolute',
    //     top: -5,
    //     right: -5,
    //     width: 28,
    //     height: 28,
    // },
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

});

export default Settings;

