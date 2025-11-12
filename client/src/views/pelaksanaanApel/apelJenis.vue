<template>
  <div class="about" style="padding:15px">
    <q-card bordered class="my-card">
      <q-card-section class="bg-primary text-white">
        <div class="row">
          <div class="col-12 col-md-6">
            <div class="text-h6 h_titleHead">Jenis Apel</div>
            <div class="text-subtitle2">Jenis Apel dan OPD Peserta</div>
          </div>
          <div class="col-12 col-md-2"></div>
          <div class="col-12 col-md-4">
            <div class="row">
              <q-input v-model="cari_value" @keyup="cari_data()" outlined square :dense="true" class="bg-white" style="width:90%"/>
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
        <div v-if="cek_load_data" class="text-center">
          

          <q-img
            src="./img/loading.gif"
            spinner-color="primary"
            spinner-size="82px"
            width="300px"
            height="auto"
          />
          <br>
          <span>LOADING..</span>
        </div>
        <div v-if="!cek_load_data" class="tbl_responsive">

          <!-- =================================================== KONTENT =========================================================== -->
            <table width="100%">
              <tr class="h_table_head bg-blue-2">
                <th width="5%" class="text-center">No</th>
                <th width="30%">Uraian</th>
                <th width="15%">Jml OPD Peserta</th>
                <th width="35%">Keterangan</th>
                <th width="15%"></th>
              </tr>
              <tr v-for="(data, index) in list_data" :key="data.id" :class="'h_table_body '">
                <td class="text-center">{{index+1}}.</td>
                <td>{{data.uraian}}</td>
                <td class="text-center">35</td>
                <td>{{data.keterangan}}</td>
                <td class="text-center">
                  <q-btn-group>
                    <q-btn @click="mdl_maps = true, selectData(data), getViewPeserta()" glossy color="blue" icon="account_balance" class="tbl_btn" >
                      <q-tooltip content-class="bg-blue-9" content-style="font-size: 13px">
                        Click Menambah OPD Peserta
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
        <div v-if="!cek_load_data" class="text-center">
          <q-btn @click="btn_prev" glossy color="orange" icon="skip_previous" class="paginate_btn" />
            <span class="h_panation">&nbsp; {{page_first}} - {{page_last}} &nbsp;</span>
          <q-btn @click="btn_next" glossy color="orange" icon="skip_next" class="paginate_btn" />
        </div>
        <br>
      </q-card-section>
    </q-card>





          <!-- =================================================== MODAL =========================================================== -->


            <!-- ================================================= MODAL TAMBAH ================================================ -->
              <q-dialog v-model="mdl_add" persistent>
                <q-card class="mdl-md">
                  <q-card-section class="bg-primary">
                    <div class="text-h6 h_modalhead">Simpan Data</div>
                  </q-card-section>

                  <form @submit.prevent="addData()">

                    <q-card-section class="q-pt-none">
                        <br>
                        <div class="row">
                          <div class="col-12 col-md-12 frame_cari">
                            <span class="h_lable ">Uraian Kegiatan</span>
                            <q-input v-model="form.uraian" outlined square :dense="true" class="bg-white margin_btn" placeholder="ex : Apel Senin"/> 
                          </div>

                          <div class="col-12 col-md-12 frame_cari">
                            <span class="h_lable ">Keterangan</span>
                            <q-input v-model="form.keterangan" outlined square :dense="true" class="bg-white margin_btn" type="textarea"/>
                          </div>
                        </div>
                    </q-card-section>

                    <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                        <q-btn :loading="btn_add" color="primary" @click="addData()" label="Simpan" />
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
                    <div class="text-h6 h_modalhead">Edit Data</div>
                  </q-card-section>

                  <q-card-section class="q-pt-none">
                        <br>
                        <div class="row">
                          <div class="col-12 col-md-12 frame_cari">
                            <span class="h_lable ">Uraian Kegiatan</span>
                            <q-input v-model="form.uraian" outlined square :dense="true" class="bg-white margin_btn" placeholder="ex : Apel Senin"/> 
                          </div>

                          <div class="col-12 col-md-12 frame_cari">
                            <span class="h_lable ">Keterangan</span>
                            <q-input v-model="form.keterangan" outlined square :dense="true" class="bg-white margin_btn" type="textarea"/>
                          </div>
                        </div>
                  </q-card-section>

                  <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                    
                      <q-btn :loading="btn_add" color="primary" @click="editData()" label="Simpan" />
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

            <!-- ================================================= MODAL MODAL LIST OPD ================================================ -->
              <q-dialog v-model="mdl_maps" persistent>
                <q-card class="mdl-md">
                  <q-card-section class="bg-primary">
                    <div class="text-h6 h_modalhead">List OPD Peserta</div>
                  </q-card-section>

                  
                    <q-card-section class="q-pt-none">
                      <br>
                      <div class="row text-white">
                        <q-input placeholder="Cari..." outlined square :dense="true" v-model="cari_value_peserta" @keyup="getViewPeserta()" class="bg-white" style="width:90%"/>
                        <q-btn glossy class="bg-light-blue-10" @click="mdl_opd = true, getUnitKerja()" dense flat icon="add" style="width:10%">
                            <q-tooltip content-class="bg-light-blue-10" content-style="font-size: 13px">
                              Click untuk Memilih OPD
                            </q-tooltip>
                        </q-btn>
                      </div>

                      <br>
                      <div v-if="cek_load_data_peserta" class="text-center">
                        <q-img
                          src="./img/loading.gif"
                          spinner-color="primary"
                          spinner-size="82px"
                          width="300px"
                          height="auto"
                        />
                        <br>
                        <span>LOADING..</span>
                      </div>

                      <div v-if="!cek_load_data_peserta" class="tbl_responsive">
                        <table width="100%">
                          <tr class="h_table_head bg-blue-2">
                            <th width="10%">No.</th>
                            <th>OPD</th>
                            <th width="10%"></th>
                          </tr>
                          <tr :class="'h_table_body '" v-for="(data, index) in list_peserta" :key="data.id">
                            <td>{{index+1}}</td>
                            <td>{{data.unit_kerja_uraian}}</td>
                            <td class="text-center">
                              <q-btn class="glossy" round color="deep-orange" icon="backspace">
                                <q-tooltip content-class="bg-red" content-style="font-size: 13px">
                                  Click untuk menghapus data ini
                                </q-tooltip>
                              </q-btn>
                            </td>
                          </tr>
                        </table>
                      </div>
                      <hr class="hrpagin">
                      <br>
     

                    </q-card-section>

                    <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                         <q-btn label="Kembali" color="negative" v-close-popup />
                    </q-card-actions>

                
                </q-card>
              </q-dialog>
            <!-- ================================================= MODAL MODAL LIST OPD ================================================ -->

            <!-- ================================================= MODAL TAMBAH OPD ================================================ -->
              <q-dialog v-model="mdl_opd" persistent>
                <q-card class="mdl-md">
                  <q-card-section class="bg-primary">
                    <div class="text-h6 h_modalhead">Pilih OPD</div>
                  </q-card-section>
                    <q-card-section class="q-pt-none">
                      <br>
                      <div class="row">
                        <div class="col-12 col-md-5" style="padding-right:2%">
                          <select v-model="data_batas1" @change="getUnitKerja()" class="inputbs">
                            <option value="8">Jumlah Tampil Data</option>
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="500">Semua</option>
                          </select>
                        </div>

                        <div class="col-12 col-md-7">
                          <div class="row text-white">
                            <q-input v-model="cari_value1" @keyup="getUnitKerja()" placeholder="Cari..." outlined square :dense="true" class="bg-white" style="width:100%"/>
                          </div>

                        </div>
                      </div>

                      <br>

                      <div  class="tbl_responsive">
                        <table width="100%">
                          <tr class="h_table_head bg-blue-2">
                            <th width="10%">No.</th>
                            <th>OPD</th>
                            <th class="text-center" width="10%">
                                <input type="checkbox" class="mdCheckbox1" v-model="getAllUnitKerja" @change="selecAllUnitKerja()">
                            </th>
                          </tr>
                          <tr v-for="(data, index) in list_unitKerja" :key="data.id" :class="'h_table_body '">
                            <td class="text-center">{{index+1}}</td>
                            <td>{{data.unit_kerja}}</td>
                            <td class="text-center">
                              <input type="checkbox" class="mdCheckbox" v-model="peserta.unit_kerja" :value="data.id">
                            </td>
                          </tr>
                        </table>
                      </div>

                      <hr class="hrpagin">
                      <br>
                      <div class="text-center">
                        <q-btn @click="btn_prev1" glossy color="blue" icon="skip_previous" class="paginate_btn" />
                          <span class="h_panation">&nbsp; {{page_first1}} - {{page_last1}} &nbsp;</span>
                        <q-btn @click="btn_next1" glossy color="blue" icon="skip_next" class="paginate_btn" />
                      </div>
                      <br>
                    </q-card-section>

                    <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                          <q-btn @click="addPeserta" label="Simpan" color="negative" />
                         <q-btn label="Kembali" color="negative" v-close-popup />
                    </q-card-actions>

                </q-card>
              </q-dialog>
            <!-- ================================================= MODAL TAMBAH OPD ================================================ -->

       
          <!-- =================================================== MODAL =========================================================== -->




  </div>
</template>


<script>

import libUmum from '../../library/umum'


export default {
  data() {
    return {
      

      form : {
        id : '',
        uraian : '',
        keterangan : '',
      },
      peserta : {
        jenisapel : '',
        unit_kerja : []
      },
     
      list_data : [],
      list_unitKerja : [],
      list_peserta : [],


      page_first: 1,
      page_last: 0,
      cari_value: "",
      cek_load_data : true,

      page_first1: 1,
      page_last1: 0,
      cari_value1: "",
      data_batas1 : 10,
      cek_load_data1 : true,

      page_first2: 1,
      page_last2: 0,
      cari_value2: "",
      cek_load_data2 : true,

      cari_value_peserta: "",
      cek_load_data_peserta : true,

      getAllUnitKerja : false,


      mdl_add: false,
      mdl_edit: false,
      mdl_hapus : false,
      mdl_chat : false,
      mdl_maps : false,
      btn_add: false,
      mdl_opd : false,
      mdl_img : false,
    }
  },
  methods: {


    getView : function(){
      this.cek_load_data = true;
      fetch(this.$store.state.url.URL_apelJenis + "view", {
          method: "POST",
          headers: {
          "content-type": "application/json",
          authorization: "kikensbatara " + localStorage.token
          },
          body: JSON.stringify({
              data_ke: this.page_first,
              cari_value: this.cari_value
          })
      })
          .then(res => res.json())
          .then(res_data => {
              this.list_data = res_data.data;
              this.page_last = res_data.jml_data;

              this.cek_load_data = false;
      });
    },


    addData : function(number) {

      fetch(this.$store.state.url.URL_apelJenis + "Add", {
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
 
      fetch(this.$store.state.url.URL_apelJenis + "editData", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: "kikensbatara " + localStorage.token
          },
          body: JSON.stringify(this.form)
      }).then(res_data => {
          this.Notify('Sukses Merubah Data', 'warning', 'check_circle_outline');
          this.getView();
      });
    },

    removeData : function(data){
      fetch(this.$store.state.url.URL_apelJenis + "removeData", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: "kikensbatara " + localStorage.token
          },
          body: JSON.stringify({id : this.form.id})
      }).then(res_data => {
          this.Notify('Sukses Menghapus Data', 'negative', 'check_circle_outline');
          this.getView();
      });

    },


    selectData : function(data){
        this.form.id = data.id;
        this.form.uraian = data.uraian;
        this.form.keterangan = data.keterangan;

        this.peserta.jenisapel = data.id;
    },

    addPeserta : function(){
      console.log(this.peserta.unit_kerja)

      fetch(this.$store.state.url.URL_apelJenis + "addUPesertaUnitKerja", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: "kikensbatara " + localStorage.token
          },
          body: JSON.stringify(this.peserta)

      }).then(res_data => {
          this.Notify('Sukses menambah Peserta', 'primary', 'check_circle_outline');
          this.getViewPeserta();
          this.getView();
      });
    },

    getViewPeserta : function(){
      this.cek_load_data_peserta = true;
      fetch(this.$store.state.url.URL_apelJenis + "viewPesertaUnitKerja", {
          method: "POST",
          headers: {
          "content-type": "application/json",
          authorization: "kikensbatara " + localStorage.token
          },
          body: JSON.stringify({
            id : this.form.id,
            cari_data : this.cari_value_peserta
          })
      })
          .then(res => res.json())
          .then(res_data => {
              this.list_peserta = res_data;
              this.cek_load_data_peserta = false;
              console.log(res_data)
      });
    },

    // ====================================== TAMBAHAN ====================================

      getUnitKerja : function(){
        this.cek_load_data1 = true;

        if (this.peserta.unit_kerja.length <= 0) {
          this.getAllUnitKerja = false;
        } 



        fetch(this.$store.state.url.URL_apelJenis + "selectUnitKerja", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              authorization: "kikensbatara " + localStorage.token
            },
            body: JSON.stringify({
                data_ke: this.page_first1,
                cari_value: this.cari_value1,
                data_batas: this.data_batas1
            })
        })
            .then(res => res.json())
            .then(res_data => {
                this.list_unitKerja = res_data.data;
                this.page_last1 = res_data.jml_data;

                this.cek_load_data1 = false;
                // console.log(this.list_unitKerja)
        });
      },


      selecAllUnitKerja : function(){
        if (this.getAllUnitKerja) {
          this.list_unitKerja.forEach(data => {
            this.peserta.unit_kerja.push(data.id)
          });
        } else {
          this.peserta.unit_kerja = [];
        }
      },


    // ====================================== TAMBAHAN ====================================

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
        btn_prev : function(){
            if(this.page_first>1){this.page_first--}
            else{this.page_first = 1;}
            this.getView();
        },

        btn_next : function(){
            if(this.page_first >= this.page_last){this.page_first == this.page_last}
            else{this.page_first++;}
            this.getView();
        },

        cari_data : function(){
            this.page_first = 1; this.getView();
        },

        btn_prev1 : function(){
            if(this.page_first1>1){this.page_first1--}
            else{this.page_first1 = 1;}
            this.getUnitKerja();
        },

        btn_next1 : function(){
            if(this.page_first1 >= this.page_last1){this.page_first1 == this.page_last1}
            else{this.page_first1++;}
            this.getUnitKerja();
        },

        cari_data1 : function(){
            this.page_first1 = 1; this.getUnitKerja();
        },


        btn_prev2 : function(){
            if(this.page_first2>1){this.page_first2--}
            else{this.page_first2 = 1;}
            this.getView();
        },

        btn_next2 : function(){
            if(this.page_first2 >= this.page_last2){this.page_first2 == this.page_last2}
            else{this.page_first2++;}
            this.getView();
        },

        cari_data2 : function(){
            this.page_first2 = 1; this.getView();
        },




    // ====================================== PAGINATE ====================================







  },

  mounted () {

    this.getView();
    this.$getLocation()
    .then(coordinates => {
      this.form.lat = coordinates.lat;
      this.form.lng = coordinates.lng;

      this.$store.state.coordinat.lat = coordinates.lat;
      this.$store.state.coordinat.lng = coordinates.lng;
    });

    this.$store.commit("listJeniskategorilokasi");
    this.$store.commit("getStorage");

    this.form.unit_kerja = this.$store.state.unit_kerja





  },
}
</script>




