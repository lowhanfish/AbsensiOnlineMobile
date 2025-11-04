const express = require('express');
var dbs = require('../../../../db/MySql/absensi');
const fs = require('fs');

var multer=require("multer");
var upload = require('../../../../db/multer/pdf');

var uniqid = require('uniqid');
const router = express.Router();





router.post('/aa', (req, res) => {

    console.log(req.body)
    res.send('oke')

});


router.post('/add', (req, res) => {

    var query = `
    
    
    `

});




router.post('/view', (req, res) => {
    var data_batas = 6;
    var data_star = (req.body.data_ke - 1)* data_batas;
    var cari = req.body.cari_value;
    var halaman = 1; 


    let jml_data = `
        SELECT 
        kegiatan.*,
        users.nama as createBy
        FROM kegiatan 
        JOIN users
        ON kegiatan.userId = users.id 
        WHERE 
        kegiatan.nama LIKE '%`+cari+`%' 
        OR kegiatan.deskripsi LIKE '%`+cari+`%'
    `

    let view = `
        SELECT 
        kegiatan.*,
        users.nama as createBy
        FROM kegiatan 
        JOIN users
        ON kegiatan.userId = users.id 
        WHERE 
        kegiatan.nama LIKE '%`+cari+`%' 
        OR kegiatan.deskripsi LIKE '%`+cari+`%'
        ORDER BY kegiatan.createAt DESC
        LIMIT `+data_star+`,`+data_batas+`
    `
    db.query(jml_data, (err, row)=>{
        if (err) {
            res.json(err)
        }else{
            halaman = Math.ceil(row.length/data_batas);
            if(halaman<1){halaman = 1}
            // ========================
            db.query(view, (err, result)=>{
                if (err) {res.json(err)}
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










module.exports = router;