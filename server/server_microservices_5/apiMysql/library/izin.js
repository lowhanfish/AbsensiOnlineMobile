const libUmum = require('./umum');



// ============================= TERPAKAI ==================================

const approveIzin = async (req, res, db)=>{

    var biodata = await libUmum.getBiodataByNIP(req.body.NIP)
    var datax = req.body;
    var listTgl = libUmum.loopingTgl(datax);
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
                    if (cekSabtuMinggu) {
                        db.query(query1, (err1, rows1)=>{
                            if (err1) {
                                console.log(err1)
                            } else {
                                console.log("Sukses data ke : "+(index+1))
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



    // res.send('OK')
    res.json({
        icon : 'check_circle_outline',
        color : 'primary',
        ket : 'Permohonan berhasil diverifikasi',
    })

}



// ============================= TERPAKAI ==================================






module.exports = {
    approveIzin : approveIzin,
}