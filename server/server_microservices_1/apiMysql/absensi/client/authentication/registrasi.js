const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
var uniqid = require('uniqid');
var db = require('../../../../db/MySql/egov');



const router = express.Router();


router.post('/aa', (req, res) => {
    // console.log(req.body)
    res.send('oke')
});






router.post('/editData', (req, res) => {

    // console.log(req.body)
    // console.log("ASSSSSSSSSSSSSSSUU")
    var query = `
        UPDATE users SET

        absensi = '`+req.body.menu_klp+`',
        username = '`+req.body.username+`',
        email = '`+req.body.email+`',
        hp = '`+req.body.hp+`',
        unit_kerja = '`+req.body.unit_kerja+`'


        WHERE id = '`+req.body.id+`'
    `
    db.query(query, (err, row)=>{
        if (err) {
            // console.log(err);
            res.send(err);
        } else {
            // console.log('Sukses mengubah data');
            res.send(row);
        }
    })
})



router.post('/editDataPass', (req, res) => {

    bcrypt.hash(req.body.password.trim(), 12).then(hashedPassword => {

        const query = `
            UPDATE users SET

            password = '`+hashedPassword+`'
            WHERE id = '`+req.body.id+`'
        `

        db.query(query, (err, row) => {
            if (err) {
                // console.log(err)
                res.send('Gagal dalam meregistrasi ');
            }else{
                // console.log('suksesssssssssssssssss')
                res.send(row);
            }
        })

    });

   
})



router.post('/removeData', (req, res) => {
    // console.log(req.body)
    var query = `
        DELETE FROM users WHERE id = '`+ req.body.id + `';
    `;

    // console.log(query)
    db.query(query, (err, row) => {
        if (err) {
            // console.log(er)
            res.send(err);
        } else {
            // console.log('sukses menghapus')
            res.send(row);
        }
    });
})



const schema = Joi.object().keys({
    username: Joi.string().regex(/^[a-zA-Z0-9_]*$/).min(3).max(14).required(),
    password: Joi.string().min(6).required(),
});



module.exports = router;