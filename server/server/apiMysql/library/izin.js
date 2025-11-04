const libUmum = require('./umum');


function convertStringToDatex(d){

    var datex = new Date(d)
    var month = datex.getMonth() + 1
    var day = datex.getDate()
    var year = datex.getFullYear()

    var datexx = year+'-'+month+'-'+day

    // console.log(datexx)

    return datexx

}

const addIzin = (req, res, db, fileRef)=>{
    // console.log('NABLRRRRRRRRRRRRRRRRRRRRR')
    var filex = req.files;    
    var datax = req.body;

    // console.log(datax)
    // console.log(req.files);

    convertStringToDatex(datax.TglMulai)
    // console.log('111111111111111111111111')

    var queryx = `
        INSERT INTO usulanizin
        (jenispresensi, jenisKategori, jenisizin, lat, lng, jamDatang, jamPulang, keterangan, NIP, JenisStatusId, TglMulai, TglSelesai, unit_kerja, fileRef, status, createdBy) 
        VALUES (
            `+datax.jenispresensi+`,
            `+datax.jenisKategori+`,
            `+datax.jenisizin+`,
            `+0+`,
            `+0+`,
            '`+datax.jamDatang+`',
            '`+datax.jamPulang+`',
            '`+datax.keterangan+`',
            '`+datax.NIP+`',
            `+datax.JenisStatusId+`,
            '`+convertStringToDatex(datax.TglMulai)+`',
            '`+convertStringToDatex(datax.TglSelesai)+`',
            '`+datax.unit_kerja+`',
            '`+fileRef+`',
            0,
            '`+req.user._id+`'
        )
    
    `

    // console.log(`+datax.jamDatang+`)

    console.log(queryx)

    // console.log('22222222222222222222222222222222')

    db.query(queryx, (err, rows)=>{
        if (err) {
            console.log(err)
        } else {
            // console.log("tidak errorrrrr")
            uploadLampiran(req, res, db, fileRef, filex)
        }
    })

    
    
}

function uploadLampiran(req, res, db, fileRef, filex){
    filex.forEach(index => {
        var query = `
            INSERT INTO lampiran (file, fileRef, createdBy)
            VALUES (
                '`+index.filename+`',
                '`+fileRef+`',
                '`+req.user._id+`'
            )
        `
        db.query(query, (err, rows)=>{
            if (err) {
                console.log(err)
            } 
        })

    });


    res.send('OK');

}

const approveIzin = async (req, res, db)=>{

    var biodata = await libUmum.getBiodataByNIP(req.body.NIP)
    // console.log(biodata.metode_absen);


    // console.log('TERPANGGIIIIIIIIIIIIIIIIIIIIIIIl')

    // console.log(req.body)
    // var datax = JSON.parse(req.body);
    var datax = req.body;
    // var filex = req.files;
    // console.log(datax)
    // console.log(req.files);
    var listTgl = libUmum.loopingTgl(datax);
    // var jam = libUmum.Timex().jam;
    // var dd = libUmum.Timex().dd;
    // var mm = libUmum.Timex().mm;
    // var yy = libUmum.Timex().yy;
    // console.log('TERPANGGIIIIIIIIIIIIIIIIIIIIIIIl2');
    listTgl.forEach(index => {
        // console.log(index)
        var query = `
            SELECT * FROM absensi
            WHERE 
            dd = `+index.dd+` AND
            mm = `+index.mm+` AND
            yy = `+index.yy+` AND
            NIP = '`+datax.NIP+`' 
        `

        // console.log(query)
        
        db.query(query, (err, rows)=>{
            if (err) {
                console.log(err);
                console.log("WAH GAK INSERT NIH")
            } else {
                console.log("WAH BISA INSERT NIH")
                if (rows.length <= 0) {

                    var query1 = `
                        INSERT INTO absensi(jenispresensi, JenisStatusId, jenisKategori, jenisizin,  lat, lng, jamDatang, jamPulang, dd, mm, yy, keterangan, NIP, fileRef, status, unit_kerja, createdBy, createdAt)

                        VALUES (
                            `+datax.jenispresensi+`,
                            `+datax.JenisStatusId+`,
                            `+datax.jenisKategori+`,
                            `+datax.jenisizin+`,
                            `+datax.lat+`,
                            `+datax.lng+`,
                            '`+datax.jamDatang+`',
                            '`+datax.jamPulang+`',
                            `+index.dd+`,
                            `+index.mm+`,
                            `+index.yy+`,
                            '`+datax.keterangan+`',
                            '`+datax.NIP+`',
                            '`+datax.fileRef+`',
                            1,
                            '`+datax.unit_kerja+`',
                            '`+req.user._id+`',
                            NOW()
                        )

                    
                    `

                    var tglInput = index.yy+'-'+index.mm+'-'+index.dd
                    var cekSabtuMinggu = libUmum.checkHariSabtuMingguUtkApprove(tglInput, biodata.metode_absen)
                    // console.log(cekSabtuMinggu)

                    if (cekSabtuMinggu) {
                        db.query(query1, (err1, rows1)=>{
                            if (err1) {
                                console.log(err1)
                            } else {
                                // console.log("Sukses data ke : "+(index+1))
                            }
                        })
                        
                    }



                    
                } else {


                    var query1 = `
                        UPDATE absensi SET

                        status = 1,
                        jamPulang = '16:00',
                        jenispresensi = `+datax.jenispresensi+`,
                        JenisStatusId = `+datax.JenisStatusId+`,
                        jenisKategori = `+datax.jenisKategori+`,
                        keterangan = '-'

                        WHERE 
                        nip = '`+datax.NIP+`' AND
                        dd = `+index.dd+` AND
                        mm = `+index.mm+` AND
                        yy = `+index.yy+`

                    `
                    db.query(query1, (err1, row1)=>{
                        if (err1) {
                            console.log(err1);
                        } else {
                            // console.log("Sukses data ke : "+(index+1))
                        }
                    })



                }

            }
        })





    });






    // console.log(listTgl)











    // res.send('OK')
    res.json({
        icon : 'check_circle_outline',
        color : 'primary',
        ket : 'Permohonan berhasil diverifikasi',
    })

}


module.exports = {
    addIzin : addIzin,
    approveIzin : approveIzin,
}