const express = require('express');
// const volleyball = require('volleyball');
const cors = require('cors');
var path = require("path");

require('dotenv').config();



const app = express();

const middleware = require('./auth/middlewares');
const auth = require('./auth');


// app.use(volleyball);

app.use(cors({
  // origin : 'http://localhost:8081'
  origin : '*'
}));
app.use(express.json());

app.use(middleware.checkTokenSeetUser);


app.get('/', (req, res) => {
  res.json({
    message: '🦄🌈✨Hello pengunjung,,, Anda mengunjugi alamat yg salah... mungkin maksud anda http://konaweselatankab.go.id ! 🌈✨🦄',
    user : req.user
  });
});


app.use('/auth', auth);
app.use('/uploads', express.static(path.join(__dirname, './uploads')))

    // ================================== BATAS =====================================================


      const test_connections = require('./apiMysql/absensi/test_connections');
      app.use('/api/v1/test_connections', middleware.isLoggedIn, test_connections);

    
    // =================== SERVER =====================




    const dm_menuList = require('./apiMysql/absensi/server/dataMaster/authorization/menuList');
    app.use('/api/v1/dm_menuList', middleware.isLoggedIn, middleware.sideMenuMidleware, dm_menuList);

    const dm_kelompokUsers = require('./apiMysql/absensi/server/dataMaster/authorization/kelompokUsers');
    app.use('/api/v1/dm_kelompokUsers', middleware.isLoggedIn, middleware.sideMenuMidleware, dm_kelompokUsers);

    const dm_registrasi = require('./apiMysql/absensi/server/dataMaster/authorization/registrasi');
    app.use('/api/v1/dm_registrasi', middleware.isLoggedIn, middleware.sideMenuMidleware, dm_registrasi);

    const dm_unitKerja = require('./apiMysql/absensi/server/dataMaster/unitKerja');
    app.use('/api/v1/dm_unitKerja', middleware.isLoggedIn, dm_unitKerja);

    const dm_instansi = require('./apiMysql/absensi/server/dataMaster/instansi');
    app.use('/api/v1/dm_instansi', middleware.isLoggedIn, dm_instansi);

    const dm_biodata = require('./apiMysql/absensi/server/dataMaster/biodata');
    app.use('/api/v1/dm_biodata', middleware.isLoggedIn, dm_biodata);



    const checkAuth = require('./apiMysql/checkAuth');
    app.use('/api/v1/checkAuth', middleware.isLoggedIn, checkAuth);



      const dataMasterkategoriAbsen = require('./apiMysql/absensi/server/dataMaster/kategoriAbsen');
      app.use('/api/v1/dataMasterkategoriAbsen', middleware.isLoggedIn, middleware.sideMenuMidleware, dataMasterkategoriAbsen);
      const dataMasterkategoriLokasi = require('./apiMysql/absensi/server/dataMaster/kategoriLokasi');
      app.use('/api/v1/dataMasterkategoriLokasi', middleware.isLoggedIn, dataMasterkategoriLokasi);

      const dataMasterjenisIzin = require('./apiMysql/absensi/server/dataMaster/jenisIzin');
      app.use('/api/v1/dataMasterjenisIzin', middleware.isLoggedIn, middleware.sideMenuMidleware, dataMasterjenisIzin);

      const dataMasterlokasiAbsen = require('./apiMysql/absensi/server/dataMaster/lokasiAbsen');
      app.use('/api/v1/dataMasterlokasiAbsen', middleware.isLoggedIn, dataMasterlokasiAbsen);
      const dataMastermasterLevel = require('./apiMysql/absensi/server/dataMaster/masterLevel');
      app.use('/api/v1/dataMastermasterLevel', middleware.isLoggedIn, dataMastermasterLevel);

      const dataMasterwaktuAbsen = require('./apiMysql/absensi/server/dataMaster/waktuAbsen');
      app.use('/api/v1/dataMasterwaktuAbsen', middleware.isLoggedIn, middleware.sideMenuMidleware, dataMasterwaktuAbsen);

      const dataMasterwaktuLibur = require('./apiMysql/absensi/server/dataMaster/waktuLibur');
      app.use('/api/v1/dataMasterwaktuLibur', middleware.isLoggedIn, middleware.sideMenuMidleware, dataMasterwaktuLibur);


      const usulanLokasi = require('./apiMysql/absensi/server/verifikasiLokasi/usulanLokasi');
      app.use('/api/v1/usulanLokasi', middleware.isLoggedIn, middleware.sideMenuMidleware, usulanLokasi);
      const verifikasiLokasi = require('./apiMysql/absensi/server/verifikasiLokasi/verifikasiLokasi');
      app.use('/api/v1/verifikasiLokasi', middleware.isLoggedIn, middleware.sideMenuMidleware, verifikasiLokasi);

      const server_verifikasiPermohonan = require('./apiMysql/absensi/server/verifikasiPermohonan/verifikasiPermohonan');
      app.use('/api/v1/server_verifikasiPermohonan', middleware.isLoggedIn, middleware.sideMenuMidleware, server_verifikasiPermohonan);


      const apelJenis = require('./apiMysql/absensi/server/pelaksanaanApel/apelJenis');
      app.use('/api/v1/apelJenis', middleware.isLoggedIn, middleware.sideMenuMidleware, apelJenis);
      const apelPelaksanaan = require('./apiMysql/absensi/server/pelaksanaanApel/apelPelaksanaan');
      app.use('/api/v1/apelPelaksanaan', middleware.isLoggedIn, middleware.sideMenuMidleware, apelPelaksanaan);

      const presensi_lapHarian = require('./apiMysql/absensi/server/presensi/lapHarian');
      app.use('/api/v1/presensi_lapHarian', middleware.isLoggedIn, presensi_lapHarian);
      const presensi_lapBulanan = require('./apiMysql/absensi/server/presensi/lapBulanan');
      app.use('/api/v1/presensi_lapBulanan', middleware.isLoggedIn, presensi_lapBulanan);
      const presensi_lapTahunan = require('./apiMysql/absensi/server/presensi/lapTahunan');
      app.use('/api/v1/presensi_lapTahunan', middleware.isLoggedIn, presensi_lapTahunan);
      const presensi_lapCustom = require('./apiMysql/absensi/server/presensi/lapCustom');
      app.use('/api/v1/presensi_lapCustom', middleware.isLoggedIn, presensi_lapCustom);

      const presensi_lapCustom_v2 = require('./apiMysql/absensi/server/presensi/lapCustom_v2');
      app.use('/api/v1/presensi_lapCustom_v2', middleware.isLoggedIn, middleware.sideMenuMidleware, presensi_lapCustom_v2);
      
      const presensi_lapPersonal = require('./apiMysql/absensi/server/presensi/lapPersonal');
      app.use('/api/v1/presensi_lapPersonal', middleware.isLoggedIn, presensi_lapPersonal);

      const presensi_lapApel = require('./apiMysql/absensi/server/presensi/lapApel');
      app.use('/api/v1/presensi_lapApel', middleware.isLoggedIn, presensi_lapApel);

      const presensi_pengumuman = require('./apiMysql/absensi/server/pengumuman/pengumuman');
      app.use('/api/v1/presensi_pengumuman', middleware.isLoggedIn, middleware.sideMenuMidleware, presensi_pengumuman);


      const presensi_settingProfile = require('./apiMysql/absensi/server/setting/settingProfile');
      app.use('/api/v1/presensi_settingProfile', middleware.isLoggedIn, presensi_settingProfile);
    // =================== SERVER =====================

    // =================== CLIENT =====================

      const client_updateToken = require('./apiMysql/absensi/client/tokenFcm/updateToken');
      app.use('/api/v1/client_updateToken', client_updateToken);

      const clientWaktuAbsen = require('./apiMysql/absensi/client/dataMaster/waktuAbsen');
      app.use('/api/v1/clientWaktuAbsen', clientWaktuAbsen);
      const client_jenisIzin = require('./apiMysql/absensi/client/dataMaster/jenisIzin');
      app.use('/api/v1/client_jenisIzin', client_jenisIzin);

      const client_jenisDarurat = require('./apiMysql/absensi/client/dataMaster/jenisDarurat');
      app.use('/api/v1/client_jenisDarurat', client_jenisDarurat);

      const client_lokasiAbsen = require('./apiMysql/absensi/client/lokasiAbsen/lokasiAbsen');
      app.use('/api/v1/client_lokasiAbsen', client_lokasiAbsen);

      const client_absenHarian = require('./apiMysql/absensi/client/absenClient/absenHarian');
      app.use('/api/v1/client_absenHarian', middleware.isLoggedIn, client_absenHarian);

      const client_absenApel = require('./apiMysql/absensi/client/absenClient/absenApel');
      app.use('/api/v1/client_absenApel', middleware.isLoggedIn, client_absenApel);

      const client_lampiranImg = require('./apiMysql/absensi/client/Lampiran/lampiranImg');
      app.use('/api/v1/client_lampiranImg', middleware.isLoggedIn, client_lampiranImg);

      const client_unitKerja = require('./apiMysql/absensi/client/dataMaster/unitKerja');
      app.use('/api/v1/client_unitKerja', middleware.isLoggedIn, client_unitKerja);

      const client_pengumuman = require('./apiMysql/absensi/client/pengumuman/pengumuman');
      app.use('/api/v1/client_pengumuman', middleware.isLoggedIn, client_pengumuman);




    // =================== CLIENT =====================


    // =================== KINERJA =====================

      const kinerja_ku_ra_strategis = require('./apiMysql/absensi/server/kinerja/ku_ra_strategis');
      app.use('/api/v1/kinerja_ku_ra_strategis', middleware.isLoggedIn, kinerja_ku_ra_strategis);
      const kinerja_ku_ra_strategis_indikator = require('./apiMysql/absensi/server/kinerja/ku_ra_strategis_indikator');
      app.use('/api/v1/kinerja_ku_ra_strategis_indikator', middleware.isLoggedIn, kinerja_ku_ra_strategis_indikator);
      const kinerja_periode = require('./apiMysql/absensi/server/kinerja/periode');
      app.use('/api/v1/kinerja_periode', middleware.isLoggedIn, kinerja_periode);
      const kinerja_token = require('./apiMysql/absensi/server/kinerja/token');
      app.use('/api/v1/kinerja_token', middleware.isLoggedIn, kinerja_token);
      const kinerja_worksheet = require('./apiMysql/absensi/server/kinerja/worksheet');
      app.use('/api/v1/kinerja_worksheet', middleware.isLoggedIn, kinerja_worksheet);


    // =================== KINERJA =====================


    
    
    
    // ================================== BATAS =====================================================
    
    // >>>>>>> d3108e8369f9f0f379270f0f6f53f5b9ef7abde6
    
    // const checkAbsenOtomatis = require('./apiMysql/library/checkAbsenOtomatis');
    // checkAbsenOtomatis.checkKehadiranOtomatis();

function notFound(req, res, next) {
  res.status(404);
  const error = new Error('Not Found data - ' + req.originalUrl);
  next(error);
}

function errorHandler(err, req, res, next) {
  res.status(res.statusCode || 500);
  res.json({
    message: err.message,
    stack: err.stack
  });
}

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5040;
const server = app.listen(port, () => {
  console.log('Listening on port', port);
});