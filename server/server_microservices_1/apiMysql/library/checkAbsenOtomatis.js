var schedule = require('node-schedule');



const checkKehadiranOtomatis = () =>{

    schedule.scheduleJob('25 * * * * *', function(){
      for (let i = 0; i < 1000; i++) {
          console.log('sapi'+i);
          
      }


      for (let i = 0; i < 1000; i++) {
        console.log('ayam'+i);
          
      }

  });
}



module.exports = {
    checkKehadiranOtomatis : checkKehadiranOtomatis
}
