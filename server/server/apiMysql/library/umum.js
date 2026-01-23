var db_simpeg = require('../../db/MySql/simpeg');


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

const checkHariSabtuMinggu = (tgl) =>{
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var d = new Date(tgl);
    var dayName = days[d.getDay()];

    // console.log(dayName)
    if (dayName == 'Saturday' || dayName == 'Sunday' ) {
        return false
    } else {
        return true
    }
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

const checkHariKerja = (tgl, metode) =>{
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var d = new Date(tgl);
    var dayName = days[d.getDay()];


    if (metode == 1) {
        if (dayName == 'Saturday' || dayName == 'Sunday' ) {
            return false
        } else {
            return true
        }
        
    } else if (metode == 2) {
        if (dayName == 'Sunday' ) {
            return false
        } else {
            return true
        }
    } else {
        return true
    }

    // console.log(dayName)
}

async function getTglLibur(db, dateFirt, dateLast, res){

    return new Promise(resolve => {
        
        var startx = dateFirt.split('-')
        var lastx = dateLast.split('-')
    
        var start = parseInt(startx[1]);
        var last = parseInt(lastx[1]);

    
        var query = `
            SELECT waktulibur.* FROM waktulibur
            WHERE (waktulibur.mm >= `+start+` AND waktulibur.mm <= `+last+`)  
        `
        db.query(query, (err, row)=>{
            if (err) {
                console.log(err)
                res.send(err);
            } else {

                resolve(row)
            }
        })

    })
}

const hitungTanggalMerah = async (db, dateFirt, dateLast, res) =>{

    // Kita list dulu tanggal2 liburnya dari tabel harilibur melalui fungsi ini
    var listLibur = await getTglLibur(db, dateFirt, dateLast, res)
    
    // setelah itu kita list lagi range tanggal dari awal sampai ahir melalui fungsi looping tanggal untuk dicheck dengan tanggal2 libur

    // karna fungsinya meminta variable dalam bentuk objek, yah kita ubah dulu strukturnya
    var TglMulai = dateFirt.split('-')
    var TglSelesai = dateLast.split('-')




    var datax = {
        TglMulai : parseInt(TglMulai[0])+"-"+parseInt(TglMulai[1])+'-'+parseInt(TglMulai[2]),
        TglSelesai : parseInt(TglSelesai[0])+"-"+parseInt(TglSelesai[1])+'-'+parseInt(TglSelesai[2]),
    }
    // nah ini dia fungsi looping tanggalnya ...
    var listTgl = loopingTgl(datax)


    // sekarang mari kita hitung efektifitas hari kerjanya
    let hariKerja = 0
    var arrayx = []



    
    listTgl.forEach(tgl => {

        // Nah sekarang kita check apakah hari bersangkutan (tgl) ada dalam list hari listLibur, kalau ada nilainya true - sebaliknya
        const checkTgl = obj => (obj.dd === tgl.dd && obj.mm === tgl.mm && obj.yy === tgl.yy);
        // console.log(listLibur.some(checkTgl))
        if (listLibur.some(checkTgl)) {
            hariKerja = hariKerja
        } else {
            var checkHari = checkHariSabtuMinggu(tgl.yy+'-'+tgl.mm+'-'+tgl.dd)
            // console.log(tgl)
            // console.log(checkHari)
            if (checkHari) {
                hariKerja++
            } 
        }
    });
    
    // if (hariKerja < 1) {
    //     hariKerja = 1
    // }

    
    return new Promise (resolve => {
        resolve (hariKerja)
    })
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

const addIsMockLocation = (req, res, db, jenisAbsenyangdicurangi) =>{
    var query = `
       INSERT INTO fakegpsuser (nip, absen, createdAt) VALUE 
       ('`+req.body.nip+`', '`+jenisAbsenyangdicurangi+`', NOW())
   `
   db.query(query, (err, rows)=>{
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            res.json({
                status : 'Ups',
                ket : 'Anda terindikasi menggunakan lokasi palsu dan tercatat pada jam : ',
                jam : jam
            })
        }
   })
}

const restrukturListTgl  = async (dateFirt, dateLast) =>{


    var TglMulai = dateFirt.split('-')
    var TglSelesai = dateLast.split('-')

    var datax = {
        TglMulai : parseInt(TglMulai[0])+"-"+parseInt(TglMulai[1])+'-'+parseInt(TglMulai[2]),
        TglSelesai : parseInt(TglSelesai[0])+"-"+parseInt(TglSelesai[1])+'-'+parseInt(TglSelesai[2]),
    }

    var listTgl = loopingTgl(datax)

    return new Promise (resolve => {
        resolve (listTgl)
    })
}

const cariHariLibur  = async (tanggalLibur, listTanggal, metode) =>{
    return new Promise (resolve => {
        let hariKerja = 0

        listTanggal.forEach(tgl => {

            const checkTgl = obj => (obj.dd === tgl.dd && obj.mm === tgl.mm && obj.yy === tgl.yy);
            // console.log(listLibur.some(checkTgl))
            if (tanggalLibur.some(checkTgl)) {
                hariKerja = hariKerja
            } else {
                var checkHari = checkHariKerja(tgl.yy+'-'+tgl.mm+'-'+tgl.dd, metode)
                if (checkHari) {
                    hariKerja++
                } 
            }
        });
        
        resolve (hariKerja)
    })

}

module.exports = {
    getBiodataByNIP : getBiodataByNIP,
    addZero : addZero,
    Timex : Timex,
    loopingTgl : loopingTgl,
    checkHariSabtuMinggu : checkHariSabtuMinggu,
    checkHariSabtuMingguUtkApprove : checkHariSabtuMingguUtkApprove,
    hitungTanggalMerah : hitungTanggalMerah,
    hitungJarak : hitungJarak,
    restrukturListTgl : restrukturListTgl,
    getTglLibur : getTglLibur,
    cariHariLibur : cariHariLibur,
}