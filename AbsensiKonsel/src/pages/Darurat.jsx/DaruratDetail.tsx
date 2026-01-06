import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, Dimensions, ImageBackground,
} from 'react-native';
import { Stylex } from '../../assets/styles/main';
import ButtonBack from "../../components/ButtonBack";
const { height } = Dimensions.get('window');



const DaruratDetail = () => {
    const [form, setForm] = useState(null);
    const loadAyncData = async () => {

    }

    useEffect(() => {
        loadAyncData();
    }, [])


    return (
        <View style={{ flex: 1 }}>

            <ButtonBack
                routex="Dashboard"
            />

            <View style={{ flex: 1 }}>
                <View style={Stylex.titleContainer}>
                    <Text style={[styles.fontTitle, Stylex.shaddowText]}>Detail Darurat</Text>
                </View>

                <View style={styles.container}>
                    <ImageBackground
                        style={{ flex: 1 }}
                        resizeMode="stretch"
                        source={require('../../assets/images/bg1.png')}
                    >
                        <View style={styles.textbg2}>


                            <View >
                                <Text style={styles.infoTextform2}>URAIAN ABSENSI</Text>
                            </View>
                            <View style={styles.textform}>
                                <Text style={styles.infoTextform}>Nama</Text>
                                <Text style={styles.infoTextform1}>Cocodark</Text>
                            </View>
                            <View style={styles.textform}>
                                <Text style={styles.infoTextform}>Unit Kerja</Text>
                                <Text style={styles.infoTextform1}>Cocodark</Text>
                            </View>
                            <View style={styles.textform}>
                                <Text style={styles.infoTextform}>Jenis Absen</Text>
                                <Text style={styles.infoTextform1}>Cocodark</Text>
                            </View>
                            <View style={styles.textform}>
                                <Text style={styles.infoTextform}>Dari Tanggal</Text>
                                <Text style={styles.infoTextform1}>Cocodark</Text>
                            </View>
                            <View style={styles.textform}>
                                <Text style={styles.infoTextform}>Hingga Tanggal</Text>
                                <Text style={styles.infoTextform1}>Cocodark</Text>
                            </View>
                            <View style={styles.textform}>
                                <Text style={styles.infoTextform}>Keterangan</Text>
                                <Text style={styles.infoTextform1}>Cocodark</Text>
                            </View>
                            <View style={styles.textform}>
                                <Text style={styles.infoTextform}>Keterangan Verifikasi</Text>
                                <Text style={styles.infoTextform1}>Cocodark</Text>
                            </View>







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
        fontSize: 10,
        borderStyle: 'dashed',
        borderColor: '#ADADAD',
        borderBottomWidth: 0.5,
        paddingVertical: 5,
    },
    textform1: {
        marginTop: 9,
        marginBottom: 15,
        fontSize: 10,
        borderStyle: 'solid',
        borderColor: '#ADADAD',
        borderBottomWidth: 0.5,
        // paddingVertical: 15,
        // marginBottom: 12,
    },
    fontTitle: {
        fontSize: 24,
        color: '#FFFFFF',
        fontWeight: '400',
        fontFamily: 'Audiowide-Regular',
    },
    infoTextform: {
        fontSize: 12,
        fontWeight: '400',
        color: '#C2ABD5',
        lineHeight: 14
    },

    infoTextform1: {
        fontSize: 15,
        fontWeight: '600',
        color: '#8F8F8F',
        lineHeight: 14,
        marginBottom: 2,
        marginTop: 2
    },
    infoTextform2: {
        fontSize: 17,
        fontWeight: '600',
        color: '#C2ABD5',
        lineHeight: 14,
        marginBottom: 2,
        marginTop: 12
    },
});

export default DaruratDetail;
