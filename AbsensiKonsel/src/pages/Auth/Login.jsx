//import liraries
import React, { Component, useState } from 'react';
import { View, ImageBackground, Text, StyleSheet, Button, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Stylex } from '../../assets/styles/main';
import ImageLib from '../../components/ImageLib';
import Checkbox from '../../components/Checkbox';
// create a component
const Login = () => {

    const [ingat, setIngat] = useState(false);

    const handleCheckboxChange = (newValue) => {
        setIngat(newValue);
        console.log('Checkbox is now:', newValue);
    }

    
    return (   
            <ImageBackground style={{ flex: 1 }} source={require('../../assets/images/bg.png')}> 
 
                <ImageLib style={{ width: 400, position: 'absolute' }} urix={require('../../assets/images/icon/paperpen.png')} />

                <View style={{ flexDirection: 'column', alignItems: 'flex-end', marginTop: 100, marginRight: 20 }}>
                    <Text style={{ position: 'absolute', fontSize: 20, fontWeight: 'bold', color: '#565656', marginTop: 100, }}>e-Absensi</Text>
                    <Text style={{ position: 'absolute', fontSize: 36, fontWeight: 'bold', color: '#838383AB', marginTop: 120, textShadowColor: '#ffffff',   textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 8 }}>Login</Text>
                </View>

                <View style={{ flexDirection: 'column', alignItems: 'flex-end', marginTop: 200, margin: 20, borderColor: '#FFFFFF', borderWidth: 1, borderRadius: 10, backgroundColor: '#8A8A8A80',  }}>
                    <Text style={[styles.bannerText]}>Aplikasi yang diperuntukkan bagi ASN Pemda Konawe Selatan dalam proses penandatanganan dokumen yang dilaksanakan secara elektronik</Text>
                </View>

                <View style={[{ flexDirection: 'column', alignItems: 'stretch' }]}>
                    <View style={[styles.containerInputx]}> 
                        <TextInput style={[styles.inputx]} placeholder="Username"  />
                    </View>
                    <View style={[styles.containerInputx]}>
                        <TextInput style={[styles.inputx]} placeholder="Password"  secureTextEntry />
                    </View> 
                </View>

                <View style={{ flexDirection: 'row', marginHorizontal: 20, marginTop:18, }}>
                    <Checkbox
                        label="Ingat Sandi?"
                        checked={ingat}
                        onChange={() => handleCheckboxChange(!ingat)}
                    />
 
                </View>

                <View style={[{ alignItems: 'stretch', marginHorizontal: 20, marginTop:18, }]}>
                    <TouchableOpacity
                        style={[styles.buttonLogin]}
                        onPress={() => {
                            console.log('haaaaaiiii');
                            alert('Simple Button pressed');
                        }}
                    >
                        <Text style={{ color: '#FFFFFF', textAlign: 'center', fontWeight: 'bold'}}>LOGIN</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ marginHorizontal: 20, marginTop:18,}} >
                    <Text style={[{textAlign:'justify', fontSize:10}]}>Silahkan Login dengan menggunakan akun simpeg anda. Jika belum ada, anda dapat menghubungi kasubag kepegawaian di Unit Organisasi anda</Text>
                </View>                

                <View style={[{position: 'absolute', bottom: 15, left: 20, right: 20}]}>
                    <View style={[{flexDirection: 'row', justifyContent: 'space-between', bottom:0  }]}>
                        <ImageLib style={{ width: 140, }} urix={require('../../assets/images/icon/bsreLogin.png')} />
                        <ImageLib style={{ width: 150, }} urix={require('../../assets/images/icon/konselLogin.png')} />
                    </View>
                </View>

            </ImageBackground> );
};

// define your styles
const styles = StyleSheet.create({
    container: {
         
        justifyContent: 'center',
        alignItems: 'center', 
    },
    containerInputx: { 
        marginTop: 18,
        marginLeft: 20,
        marginRight: 20,
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        borderColor: '#DCDCDC',
        backgroundColor: '#FFFFFF', 
    },
    inputx: {
        height: 42,
        width: 'auto',   
        color: '#747474ff',
        fontSize: 16,
    },
    bannerText: {
        textAlign:'center', 
        fontSize: 15, 
        fontWeight: 400, 
        color: '#FFFFFF', 
        padding: 10,
    },
    buttonLogin: {
        height: 60,
        width: 'auto',  
        borderRadius: 8,
        borderColor: '#1CBBED',
        backgroundColor: '#1CBBED',
        alignItems: 'center',
        justifyContent: 'center',
    }
});

//make this component available to the app
export default Login;
