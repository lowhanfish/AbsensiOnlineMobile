<template>
  <div class="about" style="padding:15px">
    <q-card bordered class="my-card">
      <q-card-section class="bg-primary text-white">
        <div class="row">
          <div class="col-12 col-md-6">
            <div class="text-h6  h_titleHead">Laporan Harian</div>
            <div class="text-subtitle2">Tanggal {{filterku.date}}-{{filterku.bulan}}-{{filterku.tahun}}</div>
          </div>
          <div class="col-12 col-md-2"></div>
          <div class="col-12 col-md-4">
            <!-- <q-input outlined square :dense="true" class="bg-white">
              <template v-slot:after >
                <q-btn @click="alert = true" dense flat icon="add" />
              </template>
            </q-input> -->
            

            <div class="row">
              <q-input outlined square :dense="true" class="bg-white" style="width:85%" disabled/>
              <q-btn glossy class="bg-light-blue-10" @click="alert = true" dense flat icon="print" style="width:15%"/>
            </div>

          </div>
        </div>
      </q-card-section>

      <q-separator dark inset />

      <q-card-section>
        
        <div class="row">

          <div class="col-12 col-md-8 inputFilterku">
            <span class="h_lable ">Sub Unit Kerja</span>
            <q-select
                v-model="filterku.unit_kerja_id"
                @input="getView()"
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
             <span class="h_lable ">Pilih Tanggal</span>
            <!-- <div class="row text-white">
              <q-input outlined square :dense="true" class="bg-white" style="width:85%" disabled/>
              <q-btn glossy class="bg-light-blue-10" @click="alert = true" dense flat icon="add" style="width:15%"/>
            </div> -->

            <q-input outlined square :dense="true" v-model="filterku.tglFull" mask="date" :rules="['filterku.tglFull']" disabled>
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                    <q-date v-model="filterku.tglFull">
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
              <tr class="h_table_head bg-blue-2">
                <th width="5%" class="text-center">No</th>
                <th width="25%">
                  NAMA
                </th>
                <th width="10%" class="text-center">Datang</th>
                <th width="10%" class="text-center">Pulang</th>
                <th width="10%" class="text-center">Status</th>
                <th width="40%">Keterangan</th>
              </tr>
              <tr class="h_table_body" v-for="(data, index) in list_data" :key="index">
                <td class="text-center">{{index+1}}.</td>
                <td>{{UMUM.namaLengkap(data.gelar_depan, data.nama, data.gelar_belakang)}}</td>
                <td class="text-center">{{data.jamDatang}}</td>
                <td class="text-center">{{data.jamPulang}}</td>
                <td class="text-center" :style="'color :'+UMUM.statusKehadiran(data.status_id)"><b>{{data.status_uraian}}</b></td>
                <td>{{data.presensi_keterangan}}</td>
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





          <!-- =================================================== MODAL =========================================================== -->
              <q-dialog v-model="alert" persistent>
                <q-card class="mdl-md">
                  <q-card-section class="bg-primary">
                    <div class="text-h6 h_modalhead">Simpan Data</div>
                  </q-card-section>

                  <q-card-section class="q-pt-none">
                        <br>
                        <span class="h_lable ">Input Nama</span>
                        <q-input outlined square :dense="true" class="bg-white margin_btn" /> 

                        <span class="h_lable ">Input Nama</span>
                        <q-select v-model="model" :options="inputSelect" option-value="id" option-label="nama" outlined square :dense="true" class="bg-white margin_btn"/>
                        <!-- <q-input outlined square :dense="true" class="bg-white margin_btn" />  -->

                        <span class="h_lable ">Cari File</span>
                        <q-file outlined square :dense="true" class="bg-white margin_btn">
                          <template v-slot:prepend>
                            <q-icon name="attach_file" />
                          </template>
                        </q-file>
                  </q-card-section>

                  <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                    
                      <q-btn :loading="simpan1" color="primary" @click="simulateProgress(1)" label="Simpan" />
                      <q-btn label="Batal" color="negative" v-close-popup />
             
                  </q-card-actions>
                </q-card>
              </q-dialog>




          <!-- =================================================== MODAL =========================================================== -->




  </div>
</template>


<script>

import UMUM from         '../../library/umum'
import FETCHING from         '../../library/fetching'

export default {
  data() {
    return {
      list_data : [],

      page_first: 1,
      page_last: 0,
      cari_value: "",
      cek_load_data : true,

      filterku : {
        unit_kerja_id : '',
        date : '',
        bulan : '',
        tahun : '',
        tglFull: '',
      },

      UMUM :UMUM,
      FETCHING : FETCHING,




      alert: false,
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
      fetch(this.$store.state.url.URL_presensi_lapHarian + "view", {
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
              cari_value: this.cari_value
          })
      })
          .then(res => res.json())
          .then(res_data => {
            this.$store.commit("hideLoading");
            this.list_data = res_data
              console.log(res_data);
      });
    },


    searchByDate(){
      var datex = this.filterku.tglFull

      var date = datex.split('/')

      // console.log(datex)

      this.filterku.tahun = date[0];
      this.filterku.bulan = parseInt(date[1]);
      this.filterku.date = date[2];
      this.getView()
    },





    filterUnitKerja : function (val, update, abort) {
        update(() => {
          if (val === '') {}
          else {FETCHING.postUnitKerjaAuto(val)}
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
    }
  },


  mounted() {

    const d = new Date();

    this.filterku.tglFull = d.getFullYear()+'/'+(parseInt(d.getMonth())+1)+'/'+d.getDate();
    
    this.filterku.tahun = d.getFullYear();
    this.filterku.bulan = d.getMonth()+1;
    this.filterku.date = d.getDate()

    // console.log(tahun+"-"+bulan+"-"+date)




    this.filterku.unit_kerja_id = this.$store.state.unit_kerja
    this.FETCHING.postUnitKerjaAuto('', this.filterku.unit_kerja_id)
    this.getView()




  },
}
</script>




