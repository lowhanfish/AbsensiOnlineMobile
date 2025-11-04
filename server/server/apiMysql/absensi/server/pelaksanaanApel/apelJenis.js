const express = require('express');
var db = require('../../../../db/MySql/absensi');
const fs = require('fs');

var multer=require("multer");
var upload = require('../../../../db/multer/pdf');

var uniqid = require('uniqid');
const router = express.Router();



router.get('/', (req, res)=>{
    var queryx = `
        SELECT * FROM jenisapel
    `

    db.query(queryx, (err, row)=>{
        if (err) {
            console.log(err)
        } else {
            res.send(row)
        }
    })
})


router.get('/aa', (req, res) => {

    console.log(req.body)
    res.send('oke')

});


router.post('/Add',  (req,res)=>{
    var query = `
        INSERT INTO jenisapel (uraian,keterangan, createdBy, createdAt)
        VALUES
        (
            '`+req.body.uraian+`', '`+req.body.keterangan+`','`+req.user._id+`', NOW()
        )
    `

    var akses_menu = req.menu_akses
    const levelAkses = akses_menu.find(({ route }) => route === '/apelJenis');

    if (levelAkses.addx == 1) {
        db.query(query, (err, row)=>{
            if (err) {
                console.log(err)
                res.send(err);
            } else {
                res.send('OK');
            }
        })

    } else {
        res.json("ANDA TIDAK MEMILIKI HAK AKSES..!!")
    }




    // res.send('ok')

});




router.post('/view', (req, res) => {
    // console.log(req.body)
    var data_batas = 8;
    var data_star = (req.body.data_ke - 1)* data_batas;
    var cari = req.body.cari_value;
    var halaman = 1; 


    let jml_data = `
        SELECT 
        jenisapel.* 
        FROM absensi.jenisapel jenisapel

       
        WHERE 
        jenisapel.uraian LIKE '%`+cari+`%' 
    `

    let view = `
        SELECT 
        jenisapel.* 
        FROM absensi.jenisapel jenisapel

    
        WHERE 
        jenisapel.uraian LIKE '%`+cari+`%' 
        ORDER BY jenisapel.id DESC
        LIMIT `+data_star+`,`+data_batas+`
    `



    var akses_menu = req.menu_akses
    const levelAkses = akses_menu.find(({ route }) => route === '/apelJenis');

    if (levelAkses.readx == 1) {
        db.query(jml_data, (err, row)=>{
            if (err) {
                // console.log(err)
                res.json(err)
            }else{
                halaman = Math.ceil(row.length/data_batas);
                if(halaman<1){halaman = 1}
                // ========================
                db.query(view, (err2, result)=>{
                    if (err2) {
                        // console.log(err2)
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
        res.json("ANDA TIDAK MEMILIKI HAK AKSES..!!")
    }


});


// var akses_menu = req.menu_akses
// const levelAkses = akses_menu.find(({ route }) => route === '/apelJenis');

// if (levelAkses.readx == 1) {

// } else {
//     res.json("ANDA TIDAK MEMILIKI HAK AKSES..!!")
// }


router.post('/editData', (req,res)=>{
    // console.log(req.body);

    query = `
    UPDATE jenisapel SET
    uraian = '`+req.body.uraian+`',
    keterangan = '`+req.body.keterangan+`',
    editedBy = '`+req.user._id+`',
    editedAt =  NOW()

    WHERE id = '`+req.body.id+`'
    `;

    var akses_menu = req.menu_akses
    const levelAkses = akses_menu.find(({ route }) => route === '/apelJenis');

    if (levelAkses.updatex == 1) {

        db.query(query, (err, row)=>{
            if(err) {
                // console.log(err);
                res.send(err);
            }else{
                res.send(row);
            }
        })
        
    } else {
        res.json("ANDA TIDAK MEMILIKI HAK AKSES..!!")
    }



    // console.log(req.body);
    

    // console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
})


router.post('/removeData', (req, res)=> {
    // console.log(req.body)

    var query = `
        DELETE FROM jenisapel WHERE id = '`+req.body.id+`'; 
    `;

    var akses_menu = req.menu_akses
    const levelAkses = akses_menu.find(({ route }) => route === '/apelJenis');

    if (levelAkses.deletex == 1) {
        db.query(query, (err, row)=>{
            if(err){
                res.send(err);
            }else{
                res.send(row);
            }
        });

    } else {
        res.json("ANDA TIDAK MEMILIKI HAK AKSES..!!")
    }


})



router.post('/selectUnitKerja', (req, res)=> {
    // console.log(req.body)
    var data_batas = req.body.data_batas;
    var data_star = (req.body.data_ke - 1)* data_batas;
    var cari = req.body.cari_value;
    var halaman = 10; 


    let jml_data = `
        SELECT 
        unit_kerja.* 
        FROM simpeg.unit_kerja unit_kerja

       
        WHERE 
        unit_kerja.unit_kerja LIKE '%`+cari+`%' 
    `

    let view = `
        SELECT 
        unit_kerja.* 
        FROM simpeg.unit_kerja unit_kerja

    
        WHERE 
        unit_kerja.unit_kerja LIKE '%`+cari+`%'  
        LIMIT `+data_star+`,`+data_batas+`
    `
    db.query(jml_data, (err, row)=>{
        if (err) {
            // console.log(err)
            res.json(err)
        }else{
            halaman = Math.ceil(row.length/data_batas);
            if(halaman<1){halaman = 1}
            // ========================
            db.query(view, (err2, result)=>{
                if (err2) {
                    // console.log(err2)
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
});


router.post('/viewPesertaUnitKerja', (req, res) => {
    var cari = req.body.cari_data;

    let jml_data = `
        SELECT jenisapelpeserta.*,
        unit_kerja.unit_kerja as unit_kerja_uraian

        FROM absensi.jenisapelpeserta jenisapelpeserta
        
        LEFT JOIN simpeg.unit_kerja unit_kerja
        ON jenisapelpeserta.unit_kerja = unit_kerja.id


        WHERE jenisapel = `+req.body.id+` AND
        unit_kerja.unit_kerja LIKE '%`+cari+`%' 
    `

    db.query(jml_data, (err, row)=>{
        if (err) {
            // console.log(err)
            res.send(err)
        } else {
            res.send(row)
        }
    })
});


router.post('/addUPesertaUnitKerja', (req, res)=> {
    var data = req.body
    var unit_kerja = data.unit_kerja
    // console.log(unit_kerja.length)
    // res.send("ok")


    unit_kerja.forEach(element => {
        var query = `
            SELECT * FROM jenisapelpeserta
            WHERE jenisapel = `+data.jenisapel+` AND unit_kerja = '`+element+`'
        `;
        db.query(query, (err, row)=>{
            if(err){
                console.log(err)
            } 
            else {
                if (row.length <= 0) {
                    var query = `
                        INSERT INTO jenisapelpeserta (jenisapel, unit_kerja) VALUES
                        (
                            `+data.jenisapel+`,
                            '`+element+`'
                        )
                    `;
                    db.query(query, (err, row)=>{
                        if(err){
                            res.send(err);
                        }
                    });
                } else {
                    // console.log("data "+element+" sdh ada sebelumnya")
                }

            }
        });










        








        
    });

    res.send("OK")


});

router.post('/removePesertaUnitKerja', (req, res) => {

    let jml_data = `
        
    `

    db.query(jml_data, (err, row)=>{
        
    })
});









module.exports = router;