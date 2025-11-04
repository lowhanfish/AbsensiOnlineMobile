const express = require('express');
var db = require('../../../../db/MySql/absensi');

const router = express.Router();


router.post('/view', (req, res) => {
    var data_batas = 8;


    if (req.body.page_limit == null || req.body.page_limit == undefined || req.body.page_limit == '') {
        data_batas = 8;
    } else {
        data_batas = req.body.page_limit;
    }




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
});




module.exports = router;