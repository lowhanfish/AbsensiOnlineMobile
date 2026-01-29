const express = require('express');
var db = require('../../../../db/MySql/absensi');
var db_simpeg = require('../../../../db/MySql/simpeg');
const fs = require('fs');

var multer=require("multer");
var upload = require('../../../../db/multer/pdf');

var uniqid = require('uniqid');
const router = express.Router();



router.post('/list', (req, res)=>{
    const query = `SELECT * FROM jns_pegawai`

    db_simpeg.query(query, (err, rows)=>{
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(rows);
        }



    })

})




module.exports = router;