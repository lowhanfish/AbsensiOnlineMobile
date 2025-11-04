const express = require('express');
var db = require('../../../../db/MySql/kinerja');


var uniqid = require('uniqid');
const router = express.Router();


const fs = require('fs');
var multer=require("multer");
var upload = require('../../../../db/multer/pdf');



router.post('/view', (req, res) => {


    var data_batas = 8;

    if (req.body.page_limit == null || req.body.page_limit==undefined || req.body.page_limit == '') {
        data_batas = 8
    } else {
        data_batas = req.body.page_limit
    }


    var filter_status = ''
    var Jmlfilter_status = ''
    if (req.body.status == null || req.body.status==undefined || req.body.status == '') {
        filter_status = ''
        Jmlfilter_status = ''
    } else {
        filter_status = `worksheet.status = `+req.body.status+` AND`
        Jmlfilter_status = `worksheet.status = `+req.body.status+` AND`
    }

    var filter_penilai = ''
    var Jmlfilter_penilai = ''
    if (req.body.penilai == null || req.body.penilai==undefined || req.body.penilai == '') {
        filter_penilai = ''
        Jmlfilter_penilai = ''
    } else {
        filter_penilai = `AND (asn.penilai = '`+req.body.penilai+`')`
        Jmlfilter_penilai = `AND (asn.penilai = '`+req.body.penilai+`')`
    }



    var filter_dinilai = ''
    var Jmlfilter_dinilai = ''
    if (req.body.NIP == null || req.body.NIP==undefined || req.body.NIP == '') {
        filter_dinilai = ''
        Jmlfilter_dinilai = ''
    } else {
        filter_dinilai = ` AND (worksheet.nip = '`+req.body.NIP+`')`
        Jmlfilter_dinilai = ` AND (worksheet.nip = '`+req.body.NIP+`')`
    }

 


    var data_star = (req.body.data_ke - 1)* data_batas;
    var cari = req.body.cari_value;
    var halaman = 1;

    let jml_data = ` 
        SELECT worksheet.id 
        FROM kinerja2022.worksheet worksheet

        LEFT JOIN kinerja2022.asn asn
        ON asn.nip = worksheet.nip   


        WHERE
        `+Jmlfilter_status+`
        (worksheet.worksheet_uraian LIKE '%`+ cari +`%') 
        `+Jmlfilter_dinilai+`
        `+Jmlfilter_penilai+`
    
    `;

    let view = `
        SELECT 
        worksheet.*, 
        ku_ra_strategis_indikator.uraian as ku_ra_strategis_indikator_uraian,

        CONCAT(

            ku_ra_strategis_indikator.jan + 
            ku_ra_strategis_indikator.feb +
            ku_ra_strategis_indikator.mar +
            ku_ra_strategis_indikator.apr +
            ku_ra_strategis_indikator.mei +
            ku_ra_strategis_indikator.jun +
            ku_ra_strategis_indikator.jul +
            ku_ra_strategis_indikator.agu +
            ku_ra_strategis_indikator.sep +
            ku_ra_strategis_indikator.okt +
            ku_ra_strategis_indikator.nov +
            ku_ra_strategis_indikator.des
        ) AS ku_ra_target_indikator,

        ku_ra_strategis_indikator.satuan as ku_ra_strategis_indikator_satuan,
        ku_ra_strategis.uraian as ku_ra_strategis_uraian,

        pk_unit_sasaran_indikator.uraian as pk_unit_sasaran_indikator_uraian,
        pk_unit_sasaran_indikator.target as pk_unit_sasaran_indikator_target,
        pk_unit_sasaran_indikator.satuan as pk_unit_sasaran_indikator_satuan,

        pk_unit_sasaran.uraian as pk_unit_sasaran_uraian,
        pk_unit_sasaran.tahun as pk_unit_sasaran_tahun,

        biodata.nama,
        biodata.gelar_depan,
        biodata.gelar_belakang,
        jabatan.jabatan as jabatan_uraian,
        unit_kerja.unit_kerja as unit_kerja_uraian,


        asn.penilai as penilai

        FROM kinerja2022.worksheet worksheet

        LEFT JOIN kinerja2022.ku_ra_strategis_indikator ku_ra_strategis_indikator
        ON ku_ra_strategis_indikator.id = worksheet.ku_ra_strategis_indikator

        LEFT JOIN kinerja2022.ku_ra_strategis ku_ra_strategis
        ON ku_ra_strategis.id = ku_ra_strategis_indikator.ku_ra_strategis 

        LEFT JOIN kinerja2022.pk_unit_sasaran_indikator pk_unit_sasaran_indikator
        ON pk_unit_sasaran_indikator.id = ku_ra_strategis.pk_unit_sasaran_indikator  

        LEFT JOIN kinerja2022.pk_unit_sasaran pk_unit_sasaran
        ON pk_unit_sasaran.id = pk_unit_sasaran_indikator.pk_unit_sasaran   

        LEFT JOIN kinerja2022.asn asn
        ON asn.nip = worksheet.nip   

        LEFT JOIN simpeg.jabatan jabatan
        ON jabatan._id = pk_unit_sasaran.delegasi

        LEFT JOIN simpeg.unit_kerja unit_kerja
        ON unit_kerja.id = jabatan.unit_kerja

        LEFT JOIN simpeg.biodata biodata
        ON worksheet.nip = biodata.nip

        
        WHERE
        `+filter_status+`
        (worksheet.worksheet_uraian LIKE '%`+ cari +`%') 
        `+filter_dinilai+`
        `+filter_penilai+`

        
        ORDER BY worksheet.creatdAt DESC
        LIMIT `+data_star+`,`+data_batas+`

    `;

    db.query(jml_data, (err, row)=>{
        if (err) {
            console.log(err);
            res.json(err)
        }else{
            halaman = Math.ceil(row.length/data_batas);
            if(halaman<1){halaman = 1}
            // ========================
            db.query(view, (err, result)=>{
                if (err) {console.log(err); res.json(err)}
                else{
                    halaman = Math.ceil(row.length/data_batas);
                    if(halaman<1){halaman = 1}
                    // console.log(result);
                    res.json({
                        data : result,
                        jml_data : halaman,
                        total:row.length,
                    })

                }
            })
            // ========================

        }
    })
});

router.post('/view2', (req, res) => {

    console.log(req.body)

    let queryz = `
        SELECT worksheet.*,
        periode.uraian as periode_uraian,
        periode.dari,
        periode.sampai

        FROM worksheet

        LEFT JOIN periode
        ON periode.id = worksheet.periode_id


        WHERE worksheet.ku_ra_strategis_indikator = `+req.body.ku_ra_strategis_indikator+` 
    `;

    db.query(queryz, (err, row)=>{
        cek_error(res, err, row);
    })

   
});

router.post('/addDataxxxx', (req,res)=>{
    // console.log(req.user)
    console.log(req.body)
    let insert = `INSERT INTO worksheet 
        (
            ku_ra_strategis_indikator, 
            ku_ra_strategis_indikator_capaian, 
            pk_unit_sasaran_indikator_capaian,
            hari,
            bulan,
            tahun,
            worksheet_uraian,
            worksheet_capaian,
            worksheet_satuan,
            keterangan,
            nip,
            creatdBy,
            creatdAt
        )
        VALUES
        (
            `+req.body.ku_ra_strategis_indikator+`,
            `+req.body.ku_ra_strategis_indikator_capaian+`,
            `+req.body.pk_unit_sasaran_indikator_capaian+`,
            `+req.body.hari+`,
            `+req.body.bulan+`,
            `+req.body.tahun+`,
            '`+req.body.worksheet_uraian+`',
            `+req.body.worksheet_capaian+`,
            '`+req.body.worksheet_satuan+`',
            '`+req.body.keterangan+`',
            '`+req.body.nip+`',
            '`+req.user._id+`',
            NOW()
        );
    `

    db.query(insert, (err, row)=>{
        cek_error(res, err, row);
    })


    // res.send("OK")
});


router.post('/addData',upload.array("file",12), (req,res)=>{

    console.log(req.body);

    if (req.files == undefined) {
        console.log('file kosong')
    } else {
        console.log('file ada')
    }

    let insert = `INSERT INTO worksheet 
        (
            ku_ra_strategis_indikator, 
            ku_ra_strategis_indikator_capaian, 
            pk_unit_sasaran_indikator_capaian,
            periode_id,
            hari,
            bulan,
            tahun,
            worksheet_uraian,
            worksheet_capaian,
            worksheet_satuan,
            worksheet_lokasi,
            keterangan,
            nip,
            creatdBy,
            creatdAt
        )
        VALUES
        (
            `+req.body.ku_ra_strategis_indikator+`,
            `+req.body.ku_ra_strategis_indikator_capaian+`,
            `+ req.body.pk_unit_sasaran_indikator_capaian +`,
            `+req.body.periode_id+`,
            `+req.body.hari+`,
            `+req.body.bulan+`,
            `+req.body.tahun+`,
            '`+req.body.worksheet_uraian+`',
            `+req.body.worksheet_capaian+`,
            '`+req.body.worksheet_satuan+`',
            '`+req.body.worksheet_lokasi+`',
            '`+req.body.keterangan+`',
            '`+req.body.nip+`',
            '`+req.user._id+`',
            NOW()
        );
    `

    

    db.query(insert, (err, row)=>{
        if(err) {
            console.log(err);
            res.send(err);
        }else{
            if (req.files == undefined) {
                res.send(row)
            } else {

                var filex = req.files
                filex.forEach(element => {

                    // var fileThumb = 'thumbnail' + element.filename
                    // IMAGE.resizeImg(element.filename)
                    let insert = `INSERT lampiran (file, type, ref) 
                    VALUES ('`+element.filename+`', '`+element.mimetype+`' , `+row.insertId+`)
                    `
                
                    db.query(insert, (errx, rowx)=>{
                        if(errx) {
                            console.log(errx);
                            // res.send(errx);
                        }else{
                            // res.send(rowx)
                        }
                    })
                    
                });

                res.send(row)

            }
        }
    })



    // res.send(row)

    // console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
});

router.post('/editData', (req, res) => {
    console.log(req.body);
    var update = `
        UPDATE worksheet SET
        periode_id = `+req.body.periode_id+`,
        worksheet_uraian = '`+req.body.worksheet_uraian+`',
        worksheet_capaian = `+req.body.worksheet_capaian+`,
        worksheet_satuan = '`+ req.body.worksheet_satuan +`',
        worksheet_lokasi = '`+ req.body.worksheet_lokasi +`',
        status = 0,
        ku_ra_strategis_indikator_capaian = `+ req.body.ku_ra_strategis_indikator_capaian +`,
        pk_unit_sasaran_indikator_capaian = `+req.body.pk_unit_sasaran_indikator_capaian+`,
        keterangan = '`+ req.body.keterangan +`',
        keterangan_status = 'Dalam Proses Verifikasi',
        editedBy = '`+req.user._id+`',
        editedAt = NOW()

        WHERE id = `+req.body.id+`
    `;

    db.query(update, (err, row)=>{
        cek_error(res, err, row);
    })

    // res.send('OK')

})

router.post('/removeData', (req, res) => {
    console.log(req.body);
    let query = `
        DELETE FROM worksheet WHERE id = `+req.body.id+`;
    `;
    db.query(query, (err, row)=>{
        cek_error(res, err, row);
    });
})


router.post('/rejectData', (req, res) => {

    var user = req.user
    var profile = user.profile

    var update = `
        UPDATE worksheet SET
        status = 2,
        keterangan_status = '`+req.body.keterangan_status+`',
        nip_verifikator = '`+profile.nip+`'

        WHERE id = `+req.body.id+`
    `;

    db.query(update, (err, row)=>{
        cek_error(res, err, row);
    })


    // console.log(req.body);
    // res.send('data')

})

router.post('/approveData', (req, res) => {

    var user = req.user
    var profile = user.profile
    
    var update = `
        UPDATE worksheet SET
        status = 1,
        score = '`+req.body.score+`',
        keterangan_status = 'Uraian kerja telah diverifikasi',
        nip_verifikator = '`+profile.nip+`'

        WHERE id = `+req.body.id+`
    `;

    db.query(update, (err, row)=>{
        cek_error(res, err, row);
    })

    // console.log(req.body);
    // res.send("ok")

})

router.get('/list', (req, res)=> {
    let query = `
        SELECT * FROM worksheet
    `;
    db.query(query, (err, row)=>{
        cek_error(res, err, row);
    });
})

router.post('/getLamp', (req, res) => {

    console.log(req.body)

    let queryz = `
        SELECT * 
        FROM lampiran  
        WHERE lampiran.ref = `+req.body.ref+` 
    `;

    db.query(queryz, (err, row)=>{
        cek_error(res, err, row);
    })

   
});

router.post('/removeDataLamp', (req, res)=> {
    let query = `
        DELETE FROM lampiran WHERE id = `+req.body.id+`;
    `;
    db.query(query, (err, row)=>{
        if (err) {
            console.log(err)
            res.send(err)
        } else {
            hapus_file(req.body.file)
            res.send("OK")
        }
    });
})

router.post('/lap_harian', (req, res) => {
    var view = `
        SELECT 
        worksheet.*
        FROM kinerja2022.worksheet worksheet
        WHERE 
        (worksheet.nip = '`+req.body.nip+`' AND
        worksheet.status = 1) AND
        (worksheet.bulan = `+req.body.bulan+` AND worksheet.tahun = `+req.body.tahun+`)
    `

    db.query(view, async (err, rows) => {
        
        
        int_d = new Date(req.body.tahun, req.body.bulan,1);
        dx = new Date(int_d - 1);
        lastDate = dx.getDate()
        


        // console.log(req.user.profile);
        var datax = await loppingHari(req, rows, lastDate)
        

        
        if (err) {
            console.log(err);
        } else {
            res.send (datax)
        }



    })
});



router.post('/profile', (req, res)=> {
    console.log('=================================================================');
    console.log(req.body);
    let query = `
        SELECT asn.* FROM asn where asn.nip = '`+req.body.nip+`'
    `;
    db.query(query, (err, row)=>{
        if (err) {
            console.log(err);
            res.send(err)
        }else{
            console.log(row);
            res.send(row[0])
        }
    });
})


async function loppingHari(req, rows, lastDate) {


    // console.log(req.body);

    // ====================== TAMPUNG DULU SEMUA HARI LIBUR ================
    var hariLibur = await getLibur(req, rows)


    return new Promise((resolve, reject) => {
        var datax = []


        // ====================== SETELAH ITU, TAMPUNG LAGI HARI/TGL DI BULAN BERSANGKUTAN ================
        for (let i = 1; i <= lastDate; i++) {
            datax.push({
                hari: i,
                bulan: req.body.bulan,
                tahun: req.body.tahun,
                data: []
            })
        }


        // ====================== SELANJUTNYA HAPUS SEMUA HARI LIBURNYA DI HARI/TGL YANG SUDAH KITA TAMPUNG ================
        for (let j = 0; j < datax.length; j++) {
            var dt = new Date(datax[j].bulan + '-' + datax[j].hari + '-' + datax[j].tahun);
            // console.log(dt);
            var dtx = dt.getDay()

            if (dtx == 0) {
                console.log("LIBUR");
                datax.splice(j, 1);
            }
                
        }



        for (let j = 0; j < datax.length; j++) {
            var dt = new Date(datax[j].bulan + '-' + datax[j].hari + '-' + datax[j].tahun);
            // console.log(dt);
            var dtx = dt.getDay()

            if (dtx == 6) {
                console.log("LIBUR");
                datax.splice(j, 1);
            }
                
        }

        
        // ====================== SELANJUTNYA HAPUS SEMUA HARI SABTU DAN MINGGU DI HARI/TGL YANG SUDAH KITA TAMPUNG ================
        for (let i = 0; i < hariLibur.length; i++) {
            for (let j = 0; j < datax.length; j++) {
                
                if (hariLibur[i].hari == datax[j].hari) {
                    datax.splice(j, 1);
                }
                
            }
        }


        



        // ====================== COCOKKAN DAN INSERT AKTIFITAS/WORKSHEET DI HARI BERSANGKUTAN ================
        datax.forEach(element => {
            rows.forEach(element1 => {
                if (element.hari == element1.hari) {
                    // element.data.splice(0, 1);
                    element.data.push(element1)
                } 
            });
        });

        // ====================== INI PENTING, JADI MISALKAN AKTIFITASNYA TIDAK ADA MAKA DI DEFAULTKAN UTK SCORENYA ADALAH = 0 ================
        datax.forEach(element => {
            
            if (element.data.length == 0) {
                element.data.push ({
                    score: 0,
                    worksheet_uraian: '-',
                    worksheet_lokasi: '-',
                    worksheet_capaian: '-',
                })
            }


        });

        // ====================== NAAAAH... TERAHIR KIRIM DEH DATANYA ================
        resolve(datax)


    })
    
    
    
    
}

async function getLibur(req) {
    
    // console.log(req.body.tahun);
    return new Promise((resolve, reject) => {
        let query = `
            SELECT 
            waktulibur.dd as hari,
            waktulibur.mm as bulan,
            waktulibur.yy as tahun

            FROM absensi.waktulibur waktulibur

            WHERE waktulibur.mm = `+req.body.bulan+` AND waktulibur.yy = `+req.body.tahun+` 
        `;
        db.query(query, (err, row)=>{
            resolve (row)
        });
    })
    
}

function cek_error(res, err, rows){
    if(err) {
        console.log(err);
        res.send(err);
    }else{
        res.send(rows);
    }

}



function hapus_file(file){
    const path = 'uploads/'+file;

    fs.unlink(path, (err) => {
        if (err) {
          console.error(err)
          return
        }
    })

}


module.exports = router;