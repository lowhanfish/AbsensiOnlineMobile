const express = require('express');
var dbs = require('../../../../db/MySql/absensi');
const fs = require('fs');

var multer=require("multer");
var upload = require('../../../../db/multer/pdf');

var uniqid = require('uniqid');
const router = express.Router();





router.get('/', (req, res) => {
    var query = `
        SELECT * FROM jeniskategorilokasi
    `

    dbs.query(query, (err, rows)    =>{
        if (err) {
            console.log(err);
            res.send(err)
        } else {
            res.json(rows);
        }
    })
    
});


router.post('/add', (req, res) => {

    var query = `
    
    
    `

});














module.exports = router;