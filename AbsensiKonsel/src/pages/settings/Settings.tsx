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

    container: {
        flex: 1,
        minHeight: height,
        paddingHorizontal: 16
    },
    textbg2: {
        position: 'absolute',
        top: 24,
        left: 28,
        right: 28,
        height: 41
    },
    textform: {
        marginTop: 9,
        marginBottom: 5,
        fontSize: 10
    },
    infoText: {
        fontSize: 8,
        color: '#6b6b6b',
        lineHeight: 14
    },
    infoTextform: {
        fontSize: 12,
        fontWeight: '400',
        color: '#ADADAD',
        lineHeight: 14
    },
    fontTitle: {
        fontSize: 24,
        color: '#FFFFFF',
        fontWeight: '400',
        fontFamily: 'Audiowide-Regular',
    },
    textWrapper: {},
    fakeInput: {
        height: 45,
        width: '100%',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E6E4EF',
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    picker: {
        height: 55,
        width: '100%',
        marginLeft: 12,
        fontSize: 16,
        ...Platform.select({
            ios: { color: '#ADADAD' },
            android: { color: '#ADADAD' },
        }),
    },
    pickerText: {
        fontSize: 16,
        color: '#ADADAD'
    },
    inlinePicker: {
        position: 'absolute',
        top: 320,
        left: 28,
        width: 298,
        backgroundColor: '#fff',
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E6E4EF',
    },
    textarea: {
        height: 160,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E6E4EF',
        backgroundColor: '#ffffff',
        padding: 12,
        textAlignVertical: 'top',
        fontSize: 14,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 45,
        backgroundColor: '#ffffff',
        width: 61,
        height: 61,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        zIndex: 20,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        height: '100%',
    },
    calendarIcon: {
        width: 20,
        height: 20,
        opacity: 0.7,
    },
    documentPickerContainer: {
        marginBottom: 10,
    },
    btnPick: {
        backgroundColor: '#F5F5F9',
        borderWidth: 1,
        borderColor: '#E6E4EF',
        borderStyle: 'dashed',
        borderRadius: 8,
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnPickText: {
        color: '#7E59C9',
        fontWeight: 'bold',
    },
    fileList: {
        marginTop: 8,
    },
    fileItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 8,
        borderRadius: 6,
        marginBottom: 5,
        borderWidth: 1,
        borderColor: '#eee',
    },
    fileName: {
        fontSize: 12,
        color: '#555',
        flex: 1,
        marginRight: 10,
    },
    removeText: {
        color: 'red',
        fontWeight: 'bold',
        paddingHorizontal: 5,
    },

});

export default Settings;

