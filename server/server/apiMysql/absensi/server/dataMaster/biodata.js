const express = require('express');
var db = require('../../../../db/MySql/simpeg');
const router = express.Router();




router.post('/view', (req, res) => {
    // console.log(req.body)
    var data_batas = 10;
    var data_star = (req.body.data_ke - 1)* data_batas;
    var cari = req.body.cari_value;
    var halaman = 1; 

    // ====================== CEK PER-INDIVIDU BY ID ==========================
        var user_id = req.body.user_id;
        var filter_user_id = '';
        if (user_id == undefined || user_id == null || user_id == '') {
            filter_user_id = ''
        } else{
            filter_user_id =  `(biodata.id = '`+user_id+`') AND`
        }
    // ====================== CEK PER-INDIVIDU BY ID ==========================


    // ====================== CEK PER-INDIVIDU BY NIP ==========================
        var user_nip = req.body.NIP;
        var filter_user_nip = '';
        if (user_nip == undefined || user_nip == null || user_nip == '') {
            filter_user_nip = ''
        } else{
            filter_user_nip =  `(biodata.nip = '`+req.body.NIP+`') AND`
        }
    // ====================== CEK PER-INDIVIDU BY NIP ==========================
    
    // ====================== CEK UNIT KERJA ==========================
        var data_unit_kerja = req.body.unit_kerja;
        var unit_kerja = '';
        if (data_unit_kerja == undefined || data_unit_kerja == null || data_unit_kerja == '') {
            unit_kerja = ''
        } else{
            unit_kerja = data_unit_kerja
        }
    // ====================== CEK UNIT KERJA ==========================



    // ====================== MONITORING DUK SIMPEG==========================
        var filter_berdasarkan = ''
        // if (req.body.monitoring) {
        //     console.log('ada monitoring');
        //     if (req.body.filter_berdasarkan == 'JABATAN') {
        //         filter_berdasarkan = 'ORDER BY biodata.gol DESC, jabatan.esselon ASC'
        //     } else if (req.body.filter_berdasarkan == 'MASA_KERJA') {
        //         filter_berdasarkan = 'ORDER BY riwayat_kepangkatan.jns_golongan_id DESC, riwayat_kepangkatan.tmt_gol'
        //     }else{
        //         filter_berdasarkan = 'ORDER BY biodata.gol DESC, jabatan.esselon ASC'
        //     }

        // } else {
        //     filter_berdasarkan = 'ORDER BY biodata.gol DESC, jabatan.esselon ASC'
        // }
    // ====================== MONITORING DUK SIMPEG==========================


    let jml_data = `
        SELECT biodata.*,
        unit_kerja.unit_kerja as nm_unit_kerja
        FROM biodata
        
        LEFT JOIN unit_kerja
        ON biodata.unit_kerja = unit_kerja.id

        WHERE 
        biodata.unit_kerja LIKE '%`+unit_kerja+`%' AND
        (unit_kerja.unit_kerja LIKE '%`+cari+`%' 
        OR biodata.nama LIKE '%`+cari+`%') 
    `

    let view = `
        SELECT biodata.*,
        unit_kerja.unit_kerja as nm_unit_kerja,
        instansi.id as instansi_id,
        instansi.instansi,
        jabatan.jabatan as nm_jabatan,
        agama.uraian as agama_uraian,
        jns_status_keluarga.status as status_keluarga_uraian,

        riwayat_kepangkatan.jns_golongan_id,
        riwayat_kepangkatan.tmt_gol,
        CONCAT(jns_golongan.pangkat,", ", jns_golongan.gol,"/",jns_golongan.ruang) as gol_uraian,
        pendidikan_formal.strata_ijazah_id,
        pendidikan_formal.nm_sekolah as nm_sekolah,
        strata_ijazah.strata_ijazah as pendidikan_ahir_uraian,
        pendidikan_formal.thn_lulus as pendidikan_formal_thn_lulus

        FROM biodata
        
        LEFT JOIN unit_kerja
        ON biodata.unit_kerja = unit_kerja.id

        LEFT JOIN instansi
        ON unit_kerja.instansi = instansi.id

        LEFT JOIN jabatan
        ON biodata.jabatan = jabatan._id

        LEFT JOIN agama
        ON biodata.agama = agama.agama_id

        LEFT JOIN jns_status_keluarga
        ON biodata.status_keluarga = jns_status_keluarga.jns_status_keluarga_id


        LEFT JOIN riwayat_kepangkatan
        ON biodata.id = riwayat_kepangkatan.biodata_id 
        AND
        riwayat_kepangkatan.jns_golongan_id = (
            SELECT MAX(jns_golongan_id) 
            FROM riwayat_kepangkatan 
            WHERE biodata_id = biodata.id
        )

        LEFT JOIN jns_golongan
        ON jns_golongan.jns_golongan_id = riwayat_kepangkatan.jns_golongan_id


        LEFT JOIN pendidikan_formal
        ON biodata.id = pendidikan_formal.biodata_id 
        AND
        pendidikan_formal.strata_ijazah_id = (
            SELECT MIN(strata_ijazah_id) 
            FROM pendidikan_formal 
            WHERE biodata_id = biodata.id
        )

        LEFT JOIN strata_ijazah
        ON pendidikan_formal.strata_ijazah_id = strata_ijazah.strata_ijazah_id

        WHERE 
        (biodata.unit_kerja LIKE '%`+unit_kerja+`%') AND
        `+filter_user_id+`
        `+filter_user_nip+`
        (unit_kerja.unit_kerja LIKE '%`+cari+`%' 
        OR biodata.nama LIKE '%`+cari+`%')

        `+filter_berdasarkan+`
         
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
            db.query(view, (err1, result)=>{
                if (err1) {console.log(err1); res.json(err1)}
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





router.post('/list', (req, res) => {
    let view = ` 
        SELECT 
            biodata.id,
            biodata.nama,
            biodata.unit_kerja,
            biodata.nip,
            unit_kerja.unit_kerja as ref_unit_kerja
        FROM biodata
        LEFT JOIN unit_kerja
            ON biodata.unit_kerja = unit_kerja.id
            WHERE biodata.unit_kerja = '`+req.body.unit_kerja+`';
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