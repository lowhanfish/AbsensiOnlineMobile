<template>
  <div class="about" style="padding:15px">
    <q-card bordered class="my-card">
      <q-card-section class="bg-primary text-white">
        <div class="row">
          <div class="col-12 col-md-6">
            <div class="text-h6 h_titleHead">Registrasi ASN</div>
          </div>
          <div class="col-12 col-md-2"></div>
          <div class="col-12 col-md-4">
            <div class="row">
              <q-input v-model="cari_value" @keyup="cari_data()" outlined square :dense="true" class="bg-white" style="width:80%"/>
              <q-btn glossy class="bg-light-blue-10" @click="mdl_add = true" dense flat icon="add" style="width:10%">
                  <q-tooltip content-class="bg-light-blue-10" content-style="font-size: 13px">
                    Click untuk menambah data
                  </q-tooltip>
              </q-btn>
            </div>

          </div>
        </div>
      </q-card-section>

      <q-separator dark inset />

      <q-card-section>
        <div class="row">
          <div class="col-12 col-md-6"  style="padding-left:1%; padding-right:1%">
            <span class="h_lable ">Unit Kerja</span>
            <div class="row">
              <model-list-select :list="$store.state.list_instansi"
               outlined square :dense="true"
               style="width:90%"
                class="inputbs inputfilter margin_btn bg-white"
                v-model="filterku.instansi"
                option-value="id"
                option-text="instansi"
                @input="DATA_MASTER.getUnitKerja(filterku.instansi), cari_data()"
                 placeholder="Pilih Instansi">
              </model-list-select>
              <q-btn @click="filterku.instansi ='', filterku.unit_kerja ='', cari_data()" glossy class="bg-red-4" dense flat icon="refresh" style="color : white; width:10% ; height : 38px">
                  <q-tooltip content-class="bg-red-5" content-style="font-size: 13px;">
                    Reset Instansi
                  </q-tooltip>
              </q-btn>
            </div>


          </div>
          <!-- <div class="col-12 col-md-1"></div> -->
          <div class="col-12 col-md-6" style="padding-left:1%; padding-right:1%">
            <span class="h_lable ">Sub Unit Kerja</span>
            <div class="row">
              <model-list-select :list="$store.state.list_unit_kerja"
               outlined square :dense="true"
               style="width:90%"
                class="inputbs inputfilter margin_btn bg-white"
                v-model="filterku.unit_kerja"
                option-value="id"
                option-text="unit_kerja"
                @input="cari_data()"
                placeholder="Pilih Instansi">
              </model-list-select>
              <q-btn @click="filterku.unit_kerja ='', cari_data()" glossy class="bg-red-4" dense flat icon="refresh" style="color : white; width:10% ; height : 38px">
                  <q-tooltip content-class="bg-red-5" content-style="font-size: 13px;">
                    Reset Instansi
                  </q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>
      </q-card-section>


      <q-card-section>
        <div class="tbl_responsive">

          <!-- =================================================== KONTENT =========================================================== -->

            <div class="text-center"  v-if="cek_load_data">
              <img src="images/loading.gif" width="30%"> <br>
              <span class="h_loading">LOADING...</span>
            </div> 

            <table width="100%"  v-if="!cek_load_data">
              <tr class="h_table_head bg-blue-2">
                <th width="5%" class="text-center">No</th>
                <th width="40%">Nama</th>
                <th width="15%">Username</th>
                <th width="15%" class="text-center">Jadwal</th>
                <th width="15%">Kontak</th>
                <th width="10%"></th>
              </tr>

              <tr class="h_table_body" v-for="(data, index) in list_data" :key="data.id">
                <td class="text-center">{{indexing(index+1)}}.</td>
                <td class="">
                  <b>
                    {{UMUM.namaLengkap(data.gelar_depan,data.nama, data.gelar_belakang)}} ({{data.menu_klpx}})<br/>
                    <span class="h_nip">NIP. {{data.nip}}</span>
                  </b>
                </td>
                <td>{{data.username}}</td>
                <td class="text-center">{{UMUM.jadwalAbsen(data.metode_absen)}}</td>
                <td>
                  {{data.email}} <br>
                  <span class="h_nip">Hp. {{data.hp}}</span>
                </td>
               
                <td class="text-center">
                  <q-btn-group>
                    <q-btn @click="mdl_password = true, selectData(data)" glossy color="blue" icon="vpn_key" class="tbl_btn">
                      <q-tooltip content-class="bg-blue-9" content-style="font-size: 13px">
                        Click untuk mengubah password pengguna ini
                      </q-tooltip>
                    </q-btn>
                    <q-btn @click="mdl_edit = true, selectData(data)" glossy color="orange" icon="create" class="tbl_btn">
                      <q-tooltip content-class="bg-orange-9" content-style="font-size: 13px">
                        Click untuk mengubah data ini
                      </q-tooltip>
                    </q-btn>
                    <q-btn @click="mdl_hapus = true, selectData(data)" glossy color="negative" icon="delete_forever" class="tbl_btn">
                      <q-tooltip content-class="bg-red" content-style="font-size: 13px">
                        Click untuk menghapus data ini
                      </q-tooltip>
                    </q-btn>
                  </q-btn-group>
                 
                </td>
              </tr>

            </table>

          <!-- =================================================== KONTENT =========================================================== -->
        
        </div>
            <hr class="hrpagin">
            <br>

          <div class="flex flex-center"  v-if="!cek_load_data">
            <q-pagination
              @click="getView()"
              v-model="page_first"
              :max="page_last"
              :max-pages="4"
              color="orange-14"

              :direction-links="true"
              :boundary-links="true"
              icon-first="skip_previous"
              icon-last="skip_next"
              icon-prev="fast_rewind"
              icon-next="fast_forward"
            >
            </q-pagination>
          </div>
            <br>
          </q-card-section>
        </q-card>

          <!-- =================================================== MODAL =========================================================== -->


            <!-- ================================================= MODAL TAMBAH ================================================ -->
              <q-dialog v-model="mdl_add" persistent>
                <q-card class="mdl-md">
                  <q-card-section class="bg-primary">
                    <div class="text-h6 h_modalhead text-center">Tambah Pengguna</div>
                  </q-card-section>

                  <form @submit.prevent="addData()">
                    <q-card-section class="q-pt-none">
                        <br>
                        <div class="row">

                          <div class="col-12 col-md-12 frame_cari">

                            <span class="h_lable ">Unit Kerja</span>
                            <model-list-select :list="$store.state.list_instansi"
                                outlined square :dense="true"
                                class="inputbs inputfilter margin_btn bg-white"
                                v-model="filterku.instansi"
                                option-value="id"
                                option-text="instansi"
                                @input="DATA_MASTER.getUnitKerja(filterku.instansi)"
                                placeholder="Pilih Instansi">
                            </model-list-select>

                          </div>

                          <div class="col-12 col-md-12 frame_cari">

                            <span class="h_lable ">Sub Unit kerja</span>
                            <model-list-select :list="$store.state.list_unit_kerja"
                              outlined square :dense="true"
                              class="inputbs inputfilter margin_btn bg-white"
                              v-model="dataku.unit_kerja"
                              option-value="id"
                              option-text="unit_kerja"
                              @input="DATA_MASTER.getBiodata(dataku.unit_kerja)"
                              placeholder="Pilih Instansi">
                            </model-list-select>
                          </div>

                          <div class="col-12 col-md-12 frame_cari">
                            <span class="h_lable ">Nama ASN</span>
                            <model-list-select :list="$store.state.list_biodata"
                              outlined square :dense="true"
                              class="inputbs inputfilter margin_btn bg-white"
                              v-model="dataku.nip"
                              option-value="nip"
                              :custom-text="selectBiodata"
                              placeholder="Pilih ASN">
                            </model-list-select>
                          </div>

                          <div class="col-12 col-md-12 frame_cari">
                            <span class="h_lable ">Klp Pengguna</span>
                            <select v-model="dataku.menu_klp" class="bg-white">
                              <option v-for="data in list_klp" :value="data.id"  :key="data.id">{{data.uraian}} </option>
                            </select>
                          </div>

                          <div class="col-12 col-md-12 frame_cari">
                            <span class="h_lable ">Username</span>
                            <q-input v-model="dataku.username" outlined square :dense="true" class="bg-white margin_btn" />
                          </div>

                          <div class="col-12 col-md-6 frame_cari">
                            <span class="h_lable ">Hp</span>
                            <q-input v-model="dataku.hp" outlined square :dense="true" class="bg-white margin_btn" />
                          </div>

                          <div class="col-12 col-md-6 frame_cari">
                            <span class="h_lable ">e-mail</span>
                            <q-input v-model="dataku.email" outlined square :dense="true" class="bg-white margin_btn" />
                          </div>

                          <div class="col-12 col-md-12 frame_cari">
                            <span class="h_lable ">Password</span>
                            <q-input type="password" v-model="dataku.password" outlined square :dense="true" class="bg-white margin_btn" />
                          </div>

                          <div class="col-12 col-md-12 frame_cari">
                            <span class="h_lable ">Confirm Password</span>
                            <q-input type="password" v-model="dataku.confirmPassword" outlined square :dense="true" class="bg-white margin_btn" />
                          </div>

                          <div class="col-12 col-md-12 frame_cari">
                            <div class="bg-red text-center" v-if="errorMessage" style="padding:2%">
                              <span style="color:white">{{ errorMessage }}</span>
                            </div>
                          </div>

                        </div>



                    </q-card-section>

                    <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                        <q-btn color="primary" @click="addData()" label="Simpan" />
                        <q-btn label="Batal" color="negative" v-close-popup />
                    </q-card-actions>

                  </form>
                </q-card>
              </q-dialog>
            <!-- ================================================= MODAL TAMBAH ================================================ -->


            <!-- ================================================= MODAL EDIT ================================================ -->
              <q-dialog v-model="mdl_edit" persistent>
                <q-card class="mdl-md">
                  <q-card-section class="bg-orange">
                    <div class="text-h6 h_modalhead text-center">Edit Data</div>
                  </q-card-section>

                  <q-card-section class="q-pt-none">
                        <br>
                        <div class="row">

                          <div class="col-12 col-md-12 frame_cari">

                            <span class="h_lable ">Unit Kerja</span>
                            <model-list-select :list="$store.state.list_instansi"
                                outlined square :dense="true"
                                class="inputbs inputfilter margin_btn bg-white"
                                v-model="filterku.instansi"
                                option-value="id"
                                option-text="instansi"
                                @input="DATA_MASTER.getUnitKerja(filterku.instansi)"
                                placeholder="Pilih Instansi">
                            </model-list-select>

                          </div>

                          <div class="col-12 col-md-12 frame_cari">

                            <span class="h_lable ">Sub Unit kerja</span>
                            <model-list-select :list="$store.state.list_unit_kerja"
                              outlined square :dense="true"
                              class="inputbs inputfilter margin_btn bg-white"
                              v-model="dataku.unit_kerja"
                              option-value="id"
                              option-text="unit_kerja"
                              @input="DATA_MASTER.getBiodata(dataku.unit_kerja)"
                              placeholder="Pilih Instansi">
                            </model-list-select>
                          </div>

                          <div class="col-12 col-md-12 frame_cari">
                            <span class="h_lable ">Nama ASN</span>
                            <model-list-select :list="$store.state.list_biodata"
                              outlined square :dense="true"
                              class="inputbs inputfilter margin_btn bg-white"
                              v-model="dataku.nip"
                              option-value="nip"
                              :custom-text="selectBiodata"
                              placeholder="Pilih ASN">
                            </model-list-select>
                          </div>

                          <div class="col-12 col-md-12 frame_cari">
                            <span class="h_lable ">Klp Pengguna</span>
                            <select v-model="dataku.menu_klp" class="bg-white">
                              <option v-for="data in list_klp" :value="data.id"  :key="data.id">{{data.uraian}} </option>
                            </select>
                          </div>

                          <div class="col-12 col-md-12 frame_cari">
                            <span class="h_lable ">Username</span>
                            <q-input v-model="dataku.username" outlined square :dense="true" class="bg-white margin_btn" />
                          </div>

                          <div class="col-12 col-md-6 frame_cari">
                            <span class="h_lable ">Hp</span>
                            <q-input v-model="dataku.hp" outlined square :dense="true" class="bg-white margin_btn" />
                          </div>

                          <div class="col-12 col-md-6 frame_cari">
                            <span class="h_lable ">e-mail</span>
                            <q-input v-model="dataku.email" outlined square :dense="true" class="bg-white margin_btn" />
                          </div>

                          <div class="col-12 col-md-12 frame_cari">
                            <div class="bg-red text-center" v-if="errorMessage" style="padding:2%">
                              <span style="color:white">{{ errorMessage }}</span>
                            </div>
                          </div>

                          <div class="col-12 col-md-12 frame_cari">
                            <span class="h_lable ">Jadwal Absen</span>
                            <select v-model="dataku.metode_absen" class="bg-white">
                              <option value="1">[1] Senin - Jum'at</option>
                              <option value="2">[2] Senin - Sabtu</option>
                              <option value="3">[3] Hari tertentu</option>
                            </select>
                          </div>

                        </div>

                  </q-card-section>

                  <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                    
                      <q-btn color="primary" @click="editData()" label="Simpan" />
                      <q-btn label="Batal" color="negative" v-close-popup />
             
                  </q-card-actions>
                </q-card>
              </q-dialog>
            <!-- ================================================= MODAL EDIT ================================================ -->

            <!-- ================================================ MODAL HAPUS ================================================ -->
              <q-dialog v-model="mdl_hapus" persistent>
                <q-card class="mdl-sm ">
                  <q-card-section class="q-pt-none text-center orageGrad">
                      <form @submit.prevent="removeData">
                          <br>
                          <img src="img/alert.png" alt="" width="75"> <br>
                          <span class="h_notifikasi">APAKAH ANDA YAKIN INGIN MENGHAPUS DATA INI??</span>
                          <input type="submit" style="position: absolute; left: -9999px"/>
                          <br>
                          <br>

                        <q-btn label="Batal" size="sm" color="negative"  v-close-popup/>
                        &nbsp;
                        <q-btn type="submit" label="Hapus" size="sm" color="primary" v-close-popup/>

                      </form>
                  </q-card-section>
                </q-card>
              </q-dialog>
            <!-- ================================================ MODAL HAPUS ================================================ -->

            <!-- ================================================= MODAL PASSWORD ================================================ -->
              <q-dialog v-model="mdl_password" persistent>
                <q-card class="mdl-md">
                  <q-card-section class="bg-blue">
                    <div class="text-h6 h_modalhead text-center">Edit Password</div>
                  </q-card-section>

                  <q-card-section class="q-pt-none">
                        <br>
                        <div class="row">

                          <div class="col-12 col-md-12 frame_cari">
                            <span class="h_lable ">Password</span>
                            <q-input v-model="dataku.password" type="password" outlined square :dense="true" class="bg-white margin_btn" />
                          </div>

                          <div class="col-12 col-md-12 frame_cari">
                            <span class="h_lable ">Confirm Password</span>
                            <q-input v-model="dataku.confirmPassword" type="password" outlined square :dense="true" class="bg-white margin_btn" />
                          </div>

                          <div class="col-12 col-md-12 frame_cari">
                            <div class="bg-red text-center" v-if="errorMessage" style="padding:2%">
                              <span style="color:white">{{ errorMessage }}</span>
                            </div>
                          </div>

                        </div>

                  </q-card-section>

                  <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                    
                      <q-btn color="primary" @click="editDataPassword()" label="Simpan" />
                      <q-btn label="Batal" color="negative" v-close-popup />
             
                  </q-card-actions>
                </q-card>
              </q-dialog>
            <!-- ================================================= MODAL PASSWORD ================================================ -->

         
          <!-- =================================================== MODAL =========================================================== -->




  </div>
</template>


<script>

import { ModelSelect, ModelListSelect  } from 'vue-search-select'
import 'vue-search-select/dist/VueSearchSelect.css'

// import UMUM from         '../../library/umum.js'
import UMUM from         '../../library/umum'
import DATA_MASTER from  '../../library/dataMaster'
import FETCHING from  '../../library/fetching'


import Joi from "joi";

const schema = Joi.object().keys({
    username: Joi.string().regex(/^[a-zA-Z0-9_]*$/).min(6).max(13).required(),
    password: Joi.string().min(6).required(),
  });



export default {
  components: {
      ModelSelect, ModelListSelect, 
  },

  data() {
    return {
      

      form : {
          id : '',
          uraian : '',
          createdAt : '',
      },

      dataku: {
          id : '',
          username : "",
          hp: "",
          email: "",
          nip : '',
          password : "",
          confirmPassword: "",
          menu_klp : 0,
          unit_kerja : '',
          metode_absen : 1,
      },

      filterku : {
        instansi : '',
        unit_kerja : '',
        fileStat : false,
      },
     
    
      list_data : [],
      list_klp : [],

      errorMessage: '',
      signingUp : false,
    
      UMUM : UMUM,
      DATA_MASTER : DATA_MASTER,
      FETCHING : FETCHING,

      nm_jabatan : '',
      nm_unit_kerja : '',

      instansi_id : '',
      unit_kerja : '',
      unit_kerja_full : '',
      unit_kerja_edit : '',

      page_first: 1,
      page_last: 0,
      page_limit : 10,
      cari_value: "",

      cek_load_data : true,


      mdl_add: false,
      mdl_edit: false,
      mdl_hapus : false,
      mdl_password : false,
     
    }
  },
  methods: {


    getView : function(){
      this.cek_load_data = true;
      fetch(this.$store.state.url.URL_DM_REGISTER + "view", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: "kikensbatara " + localStorage.token
          },
          body: JSON.stringify({
              data_ke: this.page_first,
              cari_value: this.cari_value,
              page_limit : this.page_limit,
              unit_kerja : this.filterku.unit_kerja,
          })
      })
          .then(res => res.json())
          .then(res_data => {
              this.list_data = res_data.data;
              this.page_last = res_data.jml_data;
              this.cek_load_data = false;
              console.log(res_data);
      });
    },

    addData : function() {

        this.errorMessage = "";
        if (this.validUser()) {
            // Jika user sdh valid lakukan pengiriman data ke server
            const body = {
              username: this.dataku.username,
              password: this.dataku.password
            };
            this.signingUp = true;

            fetch(this.$store.state.url.URL_DM_REGISTER+'signup', {
                method: "POST",
                body: JSON.stringify(this.dataku),
                headers: {
                    "content-type": "application/json",
                    authorization: "kikensbatara " + localStorage.token
                }
            }).then((response) => {
                this.signingUp = false;
                // console.log(response)
                if (response.ok) {
                     this.Notify('Sukses Menambah Data', 'primary', 'check_circle_outline');
                    this.getView();
                }
                else{
                  return response.json().then(error => {
                    throw new Error(error.message);
                  });

                }
            })
            .catch((error) => {
              setTimeout(() => {
                this.signingUp = false;
                this.errorMessage = error.message;
              }, 1000);
            });
            

        }else{
          console.log("tidak valid");

        }
    },

    editData: function() {
        fetch(this.$store.state.url.URL_DM_REGISTER + "editData", {
            method: "POST",
            headers: {
                'content-type' : 'application/json',
                authorization: "kikensbatara " + localStorage.token
            },
            body: JSON.stringify({
                id : this.dataku.id,
                menu_klp : this.dataku.menu_klp,
                nama : this.dataku.nama,
                username : this.dataku.username,
                email: this.dataku.email,
                hp: this.dataku.hp,
                unit_kerja : this.dataku.unit_kerja,
                metode_absen : this.dataku.metode_absen,
                nip : this.dataku.nip,
            })
        }).then(res_data => {
            this.Notify('Sukses Mengubah Data', 'primary', 'check_circle_outline');
            this.getView();
        });
    },

    removeData : function(idnya){
      fetch(this.$store.state.url.URL_DM_REGISTER + "removeData", {
            method: "POST",
            headers: {
                "content-type": "application/json",
                authorization: "kikensbatara " + localStorage.token
            },
            body: JSON.stringify(this.dataku),
        }).then(res_data => {
            this.Notify('Sukses Menghapus Data', 'negative', 'check_circle_outline');
          this.getView();
        });
    },

    editDataPassword: function() {
      if (this.dataku.password !== this.dataku.confirmPassword) {
          this.errorMessage = "Password dan Confirm Password harus sama. !";
          return false;
      }
      else{
        this.errorMessage = '';
        fetch(this.$store.state.url.URL_DM_REGISTER + "editDataPass", {
            method: "POST",
            headers: {
                'content-type' : 'application/json',
                authorization: "kikensbatara " + localStorage.token
            },
            body: JSON.stringify({
                id : this.dataku.id,
                password : this.dataku.password,
            })
        }).then(res_data => {
            this.$store.commit('notifAdd', 'Mengubah')
            this.getView();
        });

      }

    },


    validUser : function(){


      if (this.dataku.password !== this.dataku.confirmPassword) {
          this.errorMessage = "Password dan Confirm Password harus sama. !";
          return false;
      }
      // Memulai proses validasi melalui skema Joi yang sebelumnya dibuat
      // req.body merupakan data yang di kirim oleh client dan schema merupakan skema joi yg di buat sebelumnya
      const body = {
              username: this.dataku.username,
              password: this.dataku.password
      };


      const result = schema.validate(body);
      // console.log(result)

      if (result.error === null || result.error === undefined) {
          console.log("SDH BENAR")
          return true;
      }
      if (result.error.message.includes("username")) {
          // jika pesan error yang dihasilkan mengandung char "username" maka
          this.errorMessage = "Username tidak valid (Min : 6 dan Max : 14 Karakter)";
      } else {
          this.errorMessage = "Password tidak valid (Min : 6 Karakter)";

      }
      // console.log(this.errorMessage);
      return false;
    },

    selectData : function(data){
      console.log(data)
        this.dataku.id = data.id;
        this.dataku.username = data.username;
        this.dataku.nama = data.nama;
        this.dataku.nip = data.nip;
        this.dataku.hp = data.hp;
        this.dataku.email = data.email;
        this.dataku.menu_klp = data.menu_klpx;
        this.dataku.metode_absen = data.metode_absen;
        // this.dataku.unit_kerja = data.unit_kerja;
    
    },

    // ====================================== PAGINATE ====================================
        Notify : function(message, positive, icon){
          this.$q.notify({
            message: message,
            color: positive,
            icon: icon,
            position : 'top',
            timeout: 500,
          })
        },

        indexing : function(index){
            var idx = ((this.page_first-1)*this.page_limit)+index
            return idx;
        },



        cari_data : function(){
            this.page_first = 1;
            this.getView();
        },

        selectBiodata (item) {
          return `${item.nama} | NIP. ${item.nip}`
        },


        getAsyncPost : async function() {
          this.list_klp = await FETCHING.postMasterKlpMenu();
        },



    // ====================================== PAGINATE ====================================
  },

  mounted () {

    var get_profile = JSON.parse(localStorage.profile);
    this.filterku.unit_kerja = get_profile.profile.unit_kerja;
    this.filterku.instansi = get_profile.profile.instansi_id;
    this.unit_kerja_full = get_profile.profile.unit_kerja_nama;
    this.unit_kerja = get_profile.profile.unit_kerja;
    this.dataku.unit_kerja = get_profile.profile.unit_kerja;

    DATA_MASTER.getInstansi();
    DATA_MASTER.getUnitKerja(this.filterku.instansi);
    DATA_MASTER.getBiodata(this.dataku.unit_kerja);
    
    this.getAsyncPost()

    this.getView();

  },
  watch: {
        dataku: {
            handler() {
                this.errorMessage = "";
            },
            deep: true
        }
  },
}
</script>




