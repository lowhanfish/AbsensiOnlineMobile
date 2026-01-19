import { Text, TextInput, ScrollView, View, StyleSheet, Dimensions, ImageBackground, TouchableOpacity, Modal } from "react-native"
import React, { useEffect, useState } from 'react';
import { Stylex } from "../../assets/styles/main";
import ImageLib from '../../components/ImageLib';
import { useNavigation } from '@react-navigation/native';
import ButtonBack from "../../components/ButtonBack";
import axios from "axios";
import { useSelector } from "react-redux";
import LoadingImage from "../../components/LoadingImage";
import GestureRecognizer, { swipeDirections } from 'react-native-swipe-gestures';
import { useAuthGuard } from "../../hooks/useAuthGuard";
import DaruratItem from "./components/DaruratItem";
import DaruratSettings from "./components/DaruratSettings";
const { height, width } = Dimensions.get('window');

const Darurat = () => {
  useAuthGuard();
  const navigation = useNavigation();

  const URL = useSelector(state => state.URL);
  const token = useSelector(state => state.TOKEN);

  const [text, setText] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [listData, setListData] = useState([]);
  const [pageLimit, setPageLimit] = useState(10);
  const [pageFirst, setPageFirst] = useState(1);
  const [pageLast, setPageLast] = useState(1);
  const [cariValue, setCariValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80
  };

  const viewData = () => {
    setLoading(false);
    axios.post(URL.URL_AbsenHarian + 'viewListDarurat_v2', JSON.stringify({
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
      setListData(result.data.data);
      setPageLast(result.data.jml_data)
    }).catch(error => {
      setLoading(true);
    })
  }

  const handleButtonPress = () => {
    console.log('Filter Data By Text', text);
  };

  const handleItemPress = (item) => {
    // Jika modal sedang terbuka, tutup dulu
    if (modalVisible) {
      setModalVisible(false);
      setTimeout(() => {
        setSelectedItem(item);
        setModalVisible(true);
      }, 200);
    } else {
      setSelectedItem(item);
      setModalVisible(true);
    }
  };

  const closePopup = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  const PrevData = () => {
    if (pageFirst > 1) {
      setPageFirst(pageFirst - 1);
    } else {
      setPageFirst(1);
    }
  };

  const NextData = () => {
    if (pageFirst >= pageLast) {
      setPageFirst(pageLast);
    } else {
      setPageFirst(pageFirst + 1);
    }
  };

  const onSwipe = (gestureName, gestureState) => {
    const { SWIPE_UP, SWIPE_DOWN, SWIPE_LEFT, SWIPE_RIGHT } = swipeDirections;
    switch (gestureName) {
      case SWIPE_LEFT:
        NextData();
        break;
      case SWIPE_RIGHT:
        PrevData();
        break;
    }
  };

  useEffect(() => {
    viewData();
  }, [pageFirst, cariValue])

  return (
    <GestureRecognizer
      onSwipe={(direction, state) => onSwipe(direction, state)}
      config={config}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1 }}>
        <ButtonBack routex="Dashboard" />
        <ScrollView>
          <View style={{ flex: 1 }}>
            <View style={Stylex.daruratTitle}>
              <Text style={[Stylex.fontTitle, Stylex.shaddowText]}>ABSEN DARURAT</Text>
            </View>

            <View style={styles.container}>
              <ImageBackground style={{ flex: 1 }} resizeMode="stretch" source={require('../../assets/images/bg1.png')}>
                <View style={Stylex.daruratHeader}>
                  <View style={Stylex.checkboxContainer}>
                    <Text style={[Stylex.dateContent, { marginLeft: 1 }]}>Page {pageFirst} dari {pageLast}</Text>
                  </View>
                </View>
                <View style={Stylex.inputWrapper}>
                  <TextInput
                    style={{ flex: 1, fontSize: 8, paddingHorizontal: 10, height: 35, backgroundColor: 'white', color: '#000000' }}
                    placeholder="Filter Data"
                    placeholderTextColor="#999"
                    value={cariValue}
                    onChangeText={setCariValue}
                  />
                  <TouchableOpacity onPress={handleButtonPress} style={Stylex.button}>
                    <ImageLib urix={require('../../assets/images/icon/filter.png')} style={Stylex.icon} />
                  </TouchableOpacity>
                </View>

                {!loading ? (
                  <LoadingImage />
                ) : (
                  <View>
                    {listData.map((item) => (
                      <DaruratItem
                        key={item.id}
                        item={item}
                        onPress={handleItemPress}
                      />
                    ))}
                  </View>
                )}
              </ImageBackground>
            </View>
          </View>
        </ScrollView>

        <TouchableOpacity
          onPress={() => { navigation.navigate("MainPage", { screen: "DaruratForm" }); }}
          style={{ position: 'absolute', bottom: 16, right: 26, elevation: 5 }}
        >
          <ImageLib style={{ width: 61, height: 61 }} urix={require('../../assets/images/icon/addBtn.png')} />
        </TouchableOpacity>

        <DaruratSettings
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          closePopup={closePopup}
          selectedItem={selectedItem}
          viewData={viewData}
        />
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

export default Darurat

