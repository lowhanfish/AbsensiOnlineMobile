const express = require('express');
var db = require('../../../../db/MySql/kinerja');
var uniqid = require('uniqid');
const router = express.Router();


const fs = require('fs');
var multer=require("multer");
var upload = require('../../../../db/multer/pdf');



router.post('/list', (req, res) => {
    // console.log('=====================================================');
    // console.log(req.body);
    let query = `
        SELECT * FROM token_integrasi WHERE uraian = 'KINERJA'
    `;
    db.query(query, (err, row)=>{
        if(err){
            console.log(err);
        } else{
            res.send(row[0])
        }
    });
})




module.exports = router;