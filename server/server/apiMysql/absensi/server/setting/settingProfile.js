const express = require('express');
var db = require('../../../../db/MySql/absensi');
const fs = require('fs');

var multer=require("multer");
var upload = require('../../../../db/multer/pdf');

var uniqid = require('uniqid');
const router = express.Router();



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
        WHERE fotosample.nip = '`+NIP+`'
    
    `;
  
    db.query(query, (err, row)=>{
        if(err) {
            console.log(err);
            res.send(err);
        }else{
            res.send(row);
        }
    })
});


// router.post('/addData',upload.single("file"), (req,res)=>{
//     // console.log(req.body)
//     // console.log(req.file);
//     // var insert = '';

//     var data = req.user.profile
//     var NIP = data.NIP
    
//     var insert = `INSERT INTO fotosample (file, nip) 
//     VALUES ('`+req.file.filename+`' ,'`+NIP+`' )
//     `;
  
//     db.query(insert, (err, row)=>{
//         if(err) {
//             console.log(err);
//             res.send(err);
//         }else{
//             res.send(row);
//         }
//     })
//     // console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
// });



router.post('/removeData', (req, res)=> {
    var file = req.body.file
    hapus_file(file);

    var query = `
        DELETE FROM fotosample WHERE id = '`+req.body.id+`'; 
    `;
    db.query(query, (err, row)=>{
        if(err){
            res.send(err);
        }else{
            res.send(row);
        }
    });
})


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