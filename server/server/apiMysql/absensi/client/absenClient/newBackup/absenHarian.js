const express = require('express');
var db = require('../../../../db/MySql/absensi');
const fs = require('fs');

var multer=require("multer");
var upload = require('../../../../db/multer/pdf');

var uniqid = require('uniqid');
const router = express.Router();

const lib = require('../../../library/umum');
const libAbsen = require('../../../library/absen');
const libIzin = require('../../../library/izin');


var fetch = require('node-fetch');
const configurasi = require('../../../library/configurasi');
const url_micro_1 = configurasi.url_micro_1



const fcm = require('../../../library/fcm');



router.get('/cappo', (req, res)=>{
    fcm.pushNotification('Nableee', 'telasooooo ');
    res.json('wataaaooo')
})

router.post('/Add', async (req, res) => {
  
    var jam = lib.Timex().jam;
    var dd = lib.Timex().dd;
    var mm = lib.Timex().mm;
    var yy = lib.Timex().yy;

    var jarakhitung = false

    // var profile_login = req.user.profile
    // var lokasiAbsen = profile_login.lokasi_absen

    // // console.log(req.body);



    // for (let i = 0; i < lokasiAbsen.length; i++) {
    //     // console.log(datax[i]);
    //     const element = lokasiAbsen[i];
    //     var jarak = lib.hitungJarak(req.body.lat, req.body.lng, element.lat, element.lng);
    //     // console.log("Jarak "+element.uraian+" : "+jarak);
    //     // console.log(typeof (element.rad) +' Lng radius :'+element.rad)

    //     if (jarak <= element.rad) { jarakhitung = true }
    // }



    // if (lokasiAbsen.length > 0) {
        // if (jarakhitung == true) {
    
    
            if (req.body.VERSI_APP == '0.0.2' || req.body.VERSI_APP == '0.0.3') {
                if (req.body.JenisStatus == 'ABSEN TERKUNCI') {
                    res.json({
                        status : 'ABSEN TERKUNCI',
                        ket : 'Mohon Maaf, Absen terkunci. Anda melakukan absen pada Jam : ',
                        jam : jam
                    })
                    
                } else {
                    if (req.body.isUseEmulator == 'true') {
        
                        res.json({
                            status : 'ABSEN GAGAL',
                            ket : 'Mohon untuk tidak menggunakan emulator. Anda melakukan absen pada Jam : ',
                            jam : jam
                        })
                        
                    } else {
                        // ==================================
                        var query = `
                            SELECT * FROM absensi
                            WHERE 
                            dd = `+dd+` AND
                            mm = `+mm+` AND
                            yy = `+yy+` AND
                            NIP = '`+req.body.NIP+`' 
                        `
                        
                        db.query(query, (err, rows)=>{
                            if (err) {
                                // console.log(err)
                                res.send(err)
                            } else {
                
                                if (req.body.JenisStatus == 'ABSEN DATANG') {
                                    if (rows.length <= 0) {
                                        libAbsen.AddAbsenHarian(req, res, db, jam, dd, mm, yy);
                                    } else {
                                        libAbsen.NotifSdhAbsen(req, res, rows);
                                    }
                                } else if (req.body.JenisStatus == 'ABSEN PULANG'){
                                    if (rows.length <= 0) {
                                        libAbsen.NotifTdkAbsenDatang(req, res, jam);
                                    } else {
                                        libAbsen.EditAbsenHarian(req, res, db, jam, rows);
                                    }
                                }
                
                            }
                        })
        
                        // ==================================
        
                    }
            
            
                    
                }
                
            } else {
        
                res.json({
                    status : 'ABSEN GAGAL',
                    ket : 'Mohon melakukan update aplikasi absensi v 1.1 android anda pada playstore. Anda melakukan absen pada Jam : ',
                    jam : jam
                })
            
            }
    
    
    
    
    
    
    
    
    
        // } else{
    
        //     res.json({
        //         status : 'ABSEN GAGAL',
        //         ket : 'Sepertinya jarak anda kejauhan dari titik lokasi, silahkan periksa kembalik Map pada layar..! Anda Mengabsen pada jam :',
        //         jam : jam
        //     })
    
        // }
        
    // } else{

    //     res.json({
    //         status : 'ABSEN GAGAL',
    //         ket : 'Pembaharuan System, silahkan logout/keluar dari akun anda lalu tutup aplikasi absensi, selanjutnya silahkan buka kembali aplikasi dan lakukan absen seperti biasa ! Anda Mengabsen pada jam :',
    //         jam : jam
    //     })

    // }


    
    // console.log(req.body);















    // console.log(req.body);
    // console.log(req.user._id)


    // res.send("OK")

});


router.post('/AddIzin', upload.array('file', 12), (req, res) => {
    // console.log(req)
    // console.log(req.file)
    // console.log(req.body)
    // console.log(req.files)
    var fileRef = uniqid();
    libIzin.addIzin(req, res, db, fileRef);

    // res.send('OK')
});


router.post('/viewListIzin', (req, res) => {
    // console.log(req.body)
    var data_batas = 5;
    var data_star = (req.body.data_ke - 1)* data_batas;
    var cari = req.body.cari_value;
    var halaman = 1; 


    let jml_data = `
        SELECT usulanizin.*,
        jenisizin.uraian as jenisizin_uraian,
        biodata.nama as biodata_nama,
        biodata.gelar_belakang as biodata_gelar_belakang,
        biodata.gelar_depan as biodata_gelar_depan,
        unit_kerja.unit_kerja as unit_kerja_uraian

        FROM absensi.usulanizin usulanizin

        LEFT JOIN simpeg.biodata biodata
        ON usulanizin.NIP = biodata.nip

        LEFT JOIN simpeg.unit_kerja unit_kerja
        ON usulanizin.unit_kerja = unit_kerja.id

        LEFT JOIN absensi.jenisizin jenisizin
        ON  usulanizin.jenisizin = jenisizin.id


        WHERE 
        usulanizin.jenisizin <> 0 AND
        (jenisizin.uraian LIKE '%`+cari+`%' 
        OR biodata.nama LIKE '%`+cari+`%'
        OR unit_kerja.unit_kerja LIKE '%`+cari+`%') 

    `

    let view = `
        SELECT usulanizin.*,
        jenisizin.uraian as jenisizin_uraian,
        biodata.nama as biodata_nama,
        biodata.gelar_belakang as biodata_gelar_belakang,
        biodata.gelar_depan as biodata_gelar_depan,
        unit_kerja.unit_kerja as unit_kerja_uraian

        FROM absensi.usulanizin usulanizin

        LEFT JOIN simpeg.biodata biodata
        ON usulanizin.NIP = biodata.nip

        LEFT JOIN simpeg.unit_kerja unit_kerja
        ON usulanizin.unit_kerja = unit_kerja.id

        LEFT JOIN absensi.jenisizin jenisizin
        ON  usulanizin.jenisizin = jenisizin.id


        WHERE 
        usulanizin.jenisizin <> 0 AND
        (jenisizin.uraian LIKE '%`+cari+`%' 
        OR biodata.nama LIKE '%`+cari+`%'
        OR unit_kerja.unit_kerja LIKE '%`+cari+`%') 
        
        AND usulanizin.createdBy = '`+req.user._id+`'
        ORDER BY usulanizin.createdAt DESC
    `
    db.query(jml_data, (err, row)=>{
        if (err) {
            // console.log(err)
            res.json(err)
        }else{
            halaman = Math.ceil(row.length/data_batas);
            if(halaman<1){halaman = 1}
            // ========================
            db.query(view, (err2, result)=>{
                if (err2) {
                    // console.log(err2)
                    res.json(err2)
                }
                else{
                    halaman = Math.ceil(row.length/data_batas);
                    if(halaman<1){halaman = 1}
                    res.json({
                        data : result,
                        jml_data : halaman
                    })
                }
            })
            // ========================

        }
    })
});


router.post('/viewListDarurat', (req, res) => {
    // console.log(req.body)
    var data_batas = 5;
    var data_star = (req.body.data_ke - 1)* data_batas;
    var cari = req.body.cari_value;
    var halaman = 1; 


    let jml_data = `
        SELECT usulanizin.*,
        jenisizin.uraian as jenisizin_uraian,
        biodata.nama as biodata_nama,
        biodata.gelar_belakang as biodata_gelar_belakang,
        biodata.gelar_depan as biodata_gelar_depan,
        unit_kerja.unit_kerja as unit_kerja_uraian,
        jeniskategori.uraian as jeniskategori_uraian

        FROM absensi.usulanizin usulanizin

        LEFT JOIN simpeg.biodata biodata
        ON usulanizin.NIP = biodata.nip

        LEFT JOIN simpeg.unit_kerja unit_kerja
        ON usulanizin.unit_kerja = unit_kerja.id

        LEFT JOIN absensi.jenisizin jenisizin
        ON  usulanizin.jenisizin = jenisizin.id

        LEFT JOIN absensi.jeniskategori jeniskategori
        ON  usulanizin.jenisKategori = jeniskategori.id


        WHERE 
        usulanizin.jenisKategori <> 0 AND
        (jeniskategori.uraian LIKE '%`+cari+`%' 
        OR biodata.nama LIKE '%`+cari+`%'
        OR unit_kerja.unit_kerja LIKE '%`+cari+`%') 

    `

    let view = `
        SELECT usulanizin.*,
        jenisizin.uraian as jenisizin_uraian,
        biodata.nama as biodata_nama,
        biodata.gelar_belakang as biodata_gelar_belakang,
        biodata.gelar_depan as biodata_gelar_depan,
        unit_kerja.unit_kerja as unit_kerja_uraian,
        jeniskategori.uraian as jeniskategori_uraian

        FROM absensi.usulanizin usulanizin

        LEFT JOIN simpeg.biodata biodata
        ON usulanizin.NIP = biodata.nip

        LEFT JOIN simpeg.unit_kerja unit_kerja
        ON usulanizin.unit_kerja = unit_kerja.id

        LEFT JOIN absensi.jenisizin jenisizin
        ON  usulanizin.jenisizin = jenisizin.id

        LEFT JOIN absensi.jeniskategori jeniskategori
        ON  usulanizin.jenisKategori = jeniskategori.id


        WHERE 
        usulanizin.jenisKategori <> 0 AND
        (jeniskategori.uraian LIKE '%`+cari+`%' 
        OR biodata.nama LIKE '%`+cari+`%'
        OR unit_kerja.unit_kerja LIKE '%`+cari+`%') 
        AND usulanizin.createdBy = '`+req.user._id+`'
        ORDER BY usulanizin.createdAt DESC


    `
    db.query(jml_data, (err, row)=>{
        if (err) {
            // console.log(err)
            res.json(err)
        }else{
            halaman = Math.ceil(row.length/data_batas);
            if(halaman<1){halaman = 1}
            // ========================
            db.query(view, (err2, result)=>{
                if (err2) {
                    // console.log(err2)
                    res.json(err2)
                }
                else{
                    halaman = Math.ceil(row.length/data_batas);
                    if(halaman<1){halaman = 1}
                    res.json({
                        data : result,
                        jml_data : halaman
                    })
                }
            })
            // ========================

        }
    })
});


router.post('/AddMockLocation', (req, res) => {
    var query = `
       INSERT INTO fakegpsuser (nip, absen, createdAt) VALUE 
       ('`+req.body.nip+`', '`+"ABSEN HARIAN"+`', NOW())
   `
   db.query(query, (err, rows)=>{
        if (err) {
            // console.log(err);
            res.send(err);
        } else {
            res.json({
                status : 'Ups',
                ket : 'Anda terindikasi menggunakan lokasi palsu dan tercatat pada jam : ',
                jam : lib.Timex().jam
            })
        }
   })
});

router.post('/statistik', async (req, res) => {
    // console.log(req.body);
    const body = req.body;
    try {
        const response = await fetch(url_micro_1+'/api/v1/client_absenHarian/statistik', {
            method: 'post',
            body: JSON.stringify(body),
            headers: {'Content-Type': 'application/json'}
        });
        const data = await response.json();
        console.log(data);
        // console.log("DATA DI DAPAT");
        res.json(data)
    } catch (error) {
        console.log("Respon error dari absensi/server/presensi/lapHarian.js, utk server Kominfo");
        res.json({})
    }


});



async function getJadwalAbsen(){
    return new Promise((resolve, reject) => {
        var query = `
            SELECT * FROM waktu; 
        `;

        db.query(query, (err, row)=>{
            if(err){
                // console.log(err);
                res.send(err);
            }else{
                resolve(row[0])
            }
        });
    })
}


const Conversi00 = (params) => {
    return ('0' + params).slice(-2)
}




async function cekWaktu(){
    
    var data = await getJadwalAbsen()

    var hours = new Date().getHours(); //Current Hours
    var min = new Date().getMinutes(); //Current Minutes
    var sec = new Date().getSeconds(); //To get the Current Seconds

    var timeNow = Conversi00(hours) + ':' + Conversi00(min)
    
    var startDatang = data.startDatang;
    var finishDatang = data.finishDatang;

    var startPulang = data.startPulang;
    var finishPulang = data.finishPulang;
    
    return new Promise((resolve, reject) => {
        
        if ((timeNow >= startDatang) && (timeNow <= finishDatang)){
          resolve('ABSEN DATANG');
        }
        else if ((timeNow >= startPulang) && (timeNow <= finishPulang)){
          resolve('ABSEN PULANG');
        } else{
          resolve('ABSEN TERKUNCI');
        }
    })
    
    
  }






module.exports = router;