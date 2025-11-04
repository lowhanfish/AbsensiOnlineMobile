const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/connection');
const users = db.get('users');
const pegawai = db.get('pegawai');
var uniqid = require('uniqid');

users.createIndex('username', {
    unique: true
});

const router = express.Router();

const schema = Joi.object().keys({
    username: Joi.string().regex(/^[a-zA-Z0-9_]*$/).min(3).max(13).required(),
    password: Joi.string().min(6).required(),
});

function createTokenSendResponse (user, res, next){
    const payload =  {
        _id: user._id,
        username : user.username,
        profile : user.profile
    };
    console.log("Token_secret : ", process.env.TOKEN_SECRET);

    jwt.sign(payload, process.env.TOKEN_SECRET, {
        expiresIn: '24h'
    }, (err, token) => {
        if(err){
            respondError422(res, next, "Kesalahan dlm pembuatan token");
        }else{
            res.json({
                token
            });
        }
    });
}

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

        users.findOne({
            username: req.body.username
        }).then(user => {
            
            if (user) {
                const error = new Error('Username sudah terpakai oleh user lain');
                res.status(409);
                next(error);
            } else {
                bcrypt.hash(req.body.password.trim(), 12).then(hashedPassword => {

                    const newUser = {
                        'id' : uniqid(),
                        'username': req.body.username,
                        'password': hashedPassword,
                        'profile' : {
                            'unit_kerja_id' : req.body.unit_kerja_id,
                            'nama_nip' :  req.body.nama_nip,
                            'adminOffice' : req.body.adminOffice,
                            'adminPlaning' : req.body.adminPlaning,
                            'adminSimpeg' : req.body.adminSimpeg,
                            'adminBhumie' : req.body.adminBhumie,
                        },
                        'date' : new Date()
                    }
                    users.insert(newUser).then(insertedUser => {
                        createTokenSendResponse(insertedUser, res, next);
                    });

                });
            }
        });


    } else {
        res.status(422);
        next(result.error);
    }
});





router.post('/update', (req, res, next) => {
    const result = Joi.validate(req.body, schema);

    if (result.error === null) {
        users.findOne({
            username: req.body.username
        }).then(user => {
            if (user) {
                bcrypt.hash(req.body.password.trim(), 12).then(hashedPassword => {
                    const newUser = {
                        
                        'username': req.body.username,
                        'password': hashedPassword,
                        'profile' : {
                            rka : req.body.level,
                            nama : req.body.nama,
                        }
                    }

                    users.update({_id: idSelector}, {$set:{
                        
                    }}).then(insertedUser => {
                        createTokenSendResponse(insertedUser, res, next);
                    });
                    

                });
            } else {
                const error = new Error('Username sudah terpakai oleh user lain');
                res.status(409);
                next(error);
            }
        });


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

router.post('/login', (req, res, next) =>{

    const result = Joi.validate(req.body, schema);
    if (result.error === null) {
        users.findOne({
            username: req.body.username,
        }).then(user => {

            if(user){

                pegawai.findOne({id : user.profile.nama}).then((profileku)=>{

                    const payload =  {
                        _id: user._id,
                        id: user.id,
                        username : user.username,
                        profile : user.profile
                    };
                    console.log("Token_secret : ", process.env.TOKEN_SECRET);
                
                    jwt.sign(payload, process.env.TOKEN_SECRET, {
                        expiresIn: '24h'
                    }, (err, token) => {
                        if(err){
                            respondError422(res, next, "Kesalahan dlm pembuatan token");
                        }else{
                            res.json({
                                token
                            });
                        }
                    }).then((result) => {
                        if(result){
                            createTokenSendResponse(user, res, next);
                        }else{
                            respondError422(res, next, "Password salah");
                        }
                    });;

                    // bcrypt.compare(req.body.password, user.password).then((result) => {
                    //     if(result){
                    //         createTokenSendResponse(user, res, next);
                    //     }else{
                    //         respondError422(res, next, "Password salah");
                    //     }
                    // });
                });
                





            }else{
                respondError422(res, next, "Username Salah");
            }
        });
    

    }else{
        respondError422(res, next, "Gagal Login Periksa kembali username atau password anda..!");
    }
});

module.exports = router;