<template>
  <div class="about" style="padding:15px">
    <q-card bordered class="my-card">
      <q-card-section class="bg-primary text-white">
        <div class="row">
          <div class="col-12 col-md-6">
            <div class="text-h6 h_titleHead">Jadual Apel</div>
            <div class="text-subtitle2">Jadual dan Lokasi Pelaksanaan</div>
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
                <th width="23%">Jenis Apel</th>
                <th width="30%">Lokasi Pelaksanaan</th>
                <th width="20%" class="text-center">Batas Absen</th>
                <th width="10%">Radius Absen</th>
                <th width="12%"></th>
              </tr>
              <tr v-for="(data, index) in list_data" :key="data.id" :class="'h_table_body '">
                <td class="text-center">{{index+1}}.</td>
                <td >{{data.jenisapel_uraian}}</td>
                <td >{{data.uraian}}</td>
                <td class="text-center">{{data.startAbsen}} - {{data.batasAbsen}} (WITA)</td>
                <td >{{data.rad}} M</td>
                
                <td class="text-center">
                  <q-btn-group>
                    <q-btn @click="mdl_maps = true, selectData(data)" glossy color="blue" icon="place" class="tbl_btn">
                      <q-tooltip content-class="bg-blue-9" content-style="font-size: 13px">
                        Click untuk melihat Maps
                      </q-tooltip>
                    </q-btn>
                    <q-btn @click="mdl_chat = true, selectData(data)" glossy color="light-green-8" icon="chat" class="tbl_btn">
                      <q-tooltip content-class="bg-green-9" content-style="font-size: 13px">
                        Click untuk melihat Data Lengkap
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
                    <div class="text-h6 h_modalhead">Simpan Data</div>
                  </q-card-section>

                    <form @submit.prevent="addData()">
                      <q-card-section class="q-pt-none">
                          <br>
                          <div class="row">
                            <div class="col-12 col-md-12 frame_cari">
                              <span class="h_lable ">Lokasi Kegiatan</span>
                              <q-input v-model="form.uraian" outlined square :dense="true" class="bg-white margin_btn" placeholder=""/>
                            </div>

                            <div class="col-12 col-md-6 frame_cari">
                              <span class="h_lable ">Jenis Apel</span>

                              <select v-model="form.jenisapel" class="inputbs margin_btn">
                                <option v-for="data in $store.state.list_ApleJenis" :key="data.id" :value="data.id">{{data.uraian}}</option>
                              </select>
                            </div>

                            <div class="col-12 col-md-6 frame_cari">
                              <span class="h_lable ">Tanggal Pelaksanaan</span>
                              
                              <q-input filled v-model="form.tgl" mask="date" :rules="['date']" outlined square :dense="true" class="bg-white margin_btn" >
                                <template v-slot:append>
                                  <q-icon name="event" class="cursor-pointer">
                                    <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                                      <q-date v-model="form.tgl">
                                        <div class="row items-center justify-end">
                                          <q-btn v-close-popup label="Close" color="primary" flat />
                                        </div>
                                      </q-date>
                                    </q-popup-proxy>
                                  </q-icon>
                                </template>
                              </q-input>



                            </div>
                            <div class="col-6 col-md-6 frame_cari">
                              <span class="h_lable ">Absen Mulai (jam)</span>
                              <q-input v-model="form.startAbsen" outlined square :dense="true" class="bg-white margin_btn" placeholder="07:30"/>

                            </div>
                            <div class="col-6 col-md-6 frame_cari">
                              <span class="h_lable ">Absen Selesai (jam)</span>
                              <q-input v-model="form.batasAbsen" outlined square :dense="true" class="bg-white margin_btn" placeholder="07:30"/>

                            </div>

                            

                            <div class="col-6 col-md-6 frame_cari">
                              <span class="h_lable ">Latitude</span>
                              <q-input v-model="form.lat" outlined square :dense="true" class="bg-white margin_btn" />
                              <q-btn @click="mdl_maps_tambah = true" color="primary" size="sm" icon="map" label="Maps"/>
                              &nbsp;&nbsp;&nbsp;
                              <q-btn color="orange" size="sm" icon="place" label="Coordinate" @click="getCoordinate"/>
                              &nbsp;&nbsp;&nbsp;
                              <q-btn color="red" size="sm" icon="clear" label="Clear" @click="clearCoordinate"/>
                            </div>

                            <div class="col-6 col-md-6 frame_cari">
                              <span class="h_lable ">Longitude</span>
                              <q-input v-model="form.lng" outlined square :dense="true" class="bg-white margin_btn" />
                            </div>

                            <div class="col-12 col-md-12 frame_cari">
                              <br>
                              <span class="h_lable ">Jarak Radius Absen</span>
                              <q-input v-model="form.rad" type="number" outlined square :dense="true" class="bg-white margin_btn" placeholder="Radius dalam satuan Meter (Ex : 2.5)"/>

                            </div>

                            <div class="col-12 col-md-12 frame_cari">
                    
                              <span class="h_lable ">Keterangan</span>
                              <q-input v-model="form.keterangan" outlined square :dense="true" class="bg-white margin_btn" type="textarea"/>


                              <span class="h_lable ">Lampiran File</span>
                              <q-file v-model="form.file" outlined square :dense="true" class="bg-white margin_btn">
                                <template v-slot:prepend>
                                  <q-icon name="attach_file" />
                                </template>
                              </q-file>
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
                        <span class="h_lable ">Lokasi Kegiatan</span>
                        <q-input v-model="form.uraian" outlined square :dense="true" class="bg-white margin_btn" placeholder=""/>
                      </div>

                      <div class="col-12 col-md-6 frame_cari">
                        <span class="h_lable ">Jenis Apel</span>

                        <select v-model="form.jenisapel" class="inputbs margin_btn">
                          <option v-for="data in $store.state.list_ApleJenis" :key="data.id" :value="data.id">{{data.uraian}}</option>
                        </select>
                      </div>

                      <div class="col-12 col-md-6 frame_cari">
                        <span class="h_lable ">Tanggal Pelaksanaan</span>
                        
                        <q-input filled v-model="form.tgl" mask="date" :rules="['date']" outlined square :dense="true" class="bg-white margin_btn" >
                          <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer">
                              <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                                <q-date v-model="form.tgl">
                                  <div class="row items-center justify-end">
                                    <q-btn v-close-popup label="Close" color="primary" flat />
                                  </div>
                                </q-date>
                              </q-popup-proxy>
                            </q-icon>
                          </template>
                        </q-input>



                      </div>
                      <div class="col-6 col-md-6 frame_cari">
                        <span class="h_lable ">Absen Mulai (jam)</span>
                        <q-input v-model="form.startAbsen" outlined square :dense="true" class="bg-white margin_btn" placeholder="07:30"/>

                      </div>
                      <div class="col-6 col-md-6 frame_cari">
                        <span class="h_lable ">Absen Selesai (jam)</span>
                        <q-input v-model="form.batasAbsen" outlined square :dense="true" class="bg-white margin_btn" placeholder="07:30"/>

                      </div>

                      

                      <div class="col-6 col-md-6 frame_cari">
                        <span class="h_lable ">Latitude</span>
                        <q-input v-model="form.lat" outlined square :dense="true" class="bg-white margin_btn" />
                        <q-btn @click="mdl_maps_tambah = true" color="primary" size="sm" icon="map" label="Maps"/>
                        &nbsp;&nbsp;&nbsp;
                        <q-btn color="orange" size="sm" icon="place" label="Coordinate" @click="getCoordinate"/>
                        &nbsp;&nbsp;&nbsp;
                        <q-btn color="red" size="sm" icon="clear" label="Clear" @click="clearCoordinate"/>
                      </div>

                      <div class="col-6 col-md-6 frame_cari">
                        <span class="h_lable ">Longitude</span>
                        <q-input v-model="form.lng" outlined square :dense="true" class="bg-white margin_btn" />
                      </div>

                      <div class="col-12 col-md-12 frame_cari">
                        <br>
                        <span class="h_lable ">Jarak Radius Absen</span>
                        <q-input v-model="form.rad" type="number" outlined square :dense="true" class="bg-white margin_btn" placeholder="Radius dalam satuan Meter (Ex : 2.5)"/>

                      </div>

                      <div class="col-12 col-md-12 frame_cari">
              
                        <span class="h_lable ">Keterangan</span>
                        <q-input v-model="form.keterangan" outlined square :dense="true" class="bg-white margin_btn" type="textarea"/>


                        <span class="h_lable ">Lampiran File</span>
                        <q-file v-model="form.file" outlined square :dense="true" class="bg-white margin_btn">
                          <template v-slot:prepend>
                            <q-icon name="attach_file" />
                          </template>
                        </q-file>
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

            <!-- ================================================= MODAL CHAT ================================================ -->
              <q-dialog v-model="mdl_chat" persistent>
                <q-card class="mdl-lg ">
                <!-- <div class="mdl-head">
                  <span>KOKO</span>
                </div> -->

                <div class="row mdl-head hijauMudaGrad1" >
                  <div class="col-11 col-sm-11 items-start h_modalHead shaddowText">Detile Apel</div>
                  <div class="col-1 col-sm-1 items-end text-right">
                    <a class="h_ModalExit" href="javascript:void(0)" @click="mdl_chat = false">x</a>
                  </div>
                </div>


                <q-card-section class="q-pt-none abuMudaGrad">
                   
                        <div class="text-center">
                          <br>
                            <table>
                              <tr  class="h_table_head bg-green-2">
                                <th>Uraian</th>
                                <th>Keterangan</th>
                              </tr>
                              <tr  class="h_table_body1" >
                                <td>Jenis Apel</td>
                                <td>{{uraianJenisapel}}</td>
                              </tr>
                              <tr  class="h_table_body1" >
                                <td>Lokasi Kegiatan</td>
                                <td>{{form.uraian}}</td>
                              </tr>
                              <tr  class="h_table_body1" >
                                <td>Tgl Kegiatan</td>
                                <td>{{form.tgl}}</td>
                              </tr>
                              <tr  class="h_table_body1" >
                                <td>Waktu Absen</td>
                                <td>{{form.startAbsen}} - {{form.batasAbsen}} (WITA)</td>
                              </tr>
                              <tr  class="h_table_body1" >
                                <td>Radius Absen</td>
                                <td>{{form.rad}}</td>
                              </tr>
                              <tr  class="h_table_body1" >
                                <td>Keterangan</td>
                                <td>{{form.keterangan}}</td>
                              </tr>
                           
                              
                            </table>
                          <br>
                          <br>
                        </div>
                      <div class="text-right">
                          <q-btn label="KEMBALI" size="md" color="negative" v-close-popup/>
                      </div>

                </q-card-section>
              </q-card>
              </q-dialog>
            <!-- ================================================= MODAL CHAT ================================================ -->

            <!-- ================================================= MODAL MAPS ================================================ -->
              <q-dialog v-model="mdl_maps" persistent full-width>
                <q-card class="mdl-md">
                  <q-card-section class="bg-primary">
                    <div class="text-h6 h_modalhead">Detil Lokasi</div>
                  </q-card-section>

                  
                    <q-card-section class="q-pt-none">
                      <br>
                      <span>
                        <b>Keterangan : </b>
                        {{form.keterangan}}
                      
                      </span>
                      <br><br>
                      <GmapMap
                        :center="{lat : form.lat, lng: form.lng}"
                        :zoom="18"
                        map-type-id="roadmap"
                        style="width: 100%; height: 612px; top: 0px; left: 0px;"
                      >
                        <GmapMarker
                          :position="{lat : form.lat, lng: form.lng}"
                          :clickable="true"
                          @click="mdl_img = true"
                          title="Telassooooo"
                        >
                          <GmapCircle
                            :center="{lat : form.lat, lng: form.lng}"
                            :radius="parseFloatku(form.rad)"
                            :visible="true"
                            :options="{strokeColor: 'orange', strokeWeight: 0.1, fillColor:'orange',fillOpacity:0.4, borderColor:'green'}"
                          />

                        </GmapMarker>

                      </GmapMap>

                    </q-card-section>

                    <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                         <q-btn label="Kembali" color="negative" v-close-popup />
                    </q-card-actions>

                
                </q-card>
              </q-dialog>
            <!-- ================================================= MODAL MAPS ================================================ -->

            <!-- ================================================= MODAL MAPS TAMBAH ================================================ -->
              
              <q-dialog v-model="mdl_maps_tambah" persistent full-width>
                <q-card class="mdl-md">
                  <q-card-section class="bg-primary">
                    <div class="text-h6 h_modalhead">Cari Lokasi</div>
                  </q-card-section>

                  
                    <q-card-section class="q-pt-none">
                       
                      <GmapMap
                        :center="$store.state.coordinat"
                        :zoom="18"
                        map-type-id="roadmap"
                        style="width: 100%; height: 612px; top: 0px; left: 0px;"
                      >
                        <GmapMarker
                          :position="{lat : form.lat, lng: form.lng}"
                          :clickable="true"
                          :draggable="true"
                          title="Telassooooo"
                          @drag="updateCoordinates"
                        >
                          <GmapCircle
                            :center="{lat : form.lat, lng: form.lng}"
                            :radius="parseFloatku(form.rad)"
                            :visible="true"
                            :options="{strokeColor: 'orange', strokeWeight: 0.1, fillColor:'orange',fillOpacity:0.4, borderColor:'green'}"
                          />
                        </GmapMarker>

                      </GmapMap>

                    </q-card-section>

                    <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                         <q-btn label="Kembali" color="negative" v-close-popup />
                    </q-card-actions>

                </q-card>
              </q-dialog>

            <!-- ================================================= MODAL MAPS TAMBAH ================================================ -->

            <!-- ================================================= MODAL GAMBAR ================================================ -->
              <q-dialog v-model="mdl_img" persistent>
                <q-card class="mdl-md">
                  <q-card-section class="bg-primary">
                    <div class="text-h6 h_modalhead">{{form.uraian}}</div>
                  </q-card-section>


                    <q-card-section class="q-pt-none">
                      <br>

                      <q-img
                        :src="$store.state.url.URL_APP+'uploads/'+form.file"
                      >
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
export default {
  data() {
    return {
      

      form : {
        id : '',
        jenisapel : '',
        uraian : 'Halaman Kantor Bupati Konawe Selatan',
        startAbsen : '06:00',
        batasAbsen : '07:30',
        lat : '',
        lng : '',
        rad : 100,
        tgl : '2022/03/01',
        dd : '',
        mm : '',
        yy : '',

        keterangan : '',
        file : null,
        file_old : '',
        unit_kerja : '',
      },

      uraianJenisapel : '',
     
      list_data : [],


      page_first: 1,
      page_last: 0,
      page_limit : 10,
      cari_value: "",
      cek_load_data : true,


      mdl_add: false,
      mdl_edit: false,
      mdl_hapus : false,
      mdl_chat : false,
      mdl_maps : false,
      btn_add: false,
      mdl_maps_tambah : false,
      mdl_img : false,

      date: '2022/01/01'
    }
  },
  methods: {


    getView : function(){
      this.$store.commit("shoWLoading");
      fetch(this.$store.state.url.URL_apelPelaksanaan + "view", {
          method: "POST",
          headers: {
          "content-type": "application/json",
          authorization: "kikensbatara " + localStorage.token
          },
          body: JSON.stringify({
              data_ke: this.page_first,
              cari_value: this.cari_value,
              page_limit : this.page_limit,
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
      formData.append('jenisapel', this.form.jenisapel);
      formData.append('uraian', this.form.uraian);
      formData.append('startAbsen', this.form.startAbsen);
      formData.append('batasAbsen', this.form.batasAbsen);
      formData.append('lat', this.form.lat);
      formData.append('lng', this.form.lng);
      formData.append('rad', this.form.rad);

      formData.append('tgl', this.form.tgl);

      formData.append('keterangan', this.form.keterangan);
      formData.append('file', this.form.file);
      formData.append('file_old', this.form.file_old);
      formData.append('unit_kerja', this.form.unit_kerja);
     

      fetch(this.$store.state.url.URL_apelPelaksanaan + "Add", {
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
      formData.append('jenisapel', this.form.jenisapel);
      formData.append('uraian', this.form.uraian);
      formData.append('startAbsen', this.form.startAbsen);
      formData.append('batasAbsen', this.form.batasAbsen);
      formData.append('lat', this.form.lat);
      formData.append('lng', this.form.lng);
      formData.append('rad', this.form.rad);

      formData.append('tgl', this.form.tgl);

      formData.append('keterangan', this.form.keterangan);
      formData.append('file', this.form.file);
      formData.append('file_old', this.form.file_old);
      formData.append('unit_kerja', this.form.unit_kerja);


      fetch(this.$store.state.url.URL_apelPelaksanaan + "editData", {
          method: "POST",
          headers: {
            authorization: "kikensbatara " + localStorage.token
          },
          body: formData
      }).then(res_data => {
          this.Notify('Sukses Merubah Data', 'warning', 'check_circle_outline');
          this.getView();
      });
    },

    removeData : function(E){
      fetch(this.$store.state.url.URL_apelPelaksanaan + "removeData", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: "kikensbatara " + localStorage.token
          },
          body: JSON.stringify({id : this.form.id, file : this.form.file})
      }).then(res_data => {
          this.Notify('Sukses Menghapus Data', 'negative', 'check_circle_outline');
          this.getView();
      });

    },
    selectData : function(data){
        console.log(data)
        this.form.id = data.id;
        this.form.jenisapel = data.jenisapel;
        this.form.uraian = data.uraian;
        this.form.startAbsen = data.startAbsen;
        this.form.batasAbsen = data.batasAbsen;
        this.form.lat = data.lat;
        this.form.lng = data.lng;
        this.form.rad = data.rad;
        this.form.tgl = data.yy + '/' +this.OObelakang(data.mm) + '/' + this.OObelakang(data.dd);
        this.form.keterangan = data.keterangan;
        this.form.file_old = data.file;
        this.form.unit_kerja = data.unit_kerja;


        this.uraianJenisapel = data.jenisapel_uraian;
    },

    // ====================================== TAMBAHAN ====================================
      clearCoordinate (){
        this.form.lat = ''; this.form.lng = '';
      },
      getCoordinate(){
        this.$getLocation()
        .then(coordinates => {
          this.form.lat = coordinates.lat;
          this.form.lng = coordinates.lng;
        });
      },
      updateCoordinates(location){
        this.form.lat = location.latLng.lat();
        this.form.lng = location.latLng.lng();
      },
      parseFloatku(data){
        return parseFloat(data)
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

        OObelakang : function(angka){
          var nilai = parseInt(angka)
          var nilai1 = String(nilai).padStart(2, "0") 
          console.log(nilai1)
          return nilai1
        }


    // ====================================== PAGINATE ====================================







  },

  mounted () {

    this.getView();
    this.$getLocation().then(coordinates => {
      this.form.lat = coordinates.lat;
      this.form.lng = coordinates.lng;

      this.$store.state.coordinat.lat = coordinates.lat;
      this.$store.state.coordinat.lng = coordinates.lng;
    });

    this.$store.commit("listApelJenis");
    this.$store.commit("getStorage");

    this.form.unit_kerja = this.$store.state.unit_kerja





  },
}
</script>




