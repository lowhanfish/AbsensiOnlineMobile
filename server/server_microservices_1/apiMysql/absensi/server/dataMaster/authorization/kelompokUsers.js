const express = require('express');
var db = require('../../../../../db/MySql/absensi');


// var db = require('../../../../../db');



// var uniqid = require('uniqid');
const router = express.Router();





router.post('/view', (req, res) => {
    var data_batas = parseInt(req.body.page_limit);
    var data_star = (req.body.data_ke - 1) * data_batas;
    var cari = req.body.cari_value;
    var halaman = 1;

    let jml_data = ` SELECT * FROM menu_klp `;

    let view = `
        SELECT * FROM menu_klp
        ORDER BY menu_klp.id ASC
        LIMIT `+ data_star + `,` + data_batas + `
    `;



    var akses_menu = req.menu_akses
    const levelAkses = akses_menu.find(({ route }) => route === '/klpUsers');

    // console.log(levelAkses);

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
// const levelAkses = akses_menu.find(({ route }) => route === '/klpUsers');

// if (levelAkses.readx == 1) {

// } else {
//     res.json("ANDA TIDAK MEMILIKI HAK AKSES..!!")
// }



router.post('/addData', (req, res) => {

    var form = req.body.form


    // ==================== FLATEN OBJECT NESTED ====================
    var list_menu = req.body.list_menu
    var data = []
    list_menu.forEach(h => {
        data.push(h)
        h.subItem.forEach(i => {
            data.push(i)
            i.subItem.forEach(j => {
                data.push(j)
            });
        });
    });
    // ================== END FLATEN OBJECT NESTED ====================



    var query = `
        INSERT INTO menu_klp (uraian) VALUES ('`+ form.uraian + `');
    `



    var akses_menu = req.menu_akses
    const levelAkses = akses_menu.find(({ route }) => route === '/klpUsers');

    if (levelAkses.addx == 1) {
        db.query(query, (err, row) => {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                data.forEach(element => {
                    var query1 = `
                        INSERT INTO menu_klp_list (menu_id, menu_klp_id, readx, updatex, deletex, addx) 
                        VALUES (
                            `+ element.id + `,
                            `+ row.insertId + `,
                            `+ element.readx + `,
                            `+ element.updatex + `,
                            `+ element.deletex + `,
                            `+ element.addx + `
                        );
                    `
                    // console.log(query1)
                    db.query(query1, (err1, row1) => {
                        if (err) {
                            console.log(err1);
                            res.send(err1);
                        }
                    })
                });
    
            }
        })
    
        res.send('OK')

    } else {
        res.json("ANDA TIDAK MEMILIKI HAK AKSES..!!")
    }





});

router.post('/editData', (req, res) => {

    var form = req.body.form;

    // ==================== FLATEN OBJECT NESTED ====================
    var list_menu = req.body.list_menu
    var data = []
    list_menu.forEach(h => {
        data.push(h)
        h.subItem.forEach(i => {
            data.push(i)
            i.subItem.forEach(j => {
                data.push(j)
            });
        });
    });
    // ================== END FLATEN OBJECT NESTED ====================










    var query = `
        UPDATE menu_klp SET
        uraian = '`+ form.uraian + `'
        WHERE id = `+ form.id+ `
    `



    var akses_menu = req.menu_akses
    const levelAkses = akses_menu.find(({ route }) => route === '/klpUsers');

    if (levelAkses.updatex == 1) {
        db.query(query, (err, row) => {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                
    
    
                data.forEach(element => {
                    var query1 = '';
    
                    if (element.menu_klp_list_id == null) {
                        query1 = `
                            INSERT INTO menu_klp_list (menu_id, menu_klp_id, readx, updatex, deletex, addx) 
                            VALUES (
                                `+ element.id + `,
                                `+ form.id + `,
                                `+ element.readx + `,
                                `+ element.updatex + `,
                                `+ element.deletex + `,
                                `+ element.addx + `
                            );
                        `
                    } else {
                        query1 = `
                            UPDATE menu_klp_list SET
                            readx = `+ element.readx + `,
                            updatex = `+ element.updatex + `,
                            deletex = `+ element.deletex + `,
                            addx = `+ element.addx + `
    
                            WHERE id = `+ element.menu_klp_list_id+ `
                        `
                    }
    
                    // console.log(query1)
                    db.query(query1, (err1, row1) => {
                        if (err) {
                            console.log(err1);
                            res.send(err1);
                        }
                    })
                });
    
    
    
    
            }
        })
    
        res.send('OK')
    } else {
        res.json("ANDA TIDAK MEMILIKI HAK AKSES..!!")
    }





})



router.post('/removeData', (req, res) => {
    var query = `
        DELETE FROM menu_klp WHERE id = `+ req.body.id + `; 
    `;

    var akses_menu = req.menu_akses
    const levelAkses = akses_menu.find(({ route }) => route === '/klpUsers');

    if (levelAkses.deletex == 1) {
        db.query(query, (err, row) => {
            if (err) {
                res.send(err);
            } else {
                var query1 = `
                    DELETE FROM menu_klp_list WHERE menu_klp_id = `+ req.body.id + `; 
                `;
                db.query(query1, (err1, row1) => {
                    if (err) {
                        res.send(err1);
                    } else {
                        res.send(row1);
                    }
                });
            }
        });
    } else {
        res.json("ANDA TIDAK MEMILIKI HAK AKSES..!!")
    }



})


router.get('/list', (req, res) => {

    let view = `
        SELECT * FROM menu_klp
    `;

    db.query(view, (err, rows) => {
        if (err) {
            // console.log(err);
            res.send(err);
        } else {
            res.send(rows)
        }
    })

   
});



router.post('/list', (req, res) => {

    let view = `
        SELECT * FROM menu_klp
    `;

    db.query(view, (err, rows) => {
        if (err) {
            // console.log(err);
            res.send(err);
        } else {
            res.send(rows)
        }
    })

   
});


router.get('/listAdd', (req, res) => {
    // console.log(req.body)
    var query = `
       SELECT menu.*, 
       true as readx,
       true as updatex,
       true as deletex,
       true as addx
       
       FROM menu
       ORDER BY menu.urutan
   `
    db.query(query, (err, rows) => {
        if (err) {
            console.log(err);
            res.send(err);
        } else {

            const nest = (items, id = null, link = 'parrent') =>
                items
                    .filter(item => item[link] === id)
                    .map(item => ({ ...item, subItem: nest(items, item.id) }));

            res.send(nest(rows))
        }
    })

});



router.post('/listEdit', (req, res) => {


    // console.log(req.body)
    var query = `
        SELECT menu.*,
        IF(ISNULL(menu_klp_list.id), null, menu_klp_list.id) as menu_klp_list_id,
        IF(ISNULL(menu_klp_list.readx), false, menu_klp_list.readx) as readx,
        IF(ISNULL(menu_klp_list.updatex), false, menu_klp_list.updatex) as updatex,
        IF(ISNULL(menu_klp_list.deletex), false, menu_klp_list.deletex) as deletex,
        IF(ISNULL(menu_klp_list.addx), false, menu_klp_list.addx) as addx


        FROM menu
        
        LEFT JOIN menu_klp_list
        ON menu.id = menu_klp_list.menu_id AND menu_klp_list.menu_klp_id = `+ req.body.menu_klp_id + `



        ORDER BY menu.urutan
    `
    db.query(query, (err, rows) => {
        if (err) {
            console.log(err);
            res.send(err);
        } else {

            const nest = (items, id = null, link = 'parrent') =>
                items
                    .filter(item => item[link] === id)
                    .map(item => ({ ...item, subItem: nest(items, item.id) }));

            res.send(nest(rows))
        }
    })

});


router.post('/listSidebar', (req, res) => {

    // console.log(req.body)
    var query = `
        SELECT menu.*,
        menu_klp_list.id as menu_klp_list_id,

        IF(menu.type = 1, true, menu_klp_list.readx) as readx,
        IF(ISNULL(menu_klp_list.updatex), false, menu_klp_list.updatex) as updatex,
        IF(ISNULL(menu_klp_list.deletex), false, menu_klp_list.deletex) as deletex,
        IF(ISNULL(menu_klp_list.addx), false, menu_klp_list.addx) as addx


        FROM menu
        
        LEFT JOIN menu_klp_list
        ON menu.id = menu_klp_list.menu_id AND menu_klp_list.menu_klp_id = `+ req.body.menu_klp_id + `

        WHERE IF(menu.type = 1, true, menu_klp_list.readx) = true
        ORDER BY menu.urutan
    `


    // WHERE IF(menu.type = 1, true, menu_klp_list.readx) = true


    db.query(query, (err, rows) => {
        if (err) {
            console.log(err);
            res.send(err);
        } else {

            const nest = (items, id = null, link = 'parrent') =>
                items
                .filter(item => item[link] === id)
                .map(item => ({ ...item, subItem: nest(items, item.id) }));

            var datax = nest(rows)
            var data = []

            datax.forEach(function(item) {
                item.subItem = item.subItem.filter(function(subItemx){
                    // console.log(subItemx)
                      return !(subItemx.subItem.length <= 0 && subItemx.type == 1);
              })  
            });


            datax.forEach((el1, index1, item1) => {
                if (el1.subItem.length <= 0 && el1.type == 1) {
                    // console.log(index1)
                    datax.splice(index1, 1);
                } 
            });

            res.send(datax)
        }
    })

});






module.exports = router;

