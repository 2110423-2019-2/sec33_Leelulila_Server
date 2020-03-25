const assert = require('chai').assert;
const CryptoJS = require('crypto-js');
const fetch = require("node-fetch");

describe('Apply Job',function(){
    it('Response Success (200)',function(){
    
        var email = "e2etest@hotmail.com";
        var data = { Email: email};
    
        let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), '123456').toString();
        let sending_data = {data: ciphertext};

        fetch("http://localhost:9000/job/addemployee/173", {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sending_data)
        }).then(function (response) {
            if (response.status >= 400) {
            throw new Error("Bad response from server");
            }
        
            // console.log(response);
            assert.equal(response.status,200);

        })
    })
})