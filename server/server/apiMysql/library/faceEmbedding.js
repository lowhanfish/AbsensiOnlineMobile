const configurasi = require('./configurasi');
var db = require('../../db/MySql/absensi');

// =================== INI YANG KITA GUNAKAN UNTUK CEK WAJAH DI V2 =================
const cekSpoofing = async (body) => {
    try {
        const response = await fetch(configurasi.url_micro_9 + '/api/v1/uploads', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.log("Error: " + response.status + " - " + errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        // console.log("============================ xx")
        // console.log(result);
        // console.log("============================ xx")
        return result.prediction;
    } catch (err) {
        console.log("Error: " + err);
        throw err;
    }
};
const pencocokkanWajah = async (body) => {
    try {
        const response = await fetch(configurasi.url_micro_10 + "api/v1/verify-uploads", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.log("Error: " + response.status + " - " + errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log(result);
        return result;
    } catch (err) {
        console.log("Error: " + err);
        throw err;
    }
};


const getDataWajah = (db, nip) => {

    return new Promise((resolve, reject) => {
        const query = `
            SELECT file
            FROM fotosample
            WHERE nip = ? AND status = 1
        `
        const values = [nip]

        db.query(query, values, (err, rows) => {
            if (err) {
                reject(err)
            } else {
                resolve(rows)
            }
        })
    })
}




// =================== INI YANG KITA GUNAKAN UNTUK CEK WAJAH DI V2 =================

const pencocokan_wajah = (vektor_sampel, vektor_absensi) => {
    // Jika input berupa string, ubah ke array
    if (typeof vektor_sampel === 'string') {
        try {
            vektor_sampel = JSON.parse(vektor_sampel);
        } catch (e) {
            throw new Error('vektor_sampel bukan array atau string JSON array valid');
        }
    }
    if (typeof vektor_absensi === 'string') {
        try {
            vektor_absensi = JSON.parse(vektor_absensi);
        } catch (e) {
            throw new Error('vektor_absensi bukan array atau string JSON array valid');
        }
    }
    // Hitung cosine similarity
    const dotProduct = vektor_sampel.reduce((sum, val, i) => sum + val * vektor_absensi[i], 0);
    const normA = Math.sqrt(vektor_sampel.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(vektor_absensi.reduce((sum, val) => sum + val * val, 0));
    const similarity = dotProduct / (normA * normB);

    return {
        similarity, // Nilai kemiripan (0-1)
        match: similarity >= DEFAULT_THRESHOLD // true jika cocok, false jika tidak
    };
}

const getVectorFromDB = (db, nip) => {

    return new Promise((resolve, reject) => {

        const query = `
            SELECT vectors
            FROM fotosample
            WHERE nip = ? AND status = 1
        `
        const values = [nip]

        db.query(query, values, (err, rows) => {
            if (err) {
                reject(err)
            } else {
                resolve(rows)
            }
        })
    })
}




module.exports = {
    pencocokan_wajah: pencocokan_wajah,
    getVectorFromDB: getVectorFromDB,
    cekSpoofing: cekSpoofing,
    pencocokkanWajah: pencocokkanWajah,
    getDataWajah: getDataWajah,

}