// import Swal from 'sweetalert2'
const Swal = require('sweetalert2')
var DataStore = require('../store');
var store = DataStore.default;
var storex =store.state

const postUnitKerjaAuto = (unit_kerja, unit_kerja_id) => {

    fetch(store.state.url.URL_m_unit_kerja + "autocomplete_unit_kerja_full", {
        method: "POST",
        headers: {
            "content-type": "application/json",
            authorization: "kikensbatara " + localStorage.token
        },
        body: JSON.stringify({
            unit_kerja: unit_kerja,
            unit_kerja_id : unit_kerja_id
        })
    })
        .then(res => res.json())
        .then(res_data => {
            // console.log(res_data)
            store.state.list_unit_kerja_auto = res_data
            // resolve(res_data)
        });
}

const postUnitKerjaId = async (unit_kerja, unit_kerja_id)=>{
  return new Promise(resolve=>{
    fetch(store.state.url.URL_m_unit_kerja + "autocomplete_unit_kerja_full", {
      method: "POST",
      headers: {
          "content-type": "application/json",
          authorization: "kikensbatara " + localStorage.token
      },
      body: JSON.stringify({
          unit_kerja: unit_kerja,
          unit_kerja_id : unit_kerja_id
      })
  })
      .then(res => res.json())
      .then(res_data => {
          resolve(res_data)
      });
  })
}

const getMasterMenu = async ()=>{
    return new Promise(resolve=>{
      fetch(storex.url.URL_DM_KLP_USERS + "listAdd", {
          method: "GET",
          headers: {
          "content-type": "application/json",
          authorization: "kikensbatara " + localStorage.token
          }
        })
          .then(res => res.json())
          .then(res_data => {
            // console.log(res_data)
            resolve(res_data)
  
      });
    })
  }
  
  // ini buat ambil menu pada saat edit data
  const postMasterMenu = async (id)=>{
    return new Promise(resolve=>{
      fetch(storex.url.URL_DM_KLP_USERS + "listEdit", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: "kikensbatara " + localStorage.token
          },
          body: JSON.stringify({
            menu_klp_id: id,
          })
        })
          .then(res => res.json())
          .then(res_data => {
            // console.log(res_data)
            resolve(res_data)
  
      });
    })
  }
  
  
  const postMasterKlpMenu = async ()=>{
    return new Promise(resolve=>{
      fetch(storex.url.URL_DM_KLP_USERS + "list", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: "kikensbatara " + localStorage.token
          },
          body: JSON.stringify({
            menu_klp_id: 'id',
          })
        })
          .then(res => res.json())
          .then(res_data => {
            console.log(res_data)
            resolve(res_data)
  
      });
    })
  }
  
  
  const postMasterMenuGetSideBar = async (id)=>{
    return new Promise(resolve=>{
      fetch(storex.url.URL_DM_KLP_USERS + "listSidebar", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: "kikensbatara " + localStorage.token
          },
          body: JSON.stringify({
            side_bar : true,
            menu_klp_id: id,
          })
        })
          .then(res => res.json())
          .then(res_data => {
            // console.log(res_data)
            resolve(res_data)
  
      });
    })
  }
  


module.exports = {
    postUnitKerjaId : postUnitKerjaId,
    postUnitKerjaAuto : postUnitKerjaAuto,
    getMasterMenu : getMasterMenu,
    postMasterMenu : postMasterMenu,
    postMasterMenuGetSideBar : postMasterMenuGetSideBar,

    postMasterKlpMenu : postMasterKlpMenu,
}