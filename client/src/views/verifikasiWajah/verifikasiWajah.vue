<template>
  <div class="about" style="padding:15px">
    <q-card bordered class="my-card">
      <q-card-section class="bg-primary text-white">
        <div class="row">
          <div class="col-12 col-md-6">
            <div class="text-h6 h_titleHead">Verifikasi Wajah</div>
            <div class="text-subtitle2">Verikasi Wajah</div>
          </div>
          <div class="col-12 col-md-2"></div>
          <div class="col-12 col-md-4">
            <div class="row">
              <q-input v-model="cari_value" @keyup="cari_data()" outlined square :dense="true" class="bg-white"
                style="width:90%" />
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
        <div class="row">

          <div class="col-12 col-md-8 inputFilterku">
            <span class="h_lable ">Unit Kerja</span>
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
                clearable
                outlined
                square
                :dense="true"
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
          <div class="col-12 col-md-4 inputFilterku">
            <span class="h_lable ">Status</span>
            <q-select
                v-model="filterku.is_private"
                @input="getView()"
                use-input
                hide-selected
                fill-input
                input-debounce="0"
                :options="opsiPrivate"
                option-value="id"
                option-label="value"
                emit-value
                map-options
                clearable
                outlined
                square
                :dense="true"
            />
          </div>
        </div>

        <hr class="hrpagin">
        <div class="tbl_responsive">

          <!-- =================================================== KONTENT =========================================================== -->
          <table width="100%">
            <tr class="h_table_head bg-blue-2">
              <th width="5%" class="text-center">No</th>
              <th width="30%" class="text-center">Nama/NIP</th>
              <th width="30%" class="text-center">Instansi</th>
              <th width="25%" class="text-center">Status</th>
              <th width="12%"></th>
            </tr>
            <tr v-for="(data, index) in list_data" :key="data.id"
              :class="'h_table_body ' + indicatorColor(data.status).bg">
              <td class="text-center">{{ index + 1 }}.</td>
              <td>
                {{ data.biodata_nama }} <br />
                <span class="h_nip">{{ data.nip }}</span>

              </td>
              <td>{{ data.unit_kerja_uraian }}</td>
              <td class="text-center">
                <q-badge
                  class="bg-blue-7"
                  style="height: 20px; min-width: 100px; align-items: center; justify-content: center;" v-if="data.private === 0 || data.private === '0' || data.private === null">
                  Non Private
                </q-badge>

                <q-badge
                  class="bg-red-7" style="height: 20px; min-width: 80px; align-items: center; justify-content: center;" v-else>
                  Private
                </q-badge>
              </td>
              <td class="text-center">
                <q-btn-group>
                  <q-btn @click="mdl_maps = true, selectData(data)" glossy color="blue" icon="search" class="tbl_btn">
                    <q-tooltip content-class="bg-blue-9" content-style="font-size: 13px">
                      Click untuk melihat Foto
                    </q-tooltip>
                  </q-btn>
                  <q-btn @click="selectData(data), setujui()" glossy color="light-green-8" icon="check" class="tbl_btn"
                    :disabled="indicatorColor(data.status).status">
                    <q-tooltip content-class="bg-light-green-8" content-style="font-size: 13px">
                      Setujui Data Ini
                    </q-tooltip>
                  </q-btn>
                  <q-btn @click="mdl_hapus = true, selectData(data)" glossy color="negative" icon="block"
                    class="tbl_btn" :disabled="indicatorColor(data.status).status">
                    <q-tooltip content-class="bg-red" content-style="font-size: 13px">
                      Click untuk mengembalikan usulan ini
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
          <span class="h_panation">&nbsp; {{ page_first }} - {{ page_last }} &nbsp;</span>
          <q-btn @click="btn_next" glossy color="orange" icon="skip_next" class="paginate_btn" />
        </div>
        <br>
      </q-card-section>
    </q-card>





    <!-- =================================================== MODAL =========================================================== -->





    <!-- ================================================ MODAL PENGEMBALIAN ================================================ -->
    <q-dialog v-model="mdl_hapus" persistent>
      <q-card class="mdl-md">
        <q-card-section class="bg-red-5">
          <div class="text-h6 h_modalhead">Komentar Pengembalian</div>
        </q-card-section>


        <q-card-section class="q-pt-none">

          <br>
          <q-input outlined hint="Tulis alasan penolakan" type="textarea" v-model="form.keterangan">
          </q-input>

        </q-card-section>

        <q-card-actions class="bg-grey-4 mdl-footer" align="right">
          <q-btn color="primary" @click="kembalikan()" label="Simpan" />
          <q-btn label="Batal" color="negative" v-close-popup />
        </q-card-actions>

      </q-card>
    </q-dialog>

    <!-- ================================================ MODAL PENGEMBALIAN ================================================ -->

    <!-- ================================================= MODAL CHAT ================================================ -->
    <q-dialog v-model="mdl_chat" persistent>
      <q-card class="mdl-md">
        <q-card-section class="bg-light-green-8">
          <div class="text-h6 h_modalhead">Komentar Keterangan</div>
        </q-card-section>


        <q-card-section class="q-pt-none">


          <div class="q-pa-md row justify-center">
            <div style="width: 100%; max-width: 90%">
              <q-chat-message name="me" avatar="https://cdn.quasar.dev/img/avatar1.jpg" :text="['hey, how are you?']"
                sent />

              <q-chat-message name="Jane" avatar="https://cdn.quasar.dev/img/avatar2.jpg"
                :text="['doing fine, how r you?']" />


            </div>
          </div>

          <input type="file" ref="file" style="display: none">
          <q-input rounded outlined hint="Tulis Pesan">
            <template v-slot:append>
              <q-icon @click="$refs.file.click()" name="attach_file" />
            </template>
          </q-input>




        </q-card-section>

        <q-card-actions class="bg-grey-4 mdl-footer" align="right">
          <q-btn :loading="btn_add" color="primary" label="Simpan" />
          <q-btn label="Batal" color="negative" v-close-popup />
        </q-card-actions>

      </q-card>
    </q-dialog>
    <!-- ================================================= MODAL CHAT ================================================ -->

    <!-- ================================================= MODAL MAPS ================================================ -->
    <q-dialog v-model="mdl_maps" persistent>
      <q-card class="mdl-md">
        <q-card-section class="bg-primary">
          <div class="text-h6 h_modalhead">Detil Foto</div>
        </q-card-section>


        <q-card-section class="q-pt-none">
          <br>
          <span>
            <b>Keterangan : </b>
            {{ form.keterangan }}
            <br> <br>
            <b>Di Verifikasi : </b>
            {{ form.verificationBy }}

          </span>
          <br><br>
          <div class="text-center">
            <q-img :src="file_path + form.file" style="height: auto; width: 100%" />
          </div>

        </q-card-section>

        <q-card-actions class="bg-grey-4 mdl-footer" align="right">
          <q-btn label="Kembali" color="negative" v-close-popup />
        </q-card-actions>


      </q-card>
    </q-dialog>
    <!-- ================================================= MODAL MAPS ================================================ -->


    <!-- ================================================= MODAL GAMBAR ================================================ -->
    <q-dialog v-model="mdl_img" persistent>
      <q-card class="mdl-md">
        <q-card-section class="bg-primary">
          <div class="text-h6 h_modalhead">{{ form.uraian }}</div>
        </q-card-section>


        <q-card-section class="q-pt-none">
          <br>

          <q-img :src="$store.state.url.URL_APP + 'uploads/' + form.file">
            <template v-slot:loading>
              <div class="text-yellow">
                <q-spinner-ios />
                <div class="q-mt-md">Loading...</div>
              </div>
            </template>
          </q-img>

        </q-card-section>

        <q-card-actions class="bg-grey-4 mdl-footer" align="right">
          <q-btn label="Kembali" color="negative" v-close-popup />
        </q-card-actions>


      </q-card>
    </q-dialog>
    <!-- ================================================= MODAL GAMBAR ================================================ -->


    <!-- =================================================== MODAL =========================================================== -->




  </div>
</template>


<script>


import UMUM from '../../library/umum'
import FETCHING from '../../library/fetching'


export default {
  data() {
    return {


      form: {
        id: '',
        uraian: '',
        keterangan: '',
        file: null,
        file_old: '',
        unit_kerja: '',
        status: 0,
      },

      filterku: {
        unit_kerja_id: '',
        is_private: 0,
      },

      opsiPrivate: [
        { id: 0, value: 'Non Private'},
        { id: 1, value: 'Private'},
      ],

      list_data: [],


      page_first: 1,
      page_last: 0,
      cari_value: "",
      cek_load_data: true,
      file_path: this.$store.state.url.URL_APP + "uploads/",

      mdl_add: false,
      mdl_edit: false,
      mdl_hapus: false,
      mdl_chat: false,
      mdl_maps: false,
      btn_add: false,
      mdl_img: false,


      UMUM: UMUM,
      FETCHING : FETCHING,
    }
  },
  methods: {


    getView: function () {
      this.$store.commit("shoWLoading");
      fetch(this.$store.state.url.URL_presensi_settingProfile + "viewData", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "kikensbatara " + localStorage.token
        },
        body: JSON.stringify({
          data_ke: this.page_first,
          cari_value: this.cari_value,
          unit_kerja_id: this.filterku.unit_kerja_id,
          is_private: this.filterku.is_private,
        })
      })
        .then(res => res.json())
        .then(res_data => {
          this.list_data = res_data.data;
          this.page_last = res_data.jml_data;
          this.$store.commit("hideLoading");
          // console.log(res_data);
        });
    },

    setujui: async function () {
      await this.UMUM.confirmx('anda akan verifikasi data ini?')
      fetch(this.$store.state.url.URL_presensi_settingProfile + "changeData", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "kikensbatara " + localStorage.token
        },
        body: JSON.stringify({
          id: this.form.id,
          status: 1,
          keterangan: "Data telah diverifikasi",
        })
      }).then(res_data => {
        this.Notify('Sukses mengonfirmasi Usulan', 'primary', 'check_circle_outline');
        this.getView();
      });
    },

    kembalikan: async function () {

      fetch(this.$store.state.url.URL_presensi_settingProfile + "changeData", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "kikensbatara " + localStorage.token
        },
        body: JSON.stringify({
          id: this.form.id,
          status: 2,
          keterangan: this.form.keterangan,
        })
      }).then(res_data => {
        this.Notify('Sukses mengembalikan usulan', 'negative', 'check_circle_outline');
        this.getView();
      });
    },

    selectData: function (data) {
      this.form.id = data.id;
      this.form.uraian = data.uraian;
      this.form.keterangan = data.keterangan;
      this.form.file = data.file;
      this.form.file_old = data.file;
      this.form.unit_kerja = data.unit_kerja;
      this.form.verificationBy = data.verificationBy;
      this.form.status = data.status;
    },

    // ====================================== PAGINATE ====================================
    Notify: function (message, positive, icon) {
      this.$q.notify({
        message: message,
        color: positive,
        icon: icon,
        position: 'top',
        timeout: 500,
      })
    },
    btn_prev: function () {
      this.cek_load_data = true;
      if (this.page_first > 1) {
        this.page_first--
      } else {
        this.page_first = 1;
      }
      this.getView();
    },

    btn_next: function () {
      if (this.page_first >= this.page_last) {
        this.page_first == this.page_last
      } else {
        this.page_first++;
      }
      this.getView();
    },

    cari_data: function () {
      this.page_first = 1;
      this.getView();
    },

    indicatorColor: function (data) {
      if (data == 0) {
        return {
          bg: `bg-orange-2`,
          status: false
        }
      }
      else if (data == 1) {
        return {
          bg: `bg-blue-1`,
          status: false
        }
      }
      else if (data == 2) {
        return {
          bg: `bg-red-2`,
          status: true
        }
      }

    },

    filterUnitKerja: function (val, update, abort) {
      update(() => {
        if (val === '') { }
        else { FETCHING.postUnitKerjaAuto(val) }
      })
    },


    // ====================================== PAGINATE ====================================







  },

  mounted() {

    this.filterku.unit_kerja_id = this.$store.state.unit_kerja
    this.FETCHING.postUnitKerjaAuto('', this.filterku.unit_kerja_id)
    this.getView();





  },
}
</script>
