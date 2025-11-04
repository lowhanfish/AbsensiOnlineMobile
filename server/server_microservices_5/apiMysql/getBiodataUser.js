const express = require('express');
const router = express.Router();
var db = require('../db/MySql/utama');


router.get('/', (req, res)=>{
    res.send("Dari Jenis Lokasi")
})



router.post('/view', (req, res)=>{


    console.log(req.body);
    // console.log("Saya di panggil");

    let view = ` 
        SELECT 
            egov.users.*, 
            simpeg.unit_kerja.unit_kerja as unit_kerja_nama,
            simpeg.unit_kerja.alamat as unit_kerja_alamat,

            simpeg.biodata.id as bio_id,
            simpeg.biodata.nama as bio_nama,
            simpeg.biodata.gelar_depan as bio_gelar_depan,
            simpeg.biodata.gelar_belakang as bio_gelar_belakang,
            simpeg.biodata.tempat_lahir  as bio_tempat_lahir ,
            simpeg.biodata.ttl as bio_ttl,
            simpeg.biodata.gol as bio_gol,
            simpeg.biodata.jabatan as bio_jabatan ,
            simpeg.biodata.alamat as bio_alamat,
            simpeg.instansi.id as instansi_id,
            simpeg.instansi.instansi as instansi_nama

        FROM egov.users 

        JOIN simpeg.unit_kerja 
            ON egov.users.unit_kerja = simpeg.unit_kerja.id
        JOIN simpeg.instansi 
            ON simpeg.instansi.id = simpeg.unit_kerja.instansi
        JOIN simpeg.biodata 
            ON egov.users.nama_nip = simpeg.biodata.nip
        WHERE users.username = '`+req.body.username+`';
    `;


    // ========================
    db.query(view, (err, rows)=>{
        if (err) {
            console.log(err)
        } else {
            res.send(rows)
        }
    })
    // ========================
})







module.exports = router;
