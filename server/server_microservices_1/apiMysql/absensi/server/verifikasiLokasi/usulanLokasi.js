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
    // console.log(req.file.filename)
    var query = `
        INSERT INTO jenisLokasi (uraian, jeniskategorilokasi, lat, lng, rad, keterangan, status, file, unit_kerja, createdBy, createdAt)
        VALUES
        (
            '`+req.body.uraian+`', `+req.body.jeniskategorilokasi+`,`+req.body.lat+`,`+req.body.lng+`,`+req.body.rad+`,'`+req.body.keterangan+`',0,'`+ req.file.filename +`','`+req.body.unit_kerja+`','`+req.user._id+`', NOW()
        )
    `


    var akses_menu = req.menu_akses
    const levelAkses = akses_menu.find(({ route }) => route === '/usulanLokasiAbsen');

    if (levelAkses.addx == 1) {
        db.query(query, (err, row)=>{
            if (err) {
                // console.log(err)
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
    // console.log('eaaaaaaaaaaaaaaaaaaaaa')
    var data_batas = 10;
    var data_star = (req.body.data_ke - 1)* data_batas;
    var cari = req.body.cari_value;
    var halaman = 1; 


    let jml_data = `
        SELECT 
        jenisLokasi.* 
        FROM absensi.jenisLokasi jenisLokasi

        JOIN egov.users users
        ON jenisLokasi.createdBy = users.id

        JOIN simpeg.biodata biodata
        ON users.nama_nip = biodata.nip

        JOIN simpeg.unit_kerja unit_kerja
        ON jenisLokasi.unit_kerja = unit_kerja.id


        WHERE 
        (jenisLokasi.hidex != 1 AND
        jenisLokasi.unit_kerja = '`+req.body.unit_kerja+`') AND
        jenisLokasi.uraian LIKE '%`+cari+`%'
    `

    let view = `
        SELECT 
        jenisLokasi.*,
        biodata.nama as biodata_nama,
        biodata.nip as biodata_nip,
        unit_kerja.unit_kerja as unit_kerja_unit_kerja,
        jeniskategorilokasi.uraian as jeniskategorilokasi_uraian,


        biodatax.nama as verifikator_nama,
        biodatax.gelar_depan as verifikator_gelar_depan,
        biodatax.gelar_belakang as verifikator_gelar_belakang



        FROM absensi.jenisLokasi jenisLokasi

        JOIN egov.users users
        ON jenisLokasi.createdBy = users.id

        JOIN simpeg.biodata biodata
        ON users.nama_nip = biodata.nip

        JOIN simpeg.unit_kerja unit_kerja
        ON jenisLokasi.unit_kerja = unit_kerja.id

        JOIN absensi.jeniskategorilokasi jeniskategorilokasi
        ON jeniskategorilokasi.id = jenisLokasi.jeniskategorilokasi



        LEFT JOIN egov.users usersx
        ON jenisLokasi.verifikator = usersx.id

        LEFT JOIN simpeg.biodata biodatax
        ON usersx.nama_nip = biodatax.nip

        WHERE 
        (jenisLokasi.hidex != 1 AND
        jenisLokasi.unit_kerja = '`+req.body.unit_kerja+`') AND
        jenisLokasi.uraian LIKE '%`+cari+`%' 
        ORDER BY jenisLokasi.id DESC
        LIMIT `+data_star+`,`+data_batas+`
    `

    var akses_menu = req.menu_akses
    const levelAkses = akses_menu.find(({ route }) => route === '/usulanLokasiAbsen');

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


router.post('/editData',upload.single("file"), (req,res)=>{
    // console.log(req.body);
    var query = '';



    var akses_menu = req.menu_akses
    const levelAkses = akses_menu.find(({ route }) => route === '/usulanLokasiAbsen');

    if (levelAkses.updatex == 1) {

        if (req.file == undefined) {
            query = `
            UPDATE jenisLokasi SET
            uraian = '`+req.body.uraian+`',
            jeniskategorilokasi = `+req.body.jeniskategorilokasi+`,
            lat = `+req.body.lat+`,
            lng = `+req.body.lng+`,
            rad = `+req.body.rad+`,
            keterangan = '`+req.body.keterangan+`',
            status = 0,
            editedBy = '`+req.user._id+`',
            editedAt =  NOW()
    
            WHERE id = '`+req.body.id+`'
            `;
        } else {
            query = `
            UPDATE jenisLokasi SET
            uraian = '`+req.body.uraian+`',
            jeniskategorilokasi = `+req.body.jeniskategorilokasi+`,
            lat = `+req.body.lat+`,
            lng = `+req.body.lng+`,
            rad = `+req.body.rad+`,
            keterangan = '`+req.body.keterangan+`',
            status = 0,
            editedBy = '`+req.user._id+`',
            file = '`+req.file.filename+`',
            editedAt =  NOW()
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


// var akses_menu = req.menu_akses
// const levelAkses = akses_menu.find(({ route }) => route === '/usulanLokasiAbsen');

// if (levelAkses.readx == 1) {

// } else {
//     res.json("ANDA TIDAK MEMILIKI HAK AKSES..!!")
// }



router.post('/removeData', (req, res)=> {
    var file = req.body.file
    hapus_file(file);

    var query = `
        DELETE FROM jenisLokasi WHERE id = '`+req.body.id+`'; 
    `;

    var akses_menu = req.menu_akses
    const levelAkses = akses_menu.find(({ route }) => route === '/usulanLokasiAbsen');

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