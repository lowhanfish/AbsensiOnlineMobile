const express = require('express');
var db = require('../../../../db/MySql/absensi');
const fs = require('fs');

var multer=require("multer");
var upload = require('../../../../db/multer/pdf');

var uniqid = require('uniqid');
const router = express.Router();





router.get('/', (req, res) => {
    console.log(req.body)
    res.send('oke')
});


router.post('/viewOne', (req, res) => {
    console.log("Lampiran ditemukan")
    console.log("Lampiran ditemukan")
    console.log(req.body)
    var query = `
        SELECT * FROM lampiran
        WHERE fileRef = '`+req.body.fileRef+`'
    `

    db.query(query, (err, row)=>{
        if (err) {
            console.log(err)
            res.send(err);
        } else {
            res.send(row);
        }
    })

});






module.exports = router;