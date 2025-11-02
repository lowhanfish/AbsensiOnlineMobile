import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


// --- FUNGSI UTILITAS (EXPORT CONST) ---

// Fungsi untuk memeriksa dan mengembalikan gelar depan
export const check_gelar_depan = (data) => {
  if (data == undefined || data == null || data == '') {
      return ''
  } else {
      return data+'. '
  }
}

// Fungsi untuk memeriksa dan mengembalikan gelar belakang
export const check_gelar_belakang = (data1) => {
  if (data1 == undefined || data1 == null || data1 == '') {
      return ''
  } else {
      return ', '+data1
  }
}

// Fungsi untuk menggabungkan nama lengkap dengan gelar
export const namaLengkap = (gelardepan, nama, gelarBelakang) =>{
  return check_gelar_depan(gelardepan)+""+nama+""+check_gelar_belakang(gelarBelakang)
}

// Fungsi untuk memastikan angka menjadi format dua digit (05, 12, dll)
export const Conversi00 = (params) => {
    return ('0' + params).slice(-2)
}

// 🚀 FUNGSI KRITIS: JamRealtime (Sudah diperbaiki)
// Mengembalikan waktu saat ini dalam format HH:MM:SS
export const JamRealtime = () => {
    // PENTING: Membuat objek Date baru setiap kali dipanggil
    const now = new Date(); 
    
    const hours = now.getHours(); 
    const min = now.getMinutes(); 
    const sec = now.getSeconds();

    // Mengembalikan string format HH:MM:SS (misalnya "18:46:37")
    return `${Conversi00(hours)}:${Conversi00(min)}:${Conversi00(sec)}`;
}


// Fungsi untuk mengecek status absen berdasarkan jam saat ini
// Digunakan di Dashboard.js setiap detik
export const cekWaktu = (timeNow, storeWaktu) => {
  // ASUMSI: properti seperti startDatang sudah ada di state Redux storeWaktu
  var startDatang = storeWaktu.startDatang;
  var finishDatang = storeWaktu.finishDatang;

  var startPulang = storeWaktu.startPulang;
  var finishPulang = storeWaktu.finishPulang;

  let keterangan = '';
  let status = false;

  // Catatan: Membandingkan string HH:MM:SS bekerja dengan baik
  if ((timeNow >= startDatang) && (timeNow <= finishDatang)){
    keterangan = 'ABSEN DATANG';
    status = true;
  }
  else if ((timeNow >= startPulang) && (timeNow <= finishPulang)){
    keterangan = 'ABSEN PULANG';
    status = true;
  } else{
    keterangan = 'ABSEN TERKUNCI';
    status = false;
  }
  
  // Mengembalikan objek Redux yang diperbarui.
  // Properti lain yang tidak diubah (seperti startDatang) tetap ada karena spread operator ({...storeWaktu})
  return { 
      ...storeWaktu,
      keterangan: keterangan, 
      status: status 
  };
}


// Fungsi untuk mengambil data waktu absen dari API
export const CheckWaktuAbsen = (URL, token) => {
    return new Promise((resolve, reject) => {
        axios.get(URL, {
            headers: { 
                "content-type": "application/json",
                "Authorization": `Bearer ${token}` 
            }
        }).then(result =>{
            // result.data HARUS mengembalikan objek yang akan disimpan di Redux
            resolve(result.data)
        }).catch(error =>{
            console.error("Gagal mengambil waktu absen:", error)
            reject(error)
        })
    })
}


// Fungsi-fungsi konversi tanggal dan utility lainnya yang Anda berikan:

export const tglConvert = (tgl) => {
    var date = new Date(tgl);
    var getBulan = date.getMonth() + 1; 
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
    let bulan = months[getBulan - 1] || '';

    return date.getDate() + " " + bulan + " " + date.getFullYear();
}


export const tglConvertReverse = (tgl) => {

  var tglx1 = tgl.split("-");
  var tglx2 = tglx1[2]+'-'+tglx1[1]+'-'+tglx1[0]

  var bb = tglx1[1];
  var cc = parseInt(bb)
  
  var bulan = '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
  bulan = months[cc - 1] || '';

  return parseInt(tglx1[2]) + " " + bulan + " " + tglx1[0];
}

export const tglConvertFromDate = (tgl) => {

  var d = new Date(tgl)

  var tahun = d.getFullYear();
  var bulan = d.getMonth()+1;
  var hari = d.getDate();

  return {
    hari : hari,
    bulan : bulan,
    tahun : tahun,
  }
}

export const GetStorage = async () => {
  var profileku = await AsyncStorage.getItem('PROFILE')
  var token = await AsyncStorage.getItem('TOKEN')

  let data = {
      AUTH_STAT: false,
      TOKEN: token,
      PROFILE: profileku,
      ID_PROFILE: null,
      NIP: null,
      UNIT_KERJA: null,
  };

  if (token) {
    data.AUTH_STAT = true;
  }

  if (profileku) {
      try {
          var get_profile = JSON.parse(profileku);
          data.ID_PROFILE = get_profile._id;
          data.NIP = get_profile.profile.NIP;
          data.UNIT_KERJA = get_profile.profile.unit_kerja;
      } catch (e) {
          console.error("Gagal parsing PROFILE dari AsyncStorage", e);
      }
  } 
  return data;
}


export const hitungJarak = (lat1, lon1, lat2, lon2) => {
  var R = 6371; // km
  var dLat = toRad(lat2 - lat1);
  var dLon = toRad(lon2 - lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);

  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;

  // console.log(d*1000)

  return d*1000;
}

export const toRad = (Value) => {
  return Value * Math.PI / 180;
}

// export const changeStat = (statUsulan)=>{
//   var color = ''
//   var imgx = ''
//   var status = ''

//   if (statUsulan === 0){
//       imgx = require ('../assets/img/load.png');
//       color = '#EDA01F';
//       status = 'Proses Verifikasi'
//   }
//   else if(statUsulan === 1) {
//       imgx = require ('../assets/img/true.png');
//       color = '#39C13B';
//       status = 'Disetujui'
//   }
//   else if(statUsulan === 2) {
//       imgx = require ('../assets/img/false.png');
//       color = '#E44942';
//       status = 'Dikembalikan'
//   }

//   return {
//       color : color,
//       imgx : imgx,
//       status : status,
//   }
// }

export const duaAngkaDibelakangKoma = (nilai)=>{
  const angka = parseFloat(nilai);
  const hasil = angka.toFixed(2);
  return hasil
}

export const kelamin = (data)=>{
  if (data == 'M' ||data == 'Laki-laki' ) {
    return 'Laki-laki'
  } else if (data == 'F' ||data == 'Perempuan') {
    return 'Perempuan'
  }
}