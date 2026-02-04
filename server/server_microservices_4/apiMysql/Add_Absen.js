const express = require('express');
const router = express.Router();
var db = require('../db/MySql/utama');

const lib = require('./library/umum');
const libAbsen = require('./library/absen');




router.get('/Add', async (req, res) => {

    res.json({
        status: 'ABSEN GAGAL',
        ket: 'Pembaharuan System, silahkan logout/keluar dari akun anda lalu tutup aplikasi absensi, selanjutnya silahkan buka kembali aplikasi dan lakukan absen seperti biasa ! Anda Mengabsen pada jam :',
    })



})


router.post('/Add', async (req, res) => {


    console.log("=============== MICRO 4 DATA KIRIMAN DARI SERVER UTAMA")
    console.log(req.body);
    console.log("=============== MICRO 4 DATA KIRIMAN DARI SERVER UTAMA")

    var jam = lib.Timex().jam;
    var dd = lib.Timex().dd;
    var mm = lib.Timex().mm;
    var yy = lib.Timex().yy;

    var jarakhitung = false
    var lokasiAbsen = req.body.lokasi_absen_unit

    for (let i = 0; i < lokasiAbsen.length; i++) {
        // console.log(datax[i]);
        const element = lokasiAbsen[i];
        var jarak = lib.hitungJarak(req.body.lat, req.body.lng, element.lat, element.lng);
        // console.log("Jarak "+element.uraian+" : "+jarak);
        // console.log(typeof (element.rad) +' Lng radius :'+element.rad)

        if (jarak <= element.rad) { jarakhitung = true }
    }



    if (lokasiAbsen.length > 0) {
        if (jarakhitung == true) {


            if (req.body.JenisStatus == 'ABSEN TERKUNCI') {
                res.json({
                    status: 'ABSEN TERKUNCI',
                    ket: 'Mohon Maaf, Absen terkunci. Anda melakukan absen pada Jam : ',
                    jam: jam
                })

            } else {
                if (req.body.isUseEmulator == 'true') {

                    res.json({
                        status: 'ABSEN GAGAL',
                        ket: 'Mohon untuk tidak menggunakan emulator. Anda melakukan absen pada Jam : ',
                        jam: jam
                    })

                } else {
                    // ==================================
                    var query = `
                            SELECT id FROM absensi
                            WHERE 
                            dd = `+ dd + ` AND
                            mm = `+ mm + ` AND
                            yy = `+ yy + ` AND
                            NIP = '`+ req.body.NIP + `' 
                        `

                    db.query(query, (err, rows) => {
                        if (err) {
                            // console.log(err)
                            res.send(err)
                        } else {
                            console.log("============ROW")
                            console.log(rows);
                            console.log(rows.length);
                            console.log("============ROW")

                            if (req.body.JenisStatus == 'ABSEN DATANG') {
                                console.log("KATEGORI ABSEN DATANG")
                                if (rows.length <= 0) {
                                    libAbsen.AddAbsenHarian(req, res, db, jam, dd, mm, yy);
                                } else {
                                    libAbsen.NotifSdhAbsen(req, res, rows);
                                }
                            } else if (req.body.JenisStatus == 'ABSEN PULANG') {
                                console.log("KATEGORI ABSEN PULANG")
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
                status: 'ABSEN GAGAL',
                ket: 'Sepertinya jarak anda kejauhan dari titik lokasi, silahkan periksa kembalik Map pada layar..! Anda Mengabsen pada jam :',
                jam: jam
            })

        }

    } else {

        res.json({
            status: 'ABSEN GAGAL',
            ket: 'Pembaharuan System, silahkan logout/keluar dari akun anda lalu tutup aplikasi absensi, selanjutnya silahkan buka kembali aplikasi dan lakukan absen seperti biasa ! Anda Mengabsen pada jam :',
            jam: jam
        })

    }



})







module.exports = router;
