// ============================= TERPAKAI ==================================

const AddAbsenHarian = (req, res, db, jam, dd, mm, yy)=>{
    var query = `
    INSERT INTO absensi (jenispresensi, JenisStatusId, lat, lng, jamDatang, jamPulang, dd, mm, yy, keterangan, NIP, status, unit_kerja, createdBy)
        VALUE(
            1,
            `+req.body.JenisStatusId+`,
            `+req.body.lat+`,
            `+req.body.lng+`,
            '`+jam+`',
            '`+jam+`',
            `+dd+`,
            `+mm+`,
            `+yy+`,
            '-',
            '`+req.body.NIP+`',
            2,
            '`+req.body.unit_kerja+`',
            '`+req.body._id+`'
        )
    `
    
    db.query(query, (err2, rows2)=>{
        if (err2) {
            console.log(err2);
            res.json(err2);
        } else {
            res.json({
                status : 'SUKSES',
                ket : 'Terimakasih, anda berhasil melakukan absen hari ini pada jam : ',
                jam : jam
            })
        }
    })

}




const NotifSdhAbsen = (req, res, rows) =>{

    res.json({
        status : 'Ups',
        ket : 'Maaf, anda sebelumnya telah melakukan absen hari ini pada jam : ',
        jam : rows[0].jamDatang
    })
}



const NotifTdkAbsenDatang = (req, res, jam) =>{

    res.json({
        status : 'Ups',
        ket : 'Anda sebelumnya tidak melakukan absen kedatangan, Anda absen pada jam : ',
        jam : jam
    })
}



const EditAbsenHarian = (req, res, db, jam, rows)=>{
    // console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAA")
    // console.log(rows[0].id)

    var query = `
        UPDATE absensi SET
        jamPulang = '`+jam+`',
        status = 1
        WHERE id = `+rows[0].id+`

    `;
    
    db.query(query, (err2, rows2)=>{
        if (err2) {
            console.log(err2);
            res.json(err2);
        } else {
            res.json({
                status : 'SUKSES',
                ket : 'Terimakasih, anda berhasil memperbaharui absen pulang anda hari ini pada jam : ',
                jam : jam
            })
        }
    })

    // var query1 = `
    //     SELECT * FROM absensi
    //     WHERE id = `+rows[0].id+`
    // `;
    
    // db.query(query1, (err1, rows1)=>{
    //     if (err1) {
    //         console.log(err1);
    //         res.json({
    //             status : 'GAGAL',
    //             ket : 'Gagal, anda sebelumnya tidak melakukan absen kedatangan, absen pulang anda hari ini pada jam : ',
    //             jam : jam
    //         })
    //     } else {

    //         if (rows1 <= 0) {
    //             res.json({
    //                 status : 'GAGAL',
    //                 ket : 'Gagal, anda sebelumnya tidak melakukan absen kedatangan, absen pulang anda hari ini pada jam : ',
    //                 jam : jam
    //             })
                
    //         } else {

                
    //         }



    //     }
    // })











    

}




// ============================= TERPAKAI ==================================




















module.exports = {
    AddAbsenHarian : AddAbsenHarian,
    EditAbsenHarian : EditAbsenHarian,
    NotifSdhAbsen : NotifSdhAbsen,
    NotifTdkAbsenDatang : NotifTdkAbsenDatang,
}