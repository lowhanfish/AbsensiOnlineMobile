<template>
  <div class="about" style="padding:15px">
    <q-card bordered class="my-card">
      <q-card-section class="bg-primary text-white">
        <div class="row">
          <div class="col-12 col-md-6">
            <div class="text-h6 h_titleHead">Hari Libur</div>
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
                <th width="36%">Tanggal</th>
                <th width="50%">Keterangan</th>
                <th width="10%"></th>
              </tr>
              <tr class="h_table_body" v-for="(data, index) in list_data" :key="data.id">
                <td class="text-center">{{index+1}}.</td>
                <td>{{data.dd}}-{{data.mm}}-{{data.yy}}</td>
                <td>{{data.keterangan}}</td>
                <td class="text-center">
                  <q-btn-group>
                    <!-- <q-btn @click="mdl_edit = true, selectData(data)" glossy color="orange" icon="create" class="tbl_btn">
                      <q-tooltip content-class="bg-orange-9" content-style="font-size: 13px">
                        Click untuk mengubah data ini
                      </q-tooltip>
                    </q-btn> -->
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
                            <!-- <span class="h_lable ">Pilih Tgl</span>
                            <q-input outlined square :dense="true" v-model="form.tglFull" mask="date" :rules="['form.tglFull']" disabled>
                              <template v-slot:append>
                                <q-icon name="event" class="cursor-pointer">
                                  <q-popup-proxy transition-show="scale" transition-hide="scale">
                                    <q-date v-model="form.tglFull" range multiple>
                                      <div class="row items-center justify-end">
                                        <q-btn @click="searchByDate()" v-close-popup label="Pilih" color="primary" flat />
                                      </div>
                                    </q-date>
                                  </q-popup-proxy>
                                </q-icon>
                              </template>
                            </q-input> -->

                            <m-date-picker v-model="date" :multi="multi" :always-display="false" :format="formatDate" :disp="disp" style="z-index:9999" lang="id"></m-date-picker>

                          </div>
                          

                          <div class="col-12 col-md-12 frame_cari">
                            <span class="h_lable ">Keterangan</span>
                            <q-input v-model="form.keterangan" outlined square :dense="true" class="bg-white margin_btn" type="textarea"/>
                          </div>

                        </div>


                        <br><br><br><br>

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

                          <!-- <div class="col-12 col-md-12 frame_cari">
                            <span class="h_lable ">Uraian</span>
                            <q-input v-model="form.uraian" outlined square :dense="true" placeholder="Contoh : Absen Lembur" class="bg-white margin_btn" /> 
                          </div> -->

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
          dd : '',
          mm : '',
          yy : '',
          tglFull : { from: '2020/07/08', to: '2020/07/17' },
          keterangan : '',
        },

        multi: true,
        disp : ['Mng','Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab','', '', 'Batal', 'Pilih'],
        date: [],
      
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
        fetch(this.$store.state.url.URL_MasterWaktuLibur + "view", {
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
        


        var datax = []

        this.date.forEach(element => {
          var tglx = element.toLocaleDateString();
          var tgl = tglx.split('/')
          datax.push({
            dd : tgl[0],
            mm : tgl[1],
            yy : tgl[2],
            tglFull : element,
            keterangan : this.form.keterangan
          })

        });



        fetch(this.$store.state.url.URL_MasterWaktuLibur + "Add", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              authorization: "kikensbatara " + localStorage.token
            },
            body: JSON.stringify(datax)
        }).then(res_data => {
            this.Notify('Sukses Menambah Data', 'primary', 'check_circle_outline');
            this.getView();
            this.$store.commit("hideLoading");
        });

      },

      removeData : function(E){
        fetch(this.$store.state.url.URL_MasterWaktuLibur + "removeData", {
            method: "POST",
            headers: {
            "content-type": "application/json",
            authorization: "kikensbatara " + localStorage.token
            },
            body: JSON.stringify({id : this.form.id})
        }).then(res_data => {
            this.Notify('Sukses Menghapus Data', 'negative', 'check_circle_outline');
            this.getView();
            this.$store.commit("hideLoading");
        });

      },
      selectData : function(data){
          this.form.id = data.id;
          this.form.dd = data.uraian;
          this.form.mm = data.startDatang;
          this.form.yy = data.finishDatang;
          this.form.tglFull = data.startPulang;
          this.form.keterangan = data.keterangan;
      },



      searchByDate(){
        var datex = this.form.tglFull

        var date = datex.split('/')

        // console.log(datex)

        // this.filterku.tahun = date[0];
        // this.filterku.bulan = parseInt(date[1]);
        // this.filterku.date = date[2];
        // this.getView()
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

          formatDate(date) {
            return date.toLocaleDateString('id-ID');

            // return date
          },


      // ====================================== PAGINATE ====================================







    },

    mounted () {
      this.getView();
    },
  }
</script>




