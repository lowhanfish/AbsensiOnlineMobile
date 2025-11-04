const express = require('express');
var db = require('../../../../db/MySql/kinerja');
var uniqid = require('uniqid');
const router = express.Router();


router.get('/', (req, res) => {
    var view = `
        SELECT 
        ku_ra_strategis_indikator.*
        FROM ku_ra_strategis_indikator
    `

    db.query(view, (err, rows)=>{
        cek_error(res, err, rows)
    })
});

router.post('/view', (req, res) => {
    var data_batas = 10;
    var data_star = (req.body.data_ke - 1)* data_batas;
    var cari = req.body.cari_value;
    var halaman = 1;

    let jml_data = ` 
        SELECT * 
        FROM ku_ra_strategis_indikator  
        WHERE ku_ra_strategis_indikator.tahun = `+req.body.tahun+` AND 
        ku_ra_strategis_indikator.uraian LIKE '%`+cari+`%' `;

    let view = `
        SELECT * FROM ku_ra_strategis_indikator
        WHERE ku_ra_strategis_indikator.tahun = `+req.body.tahun+` AND  
        ku_ra_strategis_indikator.uraian LIKE '%`+cari+`%' 
        LIMIT `+data_star+`,`+data_batas+`
    `;

    db.query(jml_data, (err, row)=>{
        if (err) {
            console.log(err);
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
                        jml_data : halaman,
                        total:row.length,
                    })
                }
            })
            // ========================

        }
    })
});


router.post('/view2', (req, res) => {

    // console.log(req.body)

    let queryz = `
        SELECT * 
        FROM ku_ra_strategis_indikator  
        WHERE ku_ra_strategis_indikator.pk_unit_sasaran = `+req.body.pk_unit_sasaran+` 
    `;

    db.query(queryz, (err, row)=>{
        cek_error(res, err, row);
    })

   
});

router.post('/addData', (req,res)=>{
    // console.log(req.body)
    let insert = `INSERT INTO ku_ra_strategis_indikator 
        (
            ku_ra_strategis, 
            uraian, 
            target,
            satuan,
            tahun,
            keterangan,
            creatdBy,
            creatdAt
        )
        VALUES
        (
            `+req.body.pk_unit_sasaran+`,
            '`+req.body.uraian+`',
            `+req.body.target+`,
            '`+req.body.satuan+`',
            `+req.body.tahun+`,
            '`+req.body.keterangan+`',
            '`+req.user._id+`',
            NOW()
        );
    `

    db.query(insert, (err, row)=>{
        cek_error(res, err, row);
    })
});

router.post('/editData', (req, res) => {
    // console.log(req.body);
    var update = `
        UPDATE ku_ra_strategis_indikator SET
        uraian = '`+req.body.uraian+`',
        target = `+req.body.target+`,
        satuan = '`+req.body.satuan+`',
        tahun = `+req.body.tahun+`,
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
        DELETE FROM ku_ra_strategis_indikator WHERE id = `+req.body.id+`;
    `;
    db.query(query, (err, row)=>{
        cek_error(res, err, row);
    });
})

router.get('/list', (req, res)=> {
    let query = `
        SELECT * FROM ku_ra_strategis_indikator
    `;
    db.query(query, (err, row)=>{
        cek_error(res, err, row);
    });
})


router.post('/list', (req, res)=> {
    // DI PAKE UNTUK APLIKASI (TAMBAHKAN):
    // 1. Absensi (Android)





    let query = `
        SELECT ku_ra_strategis_indikator.* 
        FROM ku_ra_strategis_indikator
        
        JOIN ku_ra_strategis
        ON ku_ra_strategis_indikator.ku_ra_strategis = ku_ra_strategis.id

        JOIN pk_unit_sasaran_indikator
        ON ku_ra_strategis.pk_unit_sasaran_indikator = pk_unit_sasaran_indikator.id

        JOIN pk_unit_sasaran
        ON pk_unit_sasaran_indikator.pk_unit_sasaran = pk_unit_sasaran.id

        WHERE ku_ra_strategis_indikator.creatdBy = '`+req.user._id+`'
    `;
    db.query(query, (err, row)=>{
        cek_error(res, err, row);
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


module.exports = router;