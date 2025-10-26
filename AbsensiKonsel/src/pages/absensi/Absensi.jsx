import {
    Text,
    Image,
    View,
    StyleSheet,
    Dimensions,
    Alert,
    TouchableOpacity,
    Platform
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import { Stylex } from "../../assets/styles/main";
import ImageLib from '../../components/ImageLib';
import { useNavigation } from "@react-navigation/native";

const { height, width } = Dimensions.get('window');

// Lokasi awal peta (Bisa kamu ubah sesuai kebutuhan)
const LokasiAwal = {
    latitude: -4.3324188,
    longitude: 122.2809425,
    latitudeDelta: 0.003,
    longitudeDelta: 0.003,
};

const Absensi = () => {
    const navigation = useNavigation();

    // Fungsi untuk tombol fingerprint
    const tombolAbsensi = () => {
        navigation.navigate('AbsensiFaceRecognation');
    };

    // Fungsi untuk tombol lokasi
    const tombolCekLokasi = () => {
        Alert.alert("Lokasi", "Menampilkan posisi Anda saat ini!");
    };

    return (
        <View style={styles.wrappermap}>
            {/* MAP VIEW */}
            <MapView
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                style={styles.map}
                initialRegion={LokasiAwal}
                showsUserLocation={true}
            >
                <Marker coordinate={LokasiAwal} />
            </MapView>

            {/* Tombol Kembali */}
            <TouchableOpacity
                style={Stylex.backBtn}
                onPress={() => navigation.goBack()}
            >
                <ImageLib
                    urix={require('../../assets/images/icon/tombolkembali.png')}
                    style={{ width: 64, height: 23 }}
                />
            </TouchableOpacity>

            {/* Tombol Setting */}
            <TouchableOpacity style={Stylex.btnSetting}>
                <ImageLib
                    style={{ width: 25 }}
                    urix={require('../../assets/images/icon/setting.png')}
                />
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
                activeOpacity={0.8}
            >
                <ImageLib
                    urix={require("../../assets/images/icon/Iconlokasi.png")}
                    style={styles.iconLocation}
                />
            </TouchableOpacity>

            {/* Tombol Fingerprint */}
            <TouchableOpacity
                style={styles.fingerprintBtn}
                onPress={tombolAbsensi}
                activeOpacity={0.8}
            >
                <ImageLib
                    urix={require("../../assets/images/icon/fingerprint3.png")}
                    style={styles.fingerprint}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    wrappermap: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#eaeaea", // tambahan supaya kelihatan area map
    },
    map: {
        ...StyleSheet.absoluteFillObject,
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
        left: 28,
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

export default Absensi;
