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
      app.use('/api/v1/test_connections', test_connections);

    
    // =================== SERVER =====================




    const dm_menuList = require('./apiMysql/absensi/server/dataMaster/authorization/menuList');
    app.use('/api/v1/dm_menuList', middleware.sideMenuMidleware, dm_menuList);

    const dm_kelompokUsers = require('./apiMysql/absensi/server/dataMaster/authorization/kelompokUsers');
    app.use('/api/v1/dm_kelompokUsers', middleware.sideMenuMidleware, dm_kelompokUsers);

    const dm_registrasi = require('./apiMysql/absensi/server/dataMaster/authorization/registrasi');
    app.use('/api/v1/dm_registrasi', middleware.sideMenuMidleware, dm_registrasi);

    const dm_unitKerja = require('./apiMysql/absensi/server/dataMaster/unitKerja');
    app.use('/api/v1/dm_unitKerja', dm_unitKerja);

    const dm_instansi = require('./apiMysql/absensi/server/dataMaster/instansi');
    app.use('/api/v1/dm_instansi', dm_instansi);

    const dm_biodata = require('./apiMysql/absensi/server/dataMaster/biodata');
    app.use('/api/v1/dm_biodata', dm_biodata);



    const checkAuth = require('./apiMysql/checkAuth');
    app.use('/api/v1/checkAuth', checkAuth);


      const dataMasterkategoriAbsen = require('./apiMysql/absensi/server/dataMaster/kategoriAbsen');
      app.use('/api/v1/dataMasterkategoriAbsen', middleware.sideMenuMidleware, dataMasterkategoriAbsen);
      const dataMasterkategoriLokasi = require('./apiMysql/absensi/server/dataMaster/kategoriLokasi');
      app.use('/api/v1/dataMasterkategoriLokasi', dataMasterkategoriLokasi);

      const dataMasterjenisIzin = require('./apiMysql/absensi/server/dataMaster/jenisIzin');
      app.use('/api/v1/dataMasterjenisIzin', middleware.sideMenuMidleware, dataMasterjenisIzin);

      const dataMasterlokasiAbsen = require('./apiMysql/absensi/server/dataMaster/lokasiAbsen');
      app.use('/api/v1/dataMasterlokasiAbsen', dataMasterlokasiAbsen);
      const dataMastermasterLevel = require('./apiMysql/absensi/server/dataMaster/masterLevel');
      app.use('/api/v1/dataMastermasterLevel', dataMastermasterLevel);

      const dataMasterwaktuAbsen = require('./apiMysql/absensi/server/dataMaster/waktuAbsen');
      app.use('/api/v1/dataMasterwaktuAbsen', middleware.sideMenuMidleware, dataMasterwaktuAbsen);

      const dataMasterwaktuLibur = require('./apiMysql/absensi/server/dataMaster/waktuLibur');
      app.use('/api/v1/dataMasterwaktuLibur', middleware.sideMenuMidleware, dataMasterwaktuLibur);


      const usulanLokasi = require('./apiMysql/absensi/server/verifikasiLokasi/usulanLokasi');
      app.use('/api/v1/usulanLokasi', middleware.sideMenuMidleware, usulanLokasi);
      const verifikasiLokasi = require('./apiMysql/absensi/server/verifikasiLokasi/verifikasiLokasi');
      app.use('/api/v1/verifikasiLokasi', middleware.sideMenuMidleware, verifikasiLokasi);

      const server_verifikasiPermohonan = require('./apiMysql/absensi/server/verifikasiPermohonan/verifikasiPermohonan');
      app.use('/api/v1/server_verifikasiPermohonan', middleware.sideMenuMidleware, server_verifikasiPermohonan);


      const apelJenis = require('./apiMysql/absensi/server/pelaksanaanApel/apelJenis');
      app.use('/api/v1/apelJenis', middleware.sideMenuMidleware, apelJenis);
      const apelPelaksanaan = require('./apiMysql/absensi/server/pelaksanaanApel/apelPelaksanaan');
      app.use('/api/v1/apelPelaksanaan', middleware.sideMenuMidleware, apelPelaksanaan);

      
      const presensi_lapApel = require('./apiMysql/absensi/server/presensi/lapApel');
      app.use('/api/v1/presensi_lapApel', presensi_lapApel);
      
      const presensi_pengumuman = require('./apiMysql/absensi/server/pengumuman/pengumuman');
      app.use('/api/v1/presensi_pengumuman', middleware.sideMenuMidleware, presensi_pengumuman);
      
      
      const presensi_settingProfile = require('./apiMysql/absensi/server/setting/settingProfile');
      app.use('/api/v1/presensi_settingProfile', presensi_settingProfile);
      // =================== SERVER =====================
      
      
      
      // =================== TERPAKAI =====================
      // Server gateway APlikasi Absensi
      const client_absenHarian = require('./apiMysql/absensi/client/absenClient/absenHarian');
      app.use('/api/v1/client_absenHarian', client_absenHarian);
      const client_absenApel = require('./apiMysql/absensi/client/absenClient/absenApel');
      app.use('/api/v1/client_absenApel', client_absenApel);
      
      const presensi_lapHarian = require('./apiMysql/absensi/server/presensi/lapHarian');
      app.use('/api/v1/presensi_lapHarian', presensi_lapHarian);
      const presensi_lapBulanan = require('./apiMysql/absensi/server/presensi/lapBulanan');
      app.use('/api/v1/presensi_lapBulanan', presensi_lapBulanan);
      const presensi_lapTahunan = require('./apiMysql/absensi/server/presensi/lapTahunan');
      app.use('/api/v1/presensi_lapTahunan', presensi_lapTahunan);
      const presensi_lapCustom = require('./apiMysql/absensi/server/presensi/lapCustom');
      app.use('/api/v1/presensi_lapCustom', presensi_lapCustom);
      const presensi_lapPersonal = require('./apiMysql/absensi/server/presensi/lapPersonal');
      app.use('/api/v1/presensi_lapPersonal', presensi_lapPersonal);
      // =================== TERPAKAI =====================
      


    
    
    
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

const port = process.env.PORT || 50281;
const server = app.listen(port, () => {
  console.log('Listening on port', port);
});