import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity, TextInput, ImageBackground, ScrollView, Platform,
} from 'react-native';
import { Stylex } from '../../assets/styles/main';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import ImageLib from '../../components/ImageLib';

const { height } = Dimensions.get('window');

const formatDateDisplay = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const IzinForm = () => {
  const [kategori, setKategori] = useState('');
  const [dariTanggal, setDariTanggal] = useState(null);
  const [sampaiTanggal, setSampaiTanggal] = useState(null);
  const [activePicker, setActivePicker] = useState(null);

  const onChange = (event, selectedDate) => {
    const isDismissed = event?.type === 'dismissed';
    if (isDismissed) {
      setActivePicker(null);
      return;
    }
    if (selectedDate) {
      if (activePicker === 'dari') setDariTanggal(selectedDate);
      if (activePicker === 'sampai') setSampaiTanggal(selectedDate);
    }
    if (Platform.OS === 'android') setActivePicker(null);
  };

  const openPicker = (field) => {
    setActivePicker((prev) => (prev === field ? null : field));
  };

  const currentValue =
    activePicker === 'dari'
      ? dariTanggal
        ? new Date(dariTanggal)
        : new Date()
      : activePicker === 'sampai'
        ? sampaiTanggal
          ? new Date(sampaiTanggal)
          : new Date()
        : new Date();

  return (
    <View style={{ flex: 1 }}>

      <View style={{ flex: 1 }}>
        <View style={Stylex.titleContainer}>
          <Text style={[styles.fontTitle, Stylex.shaddowText]}>FORM IZIN</Text>
        </View>

        <View style={styles.container}>
          <ImageBackground
            style={{ flex: 1 }}
            resizeMode="stretch"
            source={require('../../assets/images/bg1.png')}
          >
            <View style={styles.textbg2}>
              <Text style={styles.infoText}>
              Form ini diperuntukan untuk penginputan data pengajuan izin. Pastikan untuk mempersiapkan file Surat Keterangan atau Dokumen pendukung lainnya.
              </Text>
            </View>

            {/* Kategori */}
            <View style={styles.textform}>
              <Text style={styles.infoTextform}>Pilih Kategori Izin</Text>
            </View>
            <View style={styles.textWrapper}>
              <View style={styles.fakeInput}>
                <Picker
                  selectedValue={kategori}
                  onValueChange={(val) => setKategori(val)}
                  style={styles.picker}
                  dropdownIconColor="#7E59C9"
                  mode="dropdown"
                >
                  <Picker.Item label="-- Pilih Jenis Kategori --" value="" />
                  <Picker.Item label="Cuti Sakit" value="Absen" />
                  <Picker.Item label="Tugas Belajar" value="perjalanan_dinas" />
                  <Picker.Item label="Cuti Tahunan" value="cuti_tahunan" />
                  <Picker.Item label="Cuti Besar" value="cuti_besar" />
                  <Picker.Item label="Cuti Melahirkan" value="cuti_melahirkan" />
                  <Picker.Item label="Cuti Karena Alasan Penting" value="cuti_alasanpenting" />
                  <Picker.Item label="Cuti Diluar tanggungan Negara" value="cuti_luar" />
                  <Picker.Item label="Mengikuti LATSAR" value="latsar" />
                  <Picker.Item label="Izin Belajar" value="izin_belajar" />
                  <Picker.Item label="Izin Fakultatif" value="izin_fakultatif" />
                  <Picker.Item label="Cuti Bersama" value="cuti_bersama" />
                </Picker>
              </View>
            </View>

            {/* Dari tanggal */}
            <View style={styles.tglform}>
              <Text style={styles.infoTglform}>Dari tanggal</Text>
            </View>
            <View style={styles.tglWrapper}>
              <TouchableOpacity
                style={styles.fakeInput}
                activeOpacity={0.8}
                onPress={() => openPicker('dari')}
              >
                <Text style={[styles.pickerText, { marginLeft: 12 }]}>
                  {dariTanggal ? formatDateDisplay(dariTanggal) : '-- Pilih Tanggal --'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sampai tanggal */}
            <View style={styles.sampaiForm}>
              <Text style={styles.infoTglform}>Sampai tanggal</Text>
            </View>
            <View style={styles.sampaiWrapper}>
              <TouchableOpacity
                style={styles.fakeInput}
                activeOpacity={0.8}
                onPress={() => openPicker('sampai')}
              >
                <Text style={[styles.pickerText, { marginLeft: 12 }]}>
                  {sampaiTanggal ? formatDateDisplay(sampaiTanggal) : '-- Pilih Tanggal --'}
                </Text>
              </TouchableOpacity>
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


            {/* Keterangan */}
            <View style={styles.ketform}>
              <Text style={styles.infoketform}>Keterangan</Text>
            </View>

            <TextInput
              style={styles.textarea}
              multiline
              placeholder="Keterangan"
              placeholderTextColor="#bdbdbd"
            />
          </ImageBackground>
        </View>
      </View>

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
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
    right:28,
    height: 41
  },
  textform: {
    position: 'absolute',
    top: 78,
    left: 35,
    width: 295,
    height: 41
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
    fontSize: 9,
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
    position: 'absolute',
    top: 95,
    left: 28,
    right: 28,
  },
  tglWrapper: {
    position: 'absolute',
    top: 180,
    left: 28,
    right: 28
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
    position: 'absolute',
    top: 350,
    left: 28,
    right: 28,
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
});

export default IzinForm;
