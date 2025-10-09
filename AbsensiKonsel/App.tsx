// In App.js in a new project

import * as React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './src/pages/Auth/Login';
import Dashboard from './src/pages/Dashboard/dashboard';
import Absensi from './src/pages/Absensi/Absensi';
import AbsensiFaceRecognation from './src/pages/Absensi/AbsensiFaceRecognation';
import Darurat from './src/pages/Darurat.jsx/Darurat';
import DaruratDetail from './src/pages/Darurat.jsx/DaruratDetail';
import DaruratForm from './src/pages/Darurat.jsx/DaruratForm';
import Apel from './src/pages/Apel/Apel';
import ApelDetail from './src/pages/Apel/ApelDetail';
import Izin from './src/pages/Izin/Izin';
import IzinForm from './src/pages/Izin/IzinForm';




const Stack = createNativeStackNavigator();

function RootStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={Login} />
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