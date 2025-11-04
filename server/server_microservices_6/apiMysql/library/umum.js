// var db_simpeg = require('./db/MySql/simpeg');







// ============================= TERPAKAI ==================================

const addZero = (i) => {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}


const Timex = () =>{
    var d = new Date();
    var h = addZero(d.getHours());
    var m = addZero(d.getMinutes());
    var s = addZero(d.getSeconds());

    var dd = d.getDate();
    var mm = d.getMonth() + 1;
    var yy = d.getFullYear();

    return {
        jam : h+":"+m,
        dd : dd,
        mm : mm,
        yy : yy
    }
}


// ============================= TERPAKAI ==================================















module.exports = {
    Timex : Timex,


}