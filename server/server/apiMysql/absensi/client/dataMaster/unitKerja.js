const express = require('express');
var db = require('../../../../db/MySql/absensi');
const router = express.Router();





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
});


router.get('/list', (req, res) => {
    // console.log(req.body)
    var query = `
        SELECT * FROM simpeg.unit_kerja unit_kerja
    `

    db.query(query, (err, row)=>{
        if (err) {
            console.log(err)
            res.send(err);
        } else {
            res.send(row);
        }
    })

});


router.post('/autocomplete_unit_kerja_full', (req, res) => {

    // console.log(req.body)
    var byID = ''

    if (req.body.unit_kerja_id == null || req.body.unit_kerja_id == undefined || req.body.unit_kerja_id == '') {
        byID = ''
    } else {
        byID = `unit_kerja.id = '`+req.body.unit_kerja_id+`' AND `
    }

    let view = ` 
    SELECT 
        unit_kerja.id,
        unit_kerja.kode,
        unit_kerja.unit_kerja, 
        instansi.id as instansi_id,
        instansi.instansi as ref_instansi

    FROM simpeg.unit_kerja unit_kerja 
    JOIN simpeg.instansi instansi 
    ON unit_kerja.instansi = instansi.id

    WHERE 
    `+byID+`
    unit_kerja.unit_kerja LIKE '%`+req.body.unit_kerja+`%'
    LIMIT 10
    `;

    db.query(view, (err, row)=>{
        if (err) {
            res.json(err)
        }else{
            res.json(row)
        }
    })


});








module.exports = router;