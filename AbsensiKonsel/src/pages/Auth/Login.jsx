import React, { useState, useEffect } from 'react';
import {
    Alert,
    View,
    ImageBackground,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    ScrollView,
    Platform,
    KeyboardAvoidingView
} from 'react-native';
import axios from "axios";
import Joi from 'joi';
import { Stylex } from '../../assets/styles/main';
import ImageLib from '../../components/ImageLib';
import Checkbox from '../../components/Checkbox';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginSuccess } from '../../redux/actions'; // ✅ pakai action resmi

// === Validasi Schema ===
const loginSchema = Joi.object({
    username: Joi.string()
        .min(6)
        .max(13)
        .required()
        .messages({
            'string.empty': `Username tidak boleh kosong.`,
            'string.min': `Username minimal {#limit} karakter.`,
            'string.max': `Username maksimal {#limit} karakter.`,
            'any.required': `Username wajib diisi.`
        }),
    password: Joi.string()
        .min(6)
        .max(13)
        .required()
        .messages({
            'string.empty': `Password tidak boleh kosong.`,
            'string.min': `Password minimal {#limit} karakter.`,
            'string.max': `Password maksimal {#limit} karakter.`,
            'any.required': `Password wajib diisi.`
        }),
});

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [ingat, setIngat] = useState(false);
    const [errors, setErrors] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const loginUrl = useSelector(state => state.URL.LOGIN_URL);
    const navigation = useNavigation();
    const dispatch = useDispatch();

    // === Request API Login ===
    const RequestLogin = async (data) => {
        try {
            const response = await axios.post(loginUrl, data);
            return response.data;
        } catch (error) {
            console.log("Login gagal:", error.response?.data?.message || error.message);
            setErrors(error.response?.data?.message || "Terjadi kesalahan saat menghubungi server.");
            return null; // jangan lempar error
        }
    };

    // === Fungsi utama Login ===
    const LoginAccount = async () => {
        setIsLoading(true);
        setErrors("");

        const { error } = loginSchema.validate({ username, password }, { abortEarly: false });
        if (error) {
            let joiErrorMessage = error.details.map(detail => detail.message).join('\n');
            setErrors(joiErrorMessage.trim());
            setIsLoading(false);
            return;
        }

        try {
            const data = { username, password };
            const result = await RequestLogin(data);
            if (!result) {
                setIsLoading(false);
                return; // langsung keluar kalau gagal
            }

            const { token, profile } = result;

            console.log('Profile:', profile);

            // === Simpan ke AsyncStorage ===
            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userProfile', JSON.stringify(profile));

            // 🔹 Simpan username & password jika "ingat" dicentang
            if (ingat) {
                await AsyncStorage.setItem('savedUsername', username);
                await AsyncStorage.setItem('savedPassword', password);
                await AsyncStorage.setItem('rememberMe', 'true');
            } else {
                await AsyncStorage.removeItem('savedUsername');
                await AsyncStorage.removeItem('savedPassword');
                await AsyncStorage.setItem('rememberMe', 'false');
            }

            // === Simpan juga ke Redux (state global) ===
            dispatch(loginSuccess(token, profile));

            console.log('Token dan profil berhasil disimpan & state otentikasi diperbarui.');
            Alert.alert("Login Berhasil", "Anda berhasil masuk!");

        } catch (e) {
            console.log('Login error:', e.message);
        } finally {
            setIsLoading(false);
        }
    };

    // === Checkbox handler ===
    const handleCheckboxChange = (newValue) => {
        setIngat(newValue);
        console.log(newValue ? '🔹 Mode ingat sandi aktif' : '🔸 Mode ingat sandi dimatikan');
    };

    // === Load data login tersimpan saat pertama kali dibuka ===
    useEffect(() => {
        const loadSavedCredentials = async () => {
            try {
                const savedUsername = await AsyncStorage.getItem('savedUsername');
                const savedPassword = await AsyncStorage.getItem('savedPassword');
                const savedRemember = await AsyncStorage.getItem('rememberMe');

                if (savedRemember === 'true' && savedUsername && savedPassword) {
                    setUsername(savedUsername);
                    setPassword(savedPassword);
                    setIngat(true);
                    console.log('🔹 Username & password terakhir dimuat otomatis');
                }
            } catch (error) {
                console.log('Gagal memuat data login tersimpan:', error);
            }
        };

        loadSavedCredentials();
    }, []);

    return (
        <ImageBackground style={{ flex: 1 }} source={require('../../assets/images/bg.png')}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <ImageLib
                        style={{ width: 300, position: 'absolute' }}
                        urix={require('../../assets/images/icon/paperpen.png')}
                    />

                    <View style={{ flexDirection: 'column', alignItems: 'flex-end', marginTop: 0, marginRight: 20 }}>
                        <Text style={{ position: 'absolute', fontSize: 20, fontWeight: 'bold', color: '#565656', marginTop: 100 }}>e-Absensi</Text>
                        <Text style={{ position: 'absolute', fontSize: 36, fontWeight: 'bold', color: '#838383AB', marginTop: 120, textShadowColor: '#ffffff', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 8 }}>Login</Text>
                    </View>

                    <View style={{ flexDirection: 'column', alignItems: 'flex-end', marginTop: 200, margin: 20, borderColor: '#FFFFFF', borderWidth: 1, borderRadius: 10, backgroundColor: '#8A8A8A80' }}>
                        <Text style={styles.bannerText}>
                            Aplikasi yang diperuntukkan bagi ASN Pemda Konawe Selatan dalam proses penandatanganan dokumen yang dilaksanakan secara elektronik
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                        <View style={styles.containerInputx}>
                            <TextInput
                                style={styles.inputx}
                                placeholder="Username"
                                placeholderTextColor="#999"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.containerInputx}>
                            <TextInput
                                style={styles.inputx}
                                placeholder="Password"
                                placeholderTextColor="#999"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>

                        {errors !== '' && (
                            <View style={styles.errorBox}>
                                <Text style={{ color: 'white', fontSize: 10 }}>{errors}</Text>
                            </View>
                        )}
                    </View>

                    <View style={{ flexDirection: 'row', marginHorizontal: 20, marginTop: 18 }}>
                        <Checkbox
                            label="Ingat Sandi?"
                            checked={ingat}
                            onChange={() => handleCheckboxChange(!ingat)}
                        />
                    </View>

                    <View style={{ alignItems: 'stretch', marginHorizontal: 20, marginTop: 18 }}>
                        <TouchableOpacity
                            style={styles.buttonLogin}
                            onPress={LoginAccount}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={{ color: '#FFFFFF', textAlign: 'center', fontWeight: 'bold' }}>LOGIN</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={{ marginHorizontal: 20, marginTop: 18, marginBottom: 150 }}>
                        <Text style={{ textAlign: 'justify', fontSize: 10 }}>
                            Silahkan Login dengan menggunakan akun simpeg anda. Jika belum ada, anda dapat menghubungi kasubag kepegawaian di Unit Organisasi anda
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.fixedFooter}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <ImageLib style={{ width: 120 }} urix={require('../../assets/images/icon/bsreLogin.png')} />
                    <ImageLib style={{ width: 130 }} urix={require('../../assets/images/icon/konselLogin.png')} />
                </View>
            </View>
        </ImageBackground>
    );
};

// === Styles ===
const styles = StyleSheet.create({
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
        color: '#747474ff',
        fontSize: 12,
    },
    bannerText: {
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '400',
        color: '#FFFFFF',
        padding: 5,
    },
    buttonLogin: {
        height: 60,
        borderRadius: 8,
        borderColor: '#1CBBED',
        backgroundColor: '#1CBBED',
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorBox: {
        backgroundColor: '#C66963',
        marginHorizontal: 20,
        marginTop: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 5,
        borderRadius: 12,
    },
    fixedFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 15,
        paddingBottom: Platform.OS === 'ios' ? 30 : 10,
        backgroundColor: 'transparent',
    },
});

export default Login;
