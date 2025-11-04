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


router.post('/Add', (req, res) => {
    console.log(req.body)
    var datac = req.body;

    
    datac.forEach((data, index) => {

        var tglfully = data.yy+"-"+data.mm+"-"+data.dd

        var query = `
            INSERT INTO waktulibur (dd, mm, yy, tglFull, keterangan, createdBy, createdAt)
            VALUES
            (`+data.dd+`,`+data.mm+`, `+data.yy+`, '`+tglfully+`', '`+data.keterangan+`', '`+req.user._id+`', NOW())
        `


        var akses_menu = req.menu_akses
        const levelAkses = akses_menu.find(({ route }) => route === '/waktuLibur');

        if (levelAkses.addx == 1) {
            db.query(query, (err, row)=>{
                if (err) {
                    console.log(err)
                    res.send(err);
                } else {
                    // res.status(500).send('Sukses Update');
                    // res.send('OK');
                    console.log("Sukses menambahkan data waktu libur ke : "+(index+1))
                }
            })
        } else {
            res.json("ANDA TIDAK MEMILIKI HAK AKSES..!!")
        }
    
        
    });



    res.send('OK')

});




router.post('/view', (req, res) => {

    

    // console.log(req.body)
    var data_batas = 6;
    var data_star = (req.body.data_ke - 1)* data_batas;
    var cari = req.body.cari_value;
    var halaman = 1; 


    let jml_data = `
        SELECT 
        waktulibur.* FROM waktulibur
        WHERE 
        waktulibur.keterangan LIKE '%`+cari+`%' 
    `

    let view = `
        SELECT 
        waktulibur.*  FROM waktulibur
        WHERE 
        waktulibur.keterangan LIKE '%`+cari+`%' 
        ORDER BY waktulibur.yy, waktulibur.mm, waktulibur.dd ASC
        LIMIT `+data_star+`,`+data_batas+`
    `


    var akses_menu = req.menu_akses
    const levelAkses = akses_menu.find(({ route }) => route === '/waktuLibur');

    console.log(levelAkses);

    if (levelAkses.readx == 1) {

        console.log("ANDA MEMILIKI HAK AKSES..!!");


        db.query(jml_data, (err, row)=>{
            if (err) {
                console.log(err)
                res.json(err)
            }else{
                halaman = Math.ceil(row.length/data_batas);
                if(halaman<1){halaman = 1}
                // ========================
                db.query(view, (err2, result)=>{
                    if (err2) {
                        console.log(err2)
                        res.json(err)
                    }
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
    } else {
        console.log("ANDA TIDAK MEMILIKI HAK AKSES..!!");
        res.json("ANDA TIDAK MEMILIKI HAK AKSES..!!")
    }


    
});


router.post('/editData', (req, res)=>{

    var query = `
        UPDATE waktulibur SET
        uraian = '`+req.body.uraian+`',
        startDatang = '`+req.body.startDatang+`',
        finishDatang = '`+req.body.finishDatang+`',
        startPulang = '`+req.body.startPulang+`',
        finishPulang = '`+req.body.finishPulang+`',
        keterangan = '`+req.body.keterangan+`',
        editedBy = '`+req.user._id+`',
        editedAt = NOW()
        
        WHERE id = `+req.body.id+`
    `;



    var akses_menu = req.menu_akses
    const levelAkses = akses_menu.find(({ route }) => route === '/waktuLibur');

    if (levelAkses.updatex == 1) {
        proses_query(query, res);
    } else {
        res.json("ANDA TIDAK MEMILIKI HAK AKSES..!!")
    }

})

router.post('/removeData', (req, res)=>{
    var query = `
        DELETE FROM waktulibur
        WHERE id = `+req.body.id+`
    `;


    var akses_menu = req.menu_akses
    const levelAkses = akses_menu.find(({ route }) => route === '/waktuLibur');

    if (levelAkses.deletex == 1) {
        proses_query(query, res);
    } else {
        res.json("ANDA TIDAK MEMILIKI HAK AKSES..!!")
    }



})


    // var akses_menu = req.menu_akses
    // const levelAkses = akses_menu.find(({ route }) => route === '/waktuLibur');

    // if (levelAkses.updatex == 1) {
        
    // } else {
    //     res.json("ANDA TIDAK MEMILIKI HAK AKSES..!!")
    // }



function proses_query(view, res){
    db.query(view, (err, row)=>{
        if(err) {
            console.log(err);
            res.send(err);
        }else{
            res.send('ok');
        }
    })
}






module.exports = router;