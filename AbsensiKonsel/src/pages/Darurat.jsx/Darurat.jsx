import { Text, TextInput, ScrollView, View, StyleSheet, Dimensions, ImageBackground, TouchableOpacity, Modal } from "react-native"
import React, { useEffect, useState } from 'react';
import { Stylex } from "../../assets/styles/main";
import ImageLib from '../../components/ImageLib';
import CheckBox from '@react-native-community/checkbox';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import ButtonBack from "../../components/ButtonBack";
import axios from "axios";
import { useSelector } from "react-redux";





const { height, width } = Dimensions.get('window');

const Darurat = () => {


  const navigation = useNavigation();

  const URL = useSelector(state => state.URL);
  const token = useSelector(state => state.TOKEN);

  const [isChecked, setIsChecked] = useState(false);
  const [text, setText] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);


  const [listData, setListData] = useState([]);
  const [pageFirst, setPageFirst] = useState(1);
  const [cariValue, setCariValue] = useState('');




  const viewData = () => {

    // console.log("View Data Start========");
    // console.log(URL.URL_AbsenHarian + 'viewListDarurat');
    // console.log("token :", token)

    axios.post(URL.URL_AbsenHarian + 'viewListDarurat', JSON.stringify({
      data_ke: pageFirst,
      cari_value: cariValue
    }), {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `kikensbarara ${token}`
      }
    }).then(result => {
      console.log("ada hasilnya")
      console.log(result.data);
      setListData(result.data.data); // Update state with fetched data
    }).catch(error => {
      console.log("errornya : ", error);
    })
    console.log(URL.URL_AbsenHarian + 'viewListDarurat')

  }




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

  const openPopup = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const closePopup = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };


  const handleAction = (action) => {
    console.log(`${action} clicked for item ID:`, selectedItem?.id);
    closePopup();
  };


  useEffect(() => {
    viewData();
  }, [])

  return (
    <View style={{ flex: 1 }}>

      <ButtonBack
        routex="Dashboard"
      />

      {/* <TouchableOpacity style={Stylex.backBtn}>
        <ImageLib urix={require('../../assets/images/icon/back.png')} style={Stylex.iconBack} />
        <Text style={Stylex.backTitle}>KEMBALI</Text>
      </TouchableOpacity> */}
      <ScrollView>
        <View style={{ flex: 1 }}>
          <View style={Stylex.daruratTitle}>
            <Text style={[Stylex.fontTitle, Stylex.shaddowText]}>ABSEN DARURAT</Text>
          </View>

          <View style={styles.container} >
            <ImageBackground style={{ flex: 1 }} resizeMode="stretch" source={require('../../assets/images/bg1.png')}>
              <View style={Stylex.daruratHeader}>
                <View style={Stylex.checkboxContainer}>
                  <CheckBox
                    style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                    value={isChecked}
                    onValueChange={setIsChecked}
                  />

                  <Text style={[Stylex.dateContent, { marginLeft: 1 }]}>Pilih Semua Dokumen</Text>
                </View>
                <View style={Stylex.jumlahContainer}>
                  <Text style={Stylex.dateContent}>Jumlah Tampil</Text>
                  <Text style={Stylex.jumlahTampil}>10</Text>
                </View>
              </View>
              <View style={Stylex.inputWrapper}>
                <TextInput style={Stylex.inputDarurat} placeholder="Filter Data" value={text} onChangeText={setText} />
                <TouchableOpacity onPress={handleButtonPress} style={Stylex.button}>
                  <ImageLib urix={require('../../assets/images/icon/filter.png')} style={Stylex.icon} />
                </TouchableOpacity>
              </View>
              {data.map((item) => (
                <TouchableOpacity key={item.id} onPress={() => openPopup(item)} style={[Stylex.daruratContent, { backgroundColor: getBackgroundColor(item.status), marginBottom: 10, marginHorizontal: 25 }]}>
                  <ImageLib style={{ width: 50, margin: 8, alignSelf: 'center' }} urix={require('../../assets/images/icon/absenDarurat.png')} />
                  <View style={Stylex.textContent}>
                    <Text style={Stylex.titleContent}>ABSENSI DARURAT</Text>
                    <Text style={[Stylex.dateContent]}>20 Sep 2025 - 22 Sept 2025</Text>
                    <Text style={Stylex.nameContent}>Kiken Sukma Batara, S.Si.,MT</Text>
                  </View>
                  <ImageLib style={{ width: 20, top: -5 }} urix={getStatusImage(item.status)} />
                </TouchableOpacity>
              ))}
            </ImageBackground>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity onPress={() => { navigation.navigate("MainPage", { screen: "DaruratForm" }); }} style={{ position: 'absolute', bottom: 16, right: 26, elevation: 5, }}>
        <ImageLib style={{ width: 61, height: 61 }} urix={require('../../assets/images/icon/addBtn.png')} />
      </TouchableOpacity>

      {/* <Text>asda</Text> */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closePopup} >
        <View style={Stylex.overlay}>
          <View style={Stylex.popup}>
            <TouchableOpacity style={Stylex.closeButton} onPress={closePopup}>
              <Text style={Stylex.closeText}>✕</Text>
            </TouchableOpacity>
            <Text style={Stylex.popupTitle}>Settings</Text>
            <TouchableOpacity style={[Stylex.popupButton, { borderColor: '#9ABFFA' }]} onPress={() => handleAction('Detail')} >
              <Text style={[Stylex.popupButtonText, { color: '#9ABFFA' }]}>Detail</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[Stylex.popupButton, { borderColor: '#C4C080' }]} onPress={() => handleAction('Update')} >
              <Text style={[Stylex.popupButtonText, { color: '#C4C080' }]}>Update</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[Stylex.popupButton, { borderColor: '#C66963' }]} onPress={() => handleAction('Delete')} >
              <Text style={[Stylex.popupButtonText, { color: '#C66963' }]}>Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[Stylex.popupButton, { backgroundColor: '#C66963', borderColor: '#C66963' }]} onPress={closePopup} >
              <Text style={[Stylex.popupButtonText, { color: '#FFFFFF' }]}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


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

});


export default Darurat