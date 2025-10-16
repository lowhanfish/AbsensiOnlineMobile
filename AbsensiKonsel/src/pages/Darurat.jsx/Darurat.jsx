import { Text, TextInput, ScrollView, View, StyleSheet, Dimensions, ImageBackground, TouchableOpacity } from "react-native"
import React, { useState } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Stylex } from "../../assets/styles/main";
import ImageLib from '../../components/ImageLib';
import CheckBox from '@react-native-community/checkbox';



const { height, width } = Dimensions.get('window');

const Darurat = () => {
    const navigation = useNavigation();
    const [isChecked, setIsChecked] = useState(false);
    const [text, setText] = useState('');

    const handleButtonPress = () => {
        console.log('Filter Data By Text', text);
    };

    const data = [
    { id: 1, status: '1' },
    { id: 2, status: '1' },
    { id: 3, status: '2' },
    { id: 4, status: '3' },
    { id: 5, status: '3' },
    { id: 6, status: '2' },
    { id: 7, status: '3' },
    { id: 8, status: '1' },
    { id: 9, status: '1' },
    { id: 10, status: '2' },
  ];

  const getBackgroundColor = (status) => {
    switch (status) {
      case '1':
        return '#FFF8E0';
      case '2':
        return '#F7EEFF';
      case '3':
        return '#FFE0E0';
    }
  };

  const getStatusImage = (status) => {
    switch (status) {
      case '1':
        return require('../../assets/images/icon/process.png');
      case '2':
        return require('../../assets/images/icon/true.png');
      case '3':
        return require('../../assets/images/icon/false.png');
    }
  };

    return (
        <View style={{ flex: 1 }}>
            <TouchableOpacity style={styles.backBtn}>
                <ImageLib urix={require('../../assets/images/icon/back.png')} style={styles.iconBack}/>
                <Text style={styles.backTitle}>KEMBALI</Text>
            </TouchableOpacity>
            <ScrollView>
                <View style={{ flex: 1 }}>
                    <View style={styles.daruratTitle}>
                        <Text style={[styles.fontTitle, Stylex.shaddowText]}>ABSEN DARURAT</Text>
                    </View>

                    <View style={styles.container} >
                        <ImageBackground style={{ flex: 1 }} resizeMode="stretch" source={require('../../assets/images/bg1.png')}>
                        <View style={styles.daruratHeader}>
                            <View style={styles.checkboxContainer}>
                                <CheckBox value={isChecked} onValueChange={setIsChecked} />
                                <Text style={styles.dateContent}>Pilih Semua Dokumen</Text>
                            </View>
                            <View style={styles.jumlahContainer}>
                                <Text style={styles.dateContent}>Jumlah Tampil</Text>
                                <Text style={styles.jumlahTampil}>10</Text>
                            </View>
                        </View>
                        <View style={styles.inputWrapper}>
                            <TextInput style={styles.inputDarurat} placeholder="Filter Data" value={text} onChangeText={setText} />
                            <TouchableOpacity onPress={handleButtonPress} style={styles.button}>
                                <ImageLib urix={require('../../assets/images/icon/filter.png')} style={styles.icon}/>
                            </TouchableOpacity>
                        </View>
                        {data.map((item) => (
                        <TouchableOpacity style={[styles.daruratContent, { backgroundColor: getBackgroundColor(item.status), marginBottom: 10 }]}>
                        <ImageLib style={{ width: 41, margin: 8 }} urix={require('../../assets/images/icon/absenDarurat.png')} />
                        <View style={styles.textContent}>
                            <Text style={styles.titleContent}>ABSENSI DARURAT</Text>
                            <Text style={[styles.dateContent]}>20 Sep 2025 - 22 Sept 2025</Text>
                            <Text style={styles.nameContent}>Kiken Sukma Batara, S.Si.,MT</Text>
                        </View>
                        <ImageLib style={{ width: 20, top: -5 }} urix={getStatusImage(item.status)} />
                        </TouchableOpacity>
                        ))}
                        </ImageBackground>
                    </View>
                </View>
            </ScrollView>

            <TouchableOpacity style={{ position: 'absolute', bottom: 16, right: 26, elevation: 5, }} onPress={() => console.log('FAB Pressed')} >
                <ImageLib style={{ width: 61, height: 61 }} urix={require('../../assets/images/icon/addBtn.png')}/>
            </TouchableOpacity>
      </View>



    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minHeight: height,
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    backBtn : {
        flexDirection : 'row',
        position : 'absolute',
        textAlignVertical: 'center',
        top : 30,
        left : 30,
        zIndex: 9
    },
    iconBack: {
        width: 14,
        textAlignVertical: 'center',
    },
    backTitle : {
        fontSize : 10,
        color : '#FFFFFF',
        fontWeight : '700',
        fontFamily: 'Almarai-Bold', 
        textAlignVertical: 'center',
        paddingLeft : 5,
    },
    daruratTitle:{
        paddingTop :75,
        paddingLeft :28
    },
    fontTitle : {
        fontSize : 24,
        color : '#FFFFFF',
        fontWeight : '400',
        fontFamily: 'Audiowide-Regular', 
    },
    daruratHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 25,
        marginTop: 30,
        marginBottom: 15,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    jumlahContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    jumlahTampil: {
        fontSize : 8,
        color : '#636363',
        fontWeight : '400',
        fontFamily: 'Almarai-Regular', 
        marginLeft: 10,
        borderWidth: 1,
        borderColor: '#CCCCCC',
        backgroundColor: '#D9D9D9',
        paddingVertical: 2,
        paddingHorizontal: 4,
    },
    headerContainer : {
        flex :1,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        marginHorizontal: 20,
        borderColor: '#DEDEDE',
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5,
        borderRadius: 5,
        marginBottom: 18,
        backgroundColor: '#fff',
        paddingVertical: 0,
        height: 35
    },
    inputDarurat: {
        flex: 1,
        fontSize: 8,
        paddingHorizontal: 10,
        height: 35,
        lineHeight: 35, 
        textAlignVertical: 'center',
    },
    button: {
        padding: 10,
        height: 35,
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
        backgroundColor: '#B193F0',
    },
    icon: {
        width: 15,
    },
    daruratSearch: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 25,
        marginBottom: 15,
    },
    daruratInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginTop: 10,
        paddingHorizontal: 10,
    },
    daruratContent : {
        marginHorizontal: 20,
        border: '2px solid #EBEBEB',
        borderRadius: 10,

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 3,

        elevation: 3,

        flexDirection : 'row',
    },
    textContent : {
        flex :1,
        flexDirection : 'column',
        marginVertical : 6
    },
    titleContent : {
        fontSize : 10,
        color : '#636363',
        fontWeight : '700',
        fontFamily: 'Almarai-Bold', 
    },
    dateContent : {
        fontSize : 8,
        color : '#8D8D8D',
        fontWeight : '400',
        fontFamily: 'Almarai-Regular', 
    },
    nameContent : {
        fontSize : 8,
        color : '#A4A4A4',
        fontWeight : '700',
        fontFamily: 'Almarai-Bold', 
    },


});


export default Darurat