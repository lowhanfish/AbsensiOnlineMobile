<template>
  <div class="about" style="padding:15px">
    <q-card bordered class="my-card">
      <q-card-section class="bg-primary text-white">
        <div class="row">
          <div class="col-12 col-md-6">
            <div class="text-h6 h_titleHead">Master List Menu</div>
          </div>
          <div class="col-12 col-md-2"></div>
          <div class="col-12 col-md-4">
            <div class="row">
              <q-input v-model="cari_value" @keyup="cari_data()" outlined square :dense="true" class="bg-white" style="width:80%"/>
              <q-btn glossy class="bg-light-blue-10" @click="mdl_add = true, form.jenis=1, form.parrent=null" dense flat icon="add" style="width:10%">
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
        <div class="tbl_responsive">

          <!-- =================================================== KONTENT =========================================================== -->
            
            <div class="text-center"  v-if="cek_load_data">
              <img src="img/loading.gif" width="30%"> <br>
              <span class="h_loading">LOADING...</span>
            </div> 

            <div  v-for="data in list_data" :key="data.id">
                <table width="100%" v-if="!cek_load_data">
                <tr class="h_table_head bg-blue-2">
                    <th width="5%" class="text-center">No</th>
                    <th width="10%" class="text-center">Icon</th>
                    <th width="30%">Nama Menu</th>
                    <th width="25%" class="text-center">Route</th>
                    <th width="15%" class="text-center">Type</th>
                    <th width="15%" class="text-center">#</th>
                </tr>
                <tr >
                <tr class="h_table_body" >
                    <td class="text-center">
                        <q-btn color="blue-9" icon="expand_more" size="sm" @click="showHide(''+data.id+'')" :disabled="checkLength(data.subItem)"/>
                    </td>
                    <td class="text-center">
                        <q-icon style="font-size:25px" :name="data.icon" :color="data.color"/>
                    </td>
                    <td ><b>{{data.urutan}}. {{data.title}}</b></td>
                    <td ><b>{{data.route}}</b></td>
                    <td>{{renameType(data.type)}}</td>
                
                    <td class="text-center">
                    <q-btn-group>
                        <q-btn size="sm" glossy color="light-blue-8" icon="add" class="tbl_btn" @click="mdl_add = true, form.jenis=2, form.parrent=data.id" :disabled="checkType(data.type)">
                            <q-tooltip content-class="bg-light-blue-9" content-style="font-size: 13px">
                                Click untuk menambah data ini
                            </q-tooltip>
                        </q-btn>
                        <q-btn size="sm" glossy color="orange" icon="create" class="tbl_btn" @click="selectData(data), mdl_edit = true">
                            <q-tooltip content-class="bg-orange-9" content-style="font-size: 13px">
                                Click untuk mengubah data ini
                            </q-tooltip>
                        </q-btn>
                        <q-btn size="sm" glossy color="negative" icon="delete_forever" class="tbl_btn" @click="selectData(data), mdl_remove = true" :disabled="!checkLength(data.subItem)">
                            <q-tooltip content-class="bg-red" content-style="font-size: 13px">
                                Click untuk menghapus data ini
                            </q-tooltip>
                        </q-btn>
                    </q-btn-group>
                    
                    </td>
                </tr>

                </table>

                <div :id="''+data.id+''" class="hidex">
                  <div v-for="data1 in data.subItem" :key="data1.id">

                    <table width="100%" v-if="!cek_load_data">
                      <tr class="h_table_body bg-light-blue-1">
                          <td width="5%" class="text-center">
                              <q-btn color="light-blue-8" size="sm" icon="expand_more"  @click="showHide(''+data1.id+'')" :disabled="checkLength(data1.subItem)" />
                          </td>
                          <td width="10%" class="text-center">
                              <q-icon style="font-size:25px" :name="data.icon" />
                          </td>
                          <td width="30%">{{data1.title}}</td>
                          <td width="25%">{{data1.route}}</td>
                          <td width="15%">{{renameType(data1.type)}}</td>
                          <td width="15%" class="text-center">
                              <q-btn-group>
                                  <q-btn size="sm" glossy color="light-blue-8" icon="add" class="tbl_btn" @click="mdl_add = true, form.jenis=2, form.parrent=data1.id" :disabled="checkType(data1.type)">
                                      <q-tooltip content-class="bg-light-blue-9" content-style="font-size: 13px">
                                          Click untuk menambah data ini
                                      </q-tooltip>
                                  </q-btn>
                                  <q-btn size="sm" glossy color="orange" icon="create" class="tbl_btn" @click="selectData(data1), mdl_edit = true">
                                      <q-tooltip content-class="bg-orange-9" content-style="font-size: 13px">
                                          Click untuk mengubah data ini
                                      </q-tooltip>
                                  </q-btn>
                                  <q-btn size="sm" glossy color="negative" icon="delete_forever" class="tbl_btn" @click="selectData(data1), mdl_remove = true" :disabled="!checkLength(data1.subItem)">
                                      <q-tooltip content-class="bg-red" content-style="font-size: 13px">
                                          Click untuk menghapus data ini
                                      </q-tooltip>
                                  </q-btn>
                              </q-btn-group>
                          </td>
                      </tr>
                    </table>

                    <div :id="''+data1.id+''" class="hidex">
                      <div v-for="data2 in data1.subItem" :key="data2.id">

                        <table width="100%" v-if="!cek_load_data">
                        <tr class="h_table_body bg-light-blue-2">
                            <td width="5%" class="text-center">
                                <q-btn color="light-blue-7" icon="expand_more" size="sm" @click="showHide('class'+index+'')" disabled/>
                            </td>
                            <td width="10%" class="text-center">
                                <q-icon style="font-size:25px" :name="data.icon" />
                            </td>
                            <td width="30%">{{data2.title}}</td>
                            <td width="25%">{{data2.route}}</td>
                            <td width="15%">{{renameType(data2.type)}}</td>
                            <td width="15%" class="text-center">
                                <q-btn-group>
                                    <q-btn size="sm" glossy color="light-blue-8" icon="add" class="tbl_btn" disabled>
                                        <q-tooltip content-class="bg-light-blue-9" content-style="font-size: 13px">
                                            Click untuk menambah data ini
                                        </q-tooltip>
                                    </q-btn>
                                    <q-btn size="sm" glossy color="orange" icon="create" class="tbl_btn" @click="selectData(data2), mdl_edit = true">
                                        <q-tooltip content-class="bg-orange-9" content-style="font-size: 13px">
                                            Click untuk mengubah data ini
                                        </q-tooltip>
                                    </q-btn>
                                    <q-btn size="sm" glossy color="negative" icon="delete_forever" class="tbl_btn"  @click="selectData(data2), mdl_remove = true">
                                        <q-tooltip content-class="bg-red" content-style="font-size: 13px">
                                            Click untuk menghapus data ini
                                        </q-tooltip>
                                    </q-btn>
                                </q-btn-group>
                            </td>
                        </tr>
                        </table>

                      </div>
                    </div>


                  </div>
                </div>



            </div>


          <!-- =================================================== KONTENT =========================================================== -->
        
            </div>
            <hr class="hrpagin">
            <br>

          </q-card-section>
        </q-card>

          <!-- =================================================== MODAL =========================================================== -->


            <!-- ================================================= MODAL TAMBAH ================================================ -->
              <q-dialog v-model="mdl_add" persistent>
                <q-card class="mdl-md">
                  <q-card-section class="bg-primary">
                    <div class="text-h6 h_modalhead text-center">Simpan Data</div>
                  </q-card-section>

                  <form @submit.prevent="addData()">
                    <q-card-section class="q-pt-none">
                        <br>
                        <div class="row">

                          <div class="col-12 col-md-12 frame_cari">
                            <span class="h_lable ">Nama menu</span>
                            <q-input v-model="form.title" outlined square :dense="true" class="bg-white margin_btn" />
                          </div>

                          <div class="col-12 col-md-6 frame_cari">
                            <span class="h_lable ">
                                *Icon
                                <a href="https://fonts.google.com/icons?selected=Material+Icons">(Referensi)</a>
                            </span>
                            <q-input v-model="form.icon" outlined square :dense="true" class="bg-white margin_btn" />
                          </div>

                          <div class="col-12 col-md-6 frame_cari">
                            <span class="h_lable ">*Color</span>
                            <q-input v-model="form.color" outlined square :dense="true" class="bg-white margin_btn" />
                          </div>

                          <div class="col-12 col-md-6 frame_cari">
                            <span class="h_lable ">*Route</span>
                            <q-input v-model="form.route" outlined square :dense="true" class="bg-white margin_btn" />
                          </div>

                          

                          <div class="col-12 col-md-6 frame_cari">
                            <span class="h_lable ">*Type</span>
                            <!-- <q-input v-model="form.type" outlined square :dense="true" class="bg-white margin_btn" /> -->
                            <select v-model="form.type" class="bg-white">
                              <option v-for="data in $store.state.type" :value="data.id"  :key="data.id">{{data.uraian}} </option>
                            </select>
                          </div>

                          <div class="col-12 col-md-12 frame_cari">
                            <span class="h_lable ">*No Urut</span>
                            <q-input v-model="form.urutan" type="number" outlined square :dense="true" class="bg-white margin_btn" />
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
                            <span class="h_lable ">Nama menu</span>
                            <q-input v-model="form.title" outlined square :dense="true" class="bg-white margin_btn" />
                          </div>

                          <div class="col-12 col-md-6 frame_cari">
                            <span class="h_lable ">
                                *Icon
                                <a href="https://fonts.google.com/icons?selected=Material+Icons">(Referensi)</a>
                            </span>
                            <q-input v-model="form.icon" outlined square :dense="true" class="bg-white margin_btn" />
                          </div>

                          <div class="col-12 col-md-6 frame_cari">
                            <span class="h_lable ">*Color</span>
                            <q-input v-model="form.color" outlined square :dense="true" class="bg-white margin_btn" />
                          </div>

                          <div class="col-12 col-md-6 frame_cari">
                            <span class="h_lable ">*Route</span>
                            <q-input v-model="form.route" outlined square :dense="true" class="bg-white margin_btn" />
                          </div>

                          

                          <div class="col-12 col-md-6 frame_cari">
                            <span class="h_lable ">*Type</span>
                            <!-- <q-input v-model="form.type" outlined square :dense="true" class="bg-white margin_btn" /> -->
                            <select v-model="form.type" class="bg-white">
                              <option v-for="data in $store.state.type" :value="data.id"  :key="data.id">{{data.uraian}} </option>
                            </select>
                          </div>

                          <div class="col-12 col-md-12 frame_cari">
                            <span class="h_lable ">*No Urut</span>
                            <q-input v-model="form.urutan" type="number" outlined square :dense="true" class="bg-white margin_btn" />
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
              <q-dialog v-model="mdl_remove" persistent>
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

         
          <!-- =================================================== MODAL =========================================================== -->




  </div>
</template>


<script>

import { ModelSelect, ModelListSelect  } from 'vue-search-select'
import 'vue-search-select/dist/VueSearchSelect.css'

// import UMUM from         '../../library/umum.js'
import UMUM from         '../../library/umum'
import DATA_MASTER from  '../../library/dataMaster'

export default {
  components: {
      ModelSelect, ModelListSelect, 
  },

  data() {
    return {
      

    form : {
        id : '',
        title : '',
        icon : '',
        route : '',
        type : 0,
        jenis : 1,
        parrent : null,
        urutan : 0,
        color : ''
    },
    
      list_data : [],
    
      UMUM : UMUM,
      DATA_MASTER : DATA_MASTER,

      page_first: 1,
      page_last: 0,
      page_limit : 10,
      cari_value: "",

      cek_load_data : true,


      mdl_add: false,
      mdl_edit: false,
      mdl_remove : false,
     
    }
  },
  methods: {


    getView : function(){

        this.cek_load_data = true;
      fetch(this.$store.state.url.URL_DM_MENU + "view", {
            method: "POST",
            headers: {
            "content-type": "application/json",
            authorization: "kikensbatara " + localStorage.token
            },
            body: JSON.stringify({
                cari_value: ''
            })
        })
            .then(res => res.json())
            .then(res_data => {
              console.log(res_data)
              this.cek_load_data = false;
                this.list_data = res_data;
        });
    },

    addData : function(number) {
      fetch(this.$store.state.url.URL_DM_MENU + "addData", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              authorization: "kikensbatara " + localStorage.token
            },
            body: JSON.stringify(this.form)
        }).then(res_data => {
            this.Notify('Sukses Menambah Data', 'primary', 'check_circle_outline');
            this.getView();
        });
      // console.log(this.form.jeniskategorilokasi)
    },

    editData : function(){
        fetch(this.$store.state.url.URL_DM_MENU + "editData", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              authorization: "kikensbatara " + localStorage.token
            },
            body: JSON.stringify(this.form)
        }).then(res_data => {

            this.getView();
            this.Notify('Sukses Merubah Data', 'warning', 'check_circle_outline');
        });
    },

    removeData : function(E){

        fetch(this.$store.state.url.URL_DM_MENU + "removeData", {
            method: "POST",
            headers: {
                "content-type": "application/json",
                authorization: "kikensbatara " + localStorage.token
            },
            body: JSON.stringify(this.form)
        }).then(res_data => {
            this.getView();
            this.mdl_remove = false;
            this.Notify('Sukses Menghapus Data', 'negative', 'check_circle_outline');
        });

    },

    selectData : function(data){
        this.form.id = data.id;
        this.form.title = data.title;
        this.form.icon = data.icon;
        this.form.route = data.route;
        this.form.type = data.type;
        this.form.jenis = data.jenis;
        this.form.parrent = data.parrent;
        this.form.urutan = data.urutan;
        this.form.color = data.color;
    
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

        showHide(data){
            var element = document.getElementById(data);
            element.classList.toggle("showx");
        },
        renameType(data){
            if (data == 0) {
            return 'Single Menu'
            } else {
            return 'Multy Menu'
            }
        },
        checkType(data){
            if (data == 0) {
            return true
            } else {
            return false
            }
        },

        checkLength(data){
            if (data.length <= 0) {
            return true
            } else {
            return false
            }
        },




    // ====================================== PAGINATE ====================================
  },

  mounted () {

    this.getView();

  },
}
</script>




