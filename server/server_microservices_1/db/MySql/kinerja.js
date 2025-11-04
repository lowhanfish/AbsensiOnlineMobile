var mysql = require('mysql');

// var db = mysql.createConnection({
var db  = mysql.createPool({
    connectionLimit : process.env.LIMIT_DB_MYSQL,
    host     : process.env.HOST_DB_MYSQL,
    user     : process.env.USER_DB_MYSQL,
    password : process.env.PASS_DB_MYSQL,
    database : 'kinerja2022'
});



db.getConnection(function(err, connection) {
    if (err) {
        console.log(err);
        throw err;
    } else {
        console.log('terkoneksi DATABASE kinerja2022');
    }

});




module.exports = db;