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
const faceEmbedding = require('../../../library/faceEmbedding');


var fetch = require('node-fetch');
const configurasi = require('../../../library/configurasi');
const url_micro_1 = configurasi.url_micro_1
const url_micro_4 = configurasi.url_micro_4

const fcm = require('../../../library/fcm');

router.get('/cappo', (req, res)=>{
    fcm.pushNotification('Nableee', 'telasooooo ');
    res.json('wataaaooo')
})


// INI UNTUK ABSENSI VERSI BARU (FACE RECOGNATION)
router.post('/Add_v2', async (req, res) => {


    var jam = lib.Timex().jam;
    var nip = req.body.NIP;
    
    console.log("===========================================");
    console.log("ABSEN HARIAN V2 (FACE RECOGNATION) DI PANGGIL");
    console.log("Body:", req.body);
    console.log("User:", req.user?._id);
    console.log("Jam:", jam);
    console.log("===========================================");


    



    res.status(200).json({
        status: 'ABSEN SUKSES',
        ket: 'Terimakasih, anda berhasil melakukan absen hari ini pada jam : ',
        jam: jam
    });
});


// INI UNTUK ABSENSI VERSI LAMA (TANPA FACE RECOGNATION)
router.post('/Add', async (req, res) => {

    // console.log(url_micro_4+'/micro_4/Add_Absen/Add');
  
    const body = req.body;
    var profile_login = req.user.profile
    body.lokasi_absen_unit = profile_login.lokasi_absen
    body._id = req.user._id

     console.log("ABSEN HARIAN DI PANGGIL");
     console.log(body);

    try {
        const response = await fetch(url_micro_4+'/micro_4/Add_Absen/Add', {
            method: 'post',
            body: JSON.stringify(body),
            headers: {'Content-Type': 'application/json'}
        });
        const data = await response.json();
        // console.log(data);
        // console.log("DATA DI DAPAT");
        res.json(data)
    } catch (error) {
        console.log("Respon error dari absenharian client, utk server DCN");
        res.json({})
    }


});

router.post('/AddIzin', upload.array('file', 12), (req, res) => {

    console.log("Add Darurat/izin dipanggil");
    console.log("===========================================");
    // console.log(req)
    // console.log(req.file)
    console.log(req.body)
    // console.log(req.files)
    console.log("===========================================");
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



// DI GUNAKAN PADA ABSENSI VERSI LAMA (TANPA FACE ID)
router.post('/viewListDarurat', (req, res) => {
    console.log("LIST DARURAT DI PANGGIL")
    console.log(req.body)
    var data_batas = 5;
    var data_star = (req.body.data_ke - 1)* data_batas;
    var cari = req.body.cari_value;
    var halaman = 1; 


    let jml_data = `
        SELECT 
        COUNT(usulanizin.id) as jumlah

        FROM absensi.usulanizin usulanizin

        LEFT JOIN simpeg.biodata biodata
        ON usulanizin.NIP = biodata.nip

        LEFT JOIN simpeg.unit_kerja unit_kerja
        ON usulanizin.unit_kerja = unit_kerja.id


        LEFT JOIN absensi.jeniskategori jeniskategori
        ON  usulanizin.jenisKategori = jeniskategori.id


        WHERE 
        usulanizin.jenisKategori <> 0 AND
        (jeniskategori.uraian LIKE '%`+cari+`%' 
        OR biodata.nama LIKE '%`+cari+`%'
        #OR unit_kerja.unit_kerja LIKE '%`+cari+`%'
        ) 

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
        #OR unit_kerja.unit_kerja LIKE '%`+cari+`%''
        ) 
        AND usulanizin.createdBy = '`+req.user._id+`'

        
        ORDER BY usulanizin.createdAt DESC
        LIMIT 10
    `
    db.query(jml_data, (err, row)=>{
        if (err) {
            console.log(err)
            res.json(err)
        }else{
            halaman = Math.ceil(row.length/data_batas);
            if(halaman<1){halaman = 1}
            // ========================
            db.query(view, (err2, result)=>{
                if (err2) {
                    console.log(err2)
                    res.json(err2)
                }
                else{
                    halaman = Math.ceil(row[0].jumlah/data_batas);
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


// DI GUNAKAN PADA ABSENSI VERSI TERBARU (FACE ID)
router.post('/viewListDarurat_v2', (req, res) => {
    console.log("LIST DARURAT DI PANGGIL")
    console.log(req.user._id);
    console.log(req.body)
    var data_batas = req.body.pageLimit;
    var data_star = (req.body.pageFirst - 1)* data_batas;
    var cari = req.body.cari_value;
    var halaman = 10; 


    var data_star = (req.body.data_ke - 1)* data_batas;
    var cari = req.body.cari_value;
    var halaman = 10; 


    let jml_data = `
        SELECT 
        COUNT(usulanizin.id) as jumlah

        FROM absensi.usulanizin usulanizin

        LEFT JOIN simpeg.biodata biodata
        ON usulanizin.NIP = biodata.nip

        LEFT JOIN simpeg.unit_kerja unit_kerja
        ON usulanizin.unit_kerja = unit_kerja.id


        LEFT JOIN absensi.jeniskategori jeniskategori
        ON  usulanizin.jenisKategori = jeniskategori.id


        WHERE 
        usulanizin.jenisKategori <> 0 AND
        (jeniskategori.uraian LIKE '%`+cari+`%' 
        OR biodata.nama LIKE '%`+cari+`%'
        OR usulanizin.keterangan LIKE '%`+cari+`%'
        ) 
        AND (usulanizin.createdBy = '${req.user._id}' 
        AND (usulanizin.NIP IS NOT NULL AND usulanizin.NIP != ''))
        ORDER BY usulanizin.createdAt DESC
        

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
        OR usulanizin.keterangan LIKE '%`+cari+`%'
        ) 
        AND (usulanizin.createdBy = '${req.user._id}' 
        AND (usulanizin.NIP IS NOT NULL AND usulanizin.NIP != ''))
        ORDER BY usulanizin.createdAt DESC
        
        LIMIT `+data_star+`,`+data_batas+`
    `

    // console.log(view)


    db.query(jml_data, (err, row)=>{
        if (err) {
            console.log(err)
            res.json(err)
        }else{
            halaman = Math.ceil(row.length/data_batas);
            if(halaman<1){halaman = 1}
            // ========================
            db.query(view, (err2, result)=>{
                if (err2) {
                    console.log(err2)
                    res.json(err2)
                }
                else{
                    halaman = Math.ceil(row[0].jumlah/data_batas);
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
