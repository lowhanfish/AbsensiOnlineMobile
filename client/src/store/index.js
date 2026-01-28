import Vue from 'vue'
import Vuex from 'vuex'

import { Loading,  QSpinnerFacebook,  } from 'quasar'
import { Notify } from 'quasar'

Vue.use(Vuex)

// var URL = 'http://localhost:5040/'
// var URL = 'http://192.168.44.134:5040/'
// var URL = 'http://10.216.143.96:5040/'
var URL = 'https://serverabsensi.konaweselatankab.go.id/'

export default new Vuex.Store({
  state: {
    coordinat : {
      lat:-4.034694, 
      lng: 122.484263
    },
    btn : {
      add : false,
      edit : false,
      remove : false,
    },
    url : {
      URL_APP : URL,
      LOGIN : URL + "auth/login",

      URL_DM_REGISTER : URL+'api/v1/dm_registrasi/',
      URL_DM_MENU : URL+'api/v1/dm_menuList/',
      URL_DM_KLP_USERS : URL+'api/v1/dm_kelompokUsers/',
      URL_simpeg_biodata : URL+'api/v1/dm_biodata/',
      checkAuth : URL + 'api/v1/checkAuth/',

      URL_MasterKategori : URL+'api/v1/dataMasterkategoriAbsen/',
      URL_MasterKategoriLokasi : URL+'api/v1/dataMasterkategoriLokasi/',
      URL_MasterJenisIzin : URL+'api/v1/dataMasterjenisIzin/',
      URL_MasterLokasiAbsen : URL+'api/v1/dataMasterlokasiAbsen/',
      URL_MasterLevel : URL+'api/v1/dataMastermasterLevel/',
      URL_MasterWaktuAbsen : URL+'api/v1/dataMasterwaktuAbsen/',
      URL_MasterWaktuLibur : URL+'api/v1/dataMasterwaktuLibur/',

      URL_UsulanLokasi : URL+'api/v1/usulanLokasi/',
      URL_VerifikasiLokasi : URL+'api/v1/verifikasiLokasi/',
      URL_VerifikasiPermohonan : URL+'api/v1/server_verifikasiPermohonan/',

      URL_apelJenis : URL+'api/v1/apelJenis/',
      URL_apelPelaksanaan : URL+'api/v1/apelPelaksanaan/',

      URL_client_lampiranImg : URL+'api/v1/client_lampiranImg/',

      URL_presensi_lapHarian : URL+'api/v1/presensi_lapHarian/',
      URL_presensi_lapBulanan : URL+'api/v1/presensi_lapBulanan/',
      URL_presensi_lapTahunan : URL+'api/v1/presensi_lapTahunan/',
      URL_presensi_lapCustom : URL+'api/v1/presensi_lapCustom/',
      URL_presensi_lapCustom_v2 : URL+'api/v1/presensi_lapCustom_v2/',
      URL_presensi_lapPersonal : URL+'api/v1/presensi_lapPersonal/',

      // URL_m_unit_kerja: URL+'api/v1/presensi_lapCustom/',
      URL_m_unit_kerja: URL+'api/v1/client_unitKerja/',


      URL_presensi_pengumuman: URL+'api/v1/presensi_pengumuman/',


      URL_simpeg_unit_kerja: URL+'api/v1/dm_unitKerja/',
      URL_simpeg_instansi : URL+'api/v1/dm_instansi/',


      URL_presensi_settingProfile : URL+'api/v1/presensi_settingProfile/',


      
    },


    list_MasterKategoriLokasi : [],
    list_unit_kerja_auto : [],
    list_ApleJenis : [],

    list_unit_kerja: [],
    list_instansi: [],


    list_menu : null,
    aksesMenu : {},


    unit_kerja : '',
    unit_kerja_nama : '',

    page_first: 1,
    page_last: 0,
    cari_value: "",
    cek_load_data : true,

    type : [
      {id : 0, uraian : 'Single Menu'},
      {id : 1, uraian : 'Multy Menu'}
    ],

    
  },
  mutations: {
    listJeniskategorilokasi(state){

      fetch(state.url.URL_MasterKategoriLokasi, {
        method: "GET",
        headers: {
          "content-type": "application/json",
          authorization: "kikensbatara " + localStorage.token
        }
      })
        .then(res => res.json())
        .then(res_data => {
          state.list_MasterKategoriLokasi = res_data;
      });

    },

    listApelJenis(state){

      fetch(state.url.URL_apelJenis, {
        method: "GET",
        headers: {
          "content-type": "application/json",
          authorization: "kikensbatara " + localStorage.token
        }
      })
        .then(res => res.json())
        .then(res_data => {
          // console.log(res_data)
          state.list_ApleJenis = res_data;
      });

    },

    getStorage(state){
      var get_profile = JSON.parse(localStorage.profile);
      state.unit_kerja = get_profile.profile.unit_kerja; 
    },
    shoWLoading(){
      const spinner = typeof QSpinnerFacebook !== 'undefined'
        ? QSpinnerFacebook // Non-UMD, imported above
        : Quasar.components.QSpinnerFacebook // eslint-disable-line


      Loading.show({
        spinner,
        spinnerColor: 'yellow',
        spinnerSize: 140,
        backgroundColor: 'purple',
        // message: 'Loading... Tunggu beberapa saat, system sedang menyesuaikan akun anda..!',
        // messageColor: 'white'
      })
    },
    hideLoading(){
      Loading.hide()
    },
    shoWNotify(state, message, color, icon){
      Notify.create({
        message: message,
        color: color,
        position : 'top-right',
        icon:icon
      })
    },
  },
  actions: {
  },
  modules: {
  }
})
