// In App.js in a new project

import * as React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';



import Login from './src/pages/Auth/Login';
import MainPage from './src/pages/MainPage';
import Dashboard from './src/pages/Dashboard/dashboard';
import Absensi from './src/pages/Absensi/Absensi';






const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
    </Stack.Navigator>
  );
}


function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* MainPage akan menjadi layar utama setelah login */}
      <Stack.Screen name="MainPage" component={MainPage} />
      {/* Tambahkan layar lain yang hanya bisa diakses setelah login */}
      {/* <Stack.Screen name="Home" component={Home} /> */}
      {/* <Stack.Screen name="Profile" component={Profile} /> */}
    </Stack.Navigator>
  );
}




function RootStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* <Stack.Screen name="Absensi" component={Absensi} /> */}
      <Stack.Screen name="MainPage" component={MainPage} />
      {/* <Stack.Screen name="Login" component={Login} /> */}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <RootStack />
    </NavigationContainer>
  );
}