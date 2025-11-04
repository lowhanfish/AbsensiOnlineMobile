const express = require('express');
var dbs = require('../../db/MySql/egov');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const db = require('../db/connection');
// const users = db.get('users');
// const pegawai = db.get('pegawai');
var uniqid = require('uniqid');



const router = express.Router();


router.post('/aa', (req, res) => {

    console.log(req.body)
    res.send('oke')

});










module.exports = router;