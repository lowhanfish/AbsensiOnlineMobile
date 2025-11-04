const mongoose = require("mongoose");


const Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// var ref_dati2Scema = new Schema({
//     _id: ObjectId,
//     kd_propinsi : String,
//     kd_dati2 : String,
//     nm_dati2 : String,
//     createdby : String,
//     updatedby: String,
//     createdtime : Date,
//     updatedtime : Date

// }, { collection : 'ref_dati2' });

// const ref_dati2 = mongoose.model('ref_dati2', ref_dati2Scema);

var ref_kecamatanScema = new Schema({
    // _id: ObjectId,
    kd_propinsi : String,
    kd_dati2 : String,
    kd_kecamatan : String,
    nm_kecamatan : String,
    createdby : String,
    updatedby: String,
    createdtime : String,
    updatedtime : String

}, { collection : 'ref_kecamatan' });

// mongoose.model('ref_dati2', ref_dati2);

const ref_kecamatan = mongoose.model('ref_kecamatan', ref_kecamatanScema);

module.exports = ref_kecamatan;


