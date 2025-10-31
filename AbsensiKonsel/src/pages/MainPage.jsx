//import liraries
import React, { Component } from 'react';
import { View, ImageBackground, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from "@react-navigation/native";

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

import { Stylex } from '../assets/styles/main';
import ImageLib from '../components/ImageLib';
import BottomBar from '../components/BottomBar';

const ContentStack = createNativeStackNavigator();

const ContentAll = () => {
    return (
        <ContentStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
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
        </ContentStack.Navigator>
    );
};

// create a component
const MainPage = () => {

    const navigation = useNavigation();


    return (

        <ImageBackground style={{ flex: 1 }} source={require('../assets/images/bg.png')}>

            <View style={[Stylex.body]}>
                <TouchableOpacity style={[Stylex.btnSetting]}>
                    <ImageLib style={{ width: 25 }} urix={require('../assets/images/icon/setting.png')} />
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
