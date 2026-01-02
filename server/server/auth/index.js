const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var uniqid = require('uniqid');

var fetch = require('node-fetch');
const configurasi = require('../apiMysql/library/configurasi');
const url_micro_5 = configurasi.url_micro_5


var dbs = require('../db/MySql/egov');
var dbAbsen = require('../db/MySql/absensi');




const router = express.Router();

const schema = Joi.object().keys({
    username: Joi.string().regex(/^[a-zA-Z0-9_]*$/).min(3).max(13).required(),
    password: Joi.string().min(6).required(),
});



router.get('/', (req, res) => {
    res.json({
        message: 'kiken-login'
    });
});

router.post('/signup', (req, res, next) => {

    const request = {
        username : req.body.username,
        password : req.body.password,
    }

    const result = Joi.validate(request, schema);

    if (result.error === null) {

        let view = `SELECT * FROM users where id = '`+req.body.username+`' `;


        dbs.query(view, (err, row)=>{
            if(row.length <= 0) {
                bcrypt.hash(req.body.password.trim(), 12).then(hashedPassword => {

                    const id = uniqid();
                    const username = req.body.username;
                    const password = hashedPassword;
                    const nama_nip = req.body.nama_nip;
                    const email = nama_nip+'@konaweselatankab.go.id';
                    const unit_kerja = req.body.unit_kerja_id;
                    const Office = 0;
                    const Planing = 0;
                    const Aset = 0;
                    const Monev = 0;
                    const Berita = 0;
                    const Pengaduan = 0;
                    const Sakip = 0;
                    const Bhumie = 0;
                    const CCTV = 0;
                    const Simpeg = 0;
                    const Linja = 0;
                    const Registrasi = 0;
                    const absensi = 0;
                    // const createdAt = new Date(); 
                    // const editedAt = new Date(); 

                    let insert = `
                        INSERT INTO users (id, username, password, email, unit_kerja, nama_nip, Office, Planing, Aset, Monev, Berita, Pengaduan, Sakip, Bhumie, CCTV, Simpeg, Linja, Registrasi, absensi, createdAt, editedAt)
                        VALUES ('`+id+`', '`+username+`', '`+password+`', '`+email+`', '`+unit_kerja+`', '`+nama_nip+`', `+Office+`, '`+Planing+`', `+Aset+`, `+Monev+`, `+Berita+`, `+Pengaduan+`, '`+Sakip+`', `+Bhumie+`, `+CCTV+`, '`+Simpeg+`', `+Linja+`, `+Registrasi+`, `+absensi+`, NOW(), NOW());
    `;
                    dbs.query(insert, (err, row)=>{
                        if(err) {
                            res.send('Gagal dalam meregistrasi ');
                        }else{
                            res.send(row);
                        }
                    })

                });
            }else{
                const error = new Error('Username sudah terpakai oleh user lain');
                
                res.status(409);
                next(error);
            }
        })
    } else {
        res.status(422);
        next(result.error);
    }
});


function respondError422(res, next, text){
    res.status(422);
    const error = new Error(text);
    next(error);
}

router.post('/login', async(req, res, next) =>{
    // console.log("ADA YG LOGIN")
    // console.log("INI DATANYA")
    // console.log(req.body)

    const result = Joi.validate(req.body, schema);
    // console.log("=========================");
    // console.log(req.body.username);
    
    if (result.error === null) {

        // let view = ` 
        // SELECT 
        //     egov.users.*, 
        //     simpeg.unit_kerja.unit_kerja as unit_kerja_nama,
        //     simpeg.unit_kerja.alamat as unit_kerja_alamat,

        //     simpeg.biodata.id as bio_id,
        //     simpeg.biodata.nama as bio_nama,
        //     simpeg.biodata.gelar_depan as bio_gelar_depan,
        //     simpeg.biodata.gelar_belakang as bio_gelar_belakang,
        //     simpeg.biodata.tempat_lahir  as bio_tempat_lahir ,
        //     simpeg.biodata.ttl as bio_ttl,
        //     simpeg.biodata.gol as bio_gol,
        //     simpeg.biodata.jabatan as bio_jabatan ,
        //     simpeg.biodata.alamat as bio_alamat,
        //     simpeg.instansi.id as instansi_id,
        //     simpeg.instansi.instansi as instansi_nama

        // FROM egov.users 

        // JOIN simpeg.unit_kerja 
        //     ON egov.users.unit_kerja = simpeg.unit_kerja.id
        // JOIN simpeg.instansi 
        //     ON simpeg.instansi.id = simpeg.unit_kerja.instansi
        // JOIN simpeg.biodata 
        //     ON egov.users.nama_nip = simpeg.biodata.nip
        // WHERE users.username = '`+req.body.username+`';
        // `;



        try {
            const response = await fetch(url_micro_5+'/micro_5/getBiodataUser/view', {
                method: 'post',
                body: JSON.stringify(req.body),
                headers: {'Content-Type': 'application/json'}
            });

            const row = await response.json();

            if(row.length <= 0) {
                respondError422(res, next, "Username Salah");
            }else{

                var user = {}
                for (var i in row) {user = row[i]}
                const body = {unit_kerja : user.unit_kerja};
          
                try {
                    const response = await fetch(url_micro_5+'/micro_5/getJenisLokasi/view', {
                        method: 'post',
                        body: JSON.stringify(body),
                        headers: {'Content-Type': 'application/json'}
                    });
                    const data = await response.json();
                    const payload =  {
                        _id: user.id,
                        username : user.username,
                        profile : {
                            nama : user.bio_gelar_depan+','+user.bio_nama+','+user.bio_gelar_belakang,
                            NIP : user.nama_nip,
                            ttl : user.bio_tempat_lahir+'/'+user.bio_ttl,
                            gol : user.bio_gol,
                            instansi_id : user.instansi_id,
                            ref_instansi : user.instansi_nama,
                            unit_kerja : user.unit_kerja,
                            unit_kerja_nama : user.unit_kerja_nama,
                            unit_kerja_alamat : user.unit_kerja_alamat,
                            jabatan : user.bio_jabatan,
                            alamat : user.bio_alamat,
                            user_id : user.bio_id,
    
                            Office : user.Office,
                            Planing : user.Planing,
                            Aset : user.Aset,
                            Monev : user.Monev,
                            Berita : user.Berita,
                            Pengaduan : user.Pengaduan,
                            Sakip : user.Sakip,
                            Bhumie : user.Bhumie,
                            CCTV : user.CCTV,
                            Simpeg : user.Simpeg,
                            Linja : user.Linja,
                            Registrasi : user.Registrasi,
                            absensi : user.absensi,
                            lokasi_absen : data,
                        }
                    };
                    
                    bcrypt.compare(req.body.password, user.password).then((result) => {
                        // Jika client mengirimkan password yang benar
                        if(result){
                            jwt.sign(payload, process.env.TOKEN_SECRET, {
                                expiresIn: '24h'
                            }, (err, token) => {
                                if(err){
                                    respondError422(res, next, "Kesalahan dlm pembuatan token");
                                }else{
                                    res.json({token : token, profile : payload});
                                }
                            })
                        }else{
                            respondError422(res, next, "Password salah");
                        }
                    });

           
                } catch (error) {
                    console.log("Respon error dari auth/index.js => login, utk server Kominfo Micro 5 (Get Lokasi Absensi)");
                    console.log(error);
                    res.json([])
                }

            }
   
        } catch (error) {
            console.log("Respon error dari auth/index.js => login, utk server Kominfo Micro 5 (Get Biodata)");
            console.log(error);
            res.json([])
        }

    }else{
        respondError422(res, next, "Gagal Login Periksa kembali username atau password anda..!");
    }
});

router.get('/notif', (req, res)=>{


    // var fcm_tokens =  'eQC1XtOYSHW1ZYZbGXefo2:APA91bGr1zTlNSnZMLENlU_9d6oBVxS30rJgQLMlDGyizpyGYWAqneRWzVQ4EBrsbqyjluMGZQqdmAVxG0O2Hxb-E3QMYrMuGxv7tNX5U_-7CkW8_sF_ah_0Vq-_y7kwc4oP53D23w4Q'
    // var notification_body = {
    //     "to" : fcm_tokens,
    //     "collapse_key" : "type_a",
    //     "notification" : {
    //         "body" : "Pengumuman",
    //         "title": "Pelaksanaan Aple Pagi cezzzz jadi bagaimana ko mau ikut kah atau tidak",
    //         'image': 'https://i.ytimg.com/vi/sioEY4tWmLI/maxresdefault.jpg'
    //     },
    //     "data" : {
    //         "body" : "Body of Your Notification in Data",
    //         "title": "Title of Your Notification in Title",

    //     }
    //    }
    
    // fetch ('https://fcm.googleapis.com/fcm/send', {
    //     'method' : 'POST',
    //     'headers' : {
    //         'Authorization' :'key='+'AAAAOsX4lRw:APA91bF4IbrC5gW6Luf2dqn327-oo7oiWsQAvmVJv6QRSGvvsV9dWMno_Fc4ypCug2c1hszgDhxSpbud3gYqrGMHV2wSzjpt8IoWrs1JwQz-489kvhcULuJJeVvY5n469x6tRv4-pJ8p',
    //         'Content-Type' : 'application/json'
    //     },
    //     'body' : JSON.stringify(notification_body)
    // }).then(()=>{
    //     res.status(200).send("berhasil kirim notif")
    // }).catch((err)=>{
    //     console.log(err)
    //     res.status(400).send("Eror")
    // })





    var fcm_tokens =    [
                            'eQC1XtOYSHW1ZYZbGXefo2:APA91bGr1zTlNSnZMLENlU_9d6oBVxS30rJgQLMlDGyizpyGYWAqneRWzVQ4EBrsbqyjluMGZQqdmAVxG0O2Hxb-E3QMYrMuGxv7tNX5U_-7CkW8_sF_ah_0Vq-_y7kwc4oP53D23w4Q',
                            'eQC1XtOYSHW1ZYZbGXefo2:APA91bGr1zTlNSnZMLENlU_9d6oBVxS30rJgQLMlDGyizpyGYWAqneRWzVQ4EBrsbqyjluMGZQqdmAVxG0O2Hxb-E3QMYrMuGxv7tNX5U_-7CkW8_sF_ah_0Vq-_y7kwc4oP53D23w4Q',
                        ]
    var notification_body = {
        "registration_ids" : fcm_tokens,
        "collapse_key" : "type_a",
        "notification" : {
            "body" : "Pengumuman",
            "title": "Pelaksanaan Aple Pagi cezzzz jadi bagaimana ko mau ikut kah atau tidak",
            'image': 'https://i.ytimg.com/vi/sioEY4tWmLI/maxresdefault.jpg'
        },
        "data" : {
            "body" : "Body of Your Notification in Data",
            "title": "Title of Your Notification in Title",

        }
       }
    
    fetch ('https://fcm.googleapis.com/fcm/send', {
        'method' : 'POST',
        'headers' : {
            'Authorization' :'key='+'AAAAOsX4lRw:APA91bF4IbrC5gW6Luf2dqn327-oo7oiWsQAvmVJv6QRSGvvsV9dWMno_Fc4ypCug2c1hszgDhxSpbud3gYqrGMHV2wSzjpt8IoWrs1JwQz-489kvhcULuJJeVvY5n469x6tRv4-pJ8p',
            'Content-Type' : 'application/json'
        },
        'body' : JSON.stringify(notification_body)
    }).then(()=>{
        res.status(200).send("berhasil kirim notif")
    }).catch((err)=>{
        console.log(err)
        res.status(400).send("Eror")
    })


})



module.exports = router;