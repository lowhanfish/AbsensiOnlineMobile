import React from 'react';
import {
    View, Text, StyleSheet, ImageBackground,
    TouchableOpacity, ScrollView
} from 'react-native';
import { Stylex } from '../../assets/styles/main';
import ButtonBack from "../../components/ButtonBack";

import SettingListWajah from './components/SettingListWajah';
import SettingNotifikasi from './components/SettingNotifikasi';
import SettingAccount from './components/SettingAccount';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';


const Settings = () => {

    const dispatch = useDispatch();
    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userProfile');

            dispatch({ type: 'LOGOUT' });

            // Tidak perlu navigation.reset() di sini
            console.log('✅ Logout berhasil, tunggu navigasi otomatis dari App.tsx');
        } catch (error) {
            console.error('❌ Gagal logout:', error);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <ButtonBack routex="Dashboard" />

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
                            <SettingAccount />

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

