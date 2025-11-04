var mysql = require('mysql');
var db = mysql.createConnection({
//   host     : 'localhost',
// host     : '127.0.0.1',
//   user     : 'root',
//   password : '',
//   database : 'simpeg'
// });


host     : '103.150.196.118',
  user     : 'diskominfosandi',
  password : 'Kominfo2018',
  database : 'simpeg'
});

db.connect((err)=>{
    if(err){
        console.log(err);
    }else{
        console.log('Terkoneksi dengan DATABASE SIMPEG');
    }
})


module.exports = db;
