const express = require('express');
var db = require('../../../../db/MySql/absensi');
const fs = require('fs');

var multer=require("multer");
var upload = require('../../../../db/multer/pdf');

var uniqid = require('uniqid');
const router = express.Router();

const lib = require('../../../library/umum');
const libAbsen = require('../../../library/absen');
const libIzin = require('../../../library/izin');
const libUmum = require('../../../library/umum');



const fcm = require('../../../library/fcm');




router.get('/cappo', (req, res)=>{
    fcm.pushNotification('Nableee', 'telasooooo ');
    res.json('wataaaooo')
})

router.post('/Add', (req, res) => {
    var jam = lib.Timex().jam;
    var dd = lib.Timex().dd;
    var mm = lib.Timex().mm;
    var yy = lib.Timex().yy;

    var data = req.body
    // console.log(data)

    
    if (checkTime(data.form)) {

        if (data.isUseEmulator == 'true') {
            res.json({
                status : 'ABSEN GAGAL',
                ket : 'Mohon untuk tidak menggunakan emulator. Anda melakukan absen pada Jam : ',
                jam : jam
            })
        } else {
            AddAbsenApel(req, res, req.body)
        }



    } else {
        res.send({
            status : 'GAGAL',
            ket : 'Gagal, anda mengabsen diluar jadwal apel, absen apel anda hari ini pada jam : ',
            jam : jam
        })
    }

    // console.log(req.user._id)

});


router.post('/statistik', async (req, res) => {
    // console.log(req.body)

    const d = new Date(req.body.waktuFirst);
    const e = new Date(req.body.waktuLast);

    // console.log(d.getFullYear());
    // console.log(d.getMonth()+1);
    // console.log(d.getDate())

    var waktuFirst = d.getFullYear()+'-'+libUmum.addZero((d.getMonth()+1))+'-'+libUmum.addZero(d.getDate())
    var waktuLast = e.getFullYear()+'-'+libUmum.addZero((e.getMonth()+1))+'-'+libUmum.addZero(e.getDate())
    
  
    // console.log(waktuFirst)
    // console.log(waktuLast)

    // console.log(req.body)
    // res.send('OK')
    
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

            WHERE
            (
                CONCAT(jadwalapel.yy,'-',LPAD(jadwalapel.mm,2,'00'),'-',LPAD(jadwalapel.dd,2,'00')) >= '`+waktuFirst+`'
                AND
                CONCAT(jadwalapel.yy,'-',LPAD(jadwalapel.mm,2,'00'),'-',LPAD(jadwalapel.dd,2,'00')) <= '`+waktuLast+`'
            )

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

            WHERE
            (
                CONCAT(jadwalapel.yy,'-',LPAD(jadwalapel.mm,2,'00'),'-',LPAD(jadwalapel.dd,2,'00')) >= '`+waktuFirst+`'
                AND
                CONCAT(jadwalapel.yy,'-',LPAD(jadwalapel.mm,2,'00'),'-',LPAD(jadwalapel.dd,2,'00')) <= '`+waktuLast+`'
            )

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

            WHERE
            (
                CONCAT(jadwalapel.yy,'-',LPAD(jadwalapel.mm,2,'00'),'-',LPAD(jadwalapel.dd,2,'00')) >= '`+waktuFirst+`'
                AND
                CONCAT(jadwalapel.yy,'-',LPAD(jadwalapel.mm,2,'00'),'-',LPAD(jadwalapel.dd,2,'00')) <= '`+waktuLast+`'
            )

        ) as izin,

        @tanpaKeterangan := (@total_apel - (@hadir+@izin)) as tanpaKeterangan,

        @persentaseHadir := ( @hadir * 100 / @total_apel) as persentaseHadir,
        @persentaseIzin := ( @izin * 100 / @total_apel) as persentaseIzin,
        @persentaseTanpaKeterangan := ( @tanpaKeterangan * 100 / @total_apel) as persentaseTanpaKeterangan



        FROM simpeg.biodata biodata

        LEFT JOIN simpeg.jabatan jabatan
        ON biodata.jabatan = jabatan._id

        
        
        
        WHERE 
        biodata.unit_kerja = '`+req.body.unit_kerja_id+`'
        AND biodata.NIP = '`+req.body.NIP+`'

    `

   

    // absensi.dd = `+req.body.date+` AND
    //         absensi.mm = `+req.body.bulan+` AND
    //         absensi.yy = `+req.body.tahun+`
    
    db.query(view, (err, row)=>{
        if (err) {
            // console.log(err)
            res.send(err)
        } else {
            res.send(row)
        }
        
    })
});



function AddAbsenApel(req, res, data){
    var data1 = data.form;
    var jamx = lib.Timex().jam;
    const d = new Date();
    var thn = d.getFullYear();
    var bln = d.getMonth()+1;
    var tgl = d.getDate();

    var jam = d.getHours()
    var mnt = d.getMinutes()
    var waktu = Conversi00(jam)+":"+Conversi00(mnt)+':00';

    // console.log(data)


    var check =`
        SELECT id FROM absensi_apel
        WHERE NIP = '`+data.NIP+`' AND
        (
            dd = `+data1.dd+` AND
            mm = `+data1.mm+` AND
            yy = `+data1.yy+`
        )
    
    `

    db.query(check, (err, rows)=>{
        if (rows.length <= 0) {



            var query = `
                INSERT INTO absensi_apel (
                    lat, 
                    lng, 
                    jamDatang, 
                    dd, 
                    mm, 
                    yy,
                    NIP, 
                    unit_kerja, 
                    createdBy, 
                    createdAt 
                ) VALUE (
                    `+data1.lat+`,
                    `+data1.lng+`,
                    '`+waktu+`',
                    `+data1.dd+`,
                    `+data1.mm+`,
                    `+data1.yy+`,
                    '`+data.NIP+`',
                    '`+data1.unit_kerja+`',
                    '`+req.user._id+`',
                    NOW()
                )
            `

            db.query(query, (err2, rows2)=>{
                if (err2) {
                    // console.log(err2);
                    res.json(err2);
                } else {
                    res.send({
                        status : 'SUKSES',
                        ket : 'Sukses, anda berhasil absen apel hari ini pada jam : ',
                        jam : jamx
                    })
                }
            })








            
        } else {




            res.send({
                status : 'GAGAL',
                ket : 'Gagal, anda sebelumnya sudah absen apel hari ini pada jam : ',
                jam : jam
            })




            
        }
    })








    



}



const checkTime = (data) =>{
    const d = new Date();
    var thn = d.getFullYear();
    var bln = d.getMonth()+1;
    var tgl = d.getDate();



    var jam = d.getHours()
    var mnt = d.getMinutes()

    var waktu = Conversi00(jam)+":"+Conversi00(mnt)+':00';
    
    if (data) {
        // console.log(waktu)
        // console.log(data.startAbsen)
        if (parseInt(tgl) == parseInt(data.dd) && parseInt(bln) == parseInt(data.mm) && parseInt(thn) == parseInt(data.yy) ) {
            if ((waktu >= data.startAbsen) && (waktu <= data.batasAbsen) ) {
                // if ((data.startAbsen > waktu) && (data.batasAbsen < waktu)) {
                // console.log('Suksesssss')
                return true
            } else {
                // console.log('Gagaaaaaal')
                return false
            }
        } else{
            // console.log("GAGALLLLLLL")
            return false
        }

    } 

}



const Conversi00 = (params) => {
    return ('0' + params).slice(-2)
}








module.exports = router;