import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';


export function useAuthGuard() {
  const token = useSelector(state => state.TOKEN);
  const URL = useSelector(state => state.URL);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  
  useEffect(() => {
    // console.log("GUARD DI PANGGIL");
    // console.log("Current token:", token);
    // console.log("Current URL:", URL);

    const handleInvalidToken = async () => {
      console.log("Invalid token detected, starting logout process...");
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

    fetch(URL.URL_test_connections, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `kikensbatara ${token}`
      }
    }).then((response) => {
        // console.log(response);
        return response.json();
    }).then((result)=> {
        // console.log(result)
        if (result.message && result.message.includes("LOGIN")) {
          console.log("Invalid token message detected in fetch result.");
          handleInvalidToken();
        }
    })





  }, [token, URL, navigation]);
}