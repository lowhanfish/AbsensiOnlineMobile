const express = require('express');
var db = require('../../../../db/MySql/absensi');
const fs = require('fs');

var multer=require("multer");
var upload = require('../../../../db/multer/pdf');

var uniqid = require('uniqid');
const router = express.Router();





router.get('/aa', (req, res) => {

    // console.log(req.body)
    res.send('oke')

});


router.post('/Add', upload.single("file"), (req,res)=>{
    // console.log(req.body)
    var tglx = req.body.tgl;
    var tgl = tglx.split("/");


    var akses_menu = req.menu_akses
    const levelAkses = akses_menu.find(({ route }) => route === '/apelPelaksanaan');

    if (levelAkses.addx == 1) {
    
        if (req.file == undefined) {
            var query = `
                INSERT INTO jadwalapel (jenisapel, uraian, startAbsen, batasAbsen, lat, lng, rad, tgl, dd, mm, yy, keterangan, unit_kerja, createdBy, createdAt)
                VALUES
                (
                    `+req.body.jenisapel+`, 
                    '`+req.body.uraian+`',
                    '`+req.body.startAbsen+`',
                    '`+req.body.batasAbsen+`',
                    `+req.body.lat+`,
                    `+req.body.lng+`,
                    `+req.body.rad+`,
                    '`+req.body.tgl+`',
                    `+tgl[2]+`,
                    `+tgl[1]+`,
                    `+tgl[0]+`,
                    '`+req.body.keterangan+`',
                    '`+req.body.unit_kerja+`',
                    '`+req.user._id+`', 
                    NOW()
                )
            `
        } else {
            var query = `
                INSERT INTO jadwalapel (jenisapel, uraian, startAbsen, batasAbsen, lat, lng, rad, tgl, dd, mm, yy, keterangan, file, unit_kerja, createdBy, createdAt)
                VALUES
                (
                    `+req.body.jenisapel+`, 
                    '`+req.body.uraian+`',
                    '`+req.body.startAbsen+`',
                    '`+req.body.batasAbsen+`',
                    `+req.body.lat+`,
                    `+req.body.lng+`,
                    `+req.body.rad+`,
                    '`+req.body.tgl+`',
                    `+tgl[2]+`,
                    `+tgl[1]+`,
                    `+tgl[0]+`,
                    '`+req.body.keterangan+`',
                    '`+ req.file.filename +`',
                    '`+req.body.unit_kerja+`',
                    '`+req.user._id+`', 
                    NOW()
                )
            `
        }
        
    
        // console.log(query)
    
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



// var akses_menu = req.menu_akses
// const levelAkses = akses_menu.find(({ route }) => route === '/apelPelaksanaan');

// if (levelAkses.readx == 1) {

// } else {
//     res.json("ANDA TIDAK MEMILIKI HAK AKSES..!!")
// }




router.post('/view', (req, res) => {
    // console.log(req.body)
    var data_batas = 10;

    if (req.body.page_limit == null || req.body.page_limit == undefined || req.body.page_limit == '') {
        data_batas = 10
    } else {
        data_batas = req.body.page_limit
    }



    var data_star = (req.body.data_ke - 1)* data_batas;
    var cari = req.body.cari_value;
    var halaman = 1; 

    let jml_data = `
        SELECT 
        jadwalapel.* 
        FROM absensi.jadwalapel jadwalapel

        JOIN egov.users users
        ON jadwalapel.createdBy = users.id

        JOIN simpeg.biodata biodata
        ON users.nama_nip = biodata.nip

        JOIN simpeg.unit_kerja unit_kerja
        ON jadwalapel.unit_kerja = unit_kerja.id


        WHERE 
        jadwalapel.uraian LIKE '%`+cari+`%' 
    `

    let view = `
        SELECT 
        jadwalapel.*,
        jenisapel.uraian as jenisapel_uraian, 
        biodata.nama as biodata_nama,
        biodata.nip as biodata_nip,
        unit_kerja.unit_kerja as unit_kerja_unit_kerja



        FROM absensi.jadwalapel jadwalapel

        LEFT JOIN absensi.jenisapel jenisapel
        ON jadwalapel.jenisapel = jenisapel.id

        LEFT JOIN egov.users users
        ON jadwalapel.createdBy = users.id

        LEFT JOIN simpeg.biodata biodata
        ON users.nama_nip = biodata.nip

        LEFT JOIN simpeg.unit_kerja unit_kerja
        ON jadwalapel.unit_kerja = unit_kerja.id


        WHERE 
        jadwalapel.uraian LIKE '%`+cari+`%' 
        ORDER BY jadwalapel.id DESC
        LIMIT `+data_star+`,`+data_batas+`
    `

    var akses_menu = req.menu_akses
    const levelAkses = akses_menu.find(({ route }) => route === '/apelPelaksanaan');

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



router.post('/viewList', (req, res) => {
    // console.log(req.body)
    var data_batas = 10;
    if (req.body.page_limit == null || req.body.page_limit == undefined || req.body.page_limit == '') {
        data_batas = 10
    } else {
        data_batas = req.body.page_limit
    }

    var data_star = (req.body.data_ke - 1)* data_batas;
    var cari = req.body.cari_value;
    var halaman = 1; 

    let jml_data = `
        SELECT 
        jadwalapel.* 
        FROM absensi.jadwalapel jadwalapel

        JOIN egov.users users
        ON jadwalapel.createdBy = users.id

        JOIN simpeg.biodata biodata
        ON users.nama_nip = biodata.nip

        JOIN simpeg.unit_kerja unit_kerja
        ON jadwalapel.unit_kerja = unit_kerja.id


        WHERE 
        jadwalapel.uraian LIKE '%`+cari+`%' 
    `

    let view = `
        SELECT 
        jadwalapel.*,
        jenisapel.uraian as jenisapel_uraian, 
        biodata.nama as biodata_nama,
        biodata.nip as biodata_nip,
        unit_kerja.unit_kerja as unit_kerja_unit_kerja



        FROM absensi.jadwalapel jadwalapel

        LEFT JOIN absensi.jenisapel jenisapel
        ON jadwalapel.jenisapel = jenisapel.id

        LEFT JOIN egov.users users
        ON jadwalapel.createdBy = users.id

        LEFT JOIN simpeg.biodata biodata
        ON users.nama_nip = biodata.nip

        LEFT JOIN simpeg.unit_kerja unit_kerja
        ON jadwalapel.unit_kerja = unit_kerja.id


        WHERE 
        jadwalapel.uraian LIKE '%`+cari+`%' 
        ORDER BY jadwalapel.id DESC
        LIMIT `+data_star+`,`+data_batas+`
    `


    // var akses_menu = req.menu_akses
    // const levelAkses = akses_menu.find(({ route }) => route === '/apelPelaksanaan');

    // if (levelAkses.readx == 1) {

    // } else {
    //     res.json("ANDA TIDAK MEMILIKI HAK AKSES..!!")
    // }



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


router.post('/editData',upload.single("file"), (req,res)=>{


    var tglx = req.body.tgl;
    var tgl = tglx.split("/");



    // console.log(req.body);
    var query = '';
    
    
    var akses_menu = req.menu_akses
    const levelAkses = akses_menu.find(({ route }) => route === '/apelPelaksanaan');
    
    if (levelAkses.updatex == 1) {
        if (req.file == undefined) {
            query = `
            UPDATE jadwalapel SET
            jenisapel = `+req.body.jenisapel+`,
            uraian = '`+req.body.uraian+`',
            startAbsen = '`+req.body.startAbsen+`',
            batasAbsen = '`+req.body.batasAbsen+`',
            lat = `+req.body.lat+`,
            lng = `+req.body.lng+`,
            rad = `+req.body.rad+`,
            tgl = '`+req.body.tgl+`',
            dd = `+tgl[2]+`,
            mm =`+tgl[1]+`,
            yy = `+tgl[0]+`,
            keterangan = '`+req.body.keterangan+`',
            editedBy = '`+req.user._id+`',
            editedAt =  NOW()
    
            WHERE id = '`+req.body.id+`'
            `;
        } else {
            query = `
            UPDATE jadwalapel SET
            jenisapel = `+req.body.jenisapel+`,
            uraian = '`+req.body.uraian+`',
            startAbsen = '`+req.body.startAbsen+`',
            batasAbsen = '`+req.body.batasAbsen+`',
            lat = `+req.body.lat+`,
            lng = `+req.body.lng+`,
            rad = `+req.body.rad+`,
            tgl = '`+req.body.tgl+`',
            dd = `+tgl[2]+`,
            mm =`+tgl[1]+`,
            yy = `+tgl[0]+`,
            keterangan = '`+req.body.keterangan+`',
            file = '`+req.file.filename+`',
            editedBy = '`+req.user._id+`',
            editedAt =  NOW()
            WHERE id = '`+req.body.id+`'
            `;
            
            hapus_file(req.body.file_old);
            // console.log(req.body.file_old);
        }

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
    var file = req.body.file
    hapus_file(file);

    var query = `
        DELETE FROM jadwalapel WHERE id = '`+req.body.id+`'; 
    `;

    var akses_menu = req.menu_akses
    const levelAkses = akses_menu.find(({ route }) => route === '/apelPelaksanaan');

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


function hapus_file(file){
    const path = 'uploads/'+file;

    fs.unlink(path, (err) => {
        if (err) {
        //   console.error(err)
          return
        }
    })

}




module.exports = router;