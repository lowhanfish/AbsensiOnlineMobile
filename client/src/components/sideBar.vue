<template>
  <q-list >
    <q-img src="img/card1.png" style="width: 100%">
    <!-- <q-img src="img/card.jpg" style="width: 100%"> -->
      <div class="absolute-bottom text-subtitle1">
          <div class="row">

            Ver. 1.2.9
              <!-- <div class="col col-md-2">
                    <q-avatar>
                        <img src="/icon.png">
                    </q-avatar>
              </div> -->
              <!-- <div class="col col-md-10" style="padding-left:5%">
                  <span class="h_card_sidebar1">{{nama}}</span> <br>
                  <span class="h_card_sidebar2">Admin</span>
              </div> -->
          </div>
      </div>
    </q-img>

    <q-item-label class="bg-blue-6" header><span style="color:white">{{nama}}</span></q-item-label>



    <template v-for="(data, index) in $store.state.list_menu">

        <q-item v-if="!checkLength(data.subItem)" clickable :to="data.route" exact :key="data.index">
          <q-item-section top avatar>
            <span style="display:none">{{index}}</span>
            <q-avatar :color="data.color" text-color="white" :icon="data.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="h_sidebar_menu">{{data.title}}</q-item-label>
          </q-item-section>
        </q-item>

        <q-expansion-item  v-if="checkLength(data.subItem)" :key="data.index">
          <template v-slot:header>
            <q-item-section avatar>
              <q-avatar :icon="data.icon" :color="data.color" text-color="white" />
            </q-item-section>
            <q-item-section class="h_sidebar_menu">{{data.title}}</q-item-section>
          </template>
          <q-list bordered>

            <template v-for="(data1, index1) in data.subItem">

              <q-item v-if="!checkLength(data1.subItem)" clickable :to="data1.route" :key="index1">
                <q-item-section avatar>
                </q-item-section>
                <q-item-section class="h_sidebar_sub_menu">{{data1.title}}</q-item-section>
              </q-item>


              <q-expansion-item :key="index1" v-if="checkLength(data1.subItem)"
                class="h_sidebar_sub_menu"
                expand-separator
                :content-inset-level="1"
              >

                <template v-slot:header>
                  <q-item-section avatar>
                    <q-avatar icon="radio_button_checked"  text-color="#2d2c2c" />
                  </q-item-section>
                  <q-item-section class="h_sidebar_menu">{{data1.title}}</q-item-section>
                </template>


                  <q-list v-for="(data2, index2) in data1.subItem" :key="index2">
                      <q-item clickable :to="data2.route">
                          <q-item-section class="h_sidebar_sub_menu">{{data2.title}}</q-item-section>
                      </q-item>
                  </q-list>
              </q-expansion-item>

            </template>



        

          </q-list>
        </q-expansion-item>


      </template>



<!-- 

    <q-item clickable to="/" exact >
      <q-item-section top avatar>
        <q-avatar color="primary" text-color="white" icon="home" />
      </q-item-section>
      <q-item-section>
        <q-item-label class="h_sidebar_menu">Home</q-item-label>
        <q-item-label caption lines="2" >Dashboard</q-item-label>
      </q-item-section>
    </q-item>

    <q-expansion-item :content-inset-level="1">
      <template v-slot:header>
        <q-item-section avatar>
          <q-avatar icon="assignment_turned_in" color="green" text-color="white" />
        </q-item-section>
        <q-item-section class="h_sidebar_menu">Verifikasi Permohonan</q-item-section>
      </template>
      <q-list :content-inset-level="0.5" > 
        <q-item clickable to="/verivikasiPermohonanIzin" :content-inset-level="0.5"  >
          <q-item-section class="h_sidebar_sub_menu">Permohonan Izin</q-item-section>
        </q-item>
        <q-item clickable to="/verivikasiPermohonanDarurat">
          <q-item-section class="h_sidebar_sub_menu">Permohonan Absen Darurat</q-item-section>
        </q-item>
      </q-list>
    </q-expansion-item>

    <q-expansion-item :content-inset-level="1">
      <template v-slot:header>
        <q-item-section avatar>
          <q-avatar icon="place" color="blue" text-color="white" />
        </q-item-section>
        <q-item-section class="h_sidebar_menu">Verifikasi Lokasi</q-item-section>
      </template>
      <q-list :content-inset-level="0.5" > 
        <q-item clickable to="/usulanLokasiAbsen" :content-inset-level="0.5"  >
          <q-item-section class="h_sidebar_sub_menu">Usulan Lokasi Absen</q-item-section>
        </q-item>
        <q-item clickable to="/verifikasiLokasiAbsen">
          <q-item-section class="h_sidebar_sub_menu">Verifikasi Lokasi Absen</q-item-section>
        </q-item>
        

      </q-list>
    </q-expansion-item>

    <q-expansion-item :content-inset-level="1">
      <template v-slot:header>
        <q-item-section avatar>
          <q-avatar icon="place" color="blue" text-color="white" />
        </q-item-section>
        <q-item-section class="h_sidebar_menu">Pelaksanaan Apel</q-item-section>
      </template>
      <q-list :content-inset-level="0.5" > 
        <q-item clickable to="/apelJenis" :content-inset-level="0.5"  >
          <q-item-section class="h_sidebar_sub_menu">Jenis Apel</q-item-section>
        </q-item>
        <q-item clickable to="/apelPelaksanaan">
          <q-item-section class="h_sidebar_sub_menu">Jadual Pelaksanaan</q-item-section>
        </q-item>
      </q-list>
    </q-expansion-item>

    <q-expansion-item>
      <template v-slot:header>
        <q-item-section avatar>
          <q-avatar icon="timeline" color="teal" text-color="white" />
        </q-item-section>
        <q-item-section class="h_sidebar_menu">Presensi</q-item-section>
      </template>
      <q-list bordered :content-inset-level="0.5" > 
        <q-item clickable to="/lapHarian" :content-inset-level="0.5"  >
          <q-item-section avatar>
            <q-icon name="keyboard_arrow_right" />
          </q-item-section>
          <q-item-section class="h_sidebar_sub_menu">Laporan Harian</q-item-section>
        </q-item>
        
        <q-item clickable to="/lapCustom">
          <q-item-section avatar>
            <q-icon name="keyboard_arrow_right" />
          </q-item-section>
          <q-item-section class="h_sidebar_sub_menu">Laporan Custom</q-item-section>
        </q-item>
      </q-list>
    </q-expansion-item>

    <q-expansion-item>
      <template v-slot:header>
        <q-item-section avatar>
          <q-avatar icon="settings" color="deep-orange" text-color="white" />
        </q-item-section>
        <q-item-section class="h_sidebar_menu">Data Master</q-item-section>
      </template>
      <q-list bordered>
        <q-item clickable to="/kategoriAbsenDarurat">
          <q-item-section avatar>
            <q-icon name="radio_button_checked" />
          </q-item-section>
          <q-item-section class="h_sidebar_sub_menu">Kategori Absen Darurat</q-item-section>
        </q-item>
        <q-item clickable to="/jenisIzin">
          <q-item-section avatar>
            <q-icon name="radio_button_checked" />
          </q-item-section>
          <q-item-section class="h_sidebar_sub_menu">Jenis Izin</q-item-section>
        </q-item>
        <q-item clickable to="/waktuAbsen">
          <q-item-section avatar>
            <q-icon name="radio_button_checked" />
          </q-item-section>
          <q-item-section class="h_sidebar_sub_menu">Waktu Absen</q-item-section>
        </q-item>
        <q-item clickable to="/waktuLibur">
          <q-item-section avatar>
            <q-icon name="radio_button_checked" />
          </q-item-section>
          <q-item-section class="h_sidebar_sub_menu">Tgl Libur</q-item-section>
        </q-item>
        <q-item clickable to="/registrasi">
          <q-item-section avatar>
            <q-icon name="radio_button_checked" />
          </q-item-section>
          <q-item-section class="h_sidebar_sub_menu">Registrasi</q-item-section>
        </q-item>
        <q-item clickable to="/klpUsers">
          <q-item-section avatar>
            <q-icon name="radio_button_checked" />
          </q-item-section>
          <q-item-section class="h_sidebar_sub_menu">Klp User</q-item-section>
        </q-item>

        <q-item clickable to="/menuList">
          <q-item-section avatar>
            <q-icon name="radio_button_checked" />
          </q-item-section>
          <q-item-section class="h_sidebar_sub_menu">List Menu</q-item-section>
        </q-item>


      </q-list>
    </q-expansion-item>

    <q-item clickable to="/pengumuman">
        <q-item-section top avatar>
            <q-avatar color="primary" text-color="white" icon="priority_high" />
        </q-item-section>
        <q-item-section>
            <q-item-label class="h_sidebar_menu">Pengumuman</q-item-label>
        </q-item-section>
    </q-item> -->

    <!-- <q-item clickable to="/about">
        <q-item-section top avatar>
            <q-avatar color="primary" text-color="white" icon="priority_high" />
        </q-item-section>
        <q-item-section>
            <q-item-label class="h_sidebar_menu">About</q-item-label>
        </q-item-section>
    </q-item> -->


    <q-item clickable @click="logout" exact>
      <q-item-section top avatar>
        <q-avatar color="red" text-color="white" icon="lock" />
      </q-item-section>
      <q-item-section>
        <q-item-label class="h_sidebar_menu">Keluar</q-item-label>
        <q-item-label caption lines="2">Logout</q-item-label>
      </q-item-section>
    </q-item>


  </q-list>
</template>

<script>
import FETCHING from "../library/fetching";
   import UMUM from "../library/umum";

export default {
  data() {
    return {
      leftDrawerOpen: true,
      nama : '',
      unit_kerja_nama : '',

      list_data : [],
      FETCHING : FETCHING,
      UMUM : UMUM,
    };
  },

  methods: {


    logout : function(){
        localStorage.removeItem('token');
        localStorage.removeItem('profile');
        this.$router.push('/login');
    },


    checkLength(data){
      if (data.length <= 0) {
        return false
      } else {
        return true        
      }
    },

    

    checkOtorisasi(){
      console.log(this.$store.state.url.checkAuth)
      fetch(this.$store.state.url.checkAuth, {
            method: "GET",
            headers: {
                "content-type": "application/json",
                authorization: "kikensbatara " + localStorage.token
            }
        })
            .then(res => res.json())
            .then(res_data => {
                // console.log(res_data.message)
                if (res_data.message=='SSILAHKAN LOGIN DULU..!!!') {
                  localStorage.removeItem('token');
                  localStorage.removeItem('profile');
                  this.$router.push('/login');
                  // console.log("harus logout")
                } else {
                  return false
                }
        });
    },



    async loadMenu(){

      var get_profile = JSON.parse(localStorage.profile);
      var profileku = get_profile.profile;
      var dataMenu =await this.FETCHING.postMasterMenuGetSideBar(profileku.absensi)





      this.$store.state.list_menu = dataMenu

      // this.$store.commit('ubahState', { name : 'list_menu',  list : dataMenu});

      var cinta = {
        Data_cinta : 'adalah'
      }


      var data = []
      dataMenu.forEach(h => {
          if (h.type == 0) {
            data.push(h)
          } else {
            h.subItem.forEach(i => {
                if (i.type == 0) {
                  data.push(i)
                } else {
                  i.subItem.forEach(j => {
                      data.push(j)
                  });
                }
            });
          }
      });

      var obj = UMUM.ArrToObj(data)
      // this.$store.commit('ubahState', { name : 'aksesMenu',  list : obj});
      this.$store.state.aksesMenu = obj

      // console.log(dataMenu)

      

    },
  },


  mounted () {
    this.checkOtorisasi();
    var get_profile = JSON.parse(localStorage.profile);
    this.nama = get_profile.profile.nama;
    this.unit_kerja_nama = get_profile.profile.unit_kerja_nama;

    this.loadMenu();

    // console.log(profileku.Simpeg)
  },
  
};
</script>