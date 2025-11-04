const express = require('express');
var db = require('../../../../db/MySql/absensi');
var dbx = require('../../../../db/MySql/simpeg');
const router = express.Router();
const libUmum = require('../../../library/umum');

var fetch = require('node-fetch');
const configurasi = require('../../../library/configurasi');
const url_micro_8 = configurasi.url_micro_8


router.post('/list', async (req, res)=>{
    // console.log("VIEW LIST DETILE PERUBAHAN ABSEN DIPANGGING (lapCustom_v2)")

   
    // console.log(levelAkses)


    // console.log(req.body)
    var biodata  =  await getBioData(req.body)
    // console.log(biodata)
    // res.json({stat :"OK"})


    // console.log(req.user)



    const body = req.body;
    try {
        const response = await fetch(url_micro_8+'/micro_8/listAbsenFull/viewList', {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {'Content-Type': 'application/json'}
        });
        const data = await response.json();
        // console.log(data)
        res.json(data)
    } catch (error) {
        console.log(error)
        console.log("Respon error dari absensi/server/presensi/lapCustom_v2.js, utk server PDN 04");
        res.json([])
    }

})

router.post('/UpdateAll', async (req, res)=>{


    var data = req.body
    var biodata  =  await getBioData(data[0])

    console.log(biodata)

    for (let i = 0; i < data.length; i++) {
        
        

        if (data[i].inject == true) {
            console.log("INJEKSI")
            console.log(data[i].inject)
            await updateData (data[i], req, biodata)
        } 

        
    }



    res.send("OK")

    // var akses_menu = req.menu_akses
    // const levelAkses = akses_menu.find(({ route }) => route === '/lapCustom_v2');

    // console.log(levelAkses)


    // if (levelAkses.updatex == 1) {

    //     await updateData (req.body, req)
    //     res.send("Sukses")

    // }else {
    //     res.json({
    //         icon : 'check_circle_outline',
    //         color : 'red',
    //         ket : 'Anda tidak memiliki hak akses ini... 🙏',
    //     })
    // }

})

router.post('/Update', async (req, res)=>{

    var biodata  =  await getBioData(req.body)


    var akses_menu = req.menu_akses
    const levelAkses = akses_menu.find(({ route }) => route === '/lapCustom_v2');

    console.log(levelAkses)


    // if (levelAkses.updatex == 1) {

        await updateData (req.body, req, biodata)
        res.send("Sukses")

    // }else {
    //     res.json({
    //         icon : 'check_circle_outline',
    //         color : 'red',
    //         ket : 'Anda tidak memiliki hak akses ini... 🙏',
    //     })
    // }



   


    // console.log("DATA UPDATE lapCustom_v2 dipanggil");
    // console.log(req.body);

    // res.send("OK")

})

router.post('/removeData', (req, res)=>{
    console.log(req.body)
    // res.send("Ok")


    var query = `
        DELETE FROM absensi
        WHERE dd = `+req.body.dd+` AND mm = `+req.body.mm+` AND yy = `+req.body.yy+`
    `;
    proses_query(query, res);
})

async function updateData (data, req, biodata){

    // console.log(biodata)
    // req.body.unit_kerja = biodata.unit_kerja

    console.log(biodata.unit_kerja)

    return new Promise(async (resolve, reject) => {
        
        
            await removeData(data);
        
            var query = `
               INSERT INTO absensi (
                jenispresensi,
                JenisStatusId,
                jenisKategori,
                jenisizin,
                lat,
                lng,
                jamDatang,
                jamPulang,
                dd,
                mm,
                yy,
                keterangan,
                NIP,
                status,
                unit_kerja,
                fileRef,
                token,
                createdBy,
                createdAt
        
               ) VALUES (
        
                1,
                1,
                0,
                0,
                -4.332520,
                122.281094,
                '`+data.jamDatang+`',
                '`+data.jamPulang+`',
                `+data.dd+`,
                `+data.mm+`,
                `+data.yy+`,
                '-',
                '`+data.nip+`',
                1,
                '`+biodata.unit_kerja+`',
                null,
                null,
                '`+req.user._id+`',
                NOW()
               )
            `;
        
        
            db.query(query, (err, row)=>{
                if(err) {
                    console.log(err);
                    resolve(err);
                }else{
                    console.log("SUKSES")
                    resolve(row)
                }
            })
        
    })











}

async function removeData(data){

    return new Promise((resolve, reject) => {
        
        var query = `
            DELETE FROM absensi
            WHERE 
            (dd = `+data.dd+` AND mm = `+data.mm+` AND yy = `+data.yy+`) AND
            nip = '`+data.nip+`' 
        `

        db.query(query, (err, row)=>{
            if(err) {
                // console.log(err);
                // res.send(err);
                console.log(err);
                resolve(err);
            }else{
                // res.send('ok');
                console.log("SUKSES")
                resolve(row)
            }
        })



    })



}

async function getBioData(data){

    return new Promise((resolve, reject) => {
        
        var query = `
           SELECT biodata.* 
           FROM biodata 
           WHERE biodata.nip = '`+data.nip+`'
        `



        dbx.query(query, (err, row)=>{
            if(err) {
                console.log(err);
                resolve(err);
            }else{
                console.log("SUKSES")
                resolve(row[0])
            }
        })



    })



}

function proses_query(view, res){
    db.query(view, (err, row)=>{
        if(err) {
            // console.log(err);
            res.send(err);
        }else{
            res.send('ok');
        }
    })
}

module.exports = router;