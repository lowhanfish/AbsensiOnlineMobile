<template>
  <div class="about" style="padding:15px">
    <q-card bordered class="my-card">
      <q-card-section class="bg-primary text-white">
        <div class="row">
          <div class="col-12 col-md-6">
            <div class="text-h6 h_titleHead">Pengumuman</div>
            <div class="text-subtitle2">Pengumuman</div>
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
        <div class="tbl_responsive">
          <!-- =================================================== KONTENT =========================================================== -->
            <table width="100%">
              <tr class="h_table_head bg-blue-2">
                <th width="5%" class="text-center">No</th>
                <th width="35%">Judul</th>
                <th width="40%">Upload By</th>
                <th width="10%"></th>
              </tr>
              <tr class="h_table_body" v-for="(data, index) in list_data" :key="data.id">
                <td class="text-center">{{index+1}}.</td>
                <td>{{data.judul}}</td>
                <td>{{data.unit_kerja_nama}}</td>
                <td class="text-center">
                    <q-btn-group>
                        <q-btn @click="mdl_lihat = true, selectData(data), loadPDF = true" glossy color="blue" icon="search" class="tbl_btn">
                            <q-tooltip content-class="bg-blue-9" content-style="font-size: 13px">
                                Click untuk melihat lampiran data ini
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
                        <span class="h_lable ">Judul Pengumuman</span>
                        <q-input v-model="form.judul" outlined square :dense="true" class="bg-white margin_btn" /> 

                        <span class="h_lable ">Isi</span>
                        <vue-editor v-model="form.isi"></vue-editor>

                        <span class="h_lable ">Lampiran File</span>
                        <q-file v-model="form.file" outlined square :dense="true" class="bg-white margin_btn">
                            <template v-slot:prepend>
                            <q-icon name="attach_file" />
                            </template>
                        </q-file>

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
                        <span class="h_lable ">Judul Pengumuman</span>
                        <q-input v-model="form.judul" outlined square :dense="true" class="bg-white margin_btn" /> 

                        <span class="h_lable ">Isi</span>
                        <vue-editor v-model="form.isi"></vue-editor>

                        <span class="h_lable ">Lampiran File</span>
                        <q-file v-model="form.file" outlined square :dense="true" class="bg-white margin_btn">
                            <template v-slot:prepend>
                            <q-icon name="attach_file" />
                            </template>
                        </q-file>
                       
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

            <!-- ================================================ MODAL LIHAT ================================================ -->
            <q-dialog v-model="mdl_lihat" persistent>
              <q-card class="mdl-lg ">
                <!-- <div class="mdl-head">
                  <span>KOKO</span>
                </div> -->

                <div class="row mdl-head birumudaGrad" >
                  <div class="col-11 col-sm-11 items-start h_modalHead shaddowText">Detil Pengumuman</div>
                  <div class="col-1 col-sm-1 items-end text-right">
                    <a class="h_ModalExit" href="javascript:void(0)" @click="mdl_lihat = false, loadPDF=false">x</a>
                  </div>
                </div>


                <q-card-section class="q-pt-none abuMudaGrad">

                        <div class="text-center">
                          <br>
                            <table>
                              <tr  class="h_table_head bg-blue-2">
                                <th>Uraian</th>
                                <th>Keterangan</th>
                              </tr>
                              
                              <tr  class="h_table_body1" >
                                <td>Judul</td>
                                <td>{{form.judul}}</td>
                              </tr>

                              <tr  class="h_table_body1" >
                                <td>Keterangan</td>
                                <td>
                                    <div v-html="form.isi"></div>
                                </td>
                              </tr>

                              <tr  class="h_table_body1" >
                                <td>Tgl Publish</td>
                                <td>{{form.judul}}</td>
                              </tr>
                             
                              
                            </table>
                          <br>

                        <div v-if="form.file_type == 'application/pdf'">

                            <div style="width:100%; height:1000px" v-if="loadPDF">
                                <vue-pdf-app :pdf="$store.state.url.URL_APP+'uploads/'+form.file_old"></vue-pdf-app>

                            </div>
                        </div>

                        <div v-if="form.file_type != 'application/pdf'">
                            <span>File gambar</span>
                        </div>




                          <br>
                        </div>
                      <div class="text-right">
                          <q-btn @click="loadPDF=false" label="KEMBALI" size="md" color="negative" v-close-popup/>

                      </div>
      
                </q-card-section>
              </q-card>
            </q-dialog>

      <!-- ================================================ MODAL LIHAT ================================================ -->




          <!-- =================================================== MODAL =========================================================== -->




  </div>
</template>


<script>

import { VueEditor } from "vue2-editor";
import VuePdfApp from "vue-pdf-app";
import "vue-pdf-app/dist/icons/main.css";

export default {
    components: {
        VueEditor, VuePdfApp
    },
    data() {
        return {

        form : {
            id : '',
            judul : '',
            isi : '',
            file : null,
            file_old : '',
            file_type : '',
            unit_kerja : '',
            status : '',
            keterangan : '',
        },
        
        list_data : [],
        loadPDF : false,

        page_first: 1,
        page_last: 0,
        cari_value: "",
        cek_load_data : true,


        mdl_add: false,
        mdl_edit: false,
        mdl_hapus : false,
        mdl_lihat : false,
        btn_add: false,
        }
    },
    methods: {


        getView : function(){
            this.$store.commit("shoWLoading");
            fetch(this.$store.state.url.URL_presensi_pengumuman + "view", {
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
            var formData = new FormData();


            formData.append('id', this.form.id);
            formData.append('judul', this.form.judul);
            formData.append('isi', this.form.isi);
            formData.append('keterangan', this.form.keterangan);

            formData.append('file', this.form.file);
            formData.append('file_old', this.form.file_old);
            formData.append('unit_kerja', this.form.unit_kerja);
            

            fetch(this.$store.state.url.URL_presensi_pengumuman + "addData", {
                method: "POST",
                headers: {
                    // "content-type": "application/json",
                    authorization: "kikensbatara " + localStorage.token
                },
                body: formData
            }).then(res_data => {
                this.Notify('Sukses Menambah Data', 'primary', 'check_circle_outline');
                this.getView();
            });
            // console.log(this.form.jeniskategorilokasi)
        },



        editData : function(){
            var formData = new FormData();

            formData.append('id', this.form.id);
            formData.append('judul', this.form.judul);
            formData.append('isi', this.form.isi);
            formData.append('keterangan', this.form.keterangan);

            formData.append('file', this.form.file);
            formData.append('file_old', this.form.file_old);
            formData.append('unit_kerja', this.form.unit_kerja);


            fetch(this.$store.state.url.URL_presensi_pengumuman + "editData", {
                method: "POST",
                headers: {
                    // "content-type": "application/json",
                    authorization: "kikensbatara " + localStorage.token
                },
                body: formData
            }).then(res_data => {
                this.Notify('Sukses Merubah Data', 'warning', 'check_circle_outline');
                this.getView();
            });
        },

        removeData : function(E){
            fetch(this.$store.state.url.URL_presensi_pengumuman + "removeData", {
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
            console.log(data)
            this.form.id = data.id;
            this.form.judul = data.judul;
            this.form.isi = data.isi;

            this.form.file_old = data.file;
            this.form.file_type = data.file_type;
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
        this.form.unit_kerja = this.$store.state.unit_kerja
        console.log(this.form.unit_kerja)
        this.getView();
    },
}
</script>




