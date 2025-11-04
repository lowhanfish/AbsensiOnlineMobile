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


router.post('/Add', (req, res) => {
    // console.log(req.body)
    var query = `
        INSERT INTO jenisizin (uraian, keterangan, createdBy, createdAt)
        VALUES
        ('`+req.body.uraian+`', '`+req.body.keterangan+`', '`+req.user._id+`', NOW())
    `

    db.query(query, (err, row)=>{
        if (err) {
            // console.log(err)
            res.send(err);
        } else {
            // res.status(500).send('Sukses Update');
            res.send('OK');
        }
    })

});




router.post('/view', (req, res) => {

    // console.log(req.body)

    let view = `
        SELECT 
        biodata.*,

        IFNULL(absensi.jamDatang, '-') as jamDatang,
        IFNULL(absensi.jamPulang, '-') as jamPulang,
        IFNULL(absensi.status, 2) as status_id,
        IF(absensi.jamDatang = absensi.jamPulang, 'Tk', presensi.uraian) as status_uraian,
        IFNULL(absensi.keterangan, '-') as presensi_keterangan



        FROM simpeg.biodata biodata

        LEFT JOIN simpeg.jabatan jabatan
        ON biodata.jabatan = jabatan._id


        LEFT JOIN absensi.absensi absensi
        ON absensi.NIP = biodata.nip AND (absensi.dd = `+req.body.date+` AND absensi.mm = `+req.body.bulan+` AND absensi.yy = `+req.body.tahun+`) 

        LEFT JOIN absensi.presensi presensi
        ON 
        presensi.id = IFNULL(absensi.jenispresensi, 2)

        WHERE 
        biodata.unit_kerja = '`+req.body.unit_kerja_id+`' 
        ORDER BY jabatan.level
        
        
        

    `

    // absensi.dd = `+req.body.date+` AND
    //         absensi.mm = `+req.body.bulan+` AND
    //         absensi.yy = `+req.body.tahun+`
    
    db.query(view, (err, row)=>{
        if (err) {
            // console.log(err)
            res.send('err')
        } else {
            res.send(row)
        }
        
    })
});
// presensi.uraian as status_uraian,

// AND 
//         (
//             absensi.dd = `+req.body.date+` AND
//             absensi.mm = `+req.body.bulan+` AND
//             absensi.yy = `+req.body.tahun+`
//         )


router.post('/editData', (req, res)=>{
    var query = `
        UPDATE jenisizin SET
        uraian = '`+req.body.uraian+`',
        keterangan = '`+req.body.keterangan+`',
        editedBy = '`+req.user._id+`'
        
        WHERE id = `+req.body.id+`
    `;
    proses_query(query, res);
})

router.post('/removeData', (req, res)=>{
    var query = `
        DELETE FROM jenisizin
        WHERE id = `+req.body.id+`
    `;
    proses_query(query, res);
})



function proses_query(view, res){
    db.query(view, (err, row)=>{
        if(err) {
            // console.log(err);
            res.send(err);
        }else{
            res.send('ok');
        }
    })
}






module.exports = router;