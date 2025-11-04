const express = require('express');
var db = require('../../../../db/MySql/absensi');
const fs = require('fs');

var multer=require("multer");
var upload = require('../../../../db/multer/pdf');

var uniqid = require('uniqid');
const router = express.Router();





router.get('/aa', (req, res) => {

    console.log(req.body)
    res.send('oke')

});



router.get('/viewOne', (req, res) => {

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
    // ========================
});







module.exports = router;