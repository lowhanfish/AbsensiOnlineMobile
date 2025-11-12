<template>
  <div class="about" style="padding:15px">
    <q-card bordered class="my-card">
      <q-card-section class="bg-primary text-white">
        <div class="row">
          <div class="col-12 col-md-6">
            <div class="text-h6  h_titleHead">Verifikasi Permohonan Izin</div>
            <!-- <div class="text-subtitle2">by John Doe</div> -->
          </div>
          <div class="col-12 col-md-2"></div>
          <div class="col-12 col-md-4">
            <!-- <q-input outlined square :dense="true" class="bg-white">
              <template v-slot:after >
                <q-btn @click="alert = true" dense flat icon="add" />
              </template>
            </q-input> -->

            <div class="row">
              <q-input  v-model="cari_value" @keyup="cari_data()" outlined square :dense="true" class="bg-white" style="width:85%"/>
              <q-btn glossy class="bg-light-blue-10" dense flat icon="add" style="width:15%"/>
            </div>

          </div>
        </div>
      </q-card-section>

      <q-separator dark inset />

      <q-card-section>
        <div v-if="cek_load_data">
          <ProgressLoading/>
        </div>
        <div  v-if="!cek_load_data" class="tbl_responsive">
          <!-- =================================================== KONTENT =========================================================== -->
            <table width="100%">
              <tr class="h_table_head bg-blue-2">
                <th width="5%" class="text-center">No</th>
                <th width="25%">NAMA</th>
                <th width="20%">NIP</th>
                <th width="20%">Kategori</th>
                <th width="10%">Dari</th>
                <th width="10%">Sampai</th>
                <th width="10%"></th>
              </tr>
              <tr :class="'h_table_body '+indicatorColor(data.status).bg" v-for="(data, index) in list_data" :key="data.id">
                <td class="text-center">{{index+1}}.</td>
                <td>{{LIB.namaLengkap(data.biodata_gelar_depan, data.biodata_nama, data.biodata_gelar_belakang)}}</td>
                <td>{{data.NIP}}</td>
                <td>{{data.jenisizin_uraian}}</td>
                <td>{{LIB.tglConvert(data.TglMulai)}}</td>
                <td>{{LIB.tglConvert(data.TglSelesai)}}</td>
                <td class="justify-center">
                  <q-btn-group>
                    <q-btn @click="mdl_lihat = true, selectData(data)"  glossy color="primary" icon="search" class="tbl_btn">
                      <q-tooltip content-class="bg-blue-9" content-style="font-size: 13px">
                        Click untuk melihat Detil Permohonan
                      </q-tooltip>
                    </q-btn>
                    <q-btn @click="mdl_terima = true, selectData(data)" glossy color="light-green-9" icon="done" class="tbl_btn" >
                      <q-tooltip content-class="bg-light-green-9" content-style="font-size: 13px">
                          Click Menerima Permohonan
                        </q-tooltip>
                    </q-btn>
                    <q-btn @click="mdl_hapus = true, selectData(data)" glossy color="negative" icon="block" class="tbl_btn">
                      <q-tooltip content-class="bg-red-9" content-style="font-size: 13px">
                          Click untuk Mengembalikan Permohonan
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
        

      <!-- ================================================ MODAL TERIMA ================================================ -->
            <q-dialog v-model="mdl_terima" persistent>
              <q-card class="mdl-sm ">
                <q-card-section class="q-pt-none text-center hijauMudaGrad">
                    <form @submit.prevent="addData">
                        <br>
                        <img src="img/alert.png" alt="" width="75"> <br>
                        <span class="h_notifikasi">APAKAH ANDA YAKIN INGIN MEMVERIFIKASI DATA INI??</span>
                        <input type="submit" style="position: absolute; left: -9999px"/>
                        <br>
                        <br>

                      <q-btn label="Batal" size="sm" color="negative"  v-close-popup/>
                      &nbsp;
                      <q-btn type="submit" label="Verifikasi" size="sm" color="primary" v-close-popup/>

                    </form>
                </q-card-section>
              </q-card>
            </q-dialog>

      <!-- ================================================ MODAL TERIMA ================================================ -->

      <!-- ================================================ MODAL LIHAT ================================================ -->
            <q-dialog v-model="mdl_lihat" persistent>
              <q-card class="mdl-md ">
                <!-- <div class="mdl-head">
                  <span>KOKO</span>
                </div> -->

                <div class="row mdl-head birumudaGrad" >
                  <div class="col-11 col-sm-11 items-start h_modalHead shaddowText">Detil Permohonan</div>
                  <div class="col-1 col-sm-1 items-end text-right">
                    <a class="h_ModalExit" href="javascript:void(0)" @click="mdl_lihat = false">x</a>
                  </div>
                </div>


                <q-card-section class="q-pt-none abuMudaGrad">
                    <form @submit.prevent="addData">
                        <div class="text-center">
                          <br>
                            <table>
                              <tr  class="h_table_head bg-blue-2">
                                <th>Uraian</th>
                                <th>Keterangan</th>
                              </tr>
                              <tr  class="h_table_body1" >
                                <td>Nama</td>
                                <td>{{LIB.namaLengkap(form.biodata_gelar_depan, form.biodata_nama, form.biodata_gelar_belakang)}} </td>
                              </tr>
                              <tr  class="h_table_body1" >
                                <td>NIP</td>
                                <td>{{form.NIP}}</td>
                              </tr>
                               <tr  class="h_table_body1" >
                                <td>Unit Kerja</td>
                                <td>{{form.unit_kerja_uraian}}</td>
                              </tr>
                              <tr  class="h_table_body1" >
                                <td>Jenis Izin</td>
                                <td>{{form.jenisizin_uraian}}</td>
                              </tr>
                              
                              <tr  class="h_table_body1" >
                                <td>Dari Tgl</td>
                                <td>{{LIB.tglConvert(form.TglMulai)}}</td>
                              </tr>
                              <tr  class="h_table_body1" >
                                <td>Sampai Tgl</td>
                                <td>{{LIB.tglConvert(form.TglSelesai)}}</td>
                              </tr>
                              <tr  class="h_table_body1" >
                                <td>Keterangan</td>
                                <td>{{form.keterangan}}</td>
                              </tr>

                              <tr  class="h_table_body1" >
                                <td>Hasil Evaluasi</td>
                                <td>{{form.notif_keterangan}}</td>
                              </tr>
                              
                             
                              
                            </table>
                          <br>
                          <br>

                          <!-- <div style="padding-top:2%; padding-bottom:2%;" class="abuMudaGrad">
                            <span class="shaddowText h_modalHead">LAMPIRAN</span>
                          </div>


                          <div class="row">
                            <div class="col-6 col-md-2" style="padding:3%" v-for="(data, i) in 9" :key="i">
                              <a href="javascript:void(0);">
                                <q-img
                                    :src="'img/pdff.jpg'"
                                    spinner-color="primary"
                                    spinner-size="82px"
                                  />
                              </a>

                            </div>
                          </div> -->




                        </div>
                      <div class="text-right">
                          <q-btn label="KEMBALI" size="md" color="negative" v-close-popup/>

                      </div>
                     
                    </form>
                </q-card-section>
              </q-card>
            </q-dialog>

      <!-- ================================================ MODAL LIHAT ================================================ -->

      <!-- ================================================ MODAL HAPUS ================================================ -->
            <q-dialog v-model="mdl_hapus" persistent>
              <q-card class="mdl-md ">
                <q-card-section class="q-pt-none orageGrad">
                    <form @submit.prevent="removeData">
                      <div class="text-center ">
                        <br>
                        <img src="img/alert.png" alt="" width="75"> <br>
                        <span class="h_notifikasi">APAKAH ANDA YAKIN INGIN MENGEMBALIKAN DATA INI??</span>
                        <input type="submit" style="position: absolute; left: -9999px"/>
                        <br>

                      </div>

                        <span class="h_lable1 ">Alasan Pengembalian</span>
                            <q-input v-model="form.notif_keterangan" outlined square :dense="true" class="bg-white margin_btn" type="textarea"/>
                        <br>
                      <div class="text-right">
                        <q-btn type="submit" label="Kembalikan" color="primary" v-close-popup/>
                        &nbsp;
                        <q-btn label="Batal" color="negative"  v-close-popup/>
                      </div>

                    </form>
                </q-card-section>
              </q-card>
            </q-dialog>

      <!-- ================================================ MODAL HAPUS ================================================ -->





    <!-- =================================================== MODAL =========================================================== -->




  </div>
</template>


<script>

import libUmum from '../../library/umum'


export default {
  data() {
    return {

      form : {
        jenispresensi : '',
        JenisStatusId : '',
        NIP : '',
        TglMulai : '',
        TglSelesai : '',
        biodata_gelar_belakang : '',
        biodata_gelar_depan : '',
        biodata_nama : '',
        createdAt : '',
        createdBy : '',
        fileRef : '',
        id : '',
        jamDatang : '',
        jamPulang : '',
        jenisKategori : '',
        jenisizin : '',
        jenisizin_uraian : '',
        jeniskategori_uraian : '',
        keterangan : '',
        notif_keterangan : '',
        lat : '',
        lng : '',
        status : '',
        unit_kerja : '',
        unit_kerja_uraian : '',
      },

      list_data : [],


      page_first: 1,
      page_last: 0,
      cari_value: "",
      cek_load_data : true,

      mdl_hapus : false,
      mdl_terima : false,
      mdl_lihat : false,

      alert: false,
      simpan1: false,
      LIB : libUmum,


    }
  },
  methods: {
    getView : function(){
      this.cek_load_data = true;
      fetch(this.$store.state.url.URL_VerifikasiPermohonan + "view", {
          method: "POST",
          headers: {
          "content-type": "application/json",
          authorization: "kikensbatara " + localStorage.token
          },
          body: JSON.stringify({
              data_ke: this.page_first,
              cari_value: this.cari_value,
              jns_permohonan : 'izin',
              unit_kerja : this.form.unit_kerja
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
    addData : function(){
      fetch(this.$store.state.url.URL_VerifikasiPermohonan + "terima", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: "kikensbatara " + localStorage.token
          },
          body: JSON.stringify(this.form)
      })
      .then(res => res.json())
      .then(res_data => {
        this.Notify(res_data.ket, res_data.color, res_data.icon);
      });
    },

    removeData : function(){
      fetch(this.$store.state.url.URL_VerifikasiPermohonan + "kembalikan", {
          method: "POST",
          headers: {
          "content-type": "application/json",
          authorization: "kikensbatara " + localStorage.token
          },
          body: JSON.stringify(this.form)
      })
      .then(res => res.json())
      .then(res_data => {
        this.Notify(res_data.ket, res_data.color, res_data.icon);
      });
    },

    selectData : function(data){
      this.form = {
        jenispresensi : data.jenispresensi,
        JenisStatusId : data.JenisStatusId,
        NIP : data.NIP,
        TglMulai : data.TglMulai,
        TglSelesai : data.TglSelesai,
        biodata_gelar_belakang : data.biodata_gelar_belakang,
        biodata_gelar_depan : data.biodata_gelar_depan,
        biodata_nama : data.biodata_nama,
        createdAt : data.createdAt,
        createdBy : data.createdBy,
        fileRef : data.fileRef,
        id : data.id,
        jamDatang : data.jamDatang,
        jamPulang : data.jamPulang,
        jenisKategori : data.jenisKategori,
        jenisizin : data.jenisizin,
        jeniskategori_uraian : data.jeniskategori_uraian,
        jenisizin_uraian : data.jenisizin_uraian,
        keterangan : data.keterangan,
        notif_keterangan : data.notif_keterangan,
        lat : data.lat,
        lng : data.lng,
        status : data.status,
        unit_kerja : data.unit_kerja,
        unit_kerja_uraian : data.unit_kerja_uraian,
      };


    },

    // ========================= TAMBAHAN =======================

      cari_data : function(){
          this.page_first = 1;
          this.getView();
      },
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
        Notify : function(message, positive, icon){
          this.$q.notify({
            message: message,
            color: positive,
            icon: icon,
            position : 'top',
            timeout: 500,
          })
        },

        indicatorColor : function(data){
          if (data == 0) {
            return {
              bg : `bg-orange-2`,
              status : false
            }  
          }
          else if(data == 1){
            return {
              bg : `bg-blue-1`,
              status : false
            }
          }
          else if (data == 2){
            return {
              bg : `bg-red-2`,
              status : true
            }
          }

        },



    // ========================= TAMBAHAN =======================
  },

  mounted () {
    this.form.unit_kerja = this.$store.state.unit_kerja
    this.getView();
  },
}
</script>



<style>
</style>





