const assert = require('chai').assert;
const CryptoJS = require('crypto-js');
const fetch = require("node-fetch");
const expect = require('chai').expect;

const expect = require('chai').expect;

describe('Apply Job',function(){
    it('Response Success (200)',async () =>{
    
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

            console.log('///////////////')
            console.log(res);
            assert.equal(res, 'No user with the email onDemand@hotmail.com');
        })
    })
})

describe('Create Job', function(){
    it('Response Success (200)', function(){
    
        var id = 123;
    
        // let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), '123456').toString();
        // let sending_data = {id: ciphertext};

        fetch("http://localhost:9000/job/173", {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            // body: JSON.stringify(id)

        }).then(function (response) {
            if (response.status <= 400) {
                console.log("OK")
                expect(response.status).to.equal(200)
            // throw new Error("Bad response from server");
            } else {
                console.log("WRONG")
                expect(response.status).to.equal(401)
            }
            
        
            console.log(response.status);
            // assert.equal(response.status, 202);
            // expect(response.status).toEqual(401)
        })

        // expect(response.status).toEqual(401)
    })
})