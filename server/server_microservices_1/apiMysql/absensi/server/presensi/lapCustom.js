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
    try {
        /* ===================== PARSE TANGGAL ===================== */
        const waktuFirst = req.body.waktuFirst.replaceAll("/", "-")
        const waktuLast = req.body.waktuLast.replaceAll("/", "-")

        const jnsASN = req.body.jnsASN
        const unitKerja = req.body.unit_kerja_id

        console.log(req.body)
        console.log(waktuFirst, waktuLast)

        /* ===================== QUERY SQL ===================== */
        const view = `
            WITH RECURSIVE
            vars AS (
            SELECT
                DATE('${waktuFirst}') AS tgl_awal,
                DATE('${waktuLast}')  AS tgl_akhir,
                TIME('07:30:00') AS jam_datang,
                TIME('15:30:00') AS pulang_m1,
                TIME('13:30:00') AS pulang_m2
            ),

            kalender AS (
            SELECT tgl_awal AS tgl FROM vars
            UNION ALL
            SELECT tgl + INTERVAL 1 DAY
            FROM kalender, vars
            WHERE tgl < vars.tgl_akhir
            ),

            hari_kerja AS (
            SELECT
                b.nip,
                COUNT(*) AS jumlah_hari_kerja
            FROM simpeg.biodata b
            JOIN kalender k
                ON (
                (b.metode_absen = 1 AND DAYOFWEEK(k.tgl) NOT IN (1,7))
                OR
                (b.metode_absen = 2 AND DAYOFWEEK(k.tgl) <> 1)
                )
            GROUP BY b.nip
            ),

            hari_libur AS (
            SELECT
                b.nip,
                COUNT(DISTINCT k.tgl) AS jumlah_hari_libur
            FROM simpeg.biodata b
            JOIN kalender k
            JOIN absensi.waktulibur wl
                ON DATE(wl.tglFull) = k.tgl
            WHERE
                (
                (b.metode_absen = 1 AND DAYOFWEEK(k.tgl) NOT IN (1,7))
                OR
                (b.metode_absen = 2 AND DAYOFWEEK(k.tgl) <> 1)
                )
            GROUP BY b.nip
            )

            SELECT
            CONCAT(b.gelar_depan,' ',b.nama,' ',b.gelar_belakang) AS nama,
            b.nip,
            b.metode_absen,
            j.jabatan AS nm_jabatan,
            uk.unit_kerja,

            /* ================= HADIR & IZIN ================= */
            SUM(a.jenispresensi=1 AND a.jamDatang<>a.jamPulang AND wl.id IS NULL) AS hadir,
            SUM(a.jenispresensi=3 AND wl.id IS NULL) AS izin,

            /* ================= TL ================= */
            SUM(a.jenispresensi=1 AND a.status=1
                AND a.jamDatang > vars.jam_datang
                AND a.jamDatang <= ADDTIME(vars.jam_datang,'00:30:00')
                AND wl.id IS NULL) AS TL1,

            SUM(a.jenispresensi=1 AND a.status=1
                AND a.jamDatang > ADDTIME(vars.jam_datang,'00:30:00')
                AND a.jamDatang <= ADDTIME(vars.jam_datang,'01:00:00')
                AND wl.id IS NULL) AS TL2,

            SUM(a.jenispresensi=1 AND a.status=1
                AND a.jamDatang > ADDTIME(vars.jam_datang,'01:00:00')
                AND a.jamDatang <= ADDTIME(vars.jam_datang,'01:30:00')
                AND wl.id IS NULL) AS TL3,

            SUM(a.jenispresensi=1 AND a.status=1
                AND a.jamDatang > ADDTIME(vars.jam_datang,'01:30:00')
                AND wl.id IS NULL) AS TL4,

            /* ================= PSW ================= */
            SUM(a.jenispresensi=1 AND a.status=1 AND wl.id IS NULL AND
                (
                (b.metode_absen=1 AND a.jamPulang < vars.pulang_m1 AND a.jamPulang >= ADDTIME(vars.pulang_m1,'-00:30:00'))
                OR
                (b.metode_absen=2 AND a.jamPulang < vars.pulang_m2 AND a.jamPulang >= ADDTIME(vars.pulang_m2,'-00:30:00'))
                )) AS PSW1,

            SUM(a.jenispresensi=1 AND a.status=1 AND wl.id IS NULL AND
                (
                (b.metode_absen=1 AND a.jamPulang < ADDTIME(vars.pulang_m1,'-00:30:00') AND a.jamPulang >= ADDTIME(vars.pulang_m1,'-01:00:00'))
                OR
                (b.metode_absen=2 AND a.jamPulang < ADDTIME(vars.pulang_m2,'-00:30:00') AND a.jamPulang >= ADDTIME(vars.pulang_m2,'-01:00:00'))
                )) AS PSW2,

            SUM(a.jenispresensi=1 AND a.status=1 AND wl.id IS NULL AND
                (
                (b.metode_absen=1 AND a.jamPulang < ADDTIME(vars.pulang_m1,'-01:00:00') AND a.jamPulang >= ADDTIME(vars.pulang_m1,'-01:30:00'))
                OR
                (b.metode_absen=2 AND a.jamPulang < ADDTIME(vars.pulang_m2,'-01:00:00') AND a.jamPulang >= ADDTIME(vars.pulang_m2,'-01:30:00'))
                )) AS PSW3,

            SUM(a.jenispresensi=1 AND a.status=1 AND wl.id IS NULL AND
                (
                (b.metode_absen=1 AND a.jamPulang < ADDTIME(vars.pulang_m1,'-01:30:00'))
                OR
                (b.metode_absen=2 AND a.jamPulang < ADDTIME(vars.pulang_m2,'-01:30:00'))
                )) AS PSW4,

            /* ================= HARI ================= */
            hk.jumlah_hari_kerja,
            COALESCE(hl.jumlah_hari_libur,0) AS jumlah_hari_libur,

            /* ================= TK ================= */
            (
                hk.jumlah_hari_kerja
                - COALESCE(hl.jumlah_hari_libur,0)
                - SUM(a.jenispresensi=1 AND a.jamDatang<>a.jamPulang AND wl.id IS NULL)
            ) AS TK

            FROM simpeg.biodata b
            CROSS JOIN vars
            LEFT JOIN absensi.absensi a
            ON a.nip=b.nip
            AND DATE(CONCAT(a.yy,'-',a.mm,'-',a.dd)) BETWEEN vars.tgl_awal AND vars.tgl_akhir
            LEFT JOIN absensi.waktulibur wl
            ON wl.yy=a.yy AND wl.mm=a.mm AND wl.dd=a.dd
            LEFT JOIN hari_kerja hk ON hk.nip=b.nip
            LEFT JOIN hari_libur hl ON hl.nip=b.nip
            LEFT JOIN simpeg.jabatan j ON b.jabatan=j._id
            JOIN simpeg.unit_kerja uk ON uk.id=b.unit_kerja

            WHERE b.jenis_pegawai_id=${jnsASN}
            AND b.unit_kerja='${unitKerja}'

            GROUP BY b.nip
            ORDER BY j.level;
        `

        /* ===================== EXEC ===================== */
        db.query(view, (err, row) => {
            if (err) {
                console.log(err)
                res.status(500).send(err)
            } else {
                // res.send(row)

                var data = []

                row.forEach(element => {
                    element.persentaseHadir = (element.hadir * 100) / element.jumlah_hari_kerja
                    element.persentaseIzin = (element.izin * 100) / element.jumlah_hari_kerja
                    element.persentaseTanpaKeterangan = (element.TK * 100) / element.jumlah_hari_kerja
                    element.tanpaKeterangan = element.TK
                    element.jmlHariKerja = element.jumlah_hari_kerja


                    data.push(element);
                });

                res.send(data);


            }
        })

    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})





router.post('/view_1', async (req, res) => {

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



    // console.log(jumlahHK);
    // console.log(listTanggal);


    console.log(req.body)
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
            

        ) as izin,


      `+ cekTL(waktuFirst, waktuLast, 60, 1800) + ` AS TL1,
      `+ cekTL(waktuFirst, waktuLast, 1800, 3600) + ` AS TL2,
      `+ cekTL(waktuFirst, waktuLast, 3600, 5400) + ` AS TL3,
      `+ cekTL(waktuFirst, waktuLast, 5400, 61200) + ` AS TL4,
      `+ cekPSW(waktuFirst, waktuLast, 60, 1800) + ` AS PSW1,
      `+ cekPSW(waktuFirst, waktuLast, 1800, 3600) + ` AS PSW2,
      `+ cekPSW(waktuFirst, waktuLast, 3600, 5400) + ` AS PSW3,
      `+ cekPSW(waktuFirst, waktuLast, 5400, 61200) + ` AS PSW4


       



        FROM simpeg.biodata biodata

        LEFT JOIN simpeg.jabatan jabatan
        ON biodata.jabatan = jabatan._id

        
        
        
        WHERE 
        biodata.unit_kerja = '`+ req.body.unit_kerja_id + `'
        AND biodata.jenis_pegawai_id=`+ req.body.jnsASN + `

        ORDER BY jabatan.level

    `



    // absensi.dd = `+req.body.date+` AND
    //         absensi.mm = `+req.body.bulan+` AND
    //         absensi.yy = `+req.body.tahun+`

    console.log(view)

    db.query(view, async (err, row) => {
        if (err) {
            console.log(err)
            res.send('err')
        } else {

            // console.log(row)

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



const cekTL = (waktuFirst, waktuLast, timeMin, timeMax) => {

    return (
        `(
            SELECT
            COUNT(absensi.id)
            FROM absensi.absensi absensi
            WHERE
            absensi.NIP = biodata.nip
            AND (absensi.jenispresensi = 1)
            AND
            absensi.status = 1
            AND 
            (
                CONCAT(absensi.yy,'-',LPAD(absensi.mm,2,'00'),'-',LPAD(absensi.dd,2,'00')) >= '`+ waktuFirst + `'
                AND
                CONCAT(absensi.yy,'-',LPAD(absensi.mm,2,'00'),'-',LPAD(absensi.dd,2,'00')) <= '`+ waktuLast + `'
            )

            AND (TIME_TO_SEC(absensi.jamDatang) - TIME_TO_SEC('`+ process.env.TETAPAN_DATANG + `') > ` + timeMin + ` AND TIME_TO_SEC(absensi.jamDatang) - TIME_TO_SEC('` + process.env.TETAPAN_DATANG + `') <= ` + timeMax + `)
        )`
    )
}
const cekPSW = (waktuFirst, waktuLast, timeMin, timeMax) => {

    return (
        `(
            SELECT
            COUNT(absensi.id)
            FROM absensi.absensi absensi
            WHERE
            absensi.NIP = biodata.nip
            AND (absensi.jenispresensi = 1)
            AND
            absensi.status = 1
            AND 
            (
                CONCAT(absensi.yy,'-',LPAD(absensi.mm,2,'00'),'-',LPAD(absensi.dd,2,'00')) >= '`+ waktuFirst + `'
                AND
                CONCAT(absensi.yy,'-',LPAD(absensi.mm,2,'00'),'-',LPAD(absensi.dd,2,'00')) <= '`+ waktuLast + `'
            )

            AND ( TIME_TO_SEC('`+ process.env.TETAPAN_PULANG + `') - TIME_TO_SEC(absensi.jamPulang) > ` + timeMin + ` AND TIME_TO_SEC('` + process.env.TETAPAN_PULANG + `') - TIME_TO_SEC(absensi.jamPulang) <= ` + timeMax + `)
        )`
    )


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

    console.log(view)

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