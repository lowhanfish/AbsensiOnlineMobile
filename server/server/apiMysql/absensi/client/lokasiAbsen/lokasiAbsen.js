const express = require('express');
var db = require('../../../../db/MySql/absensi');
const fs = require('fs');

var multer=require("multer");
var upload = require('../../../../db/multer/pdf');

var uniqid = require('uniqid');
const router = express.Router();





router.post('/view', (req, res) => {

    // console.log(req.body);
    var query = `
        SELECT 
        jenisLokasi.*,
        biodata.nama as biodata_nama,
        biodata.nip as biodata_nip,
        unit_kerja.unit_kerja as unit_kerja_unit_kerja,
        jeniskategorilokasi.uraian as jeniskategorilokasi_uraian
        FROM absensi.jenisLokasi jenisLokasi

        JOIN egov.users users
        ON jenisLokasi.createdBy = users.id

        JOIN simpeg.biodata biodata
        ON users.nama_nip = biodata.nip

        JOIN simpeg.unit_kerja unit_kerja
        ON jenisLokasi.unit_kerja = unit_kerja.id

        JOIN absensi.jeniskategorilokasi jeniskategorilokasi
        ON jeniskategorilokasi.id = jenisLokasi.jeniskategorilokasi

        WHERE 
        
        (
            jenisLokasi.jeniskategorilokasi = 1 AND jenisLokasi.unit_kerja = '`+req.body.unit_kerja+`'
        )
        OR
        (
            jenisLokasi.jeniskategorilokasi = 2 AND jenisLokasi.createdBy = '`+req.user._id+`'
        )
    `

    // ========================
    db.query(query, (err2, rows)=>{
        if (err2) {
            // console.log(err2)
            res.json(err)
        }
        else{
          res.json(rows)
        }
    })
    // ========================
});


module.exports = router;