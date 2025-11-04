const express = require('express');
var db = require('../../../../db/MySql/absensi');
const fs = require('fs');

var multer=require("multer");
var upload = require('../../../../db/multer/pdf');

var uniqid = require('uniqid');
const router = express.Router();

const libIzin = require('../../../library/izin');
const umum = require('../../../library/umum');



router.get('/aass', (req, res) => {

    var query = `
        SELECT usulanizin.*,
        jenisizin.uraian as jenisizin_uraian,
        biodata.nama as biodata_nama,
        biodata.gelar_belakang as biodata_gelar_belakang,
        biodata.gelar_depan as biodata_gelar_depan,
        unit_kerja.unit_kerja as unit_kerja_uraian

        FROM absensi.usulanizin usulanizin

        LEFT JOIN simpeg.biodata biodata
        ON usulanizin.NIP = biodata.nip

        LEFT JOIN simpeg.unit_kerja unit_kerja
        ON usulanizin.unit_kerja = unit_kerja.id

        LEFT JOIN absensi.jenisizin jenisizin
        ON  usulanizin.jenisizin = jenisizin.id

    `

    db.query(query, (err, rows)=>{
        if (err) {
            res.json(err)
        } else {
            res.json(rows)
        }
    })
});

router.post('/view', (req, res) => {


    var jns_permohonan = req.body.jns_permohonan;

    if (jns_permohonan == 'izin') {
        var queryAnd = 'usulanizin.jenisizin <> 0 AND'
    } else if (jns_permohonan == 'darurat') {
        var queryAnd = 'usulanizin.jenisKategori <> 0 AND'
    }


    // console.log(req.user.profile.unit_kerja)

    // console.log("GOOOOOOOOOOOOOOO")

    // console.log(req.body)
    var data_batas = 10;
    var data_star = (req.body.data_ke - 1)* data_batas;
    var cari = req.body.cari_value;
    var halaman = 1; 


    let jml_data = `
        SELECT usulanizin.*,
        jenisizin.uraian as jenisizin_uraian,
        biodata.nama as biodata_nama,
        biodata.gelar_belakang as biodata_gelar_belakang,
        biodata.gelar_depan as biodata_gelar_depan,
        unit_kerja.unit_kerja as unit_kerja_uraian,
        jeniskategori.uraian as jeniskategori_uraian

        FROM absensi.usulanizin usulanizin

        LEFT JOIN simpeg.biodata biodata
        ON usulanizin.NIP = biodata.nip

        LEFT JOIN simpeg.unit_kerja unit_kerja
        ON usulanizin.unit_kerja = unit_kerja.id

        LEFT JOIN absensi.jenisizin jenisizin
        ON  usulanizin.jenisizin = jenisizin.id

        LEFT JOIN absensi.jeniskategori jeniskategori
        ON  usulanizin.jenisKategori = jeniskategori.id


        WHERE 
        `+queryAnd+`
        (jenisizin.uraian LIKE '%`+cari+`%' 
        OR biodata.nama LIKE '%`+cari+`%') 
        AND usulanizin.unit_kerja = '`+req.body.unit_kerja+`'

    `

    let view = `
        SELECT usulanizin.*,
        jenisizin.uraian as jenisizin_uraian,
        biodata.nama as biodata_nama,
        biodata.gelar_belakang as biodata_gelar_belakang,
        biodata.gelar_depan as biodata_gelar_depan,
        unit_kerja.unit_kerja as unit_kerja_uraian,
        jeniskategori.uraian as jeniskategori_uraian

        FROM absensi.usulanizin usulanizin

        LEFT JOIN simpeg.biodata biodata
        ON usulanizin.NIP = biodata.nip

        LEFT JOIN simpeg.unit_kerja unit_kerja
        ON usulanizin.unit_kerja = unit_kerja.id

        LEFT JOIN absensi.jenisizin jenisizin
        ON  usulanizin.jenisizin = jenisizin.id

        LEFT JOIN absensi.jeniskategori jeniskategori
        ON  usulanizin.jenisKategori = jeniskategori.id


        WHERE 
        `+queryAnd+`
        (jenisizin.uraian LIKE '%`+cari+`%' 
        OR biodata.nama LIKE '%`+cari+`%') 
        AND usulanizin.unit_kerja = '`+req.body.unit_kerja+`'
        ORDER BY usulanizin.createdAt DESC
        LIMIT `+data_star+`,`+data_batas+`

    `

    var akses_menu = req.menu_akses
    const levelAkses = akses_menu.find(({ route }) => route === '/verivikasiPermohonanDarurat');

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



// var akses_menu = req.menu_akses
// const levelAkses = akses_menu.find(({ route }) => route === '/verivikasiPermohonanDarurat');

// if (levelAkses.readx == 1) {

// } else {
//     res.json("ANDA TIDAK MEMILIKI HAK AKSES..!!")
// }




router.post('/terima', async (req, res)=>{


    var date = new Date();
    var tahun = date.getFullYear();


    var datereqmulai = new Date(req.body.TglMulai);
    var tahunreqmulai = datereqmulai.getFullYear();

    var datereqselesai = new Date(req.body.TglSelesai);
    var tahunreqselesai = datereqselesai.getFullYear();


    console.log(tahun)
    console.log(tahunreqmulai)
    console.log(tahunreqselesai)



    var hak_akses = req.user.profile
    console.log(hak_akses.absensi)


    
    if ((tahun ==  tahunreqmulai && tahun ==  tahunreqselesai) || hak_akses.absensi == '1') {
        
        var query = `
            UPDATE usulanizin SET
            status = 1,
            notif_keterangan = 'Permohonan telah diverifikasi'
            WHERE id = `+req.body.id+`
        `;
    
        var akses_menu = req.menu_akses
        const levelAkses = akses_menu.find(({ route }) => route === '/verivikasiPermohonanDarurat');
    
        if (levelAkses.updatex == 1) {
            db.query(query, (err2, rows2)=>{
                if (err2) {
                    console.log(err2);
                    // res.json(err2);
                } else {
                    libIzin.approveIzin(req, res, db);
                }
            })
    
        } else {
            res.json("ANDA TIDAK MEMILIKI HAK AKSES..!!")
        }

    } else {
        console.log("TAHUN TIDAK SESUAI..!!")
        res.json({
            icon : 'check_circle_outline',
            color : 'red',
            ket : 'Gagal..!! Tahun approve bukan tahun '+tahun+' 🙏',
        })
    }
    


    

























    // res.json({
    //     icon : 'check_circle_outline',
    //     color : 'red',
    //     ket : 'Menu ini dalam tahap maintenace',
    // })

    // libIzin.approveIzin(req, res, db);


})




router.post('/kembalikan', (req, res)=>{
    var query = `
        UPDATE usulanizin SET
        status = 2,
        notif_keterangan = '`+req.body.notif_keterangan+`'
        WHERE id = `+req.body.id+`
    `;


    var akses_menu = req.menu_akses
    const levelAkses = akses_menu.find(({ route }) => route === '/verivikasiPermohonanDarurat');

    if (levelAkses.updatex == 1) {
        db.query(query, (err2, rows2)=>{
            if (err2) {
                console.log(err2);
                res.json(err2);
            } else {
                res.json({
                    icon : 'check_circle_outline',
                    color : 'negative',
                    ket : 'Sukses anda berhasil Mengembalikan Usulan',
                })
            }
        })

    } else {
        res.json("ANDA TIDAK MEMILIKI HAK AKSES..!!")
    }

    

});







module.exports = router;