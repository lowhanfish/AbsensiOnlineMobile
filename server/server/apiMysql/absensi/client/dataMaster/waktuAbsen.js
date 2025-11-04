const express = require('express');
var db = require('../../../../db/MySql/absensi');
const router = express.Router();

var fetch = require('node-fetch');
const configurasi = require('../../../library/configurasi');
const url_micro_3 = configurasi.url_micro_3



router.get('/aa', (req, res) => {
    res.send('oke')
});



router.get('/viewOne', async (req, res) => {
    // console.log("WAKTU ABSEN DI PANGGIL");

    // console.log(url_micro_3+'/micro_3/clientWaktuAbsen/view');
    try {
        const response = await fetch(url_micro_3+'/micro_3/clientWaktuAbsen/view', {
            method: 'get',
            headers: {'Content-Type': 'application/json'}
        });
        const data = await response.json();
        res.json(data)
    } catch (error) {
        console.log("Respon error dari micro 3 tidak terkoneksi, utk server Kominfo");
        console.log(error);
        res.json([])
    }

});







module.exports = router;