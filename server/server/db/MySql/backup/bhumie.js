var mysql = require('mysql');


var db = mysql.createConnection({
//   host     : 'localhost',
    host     : '103.150.196.118',
//  user     : 'root',
//  password : '',
  database : 'pbb'
});


// host     : '127.0.0.1',
   user     : 'diskominfosandi',
   password : 'Kominfo2018',
//   database : 'pbb'
// });

db.connect((err)=>{
    if(err){
        console.log(err);
    }else{
        console.log('Terkoneksi dengan DATABASE BHUMIE');
    }
})


module.exports = db;
