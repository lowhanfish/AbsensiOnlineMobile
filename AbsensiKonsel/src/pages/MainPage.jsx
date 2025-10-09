//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';

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


const ContentStack = createNativeStackNavigator();


const ContentAll = () => {
    return (
        <ContentStack.Navigator screenOptions={{ headerShown: false }}>
            <ContentStack.Screen name="Dashboard" component={Dashboard} />
            <ContentStack.Screen name="Absensi" component={Absensi} />
            <ContentStack.Screen name="AbsensiFaceRecognation" component={AbsensiFaceRecognation} />
            <ContentStack.Screen name="Darurat" component={Darurat} />
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
    return (
        <View style={styles.container}>
            <Text>MainPage</Text>
        </View>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2c3e50',
    },
});

//make this component available to the app
export default MainPage;
