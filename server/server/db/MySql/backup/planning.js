var mysql = require('mysql');
var db = mysql.createConnection({
//   host     : 'localhost',
// host     : '127.0.0.1',
//   user     : 'root',
//   password : '',
//   database : 'e_sakip'
// });


host     : '103.150.196.118',
  user     : 'diskominfosandi',
  password : 'Kominfo2018',
  database : 'e_sakip'
});

db.connect((err)=>{
    if(err){
        console.log(err);
    }else{
        console.log('Terkoneksi dengan DATABASE E-PLANNING');
    }
})


module.exports = db;
