import { Text, Image, ScrollView, View, StyleSheet, Dimensions, Alert, TouchableOpacity } from "react-native"
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import { Stylex } from "../../assets/styles/main";
import ImageLib from '../../components/ImageLib';
import { useNavigation } from "@react-navigation/native";


const { height, width } = Dimensions.get('window');

const Absensi = () => {
    const navigation = useNavigation();

    return (
        // <Text>Absensi</Text>
        <View style={styles.wrappermap}>
            <MapView         
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={LokasiAwal}
            showsUserLocation={true}>

                <Marker 
                coordinate={LokasiAwal} />

            </MapView>

            {/* Tombol Kembali */}
            <TouchableOpacity style={
                Stylex.backBtn}
                onPress={() => navigation.goBack()}>
                    <ImageLib urix={require('../../assets/images/icon/tombolkembali.png')} style={{width:64, height:23}}/>
            </TouchableOpacity>


            {/* Tombol Setting */}
            <TouchableOpacity style={[Stylex.btnSetting]}>
                <ImageLib style={{ width: 25 }} urix={require('../../assets/images/icon/setting.png')} />
            </TouchableOpacity>

            {/* JUDUL */}
            <View style={styles.absenSection}>
                <Text style={styles.absenTitle}>ABSENSI</Text>
                <Text style={styles.absenSubtitle}>
                    Sebelum melakukan pengabsenan, pastikan anda berada di posisi yang tepat
                </Text>
            </View>
        
            
            {/* Tombol Lokasi */}
            <TouchableOpacity
            style={styles.locationBtn}
            onPress={tombolCekLokasi}
            activeOpacity={0.8}>
               
                <ImageLib
                urix={require("../../assets/images/icon/Iconlokasi.png")} // ubah sesuai lokasi file icon kamu
                style={styles.iconLocation}/>
            
            </TouchableOpacity>

            {/* Tombol fingerprint di atas peta */}
            <TouchableOpacity
            style={styles.fingerprintBtn}
            onPress={tombolAbsensi}
            activeOpacity={0.8}>

                <ImageLib
                urix={require("../../assets/images/icon/fingerprint3.png")} // ganti path sesuai project-mu
                style={styles.fingerprint}/>

            </TouchableOpacity>

        </View>

    )
}

// Fungsi yang akan dijalankan saat ditekan
const tombolAbsensi = () => {
    navigation.navigate('AbsensiFaceRecognation')
    // Alert.alert("Absen", "Anda menekan tombol fingerprint!");
    // di sini kamu bisa panggil fungsi absen API atau navigasi lain
  };
const tombolCekLokasi = () => {
    Alert.alert("Lokasi", "Menampilkan posisi Anda saat ini!");
    // nanti bisa diganti pakai Geolocation.getCurrentPosition() 
    // untuk update posisi peta ke lokasi pengguna.
  };


const LokasiAwal = {
    latitude: -4.3324188, // posisi lintang (Y)
    longitude: 122.2809425, // posisi bujur (X)
    latitudeDelta: 0.003, // zoom vertikal
    longitudeDelta: 0.003, // zoom horizontal
  };

const styles = StyleSheet.create(
    {
        wrappermap:{
        ...StyleSheet.absoluteFillObject
        },
        map:{
        ...StyleSheet.absoluteFillObject,
        // flex:1
        },
        fingerprintBtn: {
            position: "absolute",
            bottom: 100,
            alignSelf: "center",
            backgroundColor: "white",
            borderRadius: 100,
            padding: 1,
            elevation: 5,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
        },
        fingerprint: {
            width: 110,
            height: 110,
        },

        locationBtn: {
            position: "absolute",
            top: 155,
            right: 25,
            backgroundColor: "white",
            borderRadius: 40,
            padding: 1,
            elevation: 4,
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowOffset: { width: 0, height: 1 },
        },
        iconLocation: {
            width: 45,
            height: 45,
        },

        absenSection: {
            top: 75,
            left:28,
            paddingHorizontal: 20,
        },
        absenTitle: {
            fontSize: 32,
            color: '#FFFFFF',
            fontFamily: 'Audiowide-Regular',
            textShadowColor: 'rgba(0, 0, 0, 0.3)',
            textShadowOffset: { width: 2, height: 2 },
            textShadowRadius: 4,
        },
        absenSubtitle: {
            top: 1,
            color: '#555555',
            fontFamily: 'Almarai-Regular',
            fontSize: 8,
            
        },

    });

export default Absensi