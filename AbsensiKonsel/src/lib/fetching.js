import axios from "axios"



export const postData = (url, token, data) => {
    return new Promise((resolve, reject) => {
        axios.post(url, JSON.stringify(data), {
            headers : {
                "Content-Type" : "application/json",
                "Authorization" : `kikensbatara ${token}`
            }
        }).then(result => {
            // console.log(result.data);
            resolve(result.data)
        }).catch(err => {
            console.log("ERROR : ", err);
            reject(err);
        })
    })




}