//import liraries
import React, { useEffect } from 'react';
import {
    View,
    ImageBackground,
    Alert,
    StyleSheet,
    TouchableOpacity,
    BackHandler,
    Text

} from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';

import Dashboard from './Dashboard/dashboard';
import Absensi from './Absensi/Absensi';
import AbsensiFaceRecognation from './Absensi/AbsensiFaceRecognation';
import Darurat from './Darurat.jsx/Darurat';
import DaruratDetail from './Darurat.jsx/DaruratDetail';
import DaruratForm from './Darurat.jsx/DaruratForm';
import Apel from './Apel/Apel';
import ApelDetail from './Apel/ApelDetail';
import Izin from './Izin/Izin';
import IzinForm from './Izin/IzinForm';

// Offline Absensi Screens
import AbsenOffline from './Auth/Offline/AbsenOffline';
import MapOffline from './Auth/Offline/MapOffline';
import VerifikasiWajah from './Auth/Offline/VerifikasiWajah';

// Settings
import Settings from './settings/Settings';


import { Stylex } from '../assets/styles/main';
import ImageLib from '../components/ImageLib';
import BottomBar from '../components/BottomBar';

const ContentStack = createNativeStackNavigator();

const ContentAll = () => {
    return (
        <ContentStack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' },
            }}
        >
            <ContentStack.Screen name="Dashboard" component={Dashboard} />
            <ContentStack.Screen name="Absensi" component={Absensi} />
            <ContentStack.Screen name="Darurat" component={Darurat} />
            <ContentStack.Screen name="AbsensiFaceRecognation" component={AbsensiFaceRecognation} />
            <ContentStack.Screen name="DaruratDetail" component={DaruratDetail} />
            <ContentStack.Screen name="DaruratForm" component={DaruratForm} />
            <ContentStack.Screen name="Apel" component={Apel} />
            <ContentStack.Screen name="ApelDetail" component={ApelDetail} />
            <ContentStack.Screen name="Izin" component={Izin} />
            <ContentStack.Screen name="IzinForm" component={IzinForm} />

            <ContentStack.Screen name="Settings" component={Settings} />

            {/* Offline Absensi */}
            <ContentStack.Screen name="AbsenOffline" component={AbsenOffline} />
            <ContentStack.Screen name="MapOffline" component={MapOffline} />
            <ContentStack.Screen name="VerifikasiWajah" component={VerifikasiWajah} />

        </ContentStack.Navigator>
    );
};

// create a component
const MainPage = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const token = useSelector(state => state.TOKEN);

    useEffect(() => {
        // Cegah tombol back di Android keluar dari aplikasi
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
        return () => backHandler.remove();
    }, []);

    // ✅ Proteksi jika token kosong (misalnya AsyncStorage terhapus)
    useEffect(() => {
        if (!token || token === '') {
            navigation.replace('Login');
        }
    }, [token]);

    // ✅ Fungsi Logout
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
        <ImageBackground style={{ flex: 1 }} source={require('../assets/images/bg.png')}>
            <View style={[Stylex.body, { paddingTop: 10 }]}>
                <TouchableOpacity style={[Stylex.btnSetting, { marginTop: 15 }]} onPress={handleLogout}>
                    <ImageLib
                        style={{ width: 35 }}
                        urix={require('../assets/images/icon/Enter.png')}
                    />
                </TouchableOpacity>

                <ContentAll />

                <BottomBar navigation={navigation} />
            </View>
        </ImageBackground>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

//make this component available to the app
export default MainPage;
