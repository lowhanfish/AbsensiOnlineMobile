const express = require('express');
var db = require('../db/MySql/utama');
const router = express.Router();
const libIzin = require('./library/izin');



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



// var akses_menu = req.menu_akses
// const levelAkses = akses_menu.find(({ route }) => route === '/verivikasiPermohonanDarurat');

// if (levelAkses.readx == 1) {

// } else {
//     res.json("ANDA TIDAK MEMILIKI HAK AKSES..!!")
// }




router.get('/', async (req, res)=>{

    
    res.send("SUKSES")


})








module.exports = router;