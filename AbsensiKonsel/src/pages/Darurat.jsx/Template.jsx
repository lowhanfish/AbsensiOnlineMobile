import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { Stylex } from '../../assets/styles/main';
import ButtonBack from "../../components/ButtonBack";
import Photo from "../../assets/images/image5.png"
import Badgex from "../../assets/images/icon/true.png"

const Template = () => {




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
                Page ini diperuntukkan bagi ASN untuk melakukan konfigurasi ataupun perubahan data utama,
                baik pengaturan sampel wajah, username dan password, notifikasi dan lain sebagainya
              </Text>
            </View>

            <View>

              <View>
                <Text>FOTO SAMPEL WAJAH</Text>
              </View>
              <View>
                <View>
                  <View></View>
                  <View></View>
                </View>
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
    paddingHorizontal: 16
  },
  textbg2: {
    position: 'absolute',
    top: 24,
    left: 28,
    right: 28,
    height: 41
  },
  infoText: {
    fontSize: 8,
    color: '#6b6b6b',
    lineHeight: 14
  },
  fontTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '400',
    fontFamily: 'Audiowide-Regular',
  },
});

export default Template;

