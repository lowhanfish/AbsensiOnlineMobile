// Handle Laporan presensi
// // const url_micro_1 = 'http://36.88.33.75:50281'
// const url_micro_1 = 'https://absensimicro1.konaweselatankab.com'

// // const url_micro_2 = 'http://36.88.33.75:50282'
// const url_micro_2 = 'https://absensimicro2.konaweselatankab.com'

// const url_micro_3 = 'http://localhost:50283'
// const url_micro_4 = 'http://localhost:50284'
// const url_micro_5 = 'http://localhost:50285'
// const url_micro_6 = 'http://localhost:50286'

// // const url_micro_7 = 'http://36.88.33.75:50287'
// const url_micro_7 = 'https://absensimicro7.konaweselatankab.com'


const URLXYZ = process.env.HOST_MICROSERVICES


const url_micro_1 = URLXYZ+':50281'
const url_micro_2 = URLXYZ+':50282'
const url_micro_3 = URLXYZ+':50283'
const url_micro_4 = URLXYZ+':50284'
const url_micro_5 = URLXYZ+':50285'
const url_micro_6 = URLXYZ+':50286'
const url_micro_7 = URLXYZ+':50287'
const url_micro_8 = URLXYZ+':50288'


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