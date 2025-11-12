<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="glossy"  v-if="!checkLogin">
      <q-toolbar>
        <q-btn flat dense round @click="leftDrawerOpen = !leftDrawerOpen" aria-label="Menu" icon="menu" />
        <q-toolbar-title>
            Aplikasi Presensi Online (Versi Admin OPD)
        </q-toolbar-title>
        <div>
          <q-btn
            style="color:white"
            flat
              color="white"
              @click="$q.fullscreen.toggle()"
              :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"

            />

        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above content-class="bg-grey-2 shadow-up-4" v-if="!checkLogin">
      <SideBar/>
    </q-drawer>


    <q-page-container>
      <router-view/>
    </q-page-container>

    
  </q-layout>
</template>

<script>


import { AppFullscreen } from 'quasar'
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'LayoutDefault',

  components: {
    HelloWorld
  },

  data () {
    return {
      leftDrawerOpen: false,
      text:'',
      dense : true,
    }
  },
  methods: {

  },
  computed: {
      checkLogin() {
          if (this.$route.name === 'login') {
              return true;
          } else {
              return false;
          }
      }
  },

  mounted () {
    var get_profile = JSON.parse(localStorage.profile);

    // console.log(get_profile.profile)

    this.$store.state.unit_kerja = get_profile.profile.unit_kerja
    this.$store.state.unit_kerja_nama = get_profile.profile.unit_kerja_nama

  },
}
</script>

<style>
</style>
