import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  TextInput, ImageBackground, Platform, Alert,
} from 'react-native';
import { Stylex } from '../../assets/styles/main';
import { Picker } from '@react-native-picker/picker';
import { pick, types } from '@react-native-documents/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import ImageLib from '../../components/ImageLib';
import ButtonBack from "../../components/ButtonBack";
import { postData } from '../../lib/fetching';
import { useSelector } from "react-redux";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height } = Dimensions.get('window');

// Format tanggal untuk display
const formatDateDisplay = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const DaruratForm = () => {
  // State dari Redux
  const URL = useSelector(state => state.URL);
  const token = useSelector(state => state.TOKEN);

  // State lokal
  const [activePicker, setActivePicker] = useState(null);
  const [listDarurat, setListDarurat] = useState([]);
  const [maxHari, SetMaxHari] = useState(5);
  const [form, setForm] = useState({
    jenispresensi: 1,
    jenisKategori: 4,
    jenisizin: 0,
    lat: '',
    lng: '',
    jamDatang: '07:30',
    jamPulang: '16:00',
    keterangan: '',
    NIP: "",
    JenisStatusId: 1,
    TglMulai: null,
    TglSelesai: null,
    unit_kerja: "",
    files: [],
    name: ''
  });

  // Update form state dengan functional update
  const setValueForm = (value, key) => {
    setForm(prev => ({
      ...prev,
      [key]: value
    }));
  }

  // Validasi dan hitung selisih hari
  const hitungSelisihHari = () => {
    if (!form.TglMulai || !form.TglSelesai) return null;
    const startDate = new Date(form.TglMulai);
    const endDate = new Date(form.TglSelesai);
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Validasi form sebelum submit
  const validasiForm = () => {
    if (!form.TglMulai || !form.TglSelesai) {
      Alert.alert("Peringatan", "Tanggal mulai atau selesai belum dipilih");
      return false;
    }

    const diffDays = hitungSelisihHari();
    if (diffDays > (maxHari - 1)) {
      Alert.alert("Peringatan", `Kategori yang anda pilih tidak boleh melebihi ${maxHari} Hari`);
      return false;
    }

    return true;
  }

  // Build FormData untuk upload
  const buildFormData = () => {
    var formData = new FormData();
    formData.append('jenispresensi', 1);
    formData.append('jenisKategori', form.jenisKategori);
    formData.append('jenisizin', 0);
    formData.append('lat', form.lat);
    formData.append('lng', form.lng);
    formData.append('jamDatang', form.jamDatang);
    formData.append('jamPulang', form.jamPulang);
    formData.append('keterangan', form.keterangan);
    formData.append('NIP', form.NIP);
    formData.append('JenisStatusId', form.JenisStatusId);
    formData.append('TglMulai', (new Date(form.TglMulai)).toISOString());
    formData.append('TglSelesai', (new Date(form.TglSelesai)).toISOString());
    formData.append('unit_kerja', form.unit_kerja);

    form.files.forEach((filex) => {
      formData.append('file', {
        uri: filex.uri,
        name: filex.name,
        type: filex.type
      });
    });

    return formData;
  }

  // Kirim data ke server
  const saveData = () => {
    if (!validasiForm()) return;

    const formData = buildFormData();
    const apiUrl = URL.URL_AbsenHarian + "AddIzin";

    fetch(apiUrl, {
      method: "POST",
      headers: {
        'Authorization': `kikensbarara ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData
    }).then(response => {
      return response.text();
    }).then(textResponse => {
      if (textResponse === 'OK' || textResponse === '1') {
        Alert.alert("Berhasil", "Data berhasil dikirim");
      } else {
        Alert.alert("Gagal", "Server menolak data");
      }
    }).catch(error => {
      Alert.alert("Gagal", "Tidak dapat mengirim data");
    });
  }

  // Handle perubahan tanggal picker
  const onChange = (event, selectedDate) => {
    const isDismissed = event?.type === 'dismissed';
    if (isDismissed) {
      setActivePicker(null);
      return;
    }
    if (selectedDate) {
      if (activePicker === 'dari') {
        setValueForm(selectedDate, 'TglMulai');
      }
      if (activePicker === 'sampai') {
        setValueForm(selectedDate, 'TglSelesai');
      }
    }
    if (Platform.OS === 'android') setActivePicker(null);
  };

  // Buka picker tanggal
  const openPicker = (field) => {
    setActivePicker((prev) => (prev === field ? null : field));
  };

  // Ambil daftar kategori daruratt
  const getKategori = async () => {
    var listx = await postData(
      URL.URL_MasterJenisDarurat + "viewOne",
      token,
      { id: "" }
    )
    setListDarurat(listx)
  }

  // Ambil file dokumen
  const handlePickDocuments = async () => {
    try {
      const results = await pick({
        type: [types.pdf, types.images],
        allowMultiSelection: true,
      });

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

  // Hapus file dari list
  const removeFile = (index) => {
    setForm(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  // Ambil data profil dari AsyncStorage
  const loadAyncData = async () => {
    const profile = await AsyncStorage.getItem('userProfile');
    const profile1 = JSON.parse(profile)
    setValueForm(profile1.profile.unit_kerja, "unit_kerja");
    setValueForm(profile1.profile.NIP, "NIP");
  }

  // Initial load
  useEffect(() => {
    loadAyncData();
    getKategori();
  }, [])

  // Get current date untuk picker
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
                Form ini diperuntukan untuk penginputan data pengajuan absen darurat.
                Pastikan untuk mempersiapkan file Surat Perintah Tugas (SPT) atau Dokumen
                pendukung lainnya.
              </Text>
            </View>

            {/* Kategori */}
            <View style={styles.textform}>
              <Text style={styles.infoTextform}>Pilih Kategori Darurat</Text>
            </View>
            <View style={styles.textWrapper}>
              <View style={styles.fakeInput}>
                <Picker
                  selectedValue={form.jenisKategori}
                  onValueChange={(value) => {
                    setValueForm(value.id, 'jenisKategori');
                    SetMaxHari(value.hari);
                  }}
                  style={styles.picker}
                  dropdownIconColor="#7E59C9"
                  mode="dropdown"
                >
                  {listDarurat.map((data) => (
                    <Picker.Item key={data.id} label={data.uraian} value={data} />
                  ))}
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
              value={form.keterangan}
              onChangeText={(value) => { setValueForm(value, 'keterangan') }}
              style={styles.textarea}
              multiline
              placeholder="Keterangan"
              placeholderTextColor="#bdbdbd"
            />

            {/* Lampiran */}
            <View style={styles.textform}>
              <Text style={styles.infoTextform}>Lampiran Usulan (PDF/Gambar)</Text>
            </View>
            <View style={styles.documentPickerContainer}>
              <TouchableOpacity style={styles.btnPick} onPress={handlePickDocuments}>
                <Text style={styles.btnPickText}>+ Pilih File</Text>
              </TouchableOpacity>

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
          </ImageBackground>
        </View>
      </View>

      {/* Date Picker Modal */}
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

      {/* FAB Submit */}
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
    marginTop: 9,
    marginBottom: 5,
    fontSize: 10
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
  fontTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '400',
    fontFamily: 'Audiowide-Regular',
  },
  textWrapper: {},
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
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 20,
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

