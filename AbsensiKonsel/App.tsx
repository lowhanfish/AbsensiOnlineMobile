import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './src/redux/store';
// --- Tambahkan Impor BootSplash ---
import BootSplash from "react-native-bootsplash";
// ------------------------------------

// Pages
import Login from './src/pages/Auth/Login';
import MainPage from './src/pages/MainPage';

const Stack = createNativeStackNavigator();

function RootStack() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  // Asumsi: AUTH_STAT adalah string 'true' atau 'false' dari Redux
  const AUTH_STAT = useSelector((state: any) => state.AUTH_STAT);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const profile = await AsyncStorage.getItem('userProfile');

        if (token && profile) {
          const parsedProfile = JSON.parse(profile);

          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              token,
              profile: parsedProfile,
              unit_kerja: parsedProfile?.unit_kerja || '',
              id_profile: parsedProfile?.id || '',
              nip: parsedProfile?.nip || '',
            },
          });
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        // --- 1. Sembunyikan Splash Screen Tepat di sini ---
        // Setelah pengecekan Async Storage Selesai (berhasil atau gagal), 
        // aplikasi siap tampil.
        setIsLoading(false);
        BootSplash.hide({ fade: true, duration: 300 });
        // --------------------------------------------------
      }
    };

    checkAuth();

    // Catatan: Jika Anda tidak menggunakan Redux Persist atau inisialisasi lain,
    // kode di atas sudah cukup untuk menangani Splash Screen.

  }, [dispatch]);

  // Jika Anda tetap ingin menampilkan ActivityIndicator sambil loading, kode ini tetap dipertahankan.
  // Namun, jika splash screen sudah benar, kode ini mungkin tidak perlu lama terlihat.
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {/* ActivityIndicator ini hanya muncul sebentar, sebelum BootSplash.hide() dipanggil */}
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Catatan: Karena AUTH_STAT adalah string, gunakan perbandingan string. */}
      {AUTH_STAT === 'true' ? (
        <Stack.Screen name="MainPage" component={MainPage} />
      ) : (
        <Stack.Screen name="Login" component={Login} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <RootStack />
      </NavigationContainer>
    </Provider>
  );
}