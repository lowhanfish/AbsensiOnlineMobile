import React from 'react'
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import ImageLib from './ImageLib';
import { TouchableOpacity, Text } from 'react-native';
import { Stylex } from '../assets/styles/main';


const ButtonBack = ({ routex }) => {

    const navigation = useNavigation();


    const routen = (routexx) => {
        // alert("Routex di click dari button back")
        navigation.navigate('MainPage', { screen: routexx })
    }


    return (
        <TouchableOpacity onPress={() => { routen(routex); }} style={Stylex.backBtn}>
            <ImageLib urix={require('../assets/images/icon/back.png')} style={Stylex.iconBack} />
            <Text style={Stylex.backTitle}>KEMBALI</Text>
        </TouchableOpacity>
    )
}

export default ButtonBack
