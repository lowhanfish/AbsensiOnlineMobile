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



router.post('/view', (req, res) => {
    // console.log(req.body)
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
        jenisLokasi.hidex != 1 AND
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
        jenisLokasi.hidex != 1 AND
        jenisLokasi.uraian LIKE '%`+cari+`%' 
        ORDER BY jenisLokasi.id DESC
        LIMIT `+data_star+`,`+data_batas+`
    `

    var akses_menu = req.menu_akses
    const levelAkses = akses_menu.find(({ route }) => route === '/verifikasiLokasiAbsen');

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




router.post('/setujui', (req, res)=> {
    var query = `
        UPDATE jenisLokasi SET
        keterangan = 'Data terverifikasi',
        status = 1,
        verifikator = '`+req.user._id+`',
        verify_at =  NOW()

        WHERE id = '`+req.body.id+`'
    `;

    var akses_menu = req.menu_akses
    const levelAkses = akses_menu.find(({ route }) => route === '/verifikasiLokasiAbsen');

    if (levelAkses.updatex == 1) {

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

router.post('/kembalikan', (req, res)=> {
    var query = `
        UPDATE jenisLokasi SET
        keterangan = '`+req.body.keterangan+`',
        status = 2,
        verifikator = '`+req.user._id+`',
        verify_at =  NOW()

        WHERE id = '`+req.body.id+`'
    `;

    var akses_menu = req.menu_akses
    const levelAkses = akses_menu.find(({ route }) => route === '/verifikasiLokasiAbsen');

    if (levelAkses.updatex == 1) {
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