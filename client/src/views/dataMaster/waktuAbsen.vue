<template>
  <div class="about" style="padding:15px">
    <q-card bordered class="my-card">
      <q-card-section class="bg-primary text-white">
        <div class="row">
          <div class="col-12 col-md-6">
            <div class="text-h6 h_titleHead">Waktu Absen</div>
            <div class="text-subtitle2">Data Master</div>
          </div>
          <div class="col-12 col-md-2"></div>
          <div class="col-12 col-md-4">
            <div class="row">
              <q-input disabled v-model="cari_value" @keyup="cari_data()" outlined square :dense="true" class="bg-white" style="width:90%"/>
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
        <div class="tbl_responsive">
          <!-- =================================================== KONTENT =========================================================== -->
            <table width="100%">
              <tr class="h_table_head bg-blue-2">
                <th width="5%" class="text-center">No</th>
                <th width="25%">Uraian</th>
                <th width="15%">Dari (Datang)</th>
                <th width="15%">Hingga (Datang)</th>
                <th width="15%">Dari (Pulang)</th>
                <th width="15%">Hingga (Pulang)</th>
                <th width="10%"></th>
              </tr>
              <tr class="h_table_body" v-for="(data, index) in list_data" :key="data.id">
                <td class="text-center">{{index+1}}.</td>
                <td>{{data.uraian}}</td>
                <td>{{data.startDatang}}</td>
                <td>{{data.finishDatang}}</td>
                <td>{{data.startPulang}}</td>
                <td>{{data.finishPulang}}</td>
                <td class="text-center">
                  <q-btn-group>
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
        <div class="text-center">
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
                    <div class="text-h6 h_modalhead">Simpan Dataxxx</div>
                  </q-card-section>

                  <form @submit.prevent="addData()">
                    <q-card-section class="q-pt-none">
                        <br>

                        <div class="row">

                          <div class="col-12 col-md-12 frame_cari">
                            <span class="h_lable ">Uraian</span>
                            <q-input v-model="form.uraian" outlined square :dense="true" placeholder="Contoh : Absen Lembur" class="bg-white margin_btn" /> 
                          </div>

                          <div class="col-12 col-md-6 frame_cari">
                            <span class="h_lable ">Absen datang mulai dari jam</span>
                            <q-input v-model="form.startDatang" outlined square :dense="true" placeholder="Contoh : 08:30" class="bg-white margin_btn" /> 
                          </div>

                          <div class="col-12 col-md-6 frame_cari">
                            <span class="h_lable ">Absen datang sampai jam</span>
                            <q-input v-model="form.finishDatang" outlined square :dense="true" placeholder="Contoh : 10:00" class="bg-white margin_btn" /> 
                          </div>

                          <div class="col-12 col-md-6 frame_cari">
                            <span class="h_lable ">Absen pulang mulai dari jam</span>
                            <q-input v-model="form.startPulang" outlined square :dense="true" placeholder="Contoh : 12:30" class="bg-white margin_btn" /> 
                          </div>

                          <div class="col-12 col-md-6 frame_cari">
                            <span class="h_lable ">Absen pulang sampai jam</span>
                            <q-input v-model="form.finishPulang" outlined square :dense="true" placeholder="Contoh : 16:30" class="bg-white margin_btn" /> 
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
                       
                        <div class="row">

                          <div class="col-12 col-md-12 frame_cari">
                            <span class="h_lable ">Uraian</span>
                            <q-input v-model="form.uraian" outlined square :dense="true" placeholder="Contoh : Absen Lembur" class="bg-white margin_btn" /> 
                          </div>

                          <div class="col-12 col-md-6 frame_cari">
                            <span class="h_lable ">Absen datang mulai dari jam</span>
                            <q-input v-model="form.startDatang" outlined square :dense="true" placeholder="Contoh : 08:30" class="bg-white margin_btn" /> 
                          </div>

                          <div class="col-12 col-md-6 frame_cari">
                            <span class="h_lable ">Absen datang sampai jam</span>
                            <q-input v-model="form.finishDatang" outlined square :dense="true" placeholder="Contoh : 10:00" class="bg-white margin_btn" /> 
                          </div>

                          <div class="col-12 col-md-6 frame_cari">
                            <span class="h_lable ">Absen pulang mulai dari jam</span>
                            <q-input v-model="form.startPulang" outlined square :dense="true" placeholder="Contoh : 12:30" class="bg-white margin_btn" /> 
                          </div>

                          <div class="col-12 col-md-6 frame_cari">
                            <span class="h_lable ">Absen pulang sampai jam</span>
                            <q-input v-model="form.finishPulang" outlined square :dense="true" placeholder="Contoh : 16:30" class="bg-white margin_btn" /> 
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




          <!-- =================================================== MODAL =========================================================== -->




  </div>
</template>


<script>
  export default {
    data() {
      return {

        form : {
          id : '',
          uraian : '',
          startDatang : '',
          finishDatang : '',
          startPulang : '',
          finishPulang : '',
          keterangan : '',
        },
      
        list_data : [],

        page_first: 1,
        page_last: 0,
        cari_value: "",
        cek_load_data : true,


        mdl_add: false,
        mdl_edit: false,
        mdl_hapus : false,
        btn_add: false,
      }
    },
    methods: {


      getView : function(){
        this.$store.commit("shoWLoading");
        fetch(this.$store.state.url.URL_MasterWaktuAbsen + "view", {
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
                this.$store.commit("hideLoading");
                console.log(res_data);
        });
      },


      addData : function(number) {
        fetch(this.$store.state.url.URL_MasterWaktuAbsen + "Add", {
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
      },


      editData : function(){
        fetch(this.$store.state.url.URL_MasterWaktuAbsen + "editData", {
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

      removeData : function(E){
        fetch(this.$store.state.url.URL_MasterWaktuAbsen + "removeData", {
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
          this.form.startDatang = data.startDatang;
          this.form.finishDatang = data.finishDatang;
          this.form.startPulang = data.startPulang;
          this.form.finishPulang = data.finishPulang;
          this.form.keterangan = data.keterangan;
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
          btn_prev : function(){
              this.cek_load_data = true;
              if(this.page_first>1){
                  this.page_first--
              }else{
                  this.page_first = 1;
              }
              this.getView();
          },

          btn_next : function(){
              if(this.page_first >= this.page_last){
                  this.page_first == this.page_last
              }else{
                  this.page_first++;
              }
              this.getView();
          },

          cari_data : function(){
              this.page_first = 1;
              this.getView();
          },


      // ====================================== PAGINATE ====================================







    },

    mounted () {
      this.getView();
    },
  }
</script>




