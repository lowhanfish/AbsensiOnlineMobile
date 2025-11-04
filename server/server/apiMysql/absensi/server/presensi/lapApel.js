const express = require('express');
var db = require('../../../../db/MySql/absensi');
const fs = require('fs');

var multer=require("multer");
var upload = require('../../../../db/multer/pdf');

var uniqid = require('uniqid');
const router = express.Router();


const libUmum = require('../../../library/umum');






router.get('/aa', async (req, res) => {

    var waktu = new Date(2022, 1, 7).toISOString().slice(0, 10);

    var waktuFirst = '2022-01-01'
    var waktuLast = '2022-01-10'

    var unit_kerja = 'EtTbFb6EzYZt9mMJL'
    var nipx = '198511202014061001'


    let view = `
        SELECT 
        biodata.id,
        biodata.NPWP,
        biodata.TMT_PNS,
        biodata.agama,
        biodata.alamat,
        biodata.email,
        biodata.gelar_belakang,
        biodata.gelar_depan,
        biodata.gol,
        biodata.jabatan,
        biodata.jenis_kelamin,
        biodata.kontak,
        biodata.nama,
        @nip := biodata.nip as nip,
        biodata.no_karpeg,
        biodata.pendidikan_ahir_jurusan,
        biodata.status_keluarga,
        biodata.tempat_lahir,
        @unit_kerja := biodata.unit_kerja as unit_kerja,

        jabatan.jabatan as nm_jabatan,


        @total_apel := (SELECT 
            COUNT(jadwalapel.id)
            FROM absensi.jadwalapel jadwalapel

            JOIN absensi.jenisapel jenisapel
            ON jenisapel.id = jadwalapel.jenisapel

            JOIN absensi.jenisapelpeserta jenisapelpeserta
            ON jenisapel.id = jenisapelpeserta.jenisapel AND jenisapelpeserta.unit_kerja = @unit_kerja

        ) as total_apel,


        @hadir := (SELECT 
            COUNT(jadwalapel.id)
            FROM absensi.jadwalapel jadwalapel

            JOIN absensi.jenisapel jenisapel
            ON jenisapel.id = jadwalapel.jenisapel

            JOIN absensi.jenisapelpeserta jenisapelpeserta
            ON jenisapel.id = jenisapelpeserta.jenisapel AND jenisapelpeserta.unit_kerja = @unit_kerja

            JOIN absensi.absensi_apel absensi_apel
            ON jadwalapel.id = absensi_apel.jadwalapel AND (absensi_apel.NIP = @nip AND absensi_apel.jenispresensi = 1)

        ) as hadir,

        @izin := (SELECT 
            COUNT(jadwalapel.id)
            FROM absensi.jadwalapel jadwalapel

            JOIN absensi.jenisapel jenisapel
            ON jenisapel.id = jadwalapel.jenisapel

            JOIN absensi.jenisapelpeserta jenisapelpeserta
            ON jenisapel.id = jenisapelpeserta.jenisapel AND jenisapelpeserta.unit_kerja = @unit_kerja

            JOIN absensi.absensi_apel absensi_apel
            ON jadwalapel.id = absensi_apel.jadwalapel AND (absensi_apel.NIP = @nip AND absensi_apel.jenispresensi = 3)

        ) as izin,

        @tanpaKeterangan := (@total_apel - (@hadir+@izin)) as tanpaKeterangan,

        @persentaseHadir := ( @hadir * 100 / @total_apel) as persentaseHadir,
        @persentaseIzin := ( @izin * 100 / @total_apel) as persentaseIzin,
        @persentaseTanpaKeterangan := ( @tanpaKeterangan * 100 / @total_apel) as persentaseTanpaKeterangan



        FROM simpeg.biodata biodata

        LEFT JOIN simpeg.jabatan jabatan
        ON biodata.jabatan = jabatan._id

        
        
        
        WHERE 
        biodata.unit_kerja = '`+unit_kerja+`' 
        AND biodata.nip = '`+nipx+`'

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









module.exports = router;