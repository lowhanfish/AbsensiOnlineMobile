import React from 'react'
import { useNavigation, useFocusEffect } from "@react-navigation/native";


const BottonBack = ({ routex }) => {
    const navigation = useNavigation();
    const route = (routexx) => {
        navigation.navigate('Mainpage', { screen: routexx })
    }


    return (
        <TouchableOpacity onpress={() => { route(routex) }} style={Stylex.backBtn}>
            <ImageLib urix={require('../../assets/images/icon/back.png')} style={Stylex.iconBack} />
            <Text style={Stylex.backTitle}>KEMBALI</Text>
        </TouchableOpacity>
    )
}

export default BottonBack
