const express = require('express');
const router = express.Router();
var db = require('../db/MySql/utama');


router.get('/', (req, res)=>{
    res.send("Dari Jenis Lokasi")
})



router.post('/view', (req, res)=>{


    // console.log(req.body);
    // console.log("Saya di panggil");

    let view = `
        SELECT * FROM jenisLokasi 
        WHERE unit_kerja = '`+req.body.unit_kerja+`' AND status= 1
 
    `
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
