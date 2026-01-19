import { Text, TextInput, ScrollView, View, StyleSheet, Dimensions, ImageBackground, TouchableOpacity, Modal } from "react-native"
import React, { useEffect, useState } from 'react';
import { Stylex } from "../../assets/styles/main";
import ImageLib from '../../components/ImageLib';
import CheckBox from '@react-native-community/checkbox';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import ButtonBack from "../../components/ButtonBack";
import axios from "axios";
import { useSelector } from "react-redux";
import LoadingImage from "../../components/LoadingImage";
import GestureRecognizer, { swipeDirections } from 'react-native-swipe-gestures';
import { tglConvert, namaLengkap } from "../../lib/kiken";
const { height, width } = Dimensions.get('window');



const Izin = () => {


  const navigation = useNavigation();

  const URL = useSelector(state => state.URL);
  const token = useSelector(state => state.TOKEN);

  const [isChecked, setIsChecked] = useState(false);
  const [text, setText] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const [listData, setListData] = useState([]);
  const [pageLimit, setPageLimit] = useState(10);
  const [pageFirst, setPageFirst] = useState(1);
  const [pageLast, setPageLast] = useState(1);
  const [cariValue, setCariValue] = useState('');
  const [loading, setLoading] = useState(false);


  const [gestureName, setGestureName] = useState('none');



  const [modalVisible, setModalVisible] = useState(false);

  // Fungsi yang dipanggil saat swipe terdeteksi
  const onSwipe = (gestureName, gestureState) => {
    const { SWIPE_UP, SWIPE_DOWN, SWIPE_LEFT, SWIPE_RIGHT } = swipeDirections;
    setGestureName(gestureName);

    switch (gestureName) {
      case SWIPE_LEFT:
        // console.log('User swipe ke kiri');
        NextData();
        break;
      case SWIPE_RIGHT:
        // console.log('User swipe ke kanan');
        PrevData();
        break;
    }
  };

  const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80
  };

  const viewData = () => {

    setLoading(false);

    axios.post(URL.URL_AbsenHarian + "viewListIzin_v2", JSON.stringify({
      data_ke: pageFirst,
      cari_value: cariValue,
      pageFirst: pageFirst,
      pageLimit: pageLimit,
    }), {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    }).then(result => {
      setLoading(true);
      console.log(result.data);
      setListData(result.data.data); // Update state with fetched data
      setPageLast(result.data.jml_data)
    }).catch(error => {
      setLoading(true);
      // console.log("errornya : ", error);
    })
    console.log(URL.URL_AbsenHarian + 'viewListDarurat')

  }

  const removeData = () => {
    // console.log("remove data")
    setModalVisible(false);

    fetch(URL.URL_AbsenHarian + 'removeDarurat_v2', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(selectedItem)
    }).then((response) => {

      if (!response.ok) {
        closePopup();
        throw new Error(`HTTP Error : ${response.status}`)
      }
      return response.json();
    }).then((result) => {
      closePopup()
      viewData();
      Alert.alert("Sukses", "🎉 Data berhasil dihapus! Terima kasih. 😊"); // Updated to use Alert
    }).catch((error) => {
      closePopup()
      console.log(error);
      console.log(`Gagal mengirim data. error : ${error}`);
      Alert.alert("Gagal mengirim data 🥺")
    })
  }

  const handleButtonPress = () => {
    console.log('Filter Data By Text', text);
  };

  const getBackgroundColor = (status) => {
    const statusStr = String(status);
    if (statusStr === '0') {
      return '#FFF8E0';
    } else if (statusStr === '1') {
      return '#F7EEFF';
    } else if (statusStr === '2') {
      return '#FFE0E0';
    }
    return '#FFF8E0'; // default
  };

  const getStatusImage = (status) => {
    const statusStr = String(status);
    if (statusStr === '0') {
      return require('../../assets/images/icon/process.png');
    } else if (statusStr === '1') {
      return require('../../assets/images/icon/true.png');
    } else if (statusStr === '2') {
      return require('../../assets/images/icon/false.png');
    }
    return require('../../assets/images/icon/process.png'); // default
  };



  const openPopup = (item) => {
    // console.log(item)
    setSelectedItem((prev) => ({
      ...prev,
      ...item
    }));
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

  const PrevData = () => {
    if (pageFirst > 1) {
      // this.page_first--
      setPageFirst(pageFirst - 1)
    } else {
      setPageFirst(1);
    }
    // viewData();
  };

  const NextData = () => {
    if (pageFirst >= pageLast) {
      // this.page_first == this.page_last
      setPageFirst(pageLast);
    } else {
      // this.page_first++;
      setPageFirst(pageFirst + 1);
    }
    // viewData();
  };


  useEffect(() => {
    viewData();
  }, [pageFirst, cariValue])

  return (

    <GestureRecognizer
      onSwipe={(direction, state) => onSwipe(direction, state)}
      onSwipeUp={() => console.log('Swipe Up!')}
      config={config}
      style={{ flex: 1 }}
    >

      <View style={{ flex: 1 }}>

        <ButtonBack
          routex="Dashboard"
        />
        <ScrollView>
          <View style={{ flex: 1 }}>
            <View style={Stylex.daruratTitle}>
              <Text style={[Stylex.fontTitle, Stylex.shaddowText]}>USULAN IZIN</Text>
            </View>


            <View style={styles.container} >
              <ImageBackground style={{ flex: 1 }} resizeMode="stretch" source={require('../../assets/images/bg1.png')}>
                <View style={Stylex.daruratHeader}>
                  <View style={Stylex.checkboxContainer}>
                    <Text style={[Stylex.dateContent, { marginLeft: 1 }]}>Page {pageFirst} dari {pageLast}</Text>
                  </View>
                  <View style={Stylex.jumlahContainer}>
                    <Text style={Stylex.dateContent}>Jumlah Tampil</Text>
                    <Text style={Stylex.jumlahTampil}>10</Text>
                  </View>
                </View>
                <View style={Stylex.inputWrapper}>
                  <TextInput style={{ flex: 1, fontSize: 8, paddingHorizontal: 10, height: 35, backgroundColor: 'white', color: '#000000' }} placeholder="Filter Data" placeholderTextColor="#999" value={cariValue} onChangeText={setCariValue} />
                  <TouchableOpacity onPress={handleButtonPress} style={Stylex.button}>
                    <ImageLib urix={require('../../assets/images/icon/filter.png')} style={Stylex.icon} />
                  </TouchableOpacity>
                </View>


                {
                  !loading ? (
                    <LoadingImage />
                  ) : (
                    <View>

                      {listData.map((item) => (
                        <TouchableOpacity key={item.id} onPress={() => { openPopup(item) }} style={[Stylex.daruratContent, { backgroundColor: getBackgroundColor(item.status), marginBottom: 10, marginHorizontal: 25 }]}>
                          <ImageLib style={{ width: 50, margin: 8, alignSelf: 'center' }} urix={require('../../assets/images/icon/absenDarurat.png')} />
                          <View style={Stylex.textContent}>
                            <Text style={Stylex.titleContent}>{item.jenisizin_uraian}</Text>
                            <Text style={[Stylex.dateContent]}>{tglConvert(item.TglMulai)} - {tglConvert(item.TglSelesai)}</Text>
                            <Text style={Stylex.nameContent}>{namaLengkap(item.biodata_gelar_depan, item.biodata_nama, item.biodata_gelar_belakang)}</Text>
                          </View>

                          <ImageLib style={{ width: 20, top: -5 }} urix={getStatusImage(item.status)} />
                        </TouchableOpacity>
                      ))}

                    </View>
                  )
                }



              </ImageBackground>
            </View>
          </View>
        </ScrollView>

        <TouchableOpacity onPress={() => { navigation.navigate("MainPage", { screen: "IzinForm" }); }} style={{ position: 'absolute', bottom: 16, right: 26, elevation: 5, }}>
          <ImageLib style={{ width: 61, height: 61 }} urix={require('../../assets/images/icon/addBtn.png')} />
        </TouchableOpacity>

        {/* ================= MODAL SETTING =================*/}
        <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closePopup} >
          <View style={Stylex.overlay}>
            <View style={Stylex.popup}>
              <TouchableOpacity style={Stylex.closeButton} onPress={closePopup}>
                <Text style={Stylex.closeText}>✕</Text>
              </TouchableOpacity>
              <Text style={Stylex.popupTitle}>Settings</Text>
              <TouchableOpacity style={[Stylex.popupButton, { borderColor: '#9ABFFA' }]} onPress={() => { setModalVisible(false); navigation.navigate("MainPage", { screen: "DaruratDetail", params: selectedItem }) }} >
                <Text style={[Stylex.popupButtonText, { color: '#9ABFFA' }]}>Detail</Text>
              </TouchableOpacity>


              {/* <Text>{selectedItem.status}</Text> */}
              {

                selectedItem &&

                (selectedItem.status == 2 || selectedItem.status == 0) && (
                  <>
                    {/* Uncommented and fixed the Update button */}
                    {/* <TouchableOpacity style={[Stylex.popupButton, { borderColor: '#C4C080' }]} onPress={() => handleAction('Update')} >
                      <Text style={[Stylex.popupButtonText, { color: '#C4C080' }]}>Update</Text>
                    </TouchableOpacity> */}

                    <TouchableOpacity style={[Stylex.popupButton, { borderColor: '#C66963' }]} onPress={() => { removeData(); }} >
                      <Text style={[Stylex.popupButtonText, { color: '#C66963' }]}>Delete</Text>
                    </TouchableOpacity>
                  </>

                )

              }

              <TouchableOpacity style={[Stylex.popupButton, { backgroundColor: '#C66963', borderColor: '#C66963' }]} onPress={closePopup} >
                <Text style={[Stylex.popupButtonText, { color: '#FFFFFF' }]}>Batal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {/* ================= MODAL SETTING =================*/}



      </View>
    </GestureRecognizer>




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


export default Izin


