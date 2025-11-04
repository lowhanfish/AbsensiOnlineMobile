const express = require('express');
const router = express.Router();
var db = require('../db/MySql/utama');


router.get('/view', (req, res)=>{
    console.log("MICRO 3 DIPANGGIL");
    let view = `
        SELECT * FROM waktu
        ORDER BY id DESC
    `
    // ========================
    db.query(view, (err, rows)=>{
        if (err) {
            console.log(err)
        } else {
            res.send(rows[0])
        }
    })
})







module.exports = router;
