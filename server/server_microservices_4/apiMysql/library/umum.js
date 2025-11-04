// var db_simpeg = require('../../db/MySql/simpeg');


// ============================= TERPAKAI ==================================
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


const addZero = (i) => {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}


const hitungJarak = (lat1, lon1, lat2, lon2) => {
    var R = 6371; // km
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var lat1 = toRad(lat1);
    var lat2 = toRad(lat2);
  
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d*1000;
  }
  
const toRad = (Value) => {
    return Value * Math.PI / 180;
}



// ============================= TERPAKAI ==================================




module.exports = {
    addZero : addZero,
    Timex : Timex,
    hitungJarak : hitungJarak,
}