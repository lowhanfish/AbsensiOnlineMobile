import { Text, ScrollView, View, StyleSheet, Dimensions, ImageBackground, TouchableOpacity } from "react-native"
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Stylex } from "../../assets/styles/main";
import ImageLib from '../../components/ImageLib';



const { height, width } = Dimensions.get('window');

const Darurat = () => {
    const navigation = useNavigation();

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

        <ScrollView>
            <View style={{ flex: 1 }}>

                <TouchableOpacity style={styles.backBtn}>
                    <Text style={styles.backTitle}>KEMBALI</Text>
                </TouchableOpacity>
                <View style={styles.daruratTitle}>
                    <Text style={[styles.fontTitle, Stylex.shaddowText]}>ABSEN DARURAT</Text>
                </View>


                <View style={styles.container} >
                    <ImageBackground style={{ flex: 1 }} resizeMode="stretch" source={require('../../assets/images/bg1.png')}>
                    <View style={styles.daruratHeader}>
                        <Text style={styles.dateContent}>Pilih Semua Dokumen</Text>
                        <Text style={[styles.dateContent]}>Jumlah Tampil</Text>
                    </View>
                    {data.map((item) => (
                    <View style={[styles.daruratContent, { backgroundColor: getBackgroundColor(item.status), marginBottom: 10 }]}>
                    <ImageLib style={{ width: 41, margin: 8 }} urix={require('../../assets/images/icon/absenDarurat.png')} />
                    <View style={styles.textContent}>
                        <Text style={styles.titleContent}>ABSENSI DARURAT</Text>
                        <Text style={[styles.dateContent]}>20 Sep 2025 - 22 Sept 2025</Text>
                        <Text style={styles.nameContent}>Kiken Sukma Batara, S.Si.,MT</Text>
                    </View>
                    <ImageLib style={{ width: 20, top: -5 }} urix={getStatusImage(item.status)} />
                    </View>
                    ))}
                    </ImageBackground>

                </View>
            </View>



        </ScrollView>



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
        position : 'absolute',
        top : 35,
        left : 30,
        zIndex:9
    },
    backTitle : {
        fontSize : 10,
        color : '#FFFFFF',
        fontWeight : '700',
        fontFamily: 'Almarai-Bold', 
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
    headerContainer : {
        flex :1,
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