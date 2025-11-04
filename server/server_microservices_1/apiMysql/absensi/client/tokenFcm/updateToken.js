const express = require('express');
var db = require('../../../../db/MySql/absensi');
const fs = require('fs');

var multer=require("multer");
var upload = require('../../../../db/multer/pdf');

var uniqid = require('uniqid');
const router = express.Router();





router.post('/add', (req, res) => {
    // console.log(req.body);
    data = req.body;

    if (data.token_fcm == '' || data.token_fcm == undefined || data.token_fcm == null) {
        res.send('OK');
    } else {
        var query = `
            SELECT token_fcm.id FROM token_fcm WHERE token_fcm.token_fcm = '`+req.body.token_fcm+`'
        `

        // ========================
        db.query(query, (err2, rows)=>{
            if (err2) {
                console.log(err2)
                res.json(err2)
            }
            else{
            
                if (rows.length <= 0) {
                    addToken(req, res);
                } else {
                    // console.log(("Token sudah ada"))
                    res.send("Token sudah ada");
                }
            }
        })
        // ========================
    }
});


function addToken(req, res){
    var query = `
        INSERT INTO token_fcm (NIP, token_fcm) VALUES ('`+req.body.NIP+`', '`+req.body.token_fcm+`')
    `

    // ========================
    db.query(query, (err2, rows)=>{
        if (err2) {
            console.log(err2)
            res.json(err2)
        }
        else{
          res.json(rows)
        }
    })
    // ========================
}


router.post('/removex', (req, res) => {
    // console.log('INI TOKEN')
    // console.log(req.body);
    var query = `
        DELETE FROM token_fcm WHERE token_fcm = '`+req.body.token_fcm+`'
    `

    // ========================
    db.query(query, (err2, rows)=>{
        if (err2) {
            console.log(err2)
            res.json(err2)
        }
        else{
            console.log("TOken di hapus")
          res.json(rows)
        }
    })
    // ========================
});







module.exports = router;