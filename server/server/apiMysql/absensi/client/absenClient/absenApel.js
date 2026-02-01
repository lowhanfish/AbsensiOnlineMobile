const express = require('express');
var db = require('../../../../db/MySql/absensi');
const fs = require('fs');

var multer = require("multer");
var upload = require('../../../../db/multer/pdf');

var uniqid = require('uniqid');
const router = express.Router();

const lib = require('../../../library/umum');
const libAbsen = require('../../../library/absen');
const libIzin = require('../../../library/izin');
const libUmum = require('../../../library/umum');

var fetch = require('node-fetch');
const configurasi = require('../../../library/configurasi');
const url_micro_1 = configurasi.url_micro_1
const url_micro_6 = configurasi.url_micro_6



const fcm = require('../../../library/fcm');




router.get('/cappo', (req, res) => {
    fcm.pushNotification('Nableee', 'telasooooo ');
    res.json('wataaaooo')
})

router.post('/Add', async (req, res) => {
    // var jam = lib.Timex().jam;
    // var dd = lib.Timex().dd;
    // var mm = lib.Timex().mm;
    // var yy = lib.Timex().yy;

    // var data = req.body
    // // console.log(data)


    // if (checkTime(data.form)) {

    //     if (data.isUseEmulator == 'true') {
    //         res.json({
    //             status : 'ABSEN GAGAL',
    //             ket : 'Mohon untuk tidak menggunakan emulator. Anda melakukan absen pada Jam : ',
    //             jam : jam
    //         })
    //     } else {
    //         AddAbsenApel(req, res, req.body)
    //     }



    // } else {
    //     res.send({
    //         status : 'GAGAL',
    //         ket : 'Gagal, anda mengabsen diluar jadwal apel, absen apel anda hari ini pada jam : ',
    //         jam : jam
    //     })
    // }

    // console.log(req.user._id)


    const body = req.body;
    body.user_id = req.user._id
    try {
        const response = await fetch(url_micro_6 + '/micro_6/absenApel/Add', {
            method: 'post',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        console.log(data);
        // console.log("DATA DI DAPAT");
        res.json(data)
    } catch (error) {
        console.log("Respon error dari absensi/client/absenClient/AbsenApel.js, utk server DCN");
        res.json({})
    }

});


router.post('/statistik', async (req, res) => {
    // console.log(req.body);
    const body = req.body;
    try {
        const response = await fetch(url_micro_1 + '/api/v1/client_absenApel/statistik', {
            method: 'post',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' }
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



function AddAbsenApel(req, res, data) {
    var data1 = data.form;
    var jamx = lib.Timex().jam;
    const d = new Date();
    var thn = d.getFullYear();
    var bln = d.getMonth() + 1;
    var tgl = d.getDate();

    var jam = d.getHours()
    var mnt = d.getMinutes()
    var waktu = Conversi00(jam) + ":" + Conversi00(mnt) + ':00';

    // console.log(data)


    var check = `
        SELECT id FROM absensi_apel
        WHERE NIP = '`+ data.NIP + `' AND
        (
            dd = `+ data1.dd + ` AND
            mm = `+ data1.mm + ` AND
            yy = `+ data1.yy + `
        )
    
    `

    db.query(check, (err, rows) => {
        if (rows.length <= 0) {



            var query = `
                INSERT INTO absensi_apel (
                    lat, 
                    lng, 
                    jamDatang, 
                    dd, 
                    mm, 
                    yy,
                    NIP, 
                    unit_kerja, 
                    createdBy, 
                    createdAt 
                ) VALUE (
                    `+ data1.lat + `,
                    `+ data1.lng + `,
                    '`+ waktu + `',
                    `+ data1.dd + `,
                    `+ data1.mm + `,
                    `+ data1.yy + `,
                    '`+ data.NIP + `',
                    '`+ data1.unit_kerja + `',
                    '`+ req.user._id + `',
                    NOW()
                )
            `

            db.query(query, (err2, rows2) => {
                if (err2) {
                    // console.log(err2);
                    res.json(err2);
                } else {
                    res.send({
                        status: 'SUKSES',
                        ket: 'Sukses, anda berhasil absen apel hari ini pada jam : ',
                        jam: jamx
                    })
                }
            })


        } else {

            res.send({
                status: 'GAGAL',
                ket: 'Gagal, anda sebelumnya sudah absen apel hari ini pada jam : ',
                jam: jam
            })
        }
    })












}



const checkTime = (data) => {
    const d = new Date();
    var thn = d.getFullYear();
    var bln = d.getMonth() + 1;
    var tgl = d.getDate();



    var jam = d.getHours()
    var mnt = d.getMinutes()

    var waktu = Conversi00(jam) + ":" + Conversi00(mnt) + ':00';

    if (data) {
        // console.log(waktu)
        // console.log(data.startAbsen)
        if (parseInt(tgl) == parseInt(data.dd) && parseInt(bln) == parseInt(data.mm) && parseInt(thn) == parseInt(data.yy)) {
            if ((waktu >= data.startAbsen) && (waktu <= data.batasAbsen)) {
                // if ((data.startAbsen > waktu) && (data.batasAbsen < waktu)) {
                // console.log('Suksesssss')
                return true
            } else {
                // console.log('Gagaaaaaal')
                return false
            }
        } else {
            // console.log("GAGALLLLLLL")
            return false
        }

    }

}



const Conversi00 = (params) => {
    return ('0' + params).slice(-2)
}








module.exports = router;