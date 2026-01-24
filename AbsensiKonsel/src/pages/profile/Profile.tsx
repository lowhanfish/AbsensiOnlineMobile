import React from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView, Image, ImageStyle } from 'react-native';
import { Stylex } from '../../assets/styles/main';
import ButtonBack from "../../components/ButtonBack";



import { useDispatch } from 'react-redux';


const Settings = () => {

    const dispatch = useDispatch();


    return (
        <View style={{ flex: 1 }}>
            <ButtonBack routex="Dashboard" />

            <View style={{ flex: 1 }}>
                <View style={Stylex.titleContainer}>
                    <Text style={[styles.fontTitle, Stylex.shaddowText]}>PROFILE</Text>
                </View>

                <View style={styles.container}>
                    <ImageBackground
                        style={Stylex.bg3}
                        resizeMode="stretch"
                        source={require('../../assets/images/bg1.png')}
                    >
                        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>


                            {/* Divider */}

                            <View style={styles.imageContainer}>

                                <View style={Stylex.imageContainer}>
                                    <Image
                                        source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }}
                                        style={Stylex.profileImage as ImageStyle}
                                    />
                                </View>
                            </View>


                            <View style={styles.divider} />





                            <View style={{ height: 40 }} />
                        </ScrollView>
                    </ImageBackground>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16
    },
    scrollContent: {
        flex: 1,
    },
    fontTitle: {
        fontSize: 24,
        color: '#FFFFFF',
        fontWeight: '400',
        fontFamily: 'Audiowide-Regular',
    },
    divider: {
        height: 1,
        backgroundColor: '#E6E4EF',
        marginVertical: 15,
        marginHorizontal: 12,
    },
    logoutButton: {
        backgroundColor: '#E8B4B4',
        marginHorizontal: 12,
        paddingVertical: 14,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 10,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'red'
    }



});

export default Settings;

