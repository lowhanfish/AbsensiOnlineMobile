const express = require('express');
const router = express.Router();
var db = require('../db/MySql/utama');


router.get('/', (req, res)=>{

    let view = `
        SELECT 
        menu_klp_list.*,
        menu.route
        FROM menu_klp_list
        JOIN menu
        ON menu_klp_list.menu_id = menu.id
 
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



router.post('/view', (req, res)=>{


    console.log(req.body);

    console.log("Saya di panggil");

    var profile_absensi = parseInt(req.body.profile_absensi)

    let view = `
        SELECT 
        menu_klp_list.*,
        menu.route
        FROM menu_klp_list
        JOIN menu
        ON menu_klp_list.menu_id = menu.id
        WHERE menu_klp_list.menu_klp_id = `+profile_absensi+`
 
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
