var mysql = require('mysql');
var db = mysql.createConnection({
//  host     : 'localhost',
    host     : '103.150.196.118',
    user     : 'diskominfosandi',
    password : 'Kominfo2018',
    database : 'kinerja2022'
});

// host     : '127.0.0.1',
//   user     : 'root',
//   password : '',
//   database : 'kinerja2022'
// });


db.connect((err)=>{
    if(err){
        console.log(err);
    }else{
        console.log('terkoneksi DATABASE KINERJA');
    }
})


module.exports = db;
