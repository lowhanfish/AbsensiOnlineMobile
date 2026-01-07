import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity, TextInput, ImageBackground, Platform,
  Alert,
} from 'react-native';
import { Stylex } from '../../assets/styles/main';
import { Picker } from '@react-native-picker/picker';
import { pick, types } from '@react-native-documents/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import ImageLib from '../../components/ImageLib';
import ButtonBack from "../../components/ButtonBack";
import { postData } from '../../lib/fetching';
const { height } = Dimensions.get('window');
import { useSelector } from "react-redux";



const formatDateDisplay = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const DaruratForm = () => {

  const URL = useSelector(state => state.URL);
  const token = useSelector(state => state.TOKEN);

  // console.log(token);
  // console.log(URL.URL_MasterJenisDarurat + "viewOne")

  const [activePicker, setActivePicker] = useState(null);
  const [listDarurat, setListDarurat] = useState([]);
  const [maxHari, SetMaxHari] = useState(5);
  const [form, setForm] = useState({
    jenispresensi: 1, //Diambil dari tabel presensi 1. Hadir, 2 TK, 3 Izin, 4 Sakit
    jenisKategori: 4, // Diambil dari table jeniskategori, selain absen darurat maka nilainya haruslah 0
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
    keterangan: '',
    files: [], // Tambahkan array untuk menampung file terpilih
    name: ''
  });


  const setValueForm = (value, key) => {
    const prev = {
      ...form, [key]: value
    }
    setForm(prev);
  }

  const saveData = () => {



    console.log("Data Form Siap Kirim:", form);
    console.log("Jumlah File:", form.files.length);

    console.log("tanggal Mulai", (new Date(form.TglMulai)).toISOString());
    console.log("MAX HARI : ", maxHari)




    var diffDays = 0;

    if (form.TglMulai && form.TglSelesai) {
      const startDate = new Date(form.TglMulai);
      const endDate = new Date(form.TglSelesai);
      const diffTime = Math.abs(endDate - startDate);
      diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      console.log("Selisih hari:", diffDays);

      if (diffDays > (maxHari - 1)) {
        Alert.alert(`Kategori yang anda pilih tidak boleh melebihi ${maxHari} Hari`);
        // console.log(`Kategori yang anda pilih tidak boleh melebihi ${maxHari} Hari`)
      } else {
        Alert.alert("Bolehmi Absen");
      }




    } else {
      console.log("Tanggal mulai atau selesai belum dipilih");
    }

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

  const getKategori = async () => {
    var listx = await postData(
      URL.URL_MasterJenisDarurat + "viewOne",
      token,
      { id: "" }
    )

    console.log(listx)
    setListDarurat(listx)

    // console.log("LIST DARURAT : ", list)


  }

  // ========== PICKER DOKUMEN ==========
  // Fungsi untuk mengambil file
  const handlePickDocuments = async () => {
    try {
      const results = await pick({
        type: [types.pdf, types.images],
        allowMultiSelection: true, // Mengizinkan banyak file sekaligus
      });

      // Gabungkan file yang baru dipilih dengan yang sudah ada
      setForm(prev => ({
        ...prev,
        files: [...prev.files, ...results]
      }));
    } catch (err) {
      if (err.message !== 'User cancelled directory picker') {
        console.error(err);
      }
    }
  };

  // Fungsi hapus file dari list
  const removeFile = (index) => {
    setForm(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const getCurrentDate = () => {
    if (activePicker === 'dari') {
      return form.TglMulai ? new Date(form.TglMulai) : new Date();
    }
    if (activePicker === 'sampai') {
      return form.TglSelesai ? new Date(form.TglSelesai) : new Date();
    }
    return new Date();
  };

  const currentValue = getCurrentDate();

  const loadAyncData = async () => {

  }

  useEffect(() => {
    loadAyncData();
    getKategori();
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
                    onValueChange={(value) => { setValueForm(value.id, 'jenisKategori'); SetMaxHari(value.hari) }}
                    style={styles.picker}
                    dropdownIconColor="#7E59C9"
                    mode="dropdown"
                  >

                    {
                      listDarurat.map((data) => (
                        <Picker.Item key={data.id} label={data.uraian} value={data} />
                      ))
                    }


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



              {/* Lampiran  */}
              <View style={styles.textform}>
                <Text style={styles.infoTextform}>Lampiran Usulan (PDF/Gambar)</Text>
              </View>

              <View style={styles.documentPickerContainer}>
                <TouchableOpacity
                  style={styles.btnPick}
                  onPress={handlePickDocuments}
                >
                  <Text style={styles.btnPickText}>+ Pilih File</Text>
                </TouchableOpacity>

                {/* List File yang terpilih */}
                <View style={styles.fileList}>
                  {form.files.map((file, index) => (
                    <View key={index} style={styles.fileItem}>
                      <Text style={styles.fileName} numberOfLines={1}>
                        {file.name || `File ${index + 1}`}
                      </Text>
                      <TouchableOpacity onPress={() => removeFile(index)}>
                        <Text style={styles.removeText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>










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
    height: 45,
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






  documentPickerContainer: {
    marginBottom: 10,
  },
  btnPick: {
    backgroundColor: '#F5F5F9',
    borderWidth: 1,
    borderColor: '#E6E4EF',
    borderStyle: 'dashed',
    borderRadius: 8,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnPickText: {
    color: '#7E59C9',
    fontWeight: 'bold',
  },
  fileList: {
    marginTop: 8,
  },
  fileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 6,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  fileName: {
    fontSize: 12,
    color: '#555',
    flex: 1,
    marginRight: 10,
  },
  removeText: {
    color: 'red',
    fontWeight: 'bold',
    paddingHorizontal: 5,
  },







});

export default DaruratForm;
