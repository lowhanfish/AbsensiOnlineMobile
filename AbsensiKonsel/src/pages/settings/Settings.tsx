import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, Dimensions, TouchableOpacity,
    TextInput, ImageBackground, Platform, Alert,
} from 'react-native';
import { Stylex } from '../../assets/styles/main';
import { Picker } from '@react-native-picker/picker';
import { pick, types } from '@react-native-documents/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import ImageLib from '../../components/ImageLib';
import ButtonBack from "../../components/ButtonBack";
import { postData } from '../../lib/fetching';
import { useSelector } from "react-redux";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height } = Dimensions.get('window');


const Settings = () => {
    // State dari Redux
    const URL = useSelector(state => state.URL);
    const token = useSelector(state => state.TOKEN);



    // Initial load
    useEffect(() => {

    }, [])




    return (
        <View style={{ flex: 1 }}>
            <ButtonBack routex="Darurat" />

            <View style={{ flex: 1 }}>
                <View style={Stylex.titleContainer}>
                    <Text style={[styles.fontTitle, Stylex.shaddowText]}>FORM DARURAT</Text>
                </View>

                <View style={styles.container}>
                    <ImageBackground
                        style={{ flex: 1 }}
                        resizeMode="stretch"
                        source={require('../../assets/images/bg1.png')}
                    >
                        <View style={styles.textbg2}>
                            <Text style={styles.infoText}>
                                Form ini diperuntukan untuk penginputan data pengajuan absen darurat.
                                Pastikan untuk mempersiapkan file Surat Perintah Tugas (SPT) atau Dokumen
                                pendukung lainnya.
                            </Text>
                        </View>


                    </ImageBackground>
                </View>
            </View>

        </View>
    );
};

const styles = StyleSheet.create({

});

export default Settings;

