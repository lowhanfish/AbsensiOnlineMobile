import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter);





function loggedInRedirectDashboard(to, from, next) {
  if (localStorage.token) {
    next('/');
  } else {
    next();
  }
}

function isLoggedIn(to, from, next) {
  if (localStorage.token) {
    next();
  } else {
    next('/login');
  }
}










  const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/auth/login.vue'),
    beforeEnter: loggedInRedirectDashboard,
  },

  {
    path: '/',
    name: 'lapHarianx',
    component: () => import('../views/presensi/lapHarian.vue'),
    beforeEnter: isLoggedIn,
  },





  {
    path: '/Home',
    name: 'Home',
    component: Home,
    beforeEnter: isLoggedIn,
  },

  {
    path: '/verifikasiLokasiAbsen',
    name: 'verifikasiLokasiAbsen',
    component: () => import('../views/verifikasiLokasiAbsen/verifikasiLokasiAbsen.vue'),
    beforeEnter: isLoggedIn,
  },
  {
    path: '/usulanLokasiAbsen',
    name: 'usulanLokasiAbsen',
    component: () => import('../views/verifikasiLokasiAbsen/usulanLokasiAbsen.vue'),
    beforeEnter: isLoggedIn,
  },
  {
    path: '/listLokasiAbsen',
    name: 'listLokasiAbsen',
    component: () => import('../views/verifikasiLokasiAbsen/listLokasiAbsen.vue'),
    beforeEnter: isLoggedIn,
  },


  {
    path: '/verivikasiPermohonanIzin',
    name: 'verivikasiPermohonanIzin',
    component: () => import('../views/verifikasiPermohonan/verivikasiPermohonanIzin.vue'),
    beforeEnter: isLoggedIn,
  },
  {
    path: '/verivikasiPermohonanDarurat',
    name: 'verivikasiPermohonanDarurat',
    component: () => import('../views/verifikasiPermohonan/verivikasiPermohonanDarurat.vue'),
    beforeEnter: isLoggedIn,
  },

  {
    path: '/apelJenis',
    name: 'apelJenis',
    component: () => import('../views/pelaksanaanApel/apelJenis.vue'),
    beforeEnter: isLoggedIn,
  },
  {
    path: '/apelPelaksanaan',
    name: 'apelPelaksanaan',
    component: () => import('../views/pelaksanaanApel/apelPelaksanaan.vue'),
    beforeEnter: isLoggedIn,
  },










{
    path: '/lapHarian',
    name: 'lapHarian',
    component: () => import('../views/presensi/lapHarian.vue'),
    beforeEnter: isLoggedIn,
  },
  
  {
    path: '/lapMingguan',
    name: 'lapMingguan',
    component: () => import('../views/presensi/lapMingguan.vue'),
    beforeEnter: isLoggedIn,
  },
  {
    path: '/lapBulanan',
    name: 'lapBulanan',
    component: () => import('../views/presensi/lapBulanan.vue'),
    beforeEnter: isLoggedIn,
  },
  {
    path: '/lapTahunan',
    name: 'lapTahunan',
    component: () => import('../views/presensi/lapTahunan.vue'),
    beforeEnter: isLoggedIn,
  },
  {
    path: '/lapCustom',
    name: 'lapCustom',
    component: () => import('../views/presensi/lapCustom.vue'),
    beforeEnter: isLoggedIn,
  },
  {
    path: '/lapCustom_v2',
    name: 'lapCustom_v2',
    component: () => import('../views/presensi/lapCustom_v2.vue'),
    beforeEnter: isLoggedIn,
  },

  {
    path: '/lapPersonal',
    name: 'lapPersonal',
    component: () => import('../views/presensi/lapPersonal.vue'),
    beforeEnter: isLoggedIn,
  },


  
  {
    path: '/jenisIzin',
    name: 'jenisIzin',
    component: () => import('../views/dataMaster/jenisIzin.vue'),
    beforeEnter: isLoggedIn,
  },
  {
    path: '/kategoriAbsenDarurat',
    name: 'kategoriAbsenDarurat',
    component: () => import('../views/dataMaster/kategoriAbsenDarurat.vue'),
    beforeEnter: isLoggedIn,
  },
  {
    path: '/lokasiAbsen',
    name: 'lokasiAbsen',
    component: () => import('../views/dataMaster/lokasiAbsen.vue'),
    beforeEnter: isLoggedIn,
  },
  {
    path: '/menuList',
    name: 'menuList',
    component: () => import('../views/dataMaster/menuList.vue'),
    beforeEnter: isLoggedIn,
  },
  {
    path: '/klpUsers',
    name: 'klpUsers',
    component: () => import('../views/dataMaster/klpUsers.vue'),
    beforeEnter: isLoggedIn,
  },
  {
    path: '/registrasi',
    name: 'registrasi',
    component: () => import('../views/dataMaster/registrasi.vue'),
    beforeEnter: isLoggedIn,
  },
  {
    path: '/waktuAbsen',
    name: 'waktuAbsen',
    component: () => import('../views/dataMaster/waktuAbsen.vue'),
    beforeEnter: isLoggedIn,
  },
  {
    path: '/waktuLibur',
    name: 'waktuLibur',
    component: () => import('../views/dataMaster/waktuLibur.vue'),
    beforeEnter: isLoggedIn,
  },

  {
    path: '/pengumuman',
    name: 'pengumuman',
    component: () => import('../views/pengumuman/pengumuman.vue'),
    beforeEnter: isLoggedIn,
  },


  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
    beforeEnter: isLoggedIn,
  },


]

const router = new VueRouter({
  // mode: 'history',
  // base: process.env.BASE_URL,
  routes
})

export default router
