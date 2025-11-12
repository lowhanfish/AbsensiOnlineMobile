<template>
  <div class="about" style="padding:15px">
    <q-card bordered class="my-card">
      <q-card-section class="bg-primary text-white">
        <div class="row">
          <div class="col-12 col-md-6">
            <div class="text-h6  h_titleHead">Laporan Mingguan</div>
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
              <q-input outlined square :dense="true" class="bg-white" style="width:85%"/>
              <q-btn glossy class="bg-light-blue-10" @click="alert = true" dense flat icon="add" style="width:15%"/>
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
                <th width="25%">NAMA</th>
                <th width="20%">NIP</th>
                <th width="40%">Instansi</th>
                <th width="10%"></th>
              </tr>
              <tr class="h_table_body">
                <td class="text-center">1.</td>
                <td>Kiken Sukma Batara, S.Si.,MT</td>
                <td>192.168.1.1</td>
                <td>Dinas Komunikasi Informatika dan Persandian</td>
                <td class="row justify-center">
                  <q-btn-group>
                    <q-btn glossy color="primary" icon="timeline" class="tbl_btn" />
                    <q-btn glossy color="orange" icon="visibility" class="tbl_btn" />
                    <q-btn glossy color="negative" icon="update" class="tbl_btn"/>
                  </q-btn-group>

                </td>
              </tr>
              <tr class="h_table_body">
                <td class="text-center">2.</td>
                <td>Umar Papua, S.Si</td>
                <td>192.168.1.2</td>
                <td>Dinas Komunikasi Informatika dan Persandian</td>
                <td class="row justify-center">
                  <q-btn-group>
                    <q-btn glossy color="primary" icon="timeline" class="tbl_btn" />
                    <q-btn glossy color="orange" icon="visibility" class="tbl_btn" />
                    <q-btn glossy color="negative" icon="update" class="tbl_btn"/>
                  </q-btn-group>

                </td>
              </tr>
            </table>

          <!-- =================================================== KONTENT =========================================================== -->
        </div>
        <hr class="hrpagin">
        <br>
        <div class="text-center">
          <q-btn glossy color="orange" icon="skip_previous" class="paginate_btn" />
            <span class="h_panation">&nbsp; 1 dari 10 &nbsp;</span>
          <q-btn glossy color="orange" icon="skip_next" class="paginate_btn" />
        </div>
        <br>
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
export default {
  data() {
    return {
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
}
</script>




