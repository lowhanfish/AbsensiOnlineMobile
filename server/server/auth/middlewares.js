// Membuat verifikasi token yang dikirimkan melalui headers client

const jwt = require('jsonwebtoken');
var db = require('../db/MySql/egov');
var db_absensi = require('../db/MySql/absensi');
var fetch = require('node-fetch');
const configurasi = require('../apiMysql/library/configurasi');
const url_micro_2 = configurasi.url_micro_2

function checkTokenSeetUser(req, res, next){
     const authHeader = req.get('authorization');

     // console.log(authHeader);

     // if (authHeader) {
     //      // jika ada authorization yang dikirim client melalui headers
     //      // dan karena token yang dikirim dipisahkan spasi maka kita pisahkan bagiannya
     //      const token = authHeader.split(' ')[1];
     //      if (token) {
     //           // jika tokennya ada
     //           // maka lakukan verifikasi terhadap token tersebut
     //           jwt.verify(token, process.env.TOKEN_SECRET, function(error, user) {
     //                if (error) {
     //                     // console.log(error);
     //                }

     //                // Jika tidak ada error selanjutnya token di dapatkan
     //                // akan di terjemakan ke identitas user clien
     //                req.user = user;
     //                next()
     //           });
     //      }else{
     //           next();
     //      }

     // }else{

     //      next();
     // }





     if (authHeader == null || authHeader == undefined || authHeader == '' ) {
          next();
          
     }else{
          const token = authHeader.split(' ')[1];
          if (token) {
               jwt.verify(token, process.env.TOKEN_SECRET, function(error, user) {
                    if (error) {
                         console.log(error);
                    }

                    req.user = user;
                    next()
               });
          }else{
               next();
          }

     }

}

function isLoggedIn(req, res, next){
     if (req.user) {
          // jika login maka lanjutkan ke tahap berikutnya
          next();
     }else {
          // kalau tidak login berikan respon error
          const error = new Error('SSILAHKAN LOGIN DULU..!!!');
          res.status(401);
          next(error);
     }
}




async function sideMenuMidleware(req, res, next){

     var profile = req.user.profile
          // var query = `
          //      SELECT 
          //      menu_klp_list.*,
          //      menu.route
          //      FROM menu_klp_list
          //      JOIN menu
          //      ON menu_klp_list.menu_id = menu.id

          //      WHERE menu_klp_list.menu_klp_id = `+parseInt(profile.absensi)+`
          // `;

          // db_absensi.query(query, (err, rows) => {
          //      if (err) {
          //           // console.log(err);
          //           respondError422(res, next, "Salah Otorisasi");
          //      } else {
          //           req.menu_akses = rows
          //           next();

          //      }
          // })

     const body = {
          profile_absensi : profile.absensi,
          yahoo : 'ssss'
     };

    try {
        const response = await fetch(url_micro_2+'/micro_2/getAuthorisation/view', {
            method: 'post',
            body: JSON.stringify(body),
            headers: {'Content-Type': 'application/json'}
        });
        const data = await response.json();

        req.menu_akses = data
        next();

    } catch (error) {
        console.log("Respon error dari absensi/server/presensi/lapHarian.js, utk server Kominfo Micro 2");
        res.json([])
    }

}


function respondError422(res, next, text){
     res.status(422);
     const error = new Error(text);
     next(error);
 }

module.exports = {
     checkTokenSeetUser,
     isLoggedIn,
     sideMenuMidleware,
     // checkUserProfile,
}