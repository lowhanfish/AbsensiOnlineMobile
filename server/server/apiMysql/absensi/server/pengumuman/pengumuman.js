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

router.post('/view', (req, res) => {
    var data_batas = 8;
    var data_star = (req.body.data_ke - 1)* data_batas;
    var cari = req.body.cari_value;
    var halaman = 1; 


    let jml_data = `
        SELECT 
        pengumuman.*,
        biodata.nama as createBy
        FROM absensi.pengumuman pengumuman 
    
        LEFT JOIN egov.users users
        ON users.id = pengumuman.userId 

        LEFT JOIN simpeg.biodata biodata
        ON biodata.nip = users.nama_nip
        
        LEFT JOIN simpeg.unit_kerja unit_kerja
        ON unit_kerja.id = biodata.unit_kerja    
        WHERE 
        pengumuman.judul LIKE '%`+cari+`%' 
        OR pengumuman.isi LIKE '%`+cari+`%'
    `

    let view = `
        SELECT 
        pengumuman.*,
        unit_kerja.unit_kerja as unit_kerja_nama,
        biodata.nama as createBy
        FROM absensi.pengumuman pengumuman 
    
        LEFT JOIN egov.users users
        ON users.id = pengumuman.userId 

        LEFT JOIN simpeg.biodata biodata
        ON biodata.nip = users.nama_nip
        
        LEFT JOIN simpeg.unit_kerja unit_kerja
        ON unit_kerja.id = biodata.unit_kerja    
        WHERE 
        pengumuman.judul LIKE '%`+cari+`%' 
        OR pengumuman.isi LIKE '%`+cari+`%'
        ORDER BY pengumuman.createAt DESC
        LIMIT `+data_star+`,`+data_batas+`
    `

    var akses_menu = req.menu_akses
    const levelAkses = akses_menu.find(({ route }) => route === '/pengumuman');

    if (levelAkses.readx == 1) {
        db.query(jml_data, (err, row)=>{
            if (err) {
                res.json(err)
            }else{
                halaman = Math.ceil(row.length/data_batas);
                if(halaman<1){halaman = 1}
                // ========================
                db.query(view, (err, result)=>{
                    if (err) {res.json(err)}
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
// const levelAkses = akses_menu.find(({ route }) => route === '/pengumuman');

// if (levelAkses.readx == 1) {

// } else {
//     res.json("ANDA TIDAK MEMILIKI HAK AKSES..!!")
// }


router.post('/addData',upload.single("file"), (req,res)=>{
    console.log(req.body)
    var insert = '';
    console.log(req.file);
    
    
    var akses_menu = req.menu_akses
    const levelAkses = akses_menu.find(({ route }) => route === '/pengumuman');

    if (levelAkses.addx == 1) {

        if (req.file == undefined) {
            insert = `INSERT INTO pengumuman (id, judul, isi, unit_kerja, userId, createAt) 
            VALUES ('`+uniqid()+`' ,'`+req.body.judul+`' ,'`+req.body.isi+`' ,'`+req.body.unit_kerja+`','`+req.user._id+`' , NOW() )
            `;
        } else {
            insert = `INSERT INTO pengumuman (id, judul, isi, file, file_type, unit_kerja, userId, createAt) 
            VALUES ('`+uniqid()+`' ,'`+req.body.judul+`' ,'`+req.body.isi+`' ,"`+req.file.filename+`","`+req.file.mimetype+`" ,'`+req.body.unit_kerja+`','`+req.user._id+`' , NOW() )
            `;
            
            hapus_file(req.body.file_old);
            console.log(req.body.file_old);
        }
    
    
    
    
        db.query(insert, (err, row)=>{
            if(err) {
                console.log(err);
                res.send(err);
            }else{
                res.send(row);
            }
        })
        // console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
    } else {
        res.json("ANDA TIDAK MEMILIKI HAK AKSES..!!")
    }
    
});


router.post('/editData',upload.single("file"), (req,res)=>{
    console.log(req.body)
    console.log(req.file);


    var akses_menu = req.menu_akses
    const levelAkses = akses_menu.find(({ route }) => route === '/pengumuman');

    if (levelAkses.updatex == 1) {
        var query = '';
        if (req.file == undefined) {
            query = `
            UPDATE pengumuman SET
            judul = '`+req.body.judul+`',
            isi = '`+req.body.isi+`',
            unit_kerja = '`+req.body.unit_kerja+`',
            editeAt =  NOW()
            WHERE id = '`+req.body.id+`'
            `;
        } else {
            query = `
            UPDATE pengumuman SET
            judul = '`+req.body.judul+`',
            isi = '`+req.body.isi+`',
            file = '`+req.file.filename+`',
            file_type = "`+req.file.mimetype+`",
            unit_kerja = '`+req.body.unit_kerja+`',
            editeAt =  NOW()
            WHERE id = '`+req.body.id+`'
            `;
            
            hapus_file(req.body.file_old);
            console.log(req.body.file_old);
        }
        
        db.query(query, (err, row)=>{
            if(err) {
                console.log(err);
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
        DELETE FROM pengumuman WHERE id = '`+req.body.id+`'; 
    `;

    var akses_menu = req.menu_akses
    const levelAkses = akses_menu.find(({ route }) => route === '/pengumuman');

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
          console.error(err)
          return
        }
    })

}






module.exports = router;