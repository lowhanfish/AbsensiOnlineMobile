var multer  = require('multer')
const path = require('path');


var storage = multer.diskStorage({

    fileFilter: function (req, file, cb) {
        if (path.extension(file.originalname) !== '.pdf') {
          return cb(new Error('Only pdfs are allowed'))
        }
    
        cb(null, true)
      },




    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        let ext = ''; // set default extension (if any)
        if (file.originalname.split(".").length>1) // checking if there is an extension or not.
            ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
        cb(null, Date.now() + ext)
    }
})
var upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        // if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf)$/)) {
        //     console.log("salah file bos..!!")
        //     return cb(new Error('Only image files are allowed!'));
        // }
        // cb(null, true);


            if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "application/pdf") {
                cb(null, true);
            } else {
                console.log('salah file')
                // cb(null, false);
                return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
            }


            // if (path.extension(file.originalname) !== '.jpeg') {
            //     console.log('salah cess')
            //     return cb(new Error('Only pdfs are allowed'))
            //   }
            //   cb(null, true)
            

    //         var filetypes = /jpeg|jpg/;
    // var mimetype = filetypes.test(file.mimetype);
    // var extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    // if (mimetype && extname) {
    //   return cb(null, true);
    // }
    // console.log('salah')
    // cb("Error: File upload only supports the following filetypes - " + filetypes);
            






      }

});

module.exports = upload;