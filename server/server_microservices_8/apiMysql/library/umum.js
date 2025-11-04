var db_simpeg = require('../../db/MySql/simpeg');
var db = require('../../db/MySql/utama');







// ============================= TERPAKAI ==================================


const getListKehadiranFull_hapussaja = async () =>{

    var nip = '198511202014061001'
    var start = new Date("01/01/2024");
    var end = new Date("02/04/2024");





    
    var tglLibur = await getTglLibur(start, end);
    var kehadiran = await getKehadiran(nip, start, end);
    var loopDate = loopingTgl(start, end);
    var data = []


    loopDate.forEach(element => {
        var checkx = checkHariSabtuMingguUtkApprove(element.full, 1)
        if (checkx == false) {
            element.ket = "LIBUR"
        }

        tglLibur.forEach(tglLibur => {

            if (tglLibur.dd == element.dd && tglLibur.mm == element.mm && tglLibur.yy == element.yy) {
                element.ket = "LIBUR"
                element.ket_libur = tglLibur.keterangan
            }

        });


        kehadiran.forEach(kehadiran => {
            if (kehadiran.dd == element.dd && kehadiran.mm == element.mm && kehadiran.yy == element.yy) {
                element.id_absen = kehadiran.id_absen
                element.jamDatang = kehadiran.jamDatang
                element.jamPulang = kehadiran.jamPulang
                element.keterangan = kehadiran.keterangan
                element.status = kehadiran.status
                element.jeniskategori_uraian = kehadiran.jeniskategori_uraian
            }
        });



        data.push(element)
    });


    return data

}


const getListKehadiranFull = async (req) =>{

    var nip = req.body.nip
    var start = new Date(req.body.waktuFirst);
    var end = new Date(req.body.waktuLast);


    var tglLibur = await getTglLibur(start, end);
    var kehadiran = await getKehadiran(nip, start, end);
    var loopDate = loopingTgl(start, end);
    var data = []


    loopDate.forEach(element => {
        var checkx = checkHariSabtuMingguUtkApprove(element.full, 1)
        if (checkx == false) {
            element.ket = "LIBUR"
            element.ket_libur = "Sabtu-Minggu"
        }

        tglLibur.forEach(tglLibur => {

            if (tglLibur.dd == element.dd && tglLibur.mm == element.mm && tglLibur.yy == element.yy) {
                element.ket = "LIBUR"
                element.ket_libur = tglLibur.keterangan
            }

        });


        kehadiran.forEach(kehadiran => {
            if (kehadiran.dd == element.dd && kehadiran.mm == element.mm && kehadiran.yy == element.yy) {
                element.id_absen = kehadiran.id_absen
                element.jamDatang = kehadiran.jamDatang
                element.jamPulang = kehadiran.jamPulang
                element.keterangan = kehadiran.keterangan
                element.status = kehadiran.status
                element.jeniskategori_uraian = kehadiran.jeniskategori_uraian
            }
        });



        data.push(element)
    });


    return data

}


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


const loopingTgl = (start, end) =>{
    var list_tgl = [];
    // var start = new Date(datax.TglMulai);
    // var end = new Date(datax.TglSelesai);
    var loop = new Date(start);
    while(loop <= end){
        list_tgl.push({
            id_absen : null,
            dd : loop.getDate(),
            mm : loop.getMonth()+1,
            yy : loop.getFullYear(),
            full : loop,
            ket : '',
            ket_libur : '',
            keterangan : null,
            jeniskategori_uraian : null,
            jamDatang : null,
            jamPulang : null,
            status : 2
        })       
        var newDate = loop.setDate(loop.getDate() + 1);
        loop = new Date(newDate);
    }
    return list_tgl


}

const checkHariSabtuMingguUtkApprove = (tgl, jenisAbsen) =>{

    // console.log(jenisAbsen)

    var days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    var d = new Date(tgl);
    var dayName = days[d.getDay()];

    if (jenisAbsen == 1) {
        // console.log("=============")
        // console.log(tgl)
        // console.log(dayName)
        // console.log("=============")
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


const getTglLibur = async (start, end) =>{


    var thn_start = start.getFullYear();
    var thn_end = end.getFullYear();




    return new Promise((resolve, reject) => {
        
        var query = `
            SELECT waktulibur.* 
            FROM waktulibur 
            WHERE (waktulibur.yy = `+thn_start+` OR waktulibur.yy = `+thn_end+`)
        `


        db.query(query, (err, row)=>{
            if (err) {
                console.log(err)
            } else {
                resolve(row)
            }

        })


    })
}

const getKehadiran = async (nip, start, end) =>{


    dd_start = start.getDate();
    mm_start = start.getMonth()+1;
    yy_start = start.getFullYear();
    
    dd_end = end.getDate();
    mm_end = end.getMonth()+1;
    yy_end = end.getFullYear();


    // console.log(dd_start)
    // console.log(mm_start)
    // console.log(yy_start)

    // console.log(dd_end)
    // console.log(mm_end)
    // console.log(yy_end)


    return new Promise((resolve, reject) => {
        var query = `
            SELECT 
            absensi.id as id_absen,
            absensi.jamDatang,
            absensi.jamPulang,
            absensi.dd ,
            absensi.mm ,
            absensi.yy ,
            absensi.keterangan,
            absensi.status,
            jeniskategori.uraian as jeniskategori_uraian,
            @date_now := CONCAT(absensi.yy,"-",absensi.mm,"-", absensi.dd) as start,
            CONVERT(@date_now, DATE) as date_now

            FROM absensi 
            LEFT JOIN jeniskategori
            ON jeniskategori.id = absensi.jenisKategori

            WHERE (

                ( CONVERT(CONCAT(absensi.yy,"-",absensi.mm,"-", absensi.dd), DATE) >= CONVERT("`+yy_start+`-`+mm_start+`-`+dd_start+`", DATE)  )
                AND
                (CONVERT(CONCAT(absensi.yy,"-",absensi.mm,"-", absensi.dd), DATE) <= CONVERT("`+yy_end+`-`+mm_end+`-`+dd_end+`", DATE)  )

            ) AND absensi.nip = '`+nip+`'

        `


        db.query(query, (err, row)=>{
            if (err) {
                console.log(err)
            } else {
                resolve(row)
            }

        })


    })
}

// ============================= TERPAKAI ==================================















module.exports = {
    getBiodataByNIP : getBiodataByNIP,
    loopingTgl : loopingTgl,
    checkHariSabtuMingguUtkApprove : checkHariSabtuMingguUtkApprove,

    getListKehadiranFull : getListKehadiranFull,
    getListKehadiranFull_hapussaja : getListKehadiranFull_hapussaja

}