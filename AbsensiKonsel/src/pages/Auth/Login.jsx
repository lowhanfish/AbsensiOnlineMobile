//import liraries
import React, { Component, useState, useEffect } from 'react';
import { View, ImageBackground, Text, StyleSheet, Button, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Stylex } from '../../assets/styles/main';
import ImageLib from '../../components/ImageLib';
import Checkbox from '../../components/Checkbox';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';
// create a component
const Login = () => {

    const [isLoading, setIsLoading] = useState(false);

    const [ingat, setIngat] = useState(false);
    const [pesan, setPesan] = useState('');

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const dispatch = useDispatch();
    const loginUrl = useSelector(state => state.URL.LOGIN_URL);
    const navigation = useNavigation();
    useEffect(() => {
        const loadRememberedCredentials = async () => {
            try {
                const remembered = await AsyncStorage.getItem('rememberPassword');
                if (remembered === 'true') {
                    const savedUsername = await AsyncStorage.getItem('username');
                    const savedPassword = await AsyncStorage.getItem('password');
                    if (savedUsername && savedPassword) {
                        setUsername(savedUsername);
                        setPassword(savedPassword);
                        setIngat(true);
                    }
                }
            } catch (error) {
                console.error('Error loading remembered credentials:', error);
            }
        };
        loadRememberedCredentials();
    }, []);

    // const handleLogin = () => {
    //     // Simulate a login attempt
    //     const isSuccess = Math.random() > 0.5; // Randomly succeed or fail

    //     if (isSuccess) {
    //         setPesan('');
    //         alert('Login Berhasil');
    //         return true;
    //     } else {
    //         setPesan('Username atau Password Salah');
    //         return false;
    //     }
    // };

    const handleLogin = async () => {
        if (!username || !password) {
            setPesan('Username dan Password harus diisi');
            return;
        }
        setIsLoading(true);
        try {

            const response = await fetch(loginUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                }),
            });
            if (response.ok) {
                const data = await response.json();
                // console.log('Data Login:', data);
                dispatch({
                    type: 'LOGIN_SUCCESS',
                    payload: {
                        token: data.token,
                        profile: data.profile,
                        unit_kerja: data.unit_kerja,
                        id_profile: data.id_profile,
                        nip: data.nip,
                    },
                });
                setPesan('');
                if (ingat) {
                    await AsyncStorage.setItem('rememberPassword', 'true');
                    await AsyncStorage.setItem('username', username);
                    await AsyncStorage.setItem('password', password);
                } else {
                    // Jika tidak ingat, hapus data yang tersimpan
                    await AsyncStorage.removeItem('rememberPassword');
                    await AsyncStorage.removeItem('username');
                    await AsyncStorage.removeItem('password');
                }
                // alert('Login Berhasil');
                navigation.navigate('MainPage');
            } else {
                setPesan('Username atau Password Salah');
            }
        } catch (error) {
            setPesan('Terjadi kesalahan jaringan');
            console.error('Login error:', error);
        }
    };





    const handleCheckboxChange = (newValue) => {
        setIngat(newValue);
        console.log('Checkbox is now:', newValue);
    }


    return (

        <ImageBackground style={{ flex: 1 }} source={require('../../assets/images/bg.png')}>

            <ImageLib style={{ width: 300, position: 'absolute' }} urix={require('../../assets/images/icon/paperpen.png')} />

            <View style={{ flexDirection: 'column', alignItems: 'flex-end', marginTop: 0, marginRight: 20 }}>
                <Text style={{ position: 'absolute', fontSize: 20, fontWeight: 'bold', color: '#565656', marginTop: 100, }}>e-Absensi</Text>
                <Text style={{ position: 'absolute', fontSize: 36, fontWeight: 'bold', color: '#838383AB', marginTop: 120, textShadowColor: '#ffffff', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 8 }}>Login</Text>
            </View>

            <View style={{ flexDirection: 'column', alignItems: 'flex-end', marginTop: 200, margin: 20, borderColor: '#FFFFFF', borderWidth: 1, borderRadius: 10, backgroundColor: '#8A8A8A80', }}>
                <Text style={[styles.bannerText]}>Aplikasi yang diperuntukkan bagi ASN Pemda Konawe Selatan dalam proses penandatanganan dokumen yang dilaksanakan secara elektronik</Text>
            </View>

            <View style={[{ flexDirection: 'column', alignItems: 'stretch' }]}>
                <View style={[styles.containerInputx]}>
                    {/* <TextInput style={[styles.inputx]} placeholder="Username" placeholderTextColor="#999"   /> */}
                    <TextInput
                        style={[styles.inputx]}
                        placeholder="Username"
                        placeholderTextColor="#999"
                        value={username}
                        onChangeText={setUsername}
                    />
                </View>
                <View style={[styles.containerInputx]}>
                    {/* <TextInput style={[styles.inputx]} placeholder="Password" placeholderTextColor="#999"   secureTextEntry /> */}
                    <TextInput
                        style={[styles.inputx]}
                        placeholder="Password"
                        placeholderTextColor="#999"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>
                {pesan !== '' && (
                    <Text style={[{ marginHorizontal: 30, marginTop: 5, color: 'red', fontSize: 12 }]}>{pesan}</Text>
                )}

            </View>

            <View style={{ flexDirection: 'row', marginHorizontal: 20, marginTop: 18, }}>
                <Checkbox
                    label="Ingat Sandi?"
                    checked={ingat}
                    onChange={() => handleCheckboxChange(!ingat)}
                />

            </View>

            <View style={[{ alignItems: 'stretch', marginHorizontal: 20, marginTop: 18, }]}>
                <TouchableOpacity
                    style={[styles.buttonLogin]}
                    // onPress={() => {
                    //     console.log('haaaaaiiii');
                    //     alert('Simple Button pressed');
                    // }}
                    onPress={() => handleLogin()}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" /> 
                    ) : (
                        <Text style={{ color: '#FFFFFF', textAlign: 'center', fontWeight: 'bold' }}>LOGIN</Text>
                    )}
                    {/* <Text style={{ color: '#FFFFFF', textAlign: 'center', fontWeight: 'bold' }}>LOGIN</Text> */}
                </TouchableOpacity>
            </View>

            <View style={{ marginHorizontal: 20, marginTop: 18, }} >
                <Text style={[{ textAlign: 'justify', fontSize: 10 }]}>Silahkan Login dengan menggunakan akun simpeg anda. Jika belum ada, anda dapat menghubungi kasubag kepegawaian di Unit Organisasi anda</Text>
            </View>

            <View style={[{ position: 'absolute', bottom: 60, left: 20, right: 20 }]}>
                <View style={[{ flexDirection: 'row', justifyContent: 'space-between', bottom: 0 }]}>
                    <ImageLib style={{ width: 140, }} urix={require('../../assets/images/icon/bsreLogin.png')} />
                    <ImageLib style={{ width: 150, }} urix={require('../../assets/images/icon/konselLogin.png')} />
                </View>
            </View>

        </ImageBackground>


    );
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
        padding: 5,
        borderColor: '#DCDCDC',
        backgroundColor: '#FFFFFF',
    },
    inputx: {
        height: 42,
        width: 'auto',
        color: '#747474ff',
        fontSize: 12,
    },
    bannerText: {
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 400,
        color: '#FFFFFF',
        padding: 5,
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
