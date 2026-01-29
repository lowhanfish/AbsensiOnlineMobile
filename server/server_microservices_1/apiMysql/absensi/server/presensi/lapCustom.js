const express = require('express');
var db = require('../../../../db/MySql/absensi');
const fs = require('fs');

var multer = require("multer");
var upload = require('../../../../db/multer/pdf');

var uniqid = require('uniqid');
const router = express.Router();


const libUmum = require('../../../library/umum');






router.get('/aa', (req, res) => {

    // console.log(req.body)
    res.send('oke')

});


router.post('/Add', (req, res) => {
    // console.log(req.body)
    var query = `
        INSERT INTO jenisizin (uraian, keterangan, createdBy, createdAt)
        VALUES
        ('`+ req.body.uraian + `', '` + req.body.keterangan + `', '` + req.user._id + `', NOW())
    `

    db.query(query, (err, row) => {
        if (err) {
            console.log(err)
            res.send(err);
        } else {
            // res.status(500).send('Sukses Update');
            res.send('OK');
        }
    })

});




router.post('/viewBackup', async (req, res) => {

    console.log("dari viewBackup");

    var waktuFirstX = req.body.waktuFirst
    var waktuLastX = req.body.waktuLast

    var waktuFirst1 = waktuFirstX.replace("/", "-")
    var waktuFirst2 = waktuFirst1.replace("/", "-")
    var waktuFirst = waktuFirst2.replace("/", "-")

    var waktuLast1 = waktuLastX.replace("/", "-")
    var waktuLast2 = waktuLast1.replace("/", "-")
    var waktuLast = waktuLast2.replace("/", "-")

    var jmlHariKerja = await libUmum.hitungTanggalMerah(db, waktuFirst, waktuLast, res)



    // console.log(req.body)
    // console.log(waktuLast)

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
        biodata.nip,
        biodata.no_karpeg,
        biodata.pendidikan_ahir_jurusan,
        biodata.status_keluarga,
        biodata.tempat_lahir,

        jabatan.jabatan as nm_jabatan,

        @hariKerja := (`+ jmlHariKerja + `) as jmlHariKerja,
        
        @hadir := (SELECT 
            COUNT(absensi.id)
            
            FROM absensi.absensi absensi
            WHERE
            absensi.NIP = biodata.nip
            AND 
            (absensi.jenispresensi = 1 AND absensi.jamDatang != absensi.jamPulang)
            AND 
            (
                CONCAT(absensi.yy,'-',LPAD(absensi.mm,2,'00'),'-',LPAD(absensi.dd,2,'00')) >= '`+ waktuFirst + `'
                AND
                CONCAT(absensi.yy,'-',LPAD(absensi.mm,2,'00'),'-',LPAD(absensi.dd,2,'00')) <= '`+ waktuLast + `'
            )
            

        ) as hadir,

        @izin := (SELECT 
            COUNT(absensi.id)
            
            FROM absensi.absensi absensi
            WHERE
            absensi.NIP = biodata.nip
            AND absensi.jenispresensi = 3
            AND 
            (
                CONCAT(absensi.yy,'-',LPAD(absensi.mm,2,'00'),'-',LPAD(absensi.dd,2,'00')) >= '`+ waktuFirst + `'
                AND
                CONCAT(absensi.yy,'-',LPAD(absensi.mm,2,'00'),'-',LPAD(absensi.dd,2,'00')) <= '`+ waktuLast + `'
            )
            

        ) as izin,

        # (@hariKerja + 1) as kamio
       
        @tanpaKeterangan := (`+ jmlHariKerja + ` - @hadir - @izin) as tanpaKeterangan,
        
        @persentaseHadir := ( @hadir * 100 / `+ jmlHariKerja + `) as persentaseHadir,
        @persentaseIzin := ( @izin * 100 / `+ jmlHariKerja + `) as persentaseIzin,
        @persentaseTanpaKeterangan := ( @tanpaKeterangan * 100 / `+ jmlHariKerja + `) as persentaseTanpaKeterangan


        FROM simpeg.biodata biodata

        LEFT JOIN simpeg.jabatan jabatan
        ON biodata.jabatan = jabatan._id

        
        
        
        WHERE 
        biodata.unit_kerja = '`+ req.body.unit_kerja_id + `'
        ORDER BY jabatan.level

    `



    // absensi.dd = `+req.body.date+` AND
    //         absensi.mm = `+req.body.bulan+` AND
    //         absensi.yy = `+req.body.tahun+`

    db.query(view, (err, row) => {
        if (err) {
            console.log(err)
            res.send('err')
        } else {
            res.send(row)
        }

    })
});



async function loopingDate() {


}



router.post('/view', async (req, res) => {


    console.log(req.body);

    var waktuFirstX = req.body.waktuFirst
    var waktuLastX = req.body.waktuLast

    var waktuFirst1 = waktuFirstX.replace("/", "-")
    var waktuFirst2 = waktuFirst1.replace("/", "-")
    var waktuFirst = waktuFirst2.replace("/", "-")

    var waktuLast1 = waktuLastX.replace("/", "-")
    var waktuLast2 = waktuLast1.replace("/", "-")
    var waktuLast = waktuLast2.replace("/", "-")

    var jmlHariKerja = await libUmum.hitungTanggalMerah(db, waktuFirst, waktuLast, res)

    // console.log(1);

    var tanggalLibur = await libUmum.getTglLibur(db, waktuFirst, waktuLast, res)
    var listTanggal = await libUmum.restrukturListTgl(waktuFirst, waktuLast)
    var jumlahHK = await libUmum.cariHariLibur(tanggalLibur, listTanggal, 2)

    console.log("Ini dari microservices 1 yang dipanggil melalui lap custom")

    // console.log(jumlahHK);
    // console.log(listTanggal);

    console.log("=============================")
    console.log(req.body)
    console.log("=============================")
    // console.log(waktuLast)

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
        biodata.nip,
        biodata.no_karpeg,
        biodata.pendidikan_ahir_jurusan,
        biodata.status_keluarga,
        biodata.tempat_lahir,
        biodata.metode_absen,

        jabatan.jabatan as nm_jabatan,

       
        @hadir := (SELECT 
            COUNT(absensi.id)
            
            FROM absensi.absensi absensi
            WHERE
            absensi.NIP = biodata.nip
            AND 
            (absensi.jenispresensi = 1 AND absensi.jamDatang != absensi.jamPulang)
            AND 
            (
                CONCAT(absensi.yy,'-',LPAD(absensi.mm,2,'00'),'-',LPAD(absensi.dd,2,'00')) >= '`+ waktuFirst + `'
                AND
                CONCAT(absensi.yy,'-',LPAD(absensi.mm,2,'00'),'-',LPAD(absensi.dd,2,'00')) <= '`+ waktuLast + `'
            )
            

        ) as hadir,

        @izin := (SELECT 
            COUNT(absensi.id)
            
            FROM absensi.absensi absensi
            WHERE
            absensi.NIP = biodata.nip
            AND absensi.jenispresensi = 3
            AND 
            (
                CONCAT(absensi.yy,'-',LPAD(absensi.mm,2,'00'),'-',LPAD(absensi.dd,2,'00')) >= '`+ waktuFirst + `'
                AND
                CONCAT(absensi.yy,'-',LPAD(absensi.mm,2,'00'),'-',LPAD(absensi.dd,2,'00')) <= '`+ waktuLast + `'
            )

        ) as izin



        FROM simpeg.biodata biodata

        LEFT JOIN simpeg.jabatan jabatan
        ON biodata.jabatan = jabatan._id

        
        
        
        WHERE 
        biodata.unit_kerja = '`+ req.body.unit_kerja_id + `' 
        AND biodata.jenis_pegawai_id = '`+ req.body.jnsASN + `'
        ORDER BY jabatan.level

    `



    // absensi.dd = `+req.body.date+` AND
    //         absensi.mm = `+req.body.bulan+` AND
    //         absensi.yy = `+req.body.tahun+`

    db.query(view, async (err, row) => {
        if (err) {
            // console.log(err)
            res.send('err')
        } else {

            var data = await start(row, tanggalLibur, listTanggal)


            // console.log(2);
            res.send(data)

        }

    })
});



const waitFor = (ms) => new Promise(r => setTimeout(r, ms));


const asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    }
}



const start = async (row, tanggalLibur, listTanggal) => {

    var data = []
    await asyncForEach(row, async (num) => {
        // await waitFor(50);
        num.jmlHariKerja = await libUmum.cariHariLibur(tanggalLibur, listTanggal, num.metode_absen)
        num.tanpaKeterangan = num.jmlHariKerja - num.hadir - num.izin;
        num.persentaseHadir = (num.hadir * 100) / num.jmlHariKerja
        num.persentaseIzin = (num.izin * 100) / num.jmlHariKerja
        num.persentaseTanpaKeterangan = (num.tanpaKeterangan * 100) / num.jmlHariKerja

        data.push(num)


    });


    return new Promise((resolve, reject) => {
        resolve(data)
    })



}



// const asyncForEach = async (array, callback) => {
//     for (let index = 0; index < array.length; index++) {
//         await callback(array[index], index, array)
//     }
// }

// const start = async () => {
//     await asyncForEach([1, 2, 3], async (num) => {

//     await setTimeout(() => {
//         console.log("APAJ");
//     }, 1000);


//     console.log(num)
//     })
//     console.log('Done')
// }





// presensi.uraian as status_uraian,

// AND 
//         (
//             absensi.dd = `+req.body.date+` AND
//             absensi.mm = `+req.body.bulan+` AND
//             absensi.yy = `+req.body.tahun+`
//         )


router.post('/editData', (req, res) => {
    var query = `
        UPDATE jenisizin SET
        uraian = '`+ req.body.uraian + `',
        keterangan = '`+ req.body.keterangan + `',
        editedBy = '`+ req.user._id + `'
        
        WHERE id = `+ req.body.id + `
    `;
    proses_query(query, res);
})

router.post('/removeData', (req, res) => {
    var query = `
        DELETE FROM jenisizin
        WHERE id = `+ req.body.id + `
    `;
    proses_query(query, res);
})



function proses_query(view, res) {
    db.query(view, (err, row) => {
        if (err) {
            // console.log(err);
            res.send(err);
        } else {
            res.send('ok');
        }
    })
}


router.get('/WajibHapus', async (req, res) => {

    var waktu = new Date(2022, 1, 7).toISOString().slice(0, 10);

    var waktuFirst = '2022-01-01'
    var waktuLast = '2022-01-10'

    // var waktuFirst = waktuFirstX.replace("/", "-")
    // var waktuLast = waktuLastX.replace("/", "-")


    var jmlHariKerja = await libUmum.hitungTanggalMerah(db, waktuFirst, waktuLast, res)
    // console.log(jmlHariKerja)


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
        biodata.nip,
        biodata.no_karpeg,
        biodata.pendidikan_ahir_jurusan,
        biodata.status_keluarga,
        biodata.tempat_lahir,

        jabatan.jabatan as nm_jabatan,

        CONCAT(2022,'-',LPAD(1,2,'00'),'-',LPAD(7,2,'00')) as tanggalx,

        @hariKerja := (`+ jmlHariKerja + `) as jmlHariKerja,
        
        @hadir := (SELECT 
            COUNT(absensi.id)
            
            FROM absensi.absensi absensi
            WHERE
            absensi.NIP = biodata.nip
            AND absensi.jenispresensi = 1
            AND 
            (
                CONCAT(absensi.yy,'-',LPAD(absensi.mm,2,'00'),'-',LPAD(absensi.dd,2,'00')) >= '`+ waktuFirst + `'
                AND
                CONCAT(absensi.yy,'-',LPAD(absensi.mm,2,'00'),'-',LPAD(absensi.dd,2,'00')) <= '`+ waktuLast + `'
            )
            

        ) as hadir,

        @izin := (SELECT 
            COUNT(absensi.id)
            
            FROM absensi.absensi absensi
            WHERE
            absensi.NIP = biodata.nip
            AND absensi.jenispresensi = 3
            

        ) as izin,

        # (@hariKerja + 1) as kamio

        @tanpaKeterangan := (`+ jmlHariKerja + ` - @hadir - @izin) as tanpaKeterangan,
        
        @persentaseHadir := ( @hadir * 100 / `+ jmlHariKerja + `) as persentaseHadir,
        @persentaseIzin := ( @izin * 100 / `+ jmlHariKerja + `) as persentaseIzin,
        @persentaseTanpaKeterangan := ( @tanpaKeterangan * 100 / `+ jmlHariKerja + `) as persentaseTanpaKeterangan

        FROM simpeg.biodata biodata

        LEFT JOIN simpeg.jabatan jabatan
        ON biodata.jabatan = jabatan._id

        
        
        
        WHERE 
        biodata.unit_kerja = 'EtTbFb6EzYZt9mMJL' 
        AND biodata.nip = '198511202014061001'

        ORDER BY jabatan.level

    `

    // absensi.dd = `+req.body.date+` AND
    //         absensi.mm = `+req.body.bulan+` AND
    //         absensi.yy = `+req.body.tahun+`

    db.query(view, (err, row) => {
        if (err) {
            // console.log(err)
            res.send('err')
        } else {
            res.send(row)
        }

    })
});



module.exports = router;