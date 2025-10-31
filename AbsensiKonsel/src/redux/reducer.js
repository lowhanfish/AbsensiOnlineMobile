// var URLKU = 'http://192.168.43.34:5020'
// https://simpeg.konaweselatankab.go.id/

import { buildTREFromConfig } from "react-native-render-html"

// var URLKU = 'http://192.168.123.24:5028'
// var URL_SIMPEG = 'http://192.168.1.242:5000'
var URL_SIMPEG = 'https://server-egov.konaweselatankab.go.id'
var URLKU = 'https://serverabsensi.konaweselatankab.go.id'
// var URLKU = 'http://192.168.1.4:5028'
// var URLKU = 'http://192.168.43.55:5028'


// UNTUK UPDATE VERSI
// android/app/buildTREFromConfig.gradle
// versionCode 2
// versionName "1.1"

const initialState = {
    VERSI_APP : '0.0.4',
    nama : 'koko toleee',
    TOKEN   : 'xx',
    PROFILE : '',
    UNIT_KERJA : '',
    ID_PROFILE : '',
    NIP : '',
    URL: {
        URL_SIMPEG : URL_SIMPEG + '/',
        URL_APP: URLKU + '/',
        LOGIN_URL: URLKU + "/auth/login",
        URL_UpdateToken: URLKU + '/api/v1/client_updateToken/',
        URL_MasterKategori: URLKU + '/api/v1/dataMasterkategoriAbsen/',
        URL_MasterLevel: URLKU + '/api/v1/dataMastermasterLevel/',
        URL_MasterLokasiAbsen: URLKU + '/api/v1/client_lokasiAbsen/',
        URL_MasterWaktuAbsen: URLKU + '/api/v1/clientWaktuAbsen/',
        URL_MasterJenisIzin: URLKU + '/api/v1/client_jenisIzin/',
        URL_MasterJenisDarurat: URLKU + '/api/v1/client_jenisDarurat/',
        URL_AbsenHarian: URLKU + '/api/v1/client_absenHarian/',
        URL_AbsenApel: URLKU + '/api/v1/client_absenApel/',
        URL_lampiranImg: URLKU + '/api/v1/client_lampiranImg/',

        URL_kinerja_ku_ra_strategis: URLKU + '/api/v1/kinerja_ku_ra_strategis/',
        URL_kinerja_ku_ra_strategis_indikator: URLKU + '/api/v1/kinerja_ku_ra_strategis_indikator/',
        URL_kinerja_periode: URLKU + '/api/v1/kinerja_periode/',
        URL_kinerja_token: URLKU + '/api/v1/kinerja_token/',
        URL_kinerja_worksheet: URLKU + '/api/v1/kinerja_worksheet/',

        URL_Pengumuman: URLKU + '/api/v1/client_pengumuman/',

        URL_apelPelaksanaan : URLKU+'/api/v1/apelPelaksanaan/',

        URL_biodata : URLKU+'/api/v1/dm_biodata/',

        URL_test_connections : URLKU+'/api/v1/test_connections/',

        URL_presensi_settingProfile : URLKU+'/api/v1/presensi_settingProfile/',

    },
    ABSEN : {
        status : true,
        JamDatang : '',
        JamPulang : '',
        ket : ''
    },
    WAKTU: {
        id : 0,
        uraian : '',
        jam: '',
        status: false,
        waktuIndonesia: 'WITA',
        keterangan: '-----',
        startDatang: '00:00',
        finishDatang: '00:0',
        startPulang: '00:00',
        finishPulang: '00:00',
    },

    ABSENSI: {
        id: '',
        jenisKategori: '',
        jenisizin : '',
        koordinat: '',
        lat : 0,
        lng: 0,
        jamDatang: '',
        jamPulang: '',
        tanggal: '',
        dd : '',
        mm:'',
        yy : '',
        keterangan: '',
        NIP: '',
        JenisStatus: '',
        TglMulai: '',
        TglSelesai: '',
        file: '',
    },
    LOADING : true,
    jenisIzin: [],
    jenisDarurat: [],
    LIST_LOKASI_ABSEN : [],
    listAbsen: [],
    list_LampiranImg : [],

    AUTH_STAT : 'true',
}

const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
const LOGOUT = 'LOGOUT';
// state = initialState artinya jika state belumpunya nilai maka setup awalnya initialState,,, jadi boleh juga di tulis begini (state, action)
const reducer = (state = initialState, action)=>{
    switch (action.type) {
        case LOGIN_SUCCESS:
            return {
                ...state,
                TOKEN: action.payload.token,
                PROFILE: action.payload.profile,
                UNIT_KERJA: action.payload.unit_kerja,
                ID_PROFILE: action.payload.id_profile,
                NIP: action.payload.nip,
                AUTH_STAT: 'true',
            };
            case LOGOUT:
            return {
                ...state,
                TOKEN: '',
                PROFILE: '',
                UNIT_KERJA: '',
                ID_PROFILE: '',
                NIP: '',
                AUTH_STAT: 'false',
            };
        default:
            return state;
    }
}


export default reducer
