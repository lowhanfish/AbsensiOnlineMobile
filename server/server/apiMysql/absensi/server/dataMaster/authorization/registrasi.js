const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
var uniqid = require('uniqid');
var db = require('../../../../../db/MySql/egov');



const router = express.Router();


router.post('/aa', (req, res) => {
    console.log(req.body)
    res.send('oke')
});



router.post('/view', (req, res) => {
    var data_batas = parseInt(req.body.page_limit);
    var data_star = (req.body.data_ke - 1) * data_batas;
    var cari = req.body.cari_value;
    var halaman = 1;

    var unit_kerja = ``

    if (req.body.unit_kerja == '' || req.body.unit_kerja == undefined || req.body.unit_kerja == null) {
        unit_kerja = ``
    } else {
        unit_kerja = `biodata.unit_kerja = '`+req.body.unit_kerja+`' AND`
    }




    let jml_data = ` 
        SELECT
        users.id

        FROM egov.users users
        
        LEFT JOIN absensi.menu_klp menu_klp
        ON menu_klp.id = users.absensi

        LEFT JOIN simpeg.biodata biodata
        ON biodata.nip = users.nama_nip

        WHERE 
        `+unit_kerja+`
        biodata.nama LIKE '%`+cari+`%' 
    
    
    `;

    let view = `
        SELECT
        users.id,
        users.username,
        users.hp,
        users.email,
        users.absensi as menu_klpx,
        menu_klp.uraian as menu_klp_uraian,
        biodata.nama,
        biodata.nip,
        biodata.gelar_depan,
        biodata.gelar_belakang,
        biodata.unit_kerja,
        biodata.metode_absen


        FROM egov.users users
        
        LEFT JOIN absensi.menu_klp menu_klp
        ON menu_klp.id = users.absensi

        LEFT JOIN simpeg.biodata biodata
        ON biodata.nip = users.nama_nip

        WHERE 
        `+unit_kerja+`
        biodata.nama LIKE '%`+cari+`%' 

        LIMIT `+ data_star + `,` + data_batas + `
    `;

    var akses_menu = req.menu_akses
    const levelAkses = akses_menu.find(({ route }) => route === '/registrasi');

    // console.log(akses_menu);

    if (levelAkses.readx == 1) {
        db.query(jml_data, (err, row) => {
            if (err) {
                console.log(err);
                res.json(err)
            } else {
                halaman = Math.ceil(row.length / data_batas);
                if (halaman < 1) { halaman = 1 }
                // ========================
                db.query(view, (err, result) => {
                    if (err) { res.json(err) }
                    else {
                        halaman = Math.ceil(row.length / data_batas);
                        if (halaman < 1) { halaman = 1 }
                        res.json({
                            data: result,
                            jml_data: halaman,
                            total: row.length,
                        })
                    }
                })
                // ========================
            }
        })
    } else {
        res.json("ANDA TIDAK MEMILIKI HAK AKSES..!!")
    }


});


// var akses_menu = req.menu_akses
// const levelAkses = akses_menu.find(({ route }) => route === '/registrasi');

// if (levelAkses.readx == 1) {

// } else {
//     res.json("ANDA TIDAK MEMILIKI HAK AKSES..!!")
// }


router.post('/signup', (req, res, next) => {

    // console.log(req.body)

    const request = {
        username: req.body.username,
        password: req.body.password,
    }

    const result = Joi.validate(request, schema);
    // console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')

    if (result.error === null) {

        
        let view = `
            SELECT * 
            FROM users
            WHERE 
            users.username = '`+ req.body.username +`' OR users.email = '`+req.body.email +`'
        `

        var akses_menu = req.menu_akses
        const levelAkses = akses_menu.find(({ route }) => route === '/registrasi');

        if (levelAkses.addx == 1) {
            db.query(view, (err, row) => {
                if (err) {
                    console.log(err);
                    res.send(err);
                } else{
                    if (row.length <= 0) {
                        bcrypt.hash(req.body.password.trim(), 12).then(hashedPassword => {
    
                            const id = uniqid();
                            const username = req.body.username;
                            const password = hashedPassword;
                            const email = req.body.email;
                            const unit_kerja = req.body.unit_kerja;
                            const nama_nip = req.body.nip;
                            const hp = req.body.hp;
                            const Office = 0;
                            const Planing = null;
                            const Aset = 0;
                            const Monev = 0;
                            const Berita = 0;
                            const Pengaduan = 0;
                            const Sakip = null;
                            const Bhumie = 0;
                            const CCTV = 0;
                            const Simpeg = 0;
                            const absensi = req.body.menu_klp;
                            const Linja = 0;
                            const Registrasi = 0;
    
                            const query = `
                                
    
    
                            INSERT INTO users (id, username, hp, password, email, unit_kerja, nama_nip, Office, Planing, Aset, Monev, Berita, Pengaduan, Sakip, Bhumie, CCTV, Simpeg, Linja, absensi, Registrasi, createdAt, editedAt)
                            VALUES ('`+id+`', '`+username+`', '`+hp+`', '`+password+`', '`+email+`', '`+unit_kerja+`', '`+nama_nip+`', `+Office+`, '`+Planing+`', `+Aset+`, `+Monev+`, `+Berita+`, `+Pengaduan+`, '`+Sakip+`', `+Bhumie+`, `+CCTV+`, '`+Simpeg+`', `+Linja+`, `+absensi+`, `+Registrasi+`, NOW(), NOW());
    
    
    
    
    
    
    
    
    
                            `
    
                            db.query(query, (err, row) => {
                                if (err) {
                                    console.log(err)
                                    res.send('Gagal dalam meregistrasi ');
                                }else{
                                    console.log('suksesssssssssssssssss')
                                    res.send(row);
                                }
                            })
    
                        });
    
                    }else{
                        const error = new Error('Username atau email sudah digunakan sebelumnya');
                        res.status(409);
                        next(error);
                    }
                }
            })
        } else {
            res.json("ANDA TIDAK MEMILIKI HAK AKSES..!!")
        }


        // db.query(view)
        //     .then(cursor => cursor.all())
        //     .then((row, err) => {
        //         if (row.length <= 0) {



        //             bcrypt.hash(req.body.password.trim(), 12).then(hashedPassword => {

        //                 const data = {
        //                     id: uniqid(),
        //                     email: req.body.email,
        //                     level: req.body.level,
        //                     nama: req.body.nama,
        //                     hp: req.body.hp,
        //                     username: req.body.username,
        //                     password: hashedPassword
        //                 }
        //                 var reques = JSON.stringify(data)

        //                 let insert = `insert ` + reques + ` into users`

        //                 db.query(insert)
        //                     .then(cursor => cursor.all())
        //                     .then((row, err) => {
        //                         if (err) {
        //                             console.log(err)
        //                             res.send('Gagal dalam meregistrasi ');
        //                         } else {
        //                             console.log('suksesssssssssssssssss')
        //                             res.send(row);
        //                         }
        //                     });

        //             });


        //         } else {
        //             const error = new Error('Username atau email sudah digunakan sebelumnya');
        //             res.status(409);
        //             next(error);
        //         }
        //     });


    } else {
        res.status(422);
        next(result.error);
    }

});




router.post('/editData', (req, res) => {

    // console.log(req.body)
    console.log("ASSSSSSSSSSSSSSSUU")
    var query = `
        UPDATE users SET

        absensi = '`+req.body.menu_klp+`',
        username = '`+req.body.username+`',
        email = '`+req.body.email+`',
        hp = '`+req.body.hp+`',
        unit_kerja = '`+req.body.unit_kerja+`'


        WHERE id = '`+req.body.id+`'
    `


    var akses_menu = req.menu_akses
    const levelAkses = akses_menu.find(({ route }) => route === '/registrasi');

    if (levelAkses.updatex == 1) {
        db.query(query, (err, row)=>{
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                var query1 = `
                    UPDATE simpeg.biodata biodata SET
    
                    biodata.metode_absen = '`+req.body.metode_absen+`'
    
    
                    WHERE nip = '`+req.body.nip+`'
                `
                db.query(query1, (err1, row1)=>{
                    if (err1) {
                        console.log(err1);
                        res.send(err1);
                    } else {
                        console.log('Sukses mengubah data');
                        res.send(row1);
                    }
                })
    
    
    
    
    
    
    
    
    
            }
        })

    } else {
        res.json("ANDA TIDAK MEMILIKI HAK AKSES..!!")
    }


})



router.post('/editDataPass', (req, res) => {

    var akses_menu = req.menu_akses
    const levelAkses = akses_menu.find(({ route }) => route === '/registrasi');

    if (levelAkses.updatex == 1) {
        bcrypt.hash(req.body.password.trim(), 12).then(hashedPassword => {
    
            const query = `
                UPDATE users SET
    
                password = '`+hashedPassword+`'
                WHERE id = '`+req.body.id+`'
            `
    
            db.query(query, (err, row) => {
                if (err) {
                    console.log(err)
                    res.send('Gagal dalam meregistrasi ');
                }else{
                    console.log('suksesssssssssssssssss')
                    res.send(row);
                }
            })
    
        });

    } else {
        res.json("ANDA TIDAK MEMILIKI HAK AKSES..!!")
    }



   
})



router.post('/removeData', (req, res) => {
    console.log(req.body)
    var query = `
        DELETE FROM users WHERE id = '`+ req.body.id + `';
    `;

    // console.log(query)


    var akses_menu = req.menu_akses
    const levelAkses = akses_menu.find(({ route }) => route === '/registrasi');

    if (levelAkses.deletex == 1) {
        db.query(query, (err, row) => {
            if (err) {
                console.log(er)
                res.send(err);
            } else {
                console.log('sukses menghapus')
                res.send(row);
            }
        });

    } else {
        res.json("ANDA TIDAK MEMILIKI HAK AKSES..!!")
    }


})



const schema = Joi.object().keys({
    username: Joi.string().regex(/^[a-zA-Z0-9_]*$/).min(3).max(14).required(),
    password: Joi.string().min(6).required(),
});



module.exports = router;