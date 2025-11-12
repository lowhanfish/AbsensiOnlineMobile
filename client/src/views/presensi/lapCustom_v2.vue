<template>
  <div class="about" style="padding:15px">
    <q-card bordered class="my-card">
      <q-card-section class="bg-primary text-white">
        <div class="row">
          <div class="col-12 col-md-6">
            <div class="text-h6  h_titleHead">Laporan Custom V2</div>
            <div class="text-subtitle2">Tanggal {{filterku.date}}-{{filterku.bulan}}-{{filterku.tahun}}</div>
          </div>
          <div class="col-12 col-md-2"></div>
          <div class="col-12 col-md-4">
            <!-- <q-input outlined square :dense="true" class="bg-white">
              <template v-slot:after >
                <q-btn @click="mdl_printing = true" dense flat icon="add" />
              </template>
            </q-input> -->
            

            <div class="row">
              <q-input outlined square :dense="true" class="bg-white" style="width:85%" disabled/>
              <q-btn glossy class="bg-light-blue-10" @click="mdl_printing = true" dense flat icon="print" style="width:15%"/>
            </div>

          </div>
        </div>
      </q-card-section>

      <q-separator dark inset />

      <q-card-section>
        
        <div class="row">
<!-- option-label="unit_kerja" -->
          <div class="col-12 col-md-4 inputFilterku">
            <span class="h_lable ">Sub Unit Kerja</span>
            <q-select
                v-model="filterku.unit_kerja_id"
                @input="val => { getView(); showChannel(val) }"
                use-input
                hide-selected
                fill-input
                input-debounce="0"
                :options="$store.state.list_unit_kerja_auto"
                option-value="id"
                option-label="unit_kerja"
                @filter="filterUnitKerja"
                emit-value
                map-options
                clearable outlined square :dense="true"
            >
                <template v-slot:no-option>
                <q-item>
                    <q-item-section class="text-grey">
                    Tidak ditemukan
                    </q-item-section>
                </q-item>
                </template>
            </q-select>
          </div>

          <!-- <div class="col-12 col-md-2 inputFilterku"></div> -->

           <div class="col-12 col-md-4 inputFilterku">
             <span class="h_lable ">Dari Tanggal</span>
            <!-- <div class="row text-white">
              <q-input outlined square :dense="true" class="bg-white" style="width:85%" disabled/>
              <q-btn glossy class="bg-light-blue-10" @click="mdl_printing = true" dense flat icon="add" style="width:15%"/>
            </div> -->

            <q-input outlined square :dense="true" v-model="filterku.waktuFirst" mask="date" :rules="['filterku.waktuFirst']" disabled>
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                    <q-date v-model="filterku.waktuFirst">
                      <div class="row items-center justify-end">
                        <q-btn @click="searchByDate()" v-close-popup label="Pilih" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>


          </div>


          <div class="col-12 col-md-4 inputFilterku">
             <span class="h_lable ">Sampai Tanggal</span>

            <q-input outlined square :dense="true" v-model="filterku.waktuLast" mask="date" :rules="['filterku.waktuLast']" disabled>
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                    <q-date v-model="filterku.waktuLast">
                      <div class="row items-center justify-end">
                        <q-btn @click="searchByDate()" v-close-popup label="Pilih" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>


          </div>


          
        </div>

        <hr class="hrpagin">

   

        <!-- <pre>{{list_data}}</pre> -->

        <div class="tbl_responsive">
          <!-- =================================================== KONTENT =========================================================== -->
            <table width="100%">
              <tr class="h_table_head">
                <th rowspan="2" width="5%" class="text-center">No</th>
                <th rowspan="2" width="20%" class="text-center">NAMA</th>
                <th rowspan="2" width="40%" class="text-center">JABATAN</th>
                <th colspan="3" class="text-center">JUMLAH</th>
                <th colspan="3" class="text-center">PERSENTASE</th>
                <th rowspan="2" width="5%" class="text-center">HK</th>
              </tr>


              <tr class="h_table_head">
                <th width="5%" class="text-center text-primary">H</th>
                <th width="5%" class="text-center text-red">A</th>
                <th width="5%" class="text-center text-green">I</th>
                <th width="5%" class="text-center text-primary">% (H)</th>
                <th width="5%" class="text-center text-red">% (A)</th>
                <th width="5%" class="text-center text-green">% (I)</th>
              </tr>
              <tr class="h_table_body" v-for="(data, index) in list_data" :key="index">
                <td class="text-center">{{index+1}}.</td>
                <td>
                  <a href="javascript:void(0);" class="clear_underline" @click="selectData(data), mdl_detile=true">
                    {{UMUM.namaLengkap(data.gelar_depan, data.nama, data.gelar_belakang)}} <br>
                  </a>
                  <span class="h_nip">NIP. {{data.nip}}</span>
                </td>
                <td class="">{{data.nm_jabatan}}</td>
                <td class="text-center text-primary">{{data.hadir}}</td>
                <td class="text-center text-red">{{data.tanpaKeterangan}}</td>
                <td class="text-center text-green">{{data.izin}}</td>
                <td class="text-center">{{pembulatan(data.persentaseHadir)}}%</td>
                <td class="text-center">{{pembulatan(data.persentaseTanpaKeterangan)}}%</td>
                <td class="text-center">{{pembulatan(data.persentaseIzin)}}%</td>
                <td class="text-center"><strong>{{data.jmlHariKerja}}</strong></td>
              </tr>

            </table>

          <!-- =================================================== KONTENT =========================================================== -->
        </div>
        <hr class="hrpagin">
        <br>
        <!-- <div class="text-center">
          <q-btn glossy color="orange" icon="skip_previous" class="paginate_btn" />
            <span class="h_panation">&nbsp; 1 dari 10 &nbsp;</span>
          <q-btn glossy color="orange" icon="skip_next" class="paginate_btn" />
        </div>
        <br> -->
      </q-card-section>
    </q-card>





    <!-- =================================================== MODAL PRINT =========================================================== -->
        <q-dialog v-model="mdl_printing" persistent>
          <q-card class="mdl-lg">
            <q-card-section class="bg-primary">
              <div class="text-h6 h_modalhead">Simpan Data</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
                  <br>
                  
                  <div id="printMe">

                    <div class="" style="position: absolute; left: 50%; transform: translate(-50%, -50%);">
                      <div class="text-center" style="padding-top:30%">
                        <div style="background-color:pink; float:left; " >
                          <img src="img/icons/logo_konsel.png" style="width:75px; margin-left:-150px" />
                        </div>
                        <div class="text-center" style="float:left; margin:0px !important">
                          <span class="satux">PEMERINTAH KABUPATEN KONAWE SELATAN</span> <br>
                          <span class="duax">BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA</span> <br>
                          <span class="tigax">Jl. Poros Andoolo No.1 Telp. (0408) 22600</span>
                        </div>
                      </div>

                    </div>
                    <div class="text-center" style="padding-top:100px">
                      <span class="tigax">REKAP DAFTAR HADIR ABSEN ONLINE</span> <br>
                      <span class="tigax">{{uraian.unit_kerja}}</span> <br>
                      <span class="tigax">DATA PER KEADAAN : {{filterku.waktuFirst}} S/D {{filterku.waktuLast}}</span>
                    </div>
                      
                    <div class="tbl_responsive">
                    <br>
                    <!-- =================================================== KONTENT =========================================================== -->
                      <table width="100%">
                        <tr class="duav">
                          <th rowspan="2" width="5%" class="text-center">No</th>
                          <th rowspan="2" width="25%" class="text-center">NAMA</th>
                          <th rowspan="2" width="35%" class="text-center">JABATAN</th>
                          <th colspan="3" class="text-center">JUMLAH</th>
                          <th colspan="3" class="text-center">PERSENTASE</th>
                          <th rowspan="2" width="5%" class="text-center">HK</th>
                        </tr>

                        <tr class="duav">
                          <th width="5%" class="text-center text-primary">H</th>
                          <th width="5%" class="text-center text-red">A</th>
                          <th width="5%" class="text-center text-green">I</th>
                          <th width="5%" class="text-center text-primary">% (H)</th>
                          <th width="5%" class="text-center text-red">% (A)</th>
                          <th width="5%" class="text-center text-green">% (I)</th>
                        </tr>

                        <tr class="duaw" v-for="(data, index) in list_data" :key="index">
                          <td class="text-center">{{index+1}}.</td>
                          <td>
                            {{UMUM.namaLengkap(data.gelar_depan, data.nama, data.gelar_belakang)}} <br>
                            <span class="duaw_nip">NIP. {{data.nip}}</span>
                          </td>
                          <td class="">{{data.nm_jabatan}}</td>
                          <td class="text-center text-primary">{{data.hadir}}</td>
                          <td class="text-center text-red">{{data.tanpaKeterangan}}</td>
                          <td class="text-center text-green">{{data.izin}}</td>
                          <td class="text-center">{{pembulatan(data.persentaseHadir)}}%</td>
                          <td class="text-center">{{pembulatan(data.persentaseTanpaKeterangan)}}%</td>
                          <td class="text-center">{{pembulatan(data.persentaseIzin)}}%</td>
                          <td class="text-center"><strong>{{data.jmlHariKerja}}</strong></td>
                        </tr>

                      </table>

                    <!-- =================================================== KONTENT =========================================================== -->
                  </div>



                  </div>





            </q-card-section>

            <q-card-actions class="bg-grey-4 mdl-footer" align="right">
              
                <q-btn color="primary" @click="print()" label="Cetak" />
                <q-btn label="Batal" color="negative" v-close-popup />
       
            </q-card-actions>
          </q-card>
        </q-dialog>
    <!-- =================================================== MODAL PRINT =========================================================== -->
    <!-- =================================================== MODAL DETILE =========================================================== -->
        <q-dialog v-model="mdl_detile" persistent>
          <q-card class="mdl-lg">
            <q-card-section class="bg-primary">
              <div class="text-h6 h_modalhead">Simpan Data</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
                  <br>
                  
                  <div id="printMe">

                    <div class="" style="position: absolute; left: 50%; transform: translate(-50%, -50%);">
                      <div class="text-center" style="padding-top:30%">
                        <div style="background-color:pink; float:left; " >
                          <img src="img/icons/logo_konsel.png" style="width:75px; margin-left:-150px" />
                        </div>
                        <div class="text-center" style="float:left; margin:0px !important">
                          <span class="satux">PEMERINTAH KABUPATEN KONAWE SELATAN</span> <br>
                          <span class="duax">BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA</span> <br>
                          <span class="tigax">Jl. Poros Andoolo No.1 Telp. (0408) 22600</span>
                        </div>
                      </div>

                    </div>
                    <div class="text-center" style="padding-top:100px">
                      <span class="tigax">DETILE DAFTAR HADIR ABSEN ONLINE</span> <br>
                      <span class="tigax">{{uraian.unit_kerja}}</span> <br>
                    </div>
                      
                    <div class="tbl_responsive">
                    <!-- =================================================== KONTENT =========================================================== -->
                      <table width="100%">
                        <tr class="h_table_head bg-blue-2">
                          <th width="5%" class="text-center">
                            <input type="checkbox" v-model="check_all" @change="check_uncheck()">
                          </th>
                          <th width="25%">
                            NAMA
                          </th>
                          <th width="10%" class="text-center">Datang</th>
                          <th width="10%" class="text-center">Pulang</th>
                          <th width="10%" class="text-center">Status</th>
                          <th width="40%">Keterangan</th>
                        </tr>
                        <tr class="h_table_body" v-for="(data, index) in list_data_detile" :key="index">
                          <td class="text-center">
                            <input type="checkbox" v-model="data.inject">
                          </td>
                          <td>
                            <a href="javascript:void(0);" class="clear_underline" @click="selectdata_absen(data), mdl_detile_edit=true">
                              {{data.dd}}-{{data.mm}}-{{data.yy}}
                            </a>  
                          
                          </td>
                          <td class="text-center">{{data.jamDatang}}</td>
                          <td class="text-center">{{data.jamPulang}}</td>
                          <td class="text-center" :style="'color :'+UMUM.statusKehadiran(data.status)"><b v-if="data.ket != 'LIBUR'">{{UMUM.statusKehadiranKet(data.status)}}</b></td>
                          <td>
                            <b>{{data.ket}}</b>
                            {{data.ket_libur}}

                            <!-- <a v-if="data.ket == 'LIBUR'" href="javascript:void(0);" @click="clearLibur(data)">
                              <q-icon name="clear" style="color:red" />
                            </a> -->

                           
                          </td>
                        </tr>

                      </table>

                    <!-- =================================================== KONTENT =========================================================== -->
                  </div>



                  </div>





            </q-card-section>

            <q-card-actions class="bg-grey-4 mdl-footer" align="right">
              
                <q-btn color="light-green-6" @click="editDataDetileAll()" label="Update" />
                <q-btn color="primary" @click="print()" label="Cetak" />
                <q-btn label="Batal" color="negative" v-close-popup />
       
            </q-card-actions>
          </q-card>
        </q-dialog>
    <!-- =================================================== MODAL DETILE =========================================================== -->


    <!-- ================================================= MODAL DETILE EDIT ================================================ -->
      <q-dialog v-model="mdl_detile_edit" persistent>
        <q-card class="mdl-sm">
          <q-card-section class="bg-orange">
            <div class="text-h6 h_modalhead">Edit Data</div>
          </q-card-section>

          <form @submit.prevent="editDataDetile">

            <q-card-section class="q-pt-none">
                  <br>
                  <span class="h_lable ">Jam Datang</span>
                  <q-input v-model="data_absen.jamDatang" outlined square :dense="true" class="bg-white margin_btn" /> 
                  <span class="h_lable ">Jam Pulang</span>
                  <q-input v-model="data_absen.jamPulang" outlined square :dense="true" class="bg-white margin_btn" /> 


            </q-card-section>

            <q-card-actions class="bg-grey-4 mdl-footer" align="right">
              
                <q-btn color="primary" @click="editDataDetile()" label="Perbaharui" />
                <q-btn label="Batal" color="negative" v-close-popup />
        
            </q-card-actions>
          </form>
        </q-card>
      </q-dialog>
    <!-- ================================================= MODAL DETILE EDIT ================================================ -->


    



  </div>
</template>


<script>

import UMUM from         '../../library/umum'
import FETCHING from         '../../library/fetching'

export default {
  data() {
    return {
      list_data : [],
      list_data_detile : [],

      page_first: 1,
      page_last: 0,
      cari_value: "",
      cek_load_data : true,


      form : {
        NPWP: "",
        TMT_PNS: "",
        agama: "",
        alamat: "",
        email: "",
        gelar_belakang: "",
        gelar_depan: "",
        gol: "",
        hadir: "",
        id: "",
        izin: "",
        jabatan: "",
        jenis_kelamin: "",
        jmlHariKerja: "",
        kontak: "",
        metode_absen: "",
        nama: "",
        nip: "",
        nm_jabatan: "",
        no_karpeg: "",
        pendidikan_ahir_jurusan: "",
        persentaseHadir: "",
        persentaseIzin: "",
        persentaseTanpaKeterangan: "",
        status_keluarga: "",
        tanpaKeterangan: "",
        tempat_lahir: "",

      },

      data_absen : {
        id_absen : "",
        dd : "",
        mm : "",
        yy : "",
        full : "",
        ket : "",
        ket_libur : "",
        keterangan : "",
        jeniskategori_uraian : "",
        jamDatang : "",
        jamPulang : "",
        status : "",
        nip : '',
      },

      filterku : {
        unit_kerja_id : '',
        date : '',
        bulan : '',
        tahun : '',
        waktuFirst: '',
        waktuLast : '',
        nip : '',
      },

      uraian : {
        unit_kerja : '',
      },

      UMUM :UMUM,
      FETCHING : FETCHING,

      check_all : true,


      mdl_printing: false,
      mdl_detile : false,
      mdl_detile_edit : false,

      simpan1: false,
      model :'',
      inputSelect : [
        {id : '1', nama : 'kiken', alamat : 'beringin'},
        {id : '2',nama : 'Alung', alamat : 'Anawai'},
      ]
    }
  },
  methods: {

    getView : function(){
      this.$store.commit("shoWLoading");
      fetch(this.$store.state.url.URL_presensi_lapCustom + "view", {
          method: "POST",
          headers: {
          "content-type": "application/json",
          authorization: "kikensbatara " + localStorage.token
          },
          body: JSON.stringify({
              date : this.filterku.date,
              bulan : this.filterku.bulan,
              tahun : this.filterku.tahun,
              unit_kerja_id : this.filterku.unit_kerja_id,
              data_ke: this.page_first,
              cari_value: this.cari_value,

              waktuFirst: this.filterku.waktuFirst,
              waktuLast: this.filterku.waktuLast,

          })
      })
          .then(res => res.json())
          .then(res_data => {
            this.$store.commit("hideLoading");
            this.list_data = res_data
              // console.log(res_data);
      });
    },
    

    selectData : function(data){

        this.form.NPWP = data.NPWP ;
        this.form.TMT_PNS = data.TMT_PNS ;
        this.form.agama = data.agama ;
        this.form.alamat = data.alamat ;
        this.form.email = data.email ;
        this.form.gelar_belakang = data.gelar_belakang ;
        this.form.gelar_depan = data.gelar_depan ;
        this.form.gol = data.gol ;
        this.form.hadir = data.hadir ;
        this.form.id = data.id ;
        this.form.izin = data.izin ;
        this.form.jabatan = data.jabatan ;
        this.form.jenis_kelamin = data.jenis_kelamin ;
        this.form.jmlHariKerja = data.jmlHariKerja ;
        this.form.kontak = data.kontak ;
        this.form.metode_absen = data.metode_absen ;
        this.form.nama = data.nama ;
        this.form.nip = data.nip ;
        this.form.nm_jabatan = data.nm_jabatan ;
        this.form.no_karpeg = data.no_karpeg ;
        this.form.pendidikan_ahir_jurusan = data.pendidikan_ahir_jurusan ;
        this.form.persentaseHadir = data.persentaseHadir ;
        this.form.persentaseIzin = data.persentaseIzin ;
        this.form.persentaseTanpaKeterangan = data.persentaseTanpaKeterangan ;
        this.form.status_keluarga = data.status_keluarga ;
        this.form.tanpaKeterangan = data.tanpaKeterangan ;
        this.form.tempat_lahir = data.tempat_lahir ;



        this.data_absen.nip = data.nip;


        this.getViewList();


    },


    getViewList : function(){
      this.$store.commit("shoWLoading");
      fetch(this.$store.state.url.URL_presensi_lapCustom_v2 + "list", {
          method: "POST",
          headers: {
          "content-type": "application/json",
          authorization: "kikensbatara " + localStorage.token
          },
          body: JSON.stringify({
              nip : this.form.nip,
              waktuFirst: this.filterku.waktuFirst,
              waktuLast: this.filterku.waktuLast,

          })
      })
          .then(res => res.json())
          .then(res_data => {
            this.$store.commit("hideLoading");
            // console.log(res_data)

            var data = [];

            res_data.forEach(element => {

              element.nip = this.form.nip

              if (element.status == 2 && element.ket != "LIBUR") {
                element.inject = true
                element.jamDatang = this.randomNilai(null, '07', 30, 1)
                element.jamPulang = this.randomNilai(null, '15', 59, 30)
                
              } else {
                element.inject = false
              }


              data.push(element)
              
            });

            this.check_all = false

            console.log(data)


            this.list_data_detile = data
            //   console.log(list_data_detile);
      });
    },

    check_uncheck : function(){


      var res_data = this.list_data_detile
      var data = []


      if (this.check_all == true) {
  
        res_data.forEach(element => {


          element.jamDatang = this.randomNilai(null, '07', 30, 1)
          element.jamPulang = this.randomNilai(null, '15', 59, 30)
  
          if (element.ket == "LIBUR") {
            element.inject = false
          } else {
            element.inject = true
          }
  
          data.push(element)
  
        });


      } else {


        res_data.forEach(element => {
          element.inject = false
          data.push(element)
        });
        
      }


      // console.log(data)


      this.list_data_detile = data




    },

    editDataDetile : function(){

      fetch(this.$store.state.url.URL_presensi_lapCustom_v2 + "Update", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: "kikensbatara " + localStorage.token
          },
          body: JSON.stringify(this.data_absen)
      }).then(res_data => {
          this.Notify('Sukses Memperbaharui Data', 'primary', 'check_circle_outline');
          this.getViewList();
          this.mdl_detile_edit = false;
      });

    },

    editDataDetileAll : function(){
      // console.log(this.list_data_detile)

      fetch(this.$store.state.url.URL_presensi_lapCustom_v2 + "UpdateAll", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: "kikensbatara " + localStorage.token
          },
          body: JSON.stringify(this.list_data_detile)
      }).then(res_data => {
          this.Notify('Sukses Memperbaharui Data', 'primary', 'check_circle_outline');
          this.getViewList();
          this.mdl_detile_edit = false;
      });




    },

    selectdata_absen : function(data){
        this.data_absen.id_absen = data.id_absen;
        this.data_absen.dd = data.dd;
        this.data_absen.mm = data.mm;
        this.data_absen.yy = data.yy;
        this.data_absen.full = data.full;
        this.data_absen.ket = data.ket;
        this.data_absen.ket_libur = data.ket_libur;
        this.data_absen.keterangan = data.keterangan;
        this.data_absen.jeniskategori_uraian = data.jeniskategori_uraian;

        // this.data_absen.jamDatang = data.jamDatang;
        // this.data_absen.jamPulang = data.jamPulang;
        this.data_absen.jamDatang = this.randomNilai(data.jamDatang, '07', 30, 1)
        this.data_absen.jamPulang = this.randomNilai(data.jamPulang, '15', 59, 30)

        

        this.data_absen.status = data.status
    },

    clearLibur : function(data){

      fetch(this.$store.state.url.URL_presensi_lapCustom_v2 + "removeData", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: "kikensbatara " + localStorage.token
          },
          body: JSON.stringify(data)
      }).then(res_data => {
          this.Notify('Sukses Memperbaharui Data', 'primary', 'check_circle_outline');
          this.getViewList();
          this.mdl_detile_edit = false;
      });

    },


    searchByDate(){
      var waktuFirst = this.filterku.waktuFirst
      var waktuLast = this.filterku.waktuLast


      var date = waktuFirst.split('/')
      this.filterku.tahun = date[0];
      this.filterku.bulan = parseInt(date[1]);
      this.filterku.date = date[2];

      this.getView()
    },


    filterUnitKerja : function (val, update, abort) {
        update(() => {
          if (val === '') {}
            else {
            FETCHING.postUnitKerjaAuto(val)
            }
        })
    },


    simulateProgress (number) {
      // we set loading state
      this[`simpan${number}`] = true
      // simulate a delay
      setTimeout(() => {
        // we're done, we reset loading state
        this[`simpan${number}`] = false
      }, 3000)
    },


    async showChannel(val){
      // console.log(val)
      var data = await FETCHING.postUnitKerjaId('', val)
      this.uraian.unit_kerja = data[0].unit_kerja
    },




    print () {
      // Pass the element id here
      this.$htmlToPaper('printMe');
    },


    pembulatan : function(data){
      if (data == null || data == undefined || data == '') {
        return 0
      } else {
        // console.log('ASSSSSSSSSSSSSS');
        var angka = data;
        var hasil = angka.toFixed(1);
        return hasil
        
      }
    },

    randomNilai : function(value, jamx, menit_limit, menit_start){

        // var nilai_menit = Math.floor(Math.random() * menit_limit) + menit_start;
        var nilai_menit = Math.floor(Math.random() * (menit_limit - menit_start)) + menit_start;
        var menit = UMUM.addZeroFirst(nilai_menit);

        // var jamx = '07:';
        var jam = jamx+':'+menit;

        if (value == null || value == undefined || value == "") {
          return jam
        } else {
          return value
        }

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







  },


  mounted() {

    const d = new Date();

    // this.filterku.waktuFirst = d.getFullYear()+'/'+(d.getMonth()+1)+'/'+d.getDate()
    // this.filterku.waktuLast = d.getFullYear()+'/'+(d.getMonth()+1)+'/'+d.getDate()


    var tahun = d.getFullYear();
    var bulan = d.getMonth()+1;
    var date = d.getDate()

    var bulanModiv = ''

    this.filterku.waktuFirst = d.getFullYear()+'/'+"01"+'/'+"01"
    this.filterku.waktuLast = tahun+'/'+ UMUM.addZeroFirst(bulan) +'/'+UMUM.addZeroFirst(date)

    console.log(this.filterku.waktuFirst)
    
    this.filterku.tahun = tahun;
    this.filterku.bulan = bulan;
    this.filterku.date = date


    console.log(this.filterku.bulan)

    // console.log(tahun+"-"+bulan+"-"+date)




    this.filterku.unit_kerja_id = this.$store.state.unit_kerja
    this.FETCHING.postUnitKerjaAuto('', this.filterku.unit_kerja_id)

    this.showChannel(this.$store.state.unit_kerja)

    this.getView()






  },
}
</script>



<style>



</style>



