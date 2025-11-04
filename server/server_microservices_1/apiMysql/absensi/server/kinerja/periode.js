const express = require('express');
var db = require('../../../../db/MySql/kinerja');
var uniqid = require('uniqid');
const router = express.Router();


const fs = require('fs');
var multer=require("multer");
var upload = require('../../../../db/multer/pdf');


router.get('/', (req, res) => {
    var view = `
        SELECT 
        worksheet.*
        FROM worksheet
    `

    db.query(view, (err, rows)=>{
        cek_error(res, err, rows)
    })
});


router.post('/view', (req, res) => {


    let queryz = `
        SELECT periode.*,
        biodata.nama as nama,
        biodata.gelar_depan as gelar_depan,
        biodata.gelar_belakang as gelar_belakang
        FROM 
        kinerja2022.periode periode

        LEFT JOIN simpeg.biodata biodata
        ON periode.nip = biodata.nip



        WHERE
        periode.nip = '`+req.body.nip+`' AND 
        periode.uraian LIKE '%`+req.body.cari_value+`%' 
    `;

    db.query(queryz, (err, row)=>{
        cek_error(res, err, row);
    })

   
});


router.post('/addData',upload.array("file",12), (req,res)=>{





    let insert = `INSERT INTO periode 
        (
            uraian, 
            tahun, 
            dari, 
            sampai,
            nip,
            keterangan,
            creatdBy,
            creatdAt
        )
        VALUES
        (
            '`+ req.body.uraian +`',
            `+req.body.tahun+`,
            '`+req.body.dari+`',
            '`+req.body.sampai+`',
            '`+req.body.nip+`',
            '`+req.body.keterangan+`',
            '`+req.user._id+`',
            NOW()
        );
    `

    db.query(insert, (err, row)=>{
        if(err) {
            console.log(err);
            res.send(err);
        }else{
            res.send(row)
        }
    })
    // console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
});

router.post('/editData', (req, res) => {
    console.log(req.body);
    var update = `
        UPDATE periode SET
        uraian = '`+ req.body.uraian +`',
        tahun = '`+req.body.tahun+`',
        dari = '`+req.body.dari+`',
        sampai = '`+req.body.sampai+`',
        nip = `+req.body.nip+`,
        keterangan = '`+req.body.keterangan+`',
        editedBy = '`+req.user._id+`',
        editedAt = NOW()

        WHERE id = `+req.body.id+`
    `;

    db.query(update, (err, row)=>{
        cek_error(res, err, row);
    })

})

router.post('/removeData', (req, res)=> {
    let query = `
        DELETE FROM periode WHERE id = `+req.body.id+`;
    `;
    db.query(query, (err, row)=>{
        cek_error(res, err, row);
    });
})

router.post('/list', (req, res) => {
    // console.log('=====================================================');
    console.log(req.body);
    let query = `
        SELECT * FROM periode WHERE nip = '`+req.body.nip+`'
    `;
    db.query(query, (err, row)=>{
        cek_error(res, err, row);
    });
})



router.post('/getLamp', (req, res) => {

    console.log(req.body)

    let queryz = `
        SELECT * 
        FROM lampiran  
        WHERE lampiran.ref = `+req.body.ref+` 
    `;

    db.query(queryz, (err, row)=>{
        cek_error(res, err, row);
    })

   
});



router.post('/removeDataLamp', (req, res)=> {
    let query = `
        DELETE FROM lampiran WHERE id = `+req.body.id+`;
    `;
    db.query(query, (err, row)=>{
        if (err) {
            console.log(err)
            res.send(err)
        } else {
            hapus_file(req.body.file)
            res.send("OK")
        }
    });
})





function cek_error(res, err, rows){
    if(err) {
        console.log(err);
        res.send(err);
    }else{
        res.send(rows);
    }

}



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