import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, Dimensions, ImageBackground, Image,
    TouchableOpacity, Modal,
} from 'react-native';
import { Stylex } from '../../assets/styles/main';
import ButtonBack from "../../components/ButtonBack";
import ModalFile from '../../components/ModalFile';
const { height } = Dimensions.get('window');







const DaruratDetail = () => {
    const [form, setForm] = useState(null);


    const [modalVisible, setModalVisible] = useState(false);
    const openPopup = () => {
        setModalVisible(true);
    };

    const closePopup = () => {
        setModalVisible(false);
    };



    const loadAyncData = async () => {

    }

    useEffect(() => {
        loadAyncData();
    }, [])


    return (
        <View style={{ flex: 1 }}>

            <ButtonBack
                routex="Darurat"
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
                            <View style={styles.textform1}>
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




                            <View style={[styles.textform1, { paddingTop: 1 }]}>
                                <Text style={styles.infoTextform2}>LAMPIRAN</Text>
                            </View>

                            <View style={{ flex: 1, flexDirection: 'row', gap: 15, flexWrap: 'wrap', paddingTop: 11 }}>
                                <TouchableOpacity onPress={() => { openPopup() }}>
                                    <Image style={{ width: 50, height: 50 }} source={require('../../assets/images/icon/pdf.png')} />
                                </TouchableOpacity>
                                <TouchableOpacity>
                                    <Image style={{ width: 50, height: 50 }} source={require('../../assets/images/icon/jpg.png')} />
                                </TouchableOpacity>
                                <TouchableOpacity>
                                    <Image style={{ width: 50, height: 50 }} source={require('../../assets/images/icon/pdf.png')} />
                                </TouchableOpacity>
                                <TouchableOpacity>
                                    <Image style={{ width: 50, height: 50 }} source={require('../../assets/images/icon/jpg.png')} />
                                </TouchableOpacity>
                                <TouchableOpacity>
                                    <Image style={{ width: 50, height: 50 }} source={require('../../assets/images/icon/pdf.png')} />
                                </TouchableOpacity>
                                <TouchableOpacity>
                                    <Image style={{ width: 50, height: 50 }} source={require('../../assets/images/icon/jpg.png')} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ImageBackground>
                </View>

                <ModalFile
                    modalVisible={modalVisible}
                    closePopup={closePopup}
                />


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
        // position: 'absolute',
        // top: 24,
        // left: 28,
        // right: 28,
        // height: 41,
        // backgroundColor: 'red',

        paddingTop: 24,
        paddingLeft: 28,
        paddingRight: 28,
        paddingBottom: 24,
        flex: 1
    },
    textform: {
        // flex: 1,
        // flexDirection: 'column',
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
        borderColor: '#EBDBF9',
        borderBottomWidth: 5,
        paddingVertical: 5,
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
