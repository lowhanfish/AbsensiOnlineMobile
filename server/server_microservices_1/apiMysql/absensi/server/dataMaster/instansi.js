const express = require('express');
var db = require('../../../../db/MySql/simpeg');
const router = express.Router();




router.post('/list', (req, res) => {

    // console.log(req.body);

    // res.send("OK")
    
    let view = ` 
        SELECT * FROM instansi
 
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