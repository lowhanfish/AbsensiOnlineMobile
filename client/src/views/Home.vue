<template>
  <div class="about " style="padding:15px">
    <q-card bordered class="my-card">
      <q-card-section class="bg-primary text-white">
        <div class="row">
          <div class="col-12 col-md-3">
            <div class="text-h6 h_titleHead">Home</div>
            <!-- <div class="text-subtitle2">by John Doe</div> -->
          </div>
          <div class="col-12 col-md-3">
            <div class="row frame_cari">
              <span class="h_lable1 ">Dari Tgl</span>
              <input type="date" class="inputbs" placeholder="sadas">
            </div>

          </div>
          <div class="col-12 col-md-3">
            <div class="row frame_cari">
              <span class="h_lable1 ">Sampai Tgl</span>
              <input type="date" class="inputbs" placeholder="sadas">
            </div>
          </div>
          <div class="col-12 col-md-3">
            <div class="row frame_cari">
              <span class="h_lable1 ">Pilih Instansi</span>
              <select name="" id="" class="inputbs">
                <option value="">Dinas Komunikasi Informatika dan Persandian</option>
              </select>
             </div>

          </div>
        </div>
      </q-card-section>

      <q-separator dark inset />

      <q-card-section class="biruSangatmudaGrad">

         <div class="row">
           <div class="col-12 col-md-3 frWidget">
             <div class="row shadow-5 frWidgetSub">
                <div class="col-4 frWidgetSub1 text-center bg-blue-9 row items-center justify-center">
                  <q-icon name="people" style="font-size:420%; color:white" />
                </div>
                <div class="col-8 frWidgetSub2 bg-blue-7">
                  <span class="frWidgetText1">Jml Pegawai</span> <br>
                  <span class="frWidgetText2">48</span>
                </div>
             </div>
           </div>
           <div class="col-12 col-md-3 frWidget ">
             <div class="row shadow-5 frWidgetSub">
                <div class="col-4 frWidgetSub1 text-center bg-light-green-9  row items-center justify-center">
                  <q-icon class="vertical-middle" name="check_circle_outline" style="font-size:420%; color:white" />
                </div>
                <div class="col-8 frWidgetSub2 bg-light-green-7">
                  <span class="frWidgetText1">Hadir</span> <br>
                  <span class="frWidgetText2">25</span>
                </div>
             </div>
           </div>
           <div class="col-12 col-md-3 frWidget ">
             <div class="row shadow-5 frWidgetSub">
                <div class="col-4 frWidgetSub1 text-center bg-deep-orange-7  row items-center justify-center">
                  <q-icon name="block" style="font-size:420%; color:white" />
                </div>
                <div class="col-8 frWidgetSub2 bg-deep-orange-4">
                  <span class="frWidgetText1">T. Ket</span> <br>
                  <span class="frWidgetText2">11</span>
                </div>
             </div>
           </div>
           <div class="col-12 col-md-3 frWidget">
             <div class="row shadow-5 frWidgetSub">
                <div class="col-4 frWidgetSub1 text-center bg-red-7  row items-center justify-center">
                  <q-icon name="error_outline" style="font-size:420%; color:white" />
                </div>
                <div class="col-8 frWidgetSub2 bg-red-4">
                  <span class="frWidgetText1">Izin</span> <br>
                  <span class="frWidgetText2">12</span>
                </div>
             </div>
           </div>
         </div>

         <div class="row">

           <div class="col-12 col-md-6 padding1-5">
             <div class="frameChart shadow-5">
               <div id="KehadiranPie" style="width:100%; height:400px;"></div>
             </div>
           </div>

           <div class="col-12 col-md-6 padding1-5">
             <div class="frameChart shadow-5">
               <div id="KehadiranApelPie" style="width:100%; height:400px;"></div>
             </div>
           </div>



         </div>






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
                        <q-file outlined v-model="model" square :dense="true" class="bg-white margin_btn">
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
export default {
  data() {
    return {
      alert: false,
      simpan1: false,
      model :'',
      inputSelect : [
        {id : '1', nama : 'kiken', alamat : 'beringin'},
        {id : '2',nama : 'Alung', alamat : 'Anawai'},
      ],
      date : '',
    }
  },
  methods: {
    simulateProgress (number) {
      // we set loading state
      this[`simpan${number}`] = true
      // simulate a delay
      setTimeout(() => {
        // we're done, we reset loading state
        this[`simpan${number}`] = false
      }, 3000)
    },

    KehadiranPie : function(){
      Highcharts.chart('KehadiranPie', {
      chart: {
          type: 'pie',
          backgroundColor: 'transparent'
      },
      title: {
          text: 'DATA PRESENSI KEHADIRAN'
      },
      tooltip: {
          pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      accessibility: {
          point: {
              valueSuffix: '%'
          }
      },
      plotOptions: {
      pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
              enabled: false
          },
          showInLegend: true
      }
      },
      series: [{
          name: 'Persentase',
          colorByPoint: true,
          data: [
            {
              name: 'Hadir',
              y: 52.08,
              color:'#1e88e5',
              // sliced: true,
              // selected: true
            }, 
            {
              name: 'Izin',
              y: 22.92,
              color:'#7cb342',
            },
            {
              name: 'Tanpa Keterangan',
              y: 25.00,
              color:'#ff8a65',
            },
          
          ]
        }]
      });



    },

    KehadiranApelPie : function(){
      

      Highcharts.chart('KehadiranApelPie', {
      chart: {
          type: 'pie',
          backgroundColor: 'transparent',
          options3d: {
              enabled: true,
              alpha: 45,
              beta: 0
          }
      },
      title: {
          text: 'DATA PRESENSI APEL'
      },
      accessibility: {
          point: {
              valueSuffix: '%'
          }
      },
      tooltip: {
          pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      plotOptions: {
          pie: {
              allowPointSelect: true,
              cursor: 'pointer',
              depth: 35,
              dataLabels: {
                  enabled: true,
                  format: '{point.name}'
              }
          }
          },
          series: [{
              type: 'pie',
              name: 'Persentase',
              data: [
                  {
                    name: 'Hadir',
                    y: 52.08,
                    color:'#1e88e5',
                    // sliced: true,
                    // selected: true
                  }, 
                  {
                    name: 'Izin',
                    y: 22.92,
                    color:'#7cb342',
                  },
                  {
                    name: 'Tanpa Keterangan',
                    y: 25.00,
                    color:'#ff8a65',
                  },
              ]
          }]
      });









    },



    

    async button(){
      await setTimeout(() => {
        console.log('ini query pembacaannya')
      }, 2000);
      console.log('telASO')
    }







  },

  mounted () {
    this.KehadiranPie();
    this.KehadiranApelPie();
    this.button();
  },
}
</script>




