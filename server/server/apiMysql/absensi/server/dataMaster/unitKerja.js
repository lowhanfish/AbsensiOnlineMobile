const express = require('express');
var db = require('../../../../db/MySql/simpeg');
const router = express.Router();




router.post('/list', (req, res) => {
    // console.log(req.body)
    let view = ` 
    SELECT 
        unit_kerja.*
    FROM unit_kerja 

    WHERE 
        unit_kerja.instansi = '`+req.body.instansi+`' 
    `;
    db.query(view, (err, row)=>{
        if (err) {
            res.json(err)
        }else{
            res.json(row)
        }
    })
});







module.exports = router;