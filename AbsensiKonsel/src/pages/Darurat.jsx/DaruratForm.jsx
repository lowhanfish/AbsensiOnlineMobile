import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity, TextInput, ImageBackground, Platform,
} from 'react-native';
import { Stylex } from '../../assets/styles/main';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import ImageLib from '../../components/ImageLib';
import ButtonBack from "../../components/ButtonBack";

const { height } = Dimensions.get('window');

const formatDateDisplay = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const DaruratForm = () => {

  const [activePicker, setActivePicker] = useState(null);
  const [listDarurat, setListDarurat] = useState([]);
  const [form, setForm] = useState({
    jenispresensi: 1, //Diambil dari tabel presensi 1. Hadir, 2 TK, 3 Izin, 4 Sakit
    jenisKategori: 0, // Diambil dari table jeniskategori, selain absen darurat maka nilainya haruslah 0
    jenisizin: 0, // Diambil dari table jenisIzin, Selain dari usulan izin maka nilainya harus 0
    lat: '',
    lng: '',
    jamDatang: '07:30',
    jamPulang: '16:00',
    keterangan: '',
    // // NIP: store.ABSENSI.NIP,
    // // JenisStatusId: store.WAKTU.id,
    TglMulai: null,
    TglSelesai: null,
    // // unit_kerja: store.UNIT_KERJA,

    name: ''
  });


  const setValueForm = (value, key) => {
    const prev = {
      ...form, [key]: value
    }
    setForm(prev);
  }

  const saveData = () => {
    console.log("Data Form")
    console.log(form);
    var diffDays = 0;

    if (form.TglMulai && form.TglSelesai) {
      const startDate = new Date(form.TglMulai);
      const endDate = new Date(form.TglSelesai);
      const diffTime = Math.abs(endDate - startDate);
      diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      // Anda bisa menyimpan diffDays ke state atau menggunakannya sesuai kebutuhan
    } else {
      console.log("Tanggal mulai atau selesai belum dipilih");
    }
    console.log("Selisih hari:", diffDays);

  }




  const onChange = (event, selectedDate) => {
    const isDismissed = event?.type === 'dismissed';
    if (isDismissed) {
      setActivePicker(null);
      return;
    }
    if (selectedDate) {
      if (activePicker === 'dari') {
        setValueForm(selectedDate, 'TglMulai');
      };
      if (activePicker === 'sampai') {
        setValueForm(selectedDate, 'TglSelesai');

      };
    }
    if (Platform.OS === 'android') setActivePicker(null);
  };

  const openPicker = (field) => {
    setActivePicker((prev) => (prev === field ? null : field));
  };

  const currentValue =
    activePicker === 'dari'
      ? form.TglMulai
        ? new Date(form.TglMulai)
        : new Date()
      : activePicker === 'sampai'
        ? form.TglSelesai
          ? new Date(form.TglSelesai)
          : new Date()
        : new Date();



  const loadAyncData = async () => {

  }


  useEffect(() => {
    loadAyncData();
  }, [])


  return (
    <View style={{ flex: 1 }}>

      <ButtonBack
        routex="Darurat"
      />

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
                Form ini diperuntukan untuk penginputan data pengajuan absen darurat. Pastikan
                untuk mempersiapkan file Surat Perintah Tugas (SPT) atau Dokumen pendukung lainnya.
              </Text>


              {/* Test */}
              {/* <View style={styles.textform}>
                <Text style={styles.infoTextform}>Test</Text>
              </View>
              <View style={styles.textWrapper}>
                <View style={styles.fakeInput}>


                  <TextInput
                    style={styles.inputx}
                    placeholder="Username"
                    placeholderTextColor="#999"
                    value={form.name}
                    onChangeText={(value) => { setValueForm(value, 'name') }}
                    autoCapitalize="none"
                  />


                </View>
              </View> */}


              {/* Kategori */}
              <View style={styles.textform}>
                <Text style={styles.infoTextform}>Pilih Kategori Darurat</Text>
              </View>
              <View style={styles.textWrapper}>
                <View style={styles.fakeInput}>
                  <Picker
                    selectedValue={form.jenisKategori}
                    onValueChange={(value) => { setValueForm(value, 'jenisKategori') }}
                    style={styles.picker}
                    dropdownIconColor="#7E59C9"
                    mode="dropdown"
                  >
                    <Picker.Item label="-- Pilih Jenis Kategori --" value="" />
                    <Picker.Item label="Absen Desak" value="Absen" />
                    <Picker.Item label="Perjalanan Dinas" value="perjalanan_dinas" />
                  </Picker>
                </View>
              </View>


              {/* Dari tanggal */}
              <View style={styles.textform}>
                <Text style={styles.infoTextform}>Dari tanggal</Text>
              </View>

              <View>
                <TouchableOpacity
                  style={styles.fakeInput}
                  activeOpacity={0.8}
                  onPress={() => openPicker('dari')}
                >
                  <View style={styles.inputRow}>
                    <Text style={styles.pickerText}>
                      {form.TglMulai ? formatDateDisplay(form.TglMulai) : '-- Pilih Tanggal --'}
                    </Text>
                    <ImageLib
                      urix={require('../../assets/images/icon/calendar.png')}
                      style={styles.calendarIcon}
                    />
                  </View>
                </TouchableOpacity>
              </View>



              {/* Sampai tanggal */}
              <View style={styles.textform}>
                <Text style={styles.infoTextform}>Sampai tanggal</Text>
              </View>
              <View>
                <TouchableOpacity
                  style={styles.fakeInput}
                  activeOpacity={0.8}
                  onPress={() => openPicker('sampai')}
                >
                  {/* <Text style={[styles.pickerText, { marginLeft: 12 }]}>
                  {form.TglSelesai ? formatDateDisplay(form.TglSelesai) : '-- Pilih Tanggal --'}
                </Text> */}
                  <View style={styles.inputRow}>
                    <Text style={styles.pickerText}>
                      {form.TglSelesai ? formatDateDisplay(form.TglSelesai) : '-- Pilih Tanggal --'}
                    </Text>
                    <ImageLib
                      urix={require('../../assets/images/icon/calendar.png')}
                      style={styles.calendarIcon}
                    />
                  </View>
                </TouchableOpacity>
              </View>



              {/* Keterangan */}
              <View style={styles.textform}>
                <Text style={styles.infoTextform}>Keterangan</Text>
              </View>

              <TextInput
                style={styles.textarea}
                multiline
                placeholder="Keterangan"
                placeholderTextColor="#bdbdbd"
              />






            </View>







            {activePicker && (
              <View style={styles.inlinePicker}>
                <DateTimePicker
                  value={currentValue}
                  mode="date"
                  onChange={onChange}
                  maximumDate={new Date(2100, 11, 31)}
                  minimumDate={new Date(2000, 0, 1)}
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                />
              </View>
            )}



          </ImageBackground>
        </View>
      </View>

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        onPress={saveData}
      >
        <ImageLib style={{ width: 55 }} urix={require('../../assets/images/icon/send.png')} />
      </TouchableOpacity>
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: height,
    paddingHorizontal: 16
  },
  textbg2: {
    position: 'absolute',
    top: 24,
    left: 28,
    right: 28,
    height: 41
  },
  textform: {
    // position: 'absolute',
    // top: 78,
    // left: 35,
    // width: 295,
    // height: 4

    marginTop: 9,
    marginBottom: 5,
    fontSize: 10
  },
  tglform: {
    position: 'absolute',
    top: 160,
    left: 35,
    width: 295,
    height: 41
  },
  sampaiForm: {
    position: 'absolute',
    top: 240,
    left: 35,
    width: 295,
    height: 41
  },
  ketform: {
    position: 'absolute',
    top: 330,
    left: 35,
    width: 295,
    height: 41
  },

  infoText: {
    fontSize: 8,
    color: '#6b6b6b',
    lineHeight: 14
  },
  infoTextform: {
    fontSize: 12,
    fontWeight: '400',
    color: '#ADADAD',
    lineHeight: 14
  },
  infoTglform: {
    fontSize: 12,
    fontWeight: '400',
    color: '#ADADAD',
    lineHeight: 14
  },
  infoketform: {
    fontSize: 12,
    fontWeight: '400',
    color: '#ADADAD',
    lineHeight: 14
  },

  fontTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '400',
    fontFamily: 'Audiowide-Regular',
  },
  textWrapper: {
    // position: 'absolute',
    // top: 95,
    // left: 28,
    // right: 28,
  },

  sampaiWrapper: {
    position: 'absolute',
    top: 260,
    left: 28,
    right: 28
  },

  fakeInput: {
    height: 55,
    width: '100%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6E4EF',
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  picker: {
    height: 55,
    width: '100%',
    marginLeft: 12,
    fontSize: 16,
    ...Platform.select({
      ios: { color: '#ADADAD' },
      android: { color: '#ADADAD' },
    }),
  },
  pickerText: {
    fontSize: 16,
    color: '#ADADAD'
  },

  inlinePicker: {
    position: 'absolute',
    top: 320,
    left: 28,
    width: 298,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6E4EF',
  },

  textarea: {
    // position: 'absolute',
    // top: 350,
    // left: 28,
    // right: 28,

    // padingHorizontal: 28,


    height: 160,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6E4EF',
    backgroundColor: '#ffffff',
    padding: 12,
    textAlignVertical: 'top',
    fontSize: 14,
  },

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 45,
    backgroundColor: '#ffffff',
    width: 61,
    height: 61,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,                     // Android shadow
    shadowColor: '#000',              // iOS shadow
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 20,
  },

  fabImage: {
    width: 28,
    height: 28,
    tintColor: '#fff',
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    height: '100%',
  },

  calendarIcon: {
    width: 20,
    height: 20,
    opacity: 0.7,
  },
});

export default DaruratForm;
