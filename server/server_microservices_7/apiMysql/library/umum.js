var db_simpeg = require('../../db/MySql/simpeg');







// ============================= TERPAKAI ==================================

async function getBiodataByNIP(nip){

    return new Promise(resolve => {
   
        var query = `
            SELECT * FROM biodata WHERE nip = '`+nip+`'
        `
        db_simpeg.query(query, (err, row)=>{
            if (err) {
                console.log(err)
                res.send(err);
            } else {

                resolve(row[0])
            }
        })

    })
}

const loopingTgl = (datax) =>{
    var list_tgl = [];

    // var start = new Date(parseInt(datax.TglMulai));
    // var end = new Date(parseInt(datax.TglSelesai));

    var start = new Date(datax.TglMulai);
    var end = new Date(datax.TglSelesai);


    // console.log(start)


    var loop = new Date(start);
    while(loop <= end){
        list_tgl.push({
            dd : loop.getDate(),
            mm : loop.getMonth()+1,
            yy : loop.getFullYear(),
        })       
        var newDate = loop.setDate(loop.getDate() + 1);
        loop = new Date(newDate);
    }


    return list_tgl
}

const checkHariSabtuMingguUtkApprove = (tgl, jenisAbsen) =>{

    // console.log(jenisAbsen)

    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var d = new Date(tgl);
    var dayName = days[d.getDay()];

    if (jenisAbsen == 1) {
        // console.log(dayName)
        if (dayName == 'Saturday' || dayName == 'Sunday' ) {
            return false
        } else {
            return true
        }
        
    } else if (jenisAbsen == 2) {
        if (dayName == 'Sunday' ) {
            return false
        } else {
            return true
        }
    }

    else {
        return true
    }

}

// ============================= TERPAKAI ==================================















module.exports = {
    getBiodataByNIP : getBiodataByNIP,
    loopingTgl : loopingTgl,
    checkHariSabtuMingguUtkApprove : checkHariSabtuMingguUtkApprove,

}