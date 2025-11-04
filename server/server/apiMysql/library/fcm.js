const fetch = require('node-fetch');
var fcm = require('fcm-notification');
var FCM = new fcm('./firebs/privatekey.json');




var token = 'dDPs_aVB89c:APA91bFQapBVej2q9KHKPPDrz8jQjEqdV3HiYGAsqSAM_t5hlVwQI-uVzGb9Edo43_qbg9Qc7bpkxPGnCtzBfwIHhyxFHJput9CSOVLsUKxiID1GYL4WhqrM5EcC4JMdGNp6Se6dJLUt';

var serverKey = 'AAAAwQLIOfo:APA91bG25ntCTbgKlXmRkE8KSMfsArOJXz63RkPCf6AM1kQScMJ1bg44pHNt6ktuvMK9sYCaFgTUkKOUnxoGmB0s3UnWRkg-sTt5wSjchouW_ZVSoxuSKtiCScZjS8Nfkvt63QkDkHlP'




const pushNotification = (judul, isi) =>{
    
    var message = {
        data: {    //This is only optional, you can send any data
            score: '850',
            time: '2:45'
        },
        notification:{
            title : judul,
            body : isi,
            
        },
        "android": {
            "notification": {
                "sound": "default"
            }
        },
        "apns": {
            "payload": {
                "aps": {
                    "sound": "default"
                }
            }
        },
        token : token
    };
    
    FCM.send(message, function(err, response) {
        if(err){
            console.log('error found', err);
        }else {
            console.log('response here', response);
        }
    })




}
 




module.exports = {
    pushNotification : pushNotification,
}