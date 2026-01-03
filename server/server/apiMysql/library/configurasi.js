
// Handle Laporan presensi

//const url_micro_1 = 'http://10.91.178.4:50281'
const url_micro_1 = process.env.HOST_MICROSERVICES+':50281'
//const url_micro_1 = 'https://absensimicro1.konaweselatankab.com'

//const url_micro_2 = 'http://10.91.178.4:50282'
//const url_micro_2 = 'https://absensimicro2.konaweselatankab.com'
const url_micro_2 = process.env.HOST_MICROSERVICES+':50282'

const url_micro_3 = process.env.HOST_MICROSERVICES+':50283'
//const url_micro_3 = 'http://10.91.178.2:50283'
//const url_micro_3 = 'http://10.91.178.4:50283'

const url_micro_4 = process.env.HOST_MICROSERVICES+':50284'
//const url_micro_4 = 'http://10.91.178.2:50284'
//const url_micro_4 = 'http://10.91.178.4:50284'

const url_micro_5 = process.env.HOST_MICROSERVICES+':50285'
//const url_micro_5 = 'http://10.91.178.4:50285'
//const url_micro_5 = 'http://10.91.178.2:50285'

const url_micro_6 = process.env.HOST_MICROSERVICES+':50286'
//const url_micro_6 = 'http://10.91.178.2:50286'
//const url_micro_6 = 'http://10.91.178.4:50286'

const url_micro_7 = process.env.HOST_MICROSERVICES+':50287'
//const url_micro_7 = 'http://10.91.178.4:50287'
//const url_micro_7 = 'https://absensimicro7.konaweselatankab.com'

//const url_micro_8 = 'http://10.91.178.4:50288'
//const url_micro_8 = 'http://10.91.178.2:50288'
const url_micro_8 = process.env.HOST_MICROSERVICES+':50288'



// const url_micro_1 = 'http://localhost:50281'
// const url_micro_2 = 'http://localhost:50282'
// const url_micro_3 = 'http://localhost:50283'
// const url_micro_4 = 'http://localhost:50284'
// const url_micro_5 = 'http://localhost:50285'
// const url_micro_6 = 'http://localhost:50286'
// const url_micro_7 = 'http://localhost:50287'


module.exports = {
    url_micro_1 : url_micro_1,
    url_micro_2 : url_micro_2,
    url_micro_3 : url_micro_3,
    url_micro_4 : url_micro_4,
    url_micro_5 : url_micro_5,
    url_micro_6 : url_micro_6,
    url_micro_7 : url_micro_7,
    url_micro_8 : url_micro_8,	
	
}
