const express = require('express');
var db = require('../../../../db/MySql/absensi');
const router = express.Router();
var fetch = require('node-fetch');
const configurasi = require('../../../library/configurasi');
const url_micro_1 = configurasi.url_micro_1




router.get('/aa', (req, res) => {

    // console.log(req.body)
    res.send('oke')






});


router.post('/Add', (req, res) => {
   //  console.log(req.body)
    var query = `
        INSERT INTO jenisizin (uraian, keterangan, createdBy, createdAt)
        VALUES
        ('`+req.body.uraian+`', '`+req.body.keterangan+`', '`+req.user._id+`', NOW())
    `

    db.query(query, (err, row)=>{
        if (err) {
            // console.log(err)
            res.send(err);
        } else {
            // res.status(500).send('Sukses Update');
 	console.log(err);    
       res.send('OK');
        }
    })

});




router.post('/view', async (req, res) => {
//	console.log(req.user)   
    const body = req.body;
    try {
        const response = await fetch(url_micro_1+'/api/v1/presensi_lapHarian/view', {
            method: 'post',
            body: JSON.stringify(body),
            headers: {'Content-Type': 'application/json'}
        });
        const data = await response.json();
        res.json(data)
    } catch (error) {
        console.log("Respon error dari absensi/server/presensi/lapHarian.js, utk server Kominfo");
        res.json([])
    }

});

router.post('/editData', (req, res)=>{
    var query = `
        UPDATE jenisizin SET
        uraian = '`+req.body.uraian+`',
        keterangan = '`+req.body.keterangan+`',
        editedBy = '`+req.user._id+`'
        
        WHERE id = `+req.body.id+`
    `;
    proses_query(query, res);
})

router.post('/removeData', (req, res)=>{
    var query = `
        DELETE FROM jenisizin
        WHERE id = `+req.body.id+`
    `;
    proses_query(query, res);
})



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
