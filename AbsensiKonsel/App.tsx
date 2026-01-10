import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './src/redux/store';
import BootSplash from 'react-native-bootsplash';

// Pages
import Login from './src/pages/Auth/Login';
import MainPage from './src/pages/MainPage';
import AbsenOffline from './src/pages/Auth/AbsenOffline';

const Stack = createNativeStackNavigator();

function RootStack() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
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
        setIsLoading(false);
        BootSplash.hide({ fade: true, duration: 300 });
      }
    };

    checkAuth();
  }, [dispatch]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {AUTH_STAT === 'true' ? (
        <Stack.Screen name="MainPage" component={MainPage} />
      ) : (
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="AbsenOffline" component={AbsenOffline} />
        </>
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