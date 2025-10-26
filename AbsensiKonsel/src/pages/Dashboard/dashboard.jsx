import { Text, ScrollView, View, StyleSheet, Dimensions, ImageBackground, TouchableOpacity } from "react-native"
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Stylex } from "../../assets/styles/main";
import ImageLib from "../../components/ImageLib";



const { height, width } = Dimensions.get('window');

const Dashboard = () => {
    const navigation = useNavigation();

    return (

        <ScrollView>
            <View style={{ flex: 1 }}>

                <View style={Stylex.titleContainer}>
                    <Text style={[Stylex.h_title1, Stylex.shaddowText]}>Selamat Datang</Text>
                    <Text style={Stylex.h_title2}>Kiken Sukma Batara, S.Si.,MT</Text>
                </View>


                <View style={styles.container} >
                    <ImageBackground style={{ flex: 1 }} resizeMode="stretch" source={require('../../assets/images/bg1.png')}>

                        <View style={[styles.navContainer, { marginTop: -39 }]}>
                            <View style={styles.navButtonContainer}>
                                <TouchableOpacity style={styles.navButtonImageNoticeContainer}>
                                    <Text style={styles.navButtonTextNotice}>999</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.navButtonSubContainer}>
                                    <View>
                                        <ImageLib urix={require('../../assets/images/icon/absensi.png')} style={styles.navButtonImage1} />
                                    </View>
                                    <View style={{ alignItems: 'center' }}>
                                        <Text style={styles.navButtonImagetext}>
                                            ABSENSI
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.navButtonContainer, { marginHorizontal: 26 }]}>
                                <TouchableOpacity style={styles.navButtonImageNoticeContainer}>
                                    <Text style={styles.navButtonTextNotice}>999</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.navButtonSubContainer}>
                                    <View>
                                        <ImageLib urix={require('../../assets/images/icon/darurat.png')} style={styles.navButtonImage1} />
                                    </View>
                                    <View style={{ alignItems: 'center' }}>
                                        <Text style={styles.navButtonImagetext}>
                                            DARURAT
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.navButtonContainer}>
                                <TouchableOpacity style={styles.navButtonImageNoticeContainer}>
                                    <Text style={styles.navButtonTextNotice}>999</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.navButtonSubContainer}>
                                    <View>
                                        <ImageLib urix={require('../../assets/images/icon/izin.png')} style={styles.navButtonImage1} />
                                    </View>
                                    <View style={{ alignItems: 'center' }}>
                                        <Text style={styles.navButtonImagetext}>
                                            IZIN
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                        </View>
                        <View style={[styles.navContainer, { marginTop: 15 }]}>
                            <View style={styles.navButtonContainer}>
                                <TouchableOpacity style={styles.navButtonImageNoticeContainer}>
                                    <Text style={styles.navButtonTextNotice}>999</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.navButtonSubContainer}>
                                    <View>
                                        <ImageLib urix={require('../../assets/images/icon/kinerja.png')} style={styles.navButtonImage1} />
                                    </View>
                                    <View style={{ alignItems: 'center' }}>
                                        <Text style={styles.navButtonImagetext}>
                                            E-KINERJA
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.navButtonContainer, { marginHorizontal: 26 }]}>
                                <TouchableOpacity style={styles.navButtonImageNoticeContainer}>
                                    <Text style={styles.navButtonTextNotice}>999</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.navButtonSubContainer}>
                                    <View>
                                        <ImageLib urix={require('../../assets/images/icon/tte.png')} style={styles.navButtonImage1} />
                                    </View>
                                    <View style={{ alignItems: 'center' }}>
                                        <Text style={styles.navButtonImagetext}>
                                            TTE
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.navButtonContainer}>
                                <TouchableOpacity style={styles.navButtonImageNoticeContainer}>
                                    <Text style={styles.navButtonTextNotice}>999</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.navButtonSubContainer}>
                                    <View>
                                        <ImageLib urix={require('../../assets/images/icon/apel.png')} style={styles.navButtonImage1} />
                                    </View>
                                    <View style={{ alignItems: 'center' }}>
                                        <Text style={styles.navButtonImagetext}>
                                            APEL/UPACARA
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                        </View>



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
        paddingTop: 75
    },

    navContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',

    },

    navButtonContainer: {
        // flex: 1, 
        justifyContent: 'center',
        alignItems: 'center'
    },
    navButtonSubContainer: {
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 85,
        width: 85,
        backgroundColor: 'white',
        elevation: 3,
        borderRadius: 15
    },
    navButtonImage1: {
        width: 51,
    },
    navButtonImageNoticeContainer: {
        marginTop: -20,
        position: 'absolute',
        left: 0,
        top: 20,
        width: 21,
        height: 21,
        backgroundColor: '#D49AFF',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        zIndex: 9
    },
    navButtonTextNotice: {
        fontSize: 7,
        color: 'white'

    },
    navButtonImagetext: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#8B8B8B'

    },

});


export default Dashboard