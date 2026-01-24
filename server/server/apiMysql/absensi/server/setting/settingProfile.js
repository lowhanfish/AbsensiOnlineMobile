const express = require('express');
var db = require('../../../../db/MySql/absensi');
const fs = require('fs');

var multer = require("multer");
var upload = require('../../../../db/multer/pdf');

var uniqid = require('uniqid');
const router = express.Router();



// SAMPLE
router.post('/viewData', (req, res) => {
    console.log(req.body.is_private);

    var data_batas = 10;
    var data_star = (req.body.data_ke - 1) * data_batas;
    var cari = req.body.cari_value;
    var halaman = 1;

    let jml_data = `
        SELECT
        fotosample.id,
        fotosample.nip,
        fotosample.status,
        fotosample.private,

        biodata.nama as biodata_nama,
        biodata.gelar_belakang as biodata_gelar_belakang,
        biodata.gelar_depan as biodata_gelar_depan,
        biodata.unit_kerja AS unit_kerja_id,
        unit_kerja.unit_kerja AS unit_kerja_uraian

        FROM fotosample

        LEFT JOIN simpeg.biodata biodata
        ON fotosample.nip = biodata.nip

        LEFT JOIN simpeg.unit_kerja unit_kerja
        ON biodata.unit_kerja = unit_kerja.id

        WHERE
        biodata.unit_kerja = '`+ req.body.unit_kerja_id + `'
        AND biodata.nama LIKE '%`+ cari + `%'
        AND
            (
            '`+ req.body.is_private + `' = ''
            OR (
                '`+ req.body.is_private + `' = '0'
                AND (fotosample.private = 0 OR fotosample.private IS NULL)
            )
            OR (
                '`+ req.body.is_private + `' = '1'
                AND fotosample.private = 1
            )
        )

    `

    const query = `
        SELECT
        fotosample.id,
        fotosample.file,
        fotosample.nip,
        fotosample.status,
        fotosample.keterangan,
        fotosample.private,
				
        biodata_verifikator.nama AS verificationBy,

        biodata.nama as biodata_nama,
        biodata.gelar_belakang as biodata_gelar_belakang,
        biodata.gelar_depan as biodata_gelar_depan,
        biodata.unit_kerja AS unit_kerja_id,
        unit_kerja.unit_kerja AS unit_kerja_uraian

        FROM fotosample

        LEFT JOIN simpeg.biodata biodata
        ON fotosample.nip = biodata.nip

        LEFT JOIN simpeg.unit_kerja unit_kerja
        ON biodata.unit_kerja = unit_kerja.id
				
        LEFT JOIN simpeg.biodata biodata_verifikator
        ON fotosample.verificationBy = biodata_verifikator.nip

        WHERE
        biodata.unit_kerja = '`+ req.body.unit_kerja_id + `'
        AND biodata.nama LIKE '%`+ cari + `%'
        AND
            (
            '`+ req.body.is_private + `' = ''
            OR (
                '`+ req.body.is_private + `' = '0'
                AND (fotosample.private = 0 OR fotosample.private IS NULL)
            )
            OR (
                '`+ req.body.is_private + `' = '1'
                AND fotosample.private = 1
            )
        )

        LIMIT `+ data_star + `,` + data_batas + `
    `

    db.query(jml_data, (err, rows) => {
        if (err) {
            console.log(err);
            res.status(500).send(rows)
        } else {
            // res.status(200).send(rows)
            halaman = Math.ceil(rows.length / data_batas);
            if (halaman < 1) { halaman = 1 }
            // ========================
            db.query(query, (err2, result) => {
                if (err2) {
                    // console.log(err2)
                    res.json(err)
                }
                else {
                    halaman = Math.ceil(rows.length / data_batas);
                    if (halaman < 1) { halaman = 1 }
                    res.json({
                        data: result,
                        jml_data: halaman
                    })
                }
            })
            // ========================
        }
    })
})


// SAMPLE
router.post('/changeData', (req, res) => {
    const query = `
        UPDATE fotosample SET
        status = ?,
        keterangan = ?,
        verificationBy = ?

        WHERE id = ?
    
    `
    const values = [req.body.status, req.body.keterangan, req.user.profile.NIP, req.body.id];

    db.query(query, values, (err, rows) => {
        if (err) {
            console.log(err);
            res.status(500).send(rows)
        } else {
            res.status(200).send(rows)
        }
    })
})

router.get('/aa', (req, res) => {

    var data = req.user.profile
    var NIP = data.NIP
    res.send(NIP)

});

router.post('/view', (req, res) => {

    var data = req.user.profile
    var NIP = data.NIP

    var query = `
        SELECT fotosample.* FROM fotosample
        WHERE fotosample.nip = '`+ NIP + `'
    
    `;

    db.query(query, (err, row) => {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            res.send(row);
        }
    })
});


router.post('/addData', upload.single("file"), (req, res) => {
    console.log("UPLOAD SAMPEL FOTO DI PANGGIL")
    console.log(req.body);

    // Batasi maksimal 2 foto per NIP
    const nip = req.body.nip;
    db.query(`SELECT COUNT(*) as total FROM fotosample WHERE nip = ?`, [nip], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ error: 'Database error saat cek jumlah foto.' });
        }
        if (result[0].total >= 2) {
            return res.status(400).send({ error: 'Maksimal 2 foto sample per NIP.' });
        }

        var insert = `INSERT INTO fotosample (file, nip, vectors) VALUES (?, ?, ?)`;
        const values = [req.file.filename, nip, req.body.vectors];
        db.query(insert, values, (err, row) => {
            if (err) {
                console.log(err);
                res.status(500).send(err);
            } else {
                res.status(200).send(row);
            }
        });
    });
});

router.post('/removeData', (req, res) => {
    var file = req.body.fileOld
    hapus_file(file);

    var query = `
        DELETE FROM fotosample WHERE id = '`+ req.body.id + `'; 
    `;
    db.query(query, (err, row) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(row);
        }
    });
})

function hapus_file(file) {
    const path = 'uploads/' + file;

    fs.unlink(path, (err) => {
        if (err) {
            console.error(err)
            return
        }
    })

}






module.exports = router;