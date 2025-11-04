const express = require('express');
var db = require('../db/MySql/utama');
const router = express.Router();


const UMUM = require('./library/umum');



router.get('/viewList', async (req, res) => {


    data = await UMUM.getListKehadiranFull_hapussaja()
    res.send(data)
    

    // var query = `
    

    
    // `



    // db.query(view, (err2, result)=>{
    //     if (err2) {
    //         res.json(err)
    //     }
    //     else{
    //         res.send("OK")
    //     }
  
    // })


    // res.send("ok")






});


router.post('/viewList', async (req, res) => {


    console.log(req.body)

    data = await UMUM.getListKehadiranFull(req)
    // data = await UMUM.getListKehadiranFull(req)
    res.send(data)

});



// var akses_menu = req.menu_akses
// const levelAkses = akses_menu.find(({ route }) => route === '/verivikasiPermohonanDarurat');

// if (levelAkses.readx == 1) {

// } else {
//     res.json("ANDA TIDAK MEMILIKI HAK AKSES..!!")
// }




router.get('/', async (req, res)=>{

    
    res.send("SUKSES")


})








module.exports = router;