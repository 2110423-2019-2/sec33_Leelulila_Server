const assert = require('chai').assert;
const CryptoJS = require('crypto-js');
const fetch = require("node-fetch");
const expect = require('chai').expect;

describe('Apply Job',function(){

    it('Success',async () =>{
    
        var email = "e2etest@hotmail.com";
        var data = { Email: email};
    
        let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), '123456').toString();
        let sending_data = {data: ciphertext};
       

        await fetch("http://localhost:9000/job/addemployee/173", {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sending_data)
        }).then((res) => {
            return res.json();
        })
        .then((res) => {
            assert.equal(res, '1 document(s) matched the query criteria.');
        })
    })

    it('Wrong Job ID',async () =>{
    
        var email = "e2etest@hotmail.com";
        var data = { Email: email};
    
        let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), '123456').toString();
        let sending_data = {data: ciphertext};
       

        await fetch("http://localhost:9000/job/addemployee/99999", {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sending_data)
        }).then((res) => {
            return res.json();
        })
        .then((res) => {
            console.log(res);
            assert.equal(res, 'No document(s) matched the query criteria.');
        })
    })


    it('Wrong Email',async () =>{
    
        var email = "onDemand@hotmail.com";
        var data = { Email: email};
    
        let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), '123456').toString();
        let sending_data = {data: ciphertext};
       

        await fetch("http://localhost:9000/job/addemployee/173", {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sending_data)
        }).then((res) => {
            return res.json();
        })
        .then((res) => {
            assert.equal(res, 'No user with the email onDemand@hotmail.com');
        })
    })
})
