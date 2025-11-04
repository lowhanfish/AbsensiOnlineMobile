const express = require('express');
var db = require('../../../../db/MySql/kinerja');
var uniqid = require('uniqid');
const router = express.Router();

router.get('/test', (req, res) => {
    console.log(req.body)

    var view = `
        SELECT 
        pk_unit_sasaran.*,

        pk_unit_sasaran_indikator.id as indikator_id,
        pk_unit_sasaran_indikator.uraian as indikator_uraian,
        pk_unit_sasaran_indikator.target as indikator_target,
        pk_unit_sasaran_indikator.satuan as indikator_satuan,
        pk_unit_sasaran_indikator.tahun as indikator_tahun,
        pk_unit_sasaran_indikator.keterangan as indikator_keterangan,


        manual_ik_unit.id as manual_ik_id,
        manual_ik_unit.pk_unit_sasaran_indikator as manual_ik_pk_unit_sasaran_indikator,
        manual_ik_unit.deskripsi as manual_ik_deskripsi,
        manual_ik_unit.definisi as manual_ik_definisi,
        manual_ik_unit.formula as manual_ik_formula,
        manual_ik_unit.tujuan as manual_ik_tujuan,
        manual_ik_unit.satuan_ukur as manual_ik_satuan_ukur,
        manual_ik_unit.master_jenis_indikator as manual_ik_master_jenis_indikator,
        manual_ik_unit.penanggung_jawab as manual_ik_penanggung_jawab,
        manual_ik_unit.penyedia_data as manual_ik_penyedia_data,
        manual_ik_unit.sumber_data as manual_ik_sumber_data,
        manual_ik_unit.master_periode_pelaporan as manual_ik_master_periode_pelaporan,
        manual_ik_unit.penanggung_jawab_cq as manual_ik_penanggung_jawab_cq,
        master_jenis_indikator.uraian as manual_ik_master_jenis_indikator_uraian,
        master_periode_pelaporan.uraian as manual_ik_master_periode_pelaporan_uraian,

        ku_ra_strategis.id as ra_id,
        ku_ra_strategis.uraian as ra_uraian,
        ku_ra_strategis.tahun as ra_tahun,
        ku_ra_strategis.keterangan as ra_keterangan,

        (
            SELECT 
                (
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
                ) 
           
            FROM ku_ra_strategis_indikator
            WHERE ku_ra_strategis_indikator.ku_ra_strategis = ku_ra_strategis.id
        
        ) as ra_target_indikator,
        (
            SELECT 
            ku_ra_strategis_indikator.uraian
           
            FROM ku_ra_strategis_indikator
            WHERE ku_ra_strategis_indikator.ku_ra_strategis = ku_ra_strategis.id
        
        ) as ra_uraian_indikator,


        ku_ra_strategis_indikator.id as target_id,
        ku_ra_strategis_indikator.uraian as target_uraian,
        ku_ra_strategis_indikator.jan as target_jan ,
        ku_ra_strategis_indikator.feb as target_feb , 
        ku_ra_strategis_indikator.mar as target_mar , 
        ku_ra_strategis_indikator.apr as target_apr , 
        ku_ra_strategis_indikator.mei as target_mei , 
        ku_ra_strategis_indikator.jun as target_jun , 
        ku_ra_strategis_indikator.jul as target_jul , 
        ku_ra_strategis_indikator.agu as target_agu , 
        ku_ra_strategis_indikator.sep as target_sep , 
        ku_ra_strategis_indikator.okt as target_okt , 
        ku_ra_strategis_indikator.nov as target_nov , 
        ku_ra_strategis_indikator.des as target_des ,
        ku_ra_strategis_indikator.satuan as target_satuan 

        FROM pk_unit_sasaran

        LEFT JOIN pk_unit_sasaran_indikator
        ON pk_unit_sasaran.id = pk_unit_sasaran_indikator.pk_unit_sasaran

        LEFT JOIN manual_ik_unit
        ON pk_unit_sasaran_indikator.id = manual_ik_unit.pk_unit_sasaran_indikator

        LEFT JOIN master_jenis_indikator
        ON manual_ik_unit.master_jenis_indikator = master_jenis_indikator.id

        LEFT JOIN master_periode_pelaporan
        ON manual_ik_unit.master_periode_pelaporan = master_periode_pelaporan.id

        LEFT JOIN ku_ra_strategis
        ON ku_ra_strategis.pk_unit_sasaran_indikator = pk_unit_sasaran_indikator.id

        LEFT JOIN ku_ra_strategis_indikator
        ON ku_ra_strategis.id = ku_ra_strategis_indikator.ku_ra_strategis

        WHERE pk_unit_sasaran.tahun = 2022
    `

    db.query(view, (err, rows)=>{
        
        if (err) {
            console.log(err)
        } else {
            var data = []


            rows.forEach(rowku => {

                var item = data.find(item => item.id === rowku.id);
                if (item == undefined) {

                    data.push({
                        id :rowku.id,
                        uraian :rowku.uraian,
                        tahun :rowku.tahun,
                        master_jenis_sasaran_ku :rowku.master_jenis_sasaran_ku,
                        keterangan :rowku.keterangan,
                        indikator : []
                    })
                    data.forEach(sasaran => {
                        rows.forEach(rowku1 => {
                            
                            if (sasaran.id == rowku1.id) {
                                var item1 = sasaran.indikator.find(item1 => item1.indikator_id === rowku1.indikator_id);
                                if (item1 == undefined) {
                                    sasaran.indikator.push({
                                        indikator_id :rowku1.indikator_id,
                                        indikator_uraian :rowku1.indikator_uraian,
                                        indikator_target :rowku1.indikator_target,
                                        indikator_satuan :rowku1.indikator_satuan,
                                        indikator_tahun :rowku1.indikator_tahun,
                                        indikator_keterangan :rowku1.indikator_keterangan,

                                        manual_ik_id :rowku1.manual_ik_id,
                                        manual_ik_pk_unit_sasaran_indikator :rowku1.manual_ik_pk_unit_sasaran_indikator,
                                        manual_ik_deskripsi :rowku1.manual_ik_deskripsi,
                                        manual_ik_definisi :rowku1.manual_ik_definisi,
                                        manual_ik_formula :rowku1.manual_ik_formula,
                                        manual_ik_tujuan :rowku1.manual_ik_tujuan,
                                        manual_ik_satuan_ukur :rowku1.manual_ik_satuan_ukur,
                                        manual_ik_master_jenis_indikator :rowku1.manual_ik_master_jenis_indikator,
                                        manual_ik_penanggung_jawab :rowku1.manual_ik_penanggung_jawab,
                                        manual_ik_penyedia_data :rowku1.manual_ik_penyedia_data,
                                        manual_ik_sumber_data :rowku1.manual_ik_sumber_data,
                                        manual_ik_master_periode_pelaporan :rowku1.manual_ik_master_periode_pelaporan,
                                        manual_ik_penanggung_jawab_cq :rowku1.manual_ik_penanggung_jawab_cq,

                                        manual_ik_master_jenis_indikator_uraian : rowku1.manual_ik_master_jenis_indikator_uraian,
                                        manual_ik_master_periode_pelaporan_uraian : rowku1.manual_ik_master_periode_pelaporan_uraian,
                                        ra : []
                                    })


                                    sasaran.indikator.forEach(raku => {
                                        rows.forEach(rowku2 => {
                                            if (raku.indikator_id === rowku2.indikator_id) {

                                                var item2 = raku.ra.find(item2 => item2.ra_id === rowku2.ra_id);
                                                if (item2 == undefined) {
                                                    raku.ra.push({
                                                        ra_id : rowku2.ra_id,
                                                        ra_uraian : rowku2.ra_uraian,
                                                        ra_uraian_indikator : rowku2.ra_uraian_indikator,
                                                        ra_target_indikator : rowku2.ra_target_indikator,

                                                        target_jan : rowku2.target_jan,
                                                        target_feb : rowku2.target_feb,
                                                        target_mar : rowku2.target_mar,
                                                        target_apr : rowku2.target_apr,
                                                        target_mei : rowku2.target_mei,
                                                        target_jun : rowku2.target_jun,
                                                        target_jul : rowku2.target_jul,
                                                        target_agu : rowku2.target_agu,
                                                        target_sep : rowku2.target_sep,
                                                        target_okt : rowku2.target_okt,
                                                        target_nov : rowku2.target_nov,
                                                        target_des : rowku2.target_des,
                                                        target_satuan : rowku2.target_satuan,
                                                        target_uraian : rowku2.target_uraian,
                                                        target_id :  rowku2.target_id,
                                                    })
                                                } 
                                            }





                                        });
                                    });



                                }
                            }
                        });
    
                    });







                } 




            });


            res.send(data)
            // res.send(rows)

        }


    })    

});



router.get('/', (req, res) => {
    var view = `
        SELECT 
        ku_ra_strategis.*
        FROM ku_ra_strategis
    `

    db.query(view, (err, rows)=>{
        cek_error(res, err, rows)
    })
});

router.post('/view', (req, res) => {
    console.log(req.body)


    var FilterKelas = ''

    if (req.body.kelas == null || req.body.kelas == undefined || req.body.kelas == '') {
        FilterKelas = ''
    } else {
        FilterKelas = `AND pk_unit_sasaran.kelas = `+req.body.kelas+``
    }



    var view = `
    SELECT 
        pk_unit_sasaran.*,

        pk_unit_sasaran_indikator.id as indikator_id,
        pk_unit_sasaran_indikator.uraian as indikator_uraian,
        pk_unit_sasaran_indikator.target as indikator_target,
        pk_unit_sasaran_indikator.satuan as indikator_satuan,
        pk_unit_sasaran_indikator.tahun as indikator_tahun,
        pk_unit_sasaran_indikator.keterangan as indikator_keterangan,


        manual_ik_unit.id as manual_ik_id,
        manual_ik_unit.pk_unit_sasaran_indikator as manual_ik_pk_unit_sasaran_indikator,
        manual_ik_unit.deskripsi as manual_ik_deskripsi,
        manual_ik_unit.definisi as manual_ik_definisi,
        manual_ik_unit.formula as manual_ik_formula,
        manual_ik_unit.tujuan as manual_ik_tujuan,
        manual_ik_unit.satuan_ukur as manual_ik_satuan_ukur,
        manual_ik_unit.master_jenis_indikator as manual_ik_master_jenis_indikator,
        manual_ik_unit.penanggung_jawab as manual_ik_penanggung_jawab,
        manual_ik_unit.penyedia_data as manual_ik_penyedia_data,
        manual_ik_unit.sumber_data as manual_ik_sumber_data,
        manual_ik_unit.master_periode_pelaporan as manual_ik_master_periode_pelaporan,
        manual_ik_unit.penanggung_jawab_cq as manual_ik_penanggung_jawab_cq,
        master_jenis_indikator.uraian as manual_ik_master_jenis_indikator_uraian,
        master_periode_pelaporan.uraian as manual_ik_master_periode_pelaporan_uraian,

        ku_ra_strategis.id as ra_id,
        ku_ra_strategis.uraian as ra_uraian,
        ku_ra_strategis.tahun as ra_tahun,
        ku_ra_strategis.keterangan as ra_keterangan,

        (
            SELECT 
                (
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
                ) 
           
            FROM ku_ra_strategis_indikator
            WHERE ku_ra_strategis_indikator.ku_ra_strategis = ku_ra_strategis.id
        
        ) as ra_target_indikator,
        (
            SELECT 
            ku_ra_strategis_indikator.uraian
           
            FROM ku_ra_strategis_indikator
            WHERE ku_ra_strategis_indikator.ku_ra_strategis = ku_ra_strategis.id
        
        ) as ra_uraian_indikator,
        
        ku_ra_strategis.id as ra_id,
        ku_ra_strategis_indikator.id as ra_indikator_id,
        ku_ra_strategis_indikator.uraian as target_uraian,
        ku_ra_strategis_indikator.jan as target_jan ,
        ku_ra_strategis_indikator.feb as target_feb , 
        ku_ra_strategis_indikator.mar as target_mar , 
        ku_ra_strategis_indikator.apr as target_apr , 
        ku_ra_strategis_indikator.mei as target_mei , 
        ku_ra_strategis_indikator.jun as target_jun , 
        ku_ra_strategis_indikator.jul as target_jul , 
        ku_ra_strategis_indikator.agu as target_agu , 
        ku_ra_strategis_indikator.sep as target_sep , 
        ku_ra_strategis_indikator.okt as target_okt , 
        ku_ra_strategis_indikator.nov as target_nov , 
        ku_ra_strategis_indikator.des as target_des ,
        ku_ra_strategis_indikator.satuan as target_satuan,

        (
            SELECT 
            IFNULL(SUM(worksheet.ku_ra_strategis_indikator_capaian), 0)
           
            FROM worksheet
            WHERE worksheet.ku_ra_strategis_indikator = ku_ra_strategis_indikator.id
        
        ) as ra_uraian_indikator_realisasi,

        (
            SELECT 

            IFNULL(SUM(worksheet.pk_unit_sasaran_indikator_capaian), 0)
           
            FROM worksheet

            LEFT JOIN ku_ra_strategis_indikator
            ON ku_ra_strategis_indikator.id = worksheet.ku_ra_strategis_indikator

            LEFT JOIN ku_ra_strategis ku_ra_strategisx
            ON ku_ra_strategisx.id = ku_ra_strategis_indikator.ku_ra_strategis

            WHERE ku_ra_strategisx.id = ku_ra_strategis.id
        
        ) as indikator_realisasi ,

        (
            SELECT 
            IFNULL(COUNT(worksheet.id), 0)
           
            FROM worksheet
            WHERE worksheet.status = 2 AND 
            ku_ra_strategis_indikator.id =  worksheet.ku_ra_strategis_indikator
        
        ) as jml_tolak



        FROM pk_unit_sasaran

        LEFT JOIN pk_unit_sasaran_indikator
        ON pk_unit_sasaran.id = pk_unit_sasaran_indikator.pk_unit_sasaran

        LEFT JOIN manual_ik_unit
        ON pk_unit_sasaran_indikator.id = manual_ik_unit.pk_unit_sasaran_indikator

        LEFT JOIN master_jenis_indikator
        ON manual_ik_unit.master_jenis_indikator = master_jenis_indikator.id

        LEFT JOIN master_periode_pelaporan
        ON manual_ik_unit.master_periode_pelaporan = master_periode_pelaporan.id

        LEFT JOIN ku_ra_strategis
        ON ku_ra_strategis.pk_unit_sasaran_indikator = pk_unit_sasaran_indikator.id

        LEFT JOIN ku_ra_strategis_indikator
        ON ku_ra_strategis.id = ku_ra_strategis_indikator.ku_ra_strategis

    WHERE   (
                pk_unit_sasaran.tahun = `+ req.body.tahun + ` 
                AND pk_unit_sasaran.delegasi = '`+ req.body.delegasi +`'
            )
    
    `+ FilterKelas +`

    `

    db.query(view, (err, rows)=>{
        
        if (err) {
            console.log(err)
        } else {
            var data = []


            rows.forEach(rowku => {

                var item = data.find(item => item.id === rowku.id);
                if (item == undefined) {

                    data.push({
                        id :rowku.id,
                        uraian :rowku.uraian,
                        tahun :rowku.tahun,
                        master_jenis_sasaran_ku :rowku.master_jenis_sasaran_ku,
                        keterangan :rowku.keterangan,
                        indikator : []
                    })
                    data.forEach(sasaran => {
                        rows.forEach(rowku1 => {
                            
                            if (sasaran.id == rowku1.id) {
                                var item1 = sasaran.indikator.find(item1 => item1.indikator_id === rowku1.indikator_id);
                                if (item1 == undefined) {
                                    sasaran.indikator.push({
                                        indikator_id :rowku1.indikator_id,
                                        indikator_uraian :rowku1.indikator_uraian,
                                        indikator_target :rowku1.indikator_target,
                                        indikator_satuan :rowku1.indikator_satuan,
                                        indikator_tahun :rowku1.indikator_tahun,
                                        indikator_keterangan: rowku1.indikator_keterangan,
                                        
                                        indikator_realisasi : rowku1.indikator_realisasi,

                                        manual_ik_id :rowku1.manual_ik_id,
                                        manual_ik_pk_unit_sasaran_indikator :rowku1.manual_ik_pk_unit_sasaran_indikator,
                                        manual_ik_deskripsi :rowku1.manual_ik_deskripsi,
                                        manual_ik_definisi :rowku1.manual_ik_definisi,
                                        manual_ik_formula :rowku1.manual_ik_formula,
                                        manual_ik_tujuan :rowku1.manual_ik_tujuan,
                                        manual_ik_satuan_ukur :rowku1.manual_ik_satuan_ukur,
                                        manual_ik_master_jenis_indikator :rowku1.manual_ik_master_jenis_indikator,
                                        manual_ik_penanggung_jawab :rowku1.manual_ik_penanggung_jawab,
                                        manual_ik_penyedia_data :rowku1.manual_ik_penyedia_data,
                                        manual_ik_sumber_data :rowku1.manual_ik_sumber_data,
                                        manual_ik_master_periode_pelaporan :rowku1.manual_ik_master_periode_pelaporan,
                                        manual_ik_penanggung_jawab_cq :rowku1.manual_ik_penanggung_jawab_cq,

                                        manual_ik_master_jenis_indikator_uraian : rowku1.manual_ik_master_jenis_indikator_uraian,
                                        manual_ik_master_periode_pelaporan_uraian : rowku1.manual_ik_master_periode_pelaporan_uraian,
                                        ra : []
                                    })


                                    sasaran.indikator.forEach(raku => {
                                        rows.forEach(rowku2 => {
                                            if (raku.indikator_id === rowku2.indikator_id) {

                                                var item2 = raku.ra.find(item2 => item2.ra_id === rowku2.ra_id);
                                                if (item2 == undefined) {
                                                    raku.ra.push({
                                                        ra_id : rowku2.ra_id,
                                                        ra_uraian : rowku2.ra_uraian,
                                                        ra_uraian_indikator : rowku2.ra_uraian_indikator,
                                                        ra_target_indikator: rowku2.ra_target_indikator,
                                                        
                                                        ra_indikator_id : rowku2.ra_indikator_id,
                                                        ra_uraian_indikator_realisasi : rowku2.ra_uraian_indikator_realisasi,

                                                        target_jan : rowku2.target_jan,
                                                        target_feb : rowku2.target_feb,
                                                        target_mar : rowku2.target_mar,
                                                        target_apr : rowku2.target_apr,
                                                        target_mei : rowku2.target_mei,
                                                        target_jun : rowku2.target_jun,
                                                        target_jul : rowku2.target_jul,
                                                        target_agu : rowku2.target_agu,
                                                        target_sep : rowku2.target_sep,
                                                        target_okt : rowku2.target_okt,
                                                        target_nov : rowku2.target_nov,
                                                        target_des : rowku2.target_des,
                                                        
                                                        target_satuan : rowku2.target_satuan,
                                                        target_uraian : rowku2.target_uraian,
                                                        target_id: rowku2.target_id,
                                                        jml_tolak : rowku2.jml_tolak,
                                                        
                                                    })
                                                } 
                                            }





                                        });
                                    });



                                }
                            }
                        });
    
                    });







                } 




            });


            res.send(data)
            // res.send(rows)

        }


    })    

});

router.post('/addData', (req,res)=>{
    console.log(req.body)
    // req.send('OK')
    var form = req.body.form
    var indikator = req.body.indikator
    let insert = `INSERT INTO ku_ra_strategis (pk_unit_sasaran_indikator, uraian, tahun, keterangan,creatdBy)
    VALUES
    (
        `+form.pk_unit_sasaran_indikator+`,
        '`+form.uraian+`',
        `+form.tahun+`,
        '`+form.keterangan+`',
        '`+req.user._id+`'
    );`

    db.query(insert, (err, result)=>{
        if(err) {
            console.log(err)
        } else {
            let inserted_id = result.insertId;
            
            var insertIndikator = `
                INSERT INTO ku_ra_strategis_indikator (
                    ku_ra_strategis, tahun, uraian, jan, feb, mar, apr, mei, jun, jul, agu, sep, okt, nov, des, satuan, creatdBy
                ) VALUES
                (
                    `+inserted_id+`,
                    `+indikator.tahun+`,
                    '`+indikator.uraian+`',
                    `+indikator.jan+`,
                    `+indikator.feb+`,
                    `+indikator.mar+`,
                    `+indikator.apr+`,
                    `+indikator.mei+`,
                    `+indikator.jun+`,
                    `+indikator.jul+`,
                    `+indikator.agu+`,
                    `+indikator.sep+`,
                    `+indikator.okt+`,
                    `+indikator.nov+`,
                    `+indikator.des+`,
                    '`+indikator.satuan+`',
                    '`+req.user._id+`'
                )
            
            `

            db.query(insertIndikator, (err1, row1)=>{
                cek_error(res, err1, row1);
            })





        }
    })
});

router.post('/editData', (req, res) => {
    // console.log(req.body);
    // console.log("OIII");


    var form = req.body.form
    var indikator = req.body.indikator


    var update = `
        UPDATE ku_ra_strategis SET
        pk_unit_sasaran_indikator = `+form.pk_unit_sasaran_indikator+`,
        uraian = '`+form.uraian+`',
        tahun = `+form.tahun+`,
        keterangan = '`+ form.keterangan +`',
        editedBy = '`+ req.user._id +`',
        editedAt = NOW()

        WHERE id = `+form.id+`
    `;

    db.query(update, (err, row) => {
        






        var update1 = `
            UPDATE ku_ra_strategis_indikator SET
            uraian = '`+indikator.uraian+`',
            tahun = `+indikator.tahun+`,
            jan = `+ indikator.jan +`,
            feb = `+ indikator.feb +`,
            mar = `+ indikator.mar +`,
            apr = `+ indikator.apr +`,
            mei = `+ indikator.mei +`,
            jun = `+ indikator.jun +`,
            jul = `+ indikator.jul +`,
            agu = `+ indikator.agu +`,
            sep = `+ indikator.sep +`,
            okt = `+ indikator.okt +`,
            nov = `+ indikator.nov +`,
            des = `+ indikator.des +`,
            satuan = '`+ indikator.satuan +`',
            editedBy = '`+ req.user._id +`',
            editedAt = NOW()

            WHERE ku_ra_strategis = `+form.id+`
        `;

        db.query(update1, (err1, row1)=>{
        
            cek_error(res, err1, row1);
        })

    })

})

router.post('/removeData', (req, res) => {
    
    var form = req.body.form
    var indikator = req.body.indikator


    let query = `
        DELETE FROM ku_ra_strategis WHERE id = `+form.id+`;
    `;
    db.query(query, (err, row)=>{
        let query1 = `
            DELETE FROM ku_ra_strategis_indikator WHERE ku_ra_strategis = `+form.id+`;
        `;
        db.query(query1, (err1, row1)=>{
            cek_error(res, err1, row1);
        });
    });
})

router.get('/list', (req, res)=> {
    let query = `
        SELECT * FROM ku_ra_strategis
    `;
    db.query(query, (err, row)=>{
        cek_error(res, err, row);
    });
})

function cek_error(res, err, rows){
    if(err) {
        console.log(err);
        res.send(err);
    }else{
        res.send(rows);
    }

}


module.exports = router;