// 'use strict';


// var createUser = require('./mongo');

// it("Create User Success",() =>{
//     const MongoClient = require('mongodb').MongoClient;
//     const uri = "mongodb+srv://admin:cuparttime2020@cluster0-rjut3.mongodb.net/test?retryWrites=true&w=majority";
//     const client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true });

//     // var encryptedData = req.body.data;
//     // let bytes = CryptoJS.AES.decrypt(encryptedData,'123456');
//     // var payload = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
//     const newUser={};
//     const res={};
//     var q = createUser(client,newUser,res);
//     // console.log(q)
//     // expect(1).toBe(1);

// })

// import validator from 'validator';
// import CryptoJS from "crypto-js";

// function mongoRegister(data){
//     // console.log(data)
//     let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), '123456').toString();
//     let sending_data = {data: ciphertext};
//     fetch("/newuser", {
//         method: 'POST',
//         headers: {'Content-Type': 'application/json'},
//         body: JSON.stringify(sending_data)
//     }).then(function(response) {
//         if (response.status >= 400) {
//           throw new Error("Bad response from server");
//         }
//         return response.json();
//     }).then(function(resData) {
//         history.push("/");
//         // console.log(resData);      
//     }).catch(function(err) {
//         console.log(err);
//     });
// }

