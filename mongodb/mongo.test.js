const assert = require('chai').assert;
const CryptoJS = require('crypto-js');
const fetch = require("node-fetch");
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

            console.log('///////////////0')
            console.log(res);
            assert.equal(res, 'No user with the email onDemand@hotmail.com');
        })
    })
})

describe('Create Job', function(){
    it('Response Success (200)', function(){
    
        fetch("http://localhost:9000/job/173", {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            // body: JSON.stringify(id)

        }).then((res) => {
            return res.status;
        })
        .then((res) => {
            console.log('///////////////1')
            console.log(res);
            assert.equal(res, 200);
        })
    })

    it("Check ID", function(){
        // var id = 123;
        
        fetch("http://localhost:9000/job/173", {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            // body: JSON.stringify(id)

        }).then((res) => {
            return res.json();
        })
        .then((res) => {
            console.log('///////////////2')
            console.log(res._id);
            assert.equal(res._id, 173);
        })
    })

    it("Add Job", async () =>{
        var email = "thus@hotmail.com";
        var data = { Email: email};
    
        let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), '123456').toString();
        let sending_data = {data: ciphertext};
        
        await fetch("http://localhost:9000/newjob", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sending_data)

        }).then((res) => {
            return res.json();
        })
        .then((res) => {
            console.log('///////////////3')
            console.log(res);
            assert.equal(res, `New Job created with the following id: `);
        })
    })
})